"""Behaviour checks executed in an isolated lab process."""
import importlib
import inspect
import json
from pathlib import Path
import runpy
import sys
import torch

torch.set_num_threads(1)
torch.manual_seed(73)
slug=sys.argv[1]
root=Path.cwd()
package=next((root/'src').glob('*_lab')).name
model=importlib.import_module(package+'.model')
io=importlib.import_module(package+'.io')
evaluate=importlib.import_module(package+'.evaluate')
checks=[]

def checked(name, condition):
    assert bool(condition), name
    checks.append(name)

# Existing tests contain standalone assertions. Execute every zero-argument test.
for path in sorted((root/'tests').glob('test_*.py')):
    namespace=runpy.run_path(str(path))
    for name, function in namespace.items():
        if name.startswith('test_') and callable(function) and not inspect.signature(function).parameters:
            function()
            checks.append(path.name+':'+name)

image=torch.rand(1,3,64,64)*2-1
if hasattr(io,'jpeg_roundtrip'):
    attacked=io.jpeg_roundtrip(image,75)
    for invalid in [-1, 101, True, 1.5]:
        try: io.jpeg_roundtrip(image,invalid)
        except ValueError: checks.append(f'JPEG rejects invalid quality {invalid}')
        else: raise AssertionError('invalid JPEG quality accepted')
elif hasattr(evaluate,'attack'):
    attacked=evaluate.attack(image,'jpeg')
else:
    attacked=evaluate.jpeg_roundtrip(image,75)
checked('JPEG changes received pixel values',not torch.equal(image,attacked))
checked('JPEG preserves shape and finite values',attacked.shape==image.shape and torch.isfinite(attacked).all())

if hasattr(model,'shade_noise'):
    c=model.GaussianShadingConfig()
    original=torch.randn(1,c.latent_channels,c.latent_size,c.latent_size)
    message=('10'*c.payload_bits)[:c.payload_bits]
    marked=model.shade_noise(original,c,message)
    recovered=model.decode_message(marked,c)
    checked('latent recovery matches inserted bits',recovered==message)
    checked('corruption changes recovered bits',model.decode_message(-marked,c)!=message)
    checked('unmarked control is not supplied payload',model.decode_message(original,c)!=message)
    if slug=='prc-watermark':
        chips=model.prc_encode(message,seed=c.seed)
        chips[0]^=1
        checked('repetition decoder corrects one chip',model.prc_decode(chips,len(message),seed=c.seed)==message)
        chips[1]^=1
        checked('two chip errors can corrupt one bit',model.prc_decode(chips,len(message),seed=c.seed)!=message)
        checked('wrong seed changes decoding',model.prc_decode(model.prc_encode(message,seed=c.seed),len(message),seed=c.seed+1)!=message)
    if slug=='t2smark':
        central=original.abs()<torch.quantile(original.abs(),1-c.tail_fraction)
        checked('central samples remain exactly unchanged',torch.equal(original[central],marked[central]))
        checked('tail magnitudes remain unchanged',torch.equal(original.abs(),marked.abs()))
elif hasattr(model,'score_noise'):
    config_type=getattr(model,'TreeRingsConfig',getattr(model,'SealConfig',None))
    c=config_type()
    noise=torch.randn(1,c.latent_channels,c.latent_size,c.latent_size)
    key='1011001110001111'
    marked=model.embed_noise(noise,c,key)
    registered=model.score_noise(marked,c,key)
    wrong=model.score_noise(marked,c,'0100110001110000')
    checked('registered score differs from wrong-key score',abs(registered-wrong)>1e-6)
    checked('marking changes observed score',abs(registered-model.score_noise(noise,c,key))>1e-6)

if slug=='robin':
    data=torch.load('outputs/handbook/checkpoint.pt',weights_only=False,map_location='cpu')
    manifest=json.loads(Path('outputs/handbook/manifest.json').read_text())
    checked('sampled latent is frozen',torch.equal(data['latent'],data['initial_latent']))
    checked('renderer parameters are frozen',manifest['renderer_unchanged'])
    checked('conditioning receives optimisation updates',data['conditioning'].norm()>0)
    loaded,_,_=importlib.import_module(package+'.checkpoint').load_checkpoint('outputs/handbook/checkpoint.pt')
    checked('checkpoint reload preserves frozen renderer',all(torch.equal(v,data['renderer'][k]) for k,v in loaded.state_dict().items()))

manifest=json.loads(Path('outputs/handbook/manifest.json').read_text())
checked('manifest identifies the actual lab',manifest['paper_slug']==slug)
checked('manifest classification matches teaching scope',manifest['implementation_fidelity']=='prerequisite-exercise')
checked('every manifest artefact exists',all((Path('outputs/handbook')/p).is_file() for p in manifest['artifacts']))
observations={}
if package=='paper_lab':
    data=torch.load('outputs/handbook/checkpoint.pt',weights_only=False,map_location='cpu')
    saved=io.load_image(Path('outputs/handbook/watermarked.png'))
    unmarked=io.load_image(Path('outputs/handbook/base.png'))
    config_type=getattr(model,'GaussianShadingConfig',getattr(model,'TreeRingsConfig',getattr(model,'SealConfig',None)))
    c=config_type(**data['config']); renderer=model.LocalDiffusionAdapter(c)
    recorded=json.loads(Path('outputs/handbook/detect.stdout.txt').read_text())
    if hasattr(model,'decode_message'):
        target=data['message']; received=model.decode_message(renderer.invert(saved),c)
        checked('saved-image bits match detector command',received==recorded['recovered'])
        checked('manifest payload observation matches saved image',manifest['recovered']==received and manifest['message']==target)
        wrong=''.join('1' if x=='0' else '0' for x in target)
        observations={'target':target,'saved_image_bits':received,'wrong_target':wrong,'wrong_target_ber':model.bit_error(wrong,received),'unmarked_bits':model.decode_message(renderer.invert(unmarked),c),'corrupted_bits':model.decode_message(renderer.invert(-saved),c)}
    else:
        key=model.semantic_key(saved) if slug=='seal' else data['message']
        score=lambda tensor,key:model.image_score(tensor,c,key) if slug=='serum' else model.score_noise(renderer.invert(tensor),c,key)
        received=score(saved,key)
        checked('saved-image score matches detector command',abs(received-recorded['score'])<1e-6)
        checked('manifest score matches saved image',abs(received-manifest['score'])<1e-6 and manifest['recovered'] is None)
        observations={'known_key':key,'saved_image_score':received,'wrong_key_score':score(saved,'null:'+key),'unmarked_score':score(unmarked,key),'corrupted_score':score(-saved,key)}
if package in {'hidden_lab','rosteals_lab','stable_signature_lab','zodiac_lab'}:
    checkpoint=importlib.import_module(package+'.checkpoint')
    if package in {'hidden_lab','rosteals_lab'}:
        trained=checkpoint.load_model('outputs/handbook/checkpoint.pt',torch.device('cpu'))
        saved=io.load_image('outputs/handbook/encoded.png',trained.config.image_size,torch.device('cpu'))
        unmarked=io.load_image('outputs/handbook/cover.png',trained.config.image_size,torch.device('cpu'))
        target=('10'*trained.config.message_length)[:trained.config.message_length]
        decoder=trained.decoder if package=='hidden_lab' else trained.decode_message
    elif package=='stable_signature_lab':
        trained,payload=checkpoint.load_checkpoint('outputs/handbook/checkpoint.pt')
        saved=io.load_image('outputs/handbook/marked_decoder.png',trained.config.image)
        unmarked=io.load_image('outputs/handbook/base_decoder.png',trained.config.image)
        target=payload['key']; decoder=trained.logits
    else:
        _,decoder,payload=checkpoint.load_checkpoint('outputs/handbook/checkpoint.pt')
        saved=io.load_image('outputs/handbook/watermarked.png',payload['config']['image'])
        unmarked=io.load_image('outputs/handbook/inversion.png',payload['config']['image'])
        target=payload['message']
    def bits(value):
        with torch.no_grad(): return ''.join('1' if x>=0 else '0' for x in decoder(value).flatten().tolist())
    received=bits(saved)
    recorded=Path('outputs/handbook/detect.stdout.txt').read_text().strip()
    recorded=json.loads(recorded)['recovered'] if recorded.startswith('{') else recorded
    checked('saved-image decoding equals command output',received==recorded)
    checked('manifest describes the saved payload and recovery',manifest['message']==target and manifest['recovered']==received)
    wrong=''.join('1' if x=='0' else '0' for x in target)
    ber=lambda a,b:sum(x!=y for x,y in zip(a,b))/len(a)
    checked('manifest bit error matches saved-image evidence',abs(manifest['bit_error_rate']-ber(received,target))<1e-8)
    observations={'target':target,'saved_image_bits':received,'saved_image_ber':ber(received,target),'wrong_target_ber':ber(received,wrong),'unmarked_bits':bits(unmarked),'corrupted_bits':bits(-saved),'warning':'Unmarked or corrupted images can still decode to similar bits after tiny training. These measurements are not calibrated detection decisions.'}
    checked('error metric arithmetic: opposite-target BER is complementary (not sensitivity evidence)',abs(ber(received,target)+ber(received,wrong)-1)<1e-8)
print(json.dumps({'slug':slug,'checks':checks,'observations':observations,'passed':len(checks),'scope':'CPU teaching behaviour only; not calibration or reproduction'},indent=2))
