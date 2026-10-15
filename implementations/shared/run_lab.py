"""Portable CPU lab entry point. Run from any directory with Python 3.11/3.12."""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]

def run(slug, action):
    lab = ROOT / slug
    if not (lab / 'configs/smoke.toml').is_file():
        raise ValueError(f'Unknown lab: {slug}')
    package = next((lab / 'src').glob('*_lab')).name
    env = dict(os.environ, PYTHONPATH=str(lab/'src'), CUDA_VISIBLE_DEVICES='', OMP_NUM_THREADS='1', MKL_NUM_THREADS='1')
    output = lab / 'outputs/handbook'
    output.mkdir(parents=True, exist_ok=True)
    config = tomllib.loads((lab/'configs/smoke.toml').read_text())
    length = config.get('model', config).get('message_length', 16)
    message = ('10' * length)[:length]
    checkpoint = 'outputs/handbook/checkpoint.pt'
    image = 'outputs/handbook/' + ('encoded.png' if package in {'hidden_lab','rosteals_lab'} else 'marked_decoder.png' if package=='stable_signature_lab' else 'watermarked.png')
    def execute(module, args, label):
        command = [sys.executable, '-m', package+'.'+module, *args]
        result = subprocess.run(command, cwd=lab, env=env, text=True, capture_output=True, timeout=180)
        (output/(label+'.stdout.txt')).write_text(result.stdout, encoding='utf-8')
        (output/(label+'.stderr.txt')).write_text(result.stderr, encoding='utf-8')
        if result.returncode:
            raise RuntimeError(f'{slug} {label}: {result.stderr}')
        print(result.stdout.strip())
        return result.stdout
    if action == 'create':
        module = 'optimise' if package=='zodiac_lab' else 'train'
        execute(module, ['--config','configs/smoke.toml','--output-dir','outputs/handbook'], 'create')
        if package in {'hidden_lab','rosteals_lab'}:
            execute('embed', ['--checkpoint',checkpoint,'--image','outputs/handbook/cover.png','--message',message,'--output',image], 'embed')
        manifest = json.loads((output/'manifest.json').read_text())
        # Preserve training observations with their actual stage. The public fields
        # below describe only the image that the subsequent commands will read.
        training = {key:manifest.pop(key) for key in ['message','key','recovered','test_message','test_recovered','bit_error_rate','score','negative_control_score','score_margin','verification_status'] if key in manifest}
        manifest['training_observations_before_save'] = training
        module = 'extract' if package in {'hidden_lab','rosteals_lab'} else 'detect'
        received_text = execute(module,['--checkpoint',checkpoint,'--image',image],'creation-detect').strip()
        received = json.loads(received_text) if received_text.startswith('{') else {'recovered':received_text}
        manifest['saved_image_detection'] = received
        manifest['measurement_stage'] = 'saved PNG reloaded through detector'
        manifest['verification_status'] = 'not-run'
        manifest['verification_note'] = 'Recovery observations below are measured. No calibrated detection or paper verification is claimed.'
        if 'recovered' in received:
            target = message if package in {'hidden_lab','rosteals_lab'} else received.get('message',received.get('key'))
            recovered = received['recovered']
            manifest.update(message=target,recovered=recovered,bit_error_rate=sum(a!=b for a,b in zip(target,recovered))/len(target))
        else:
            manifest.update(known_key=received.get('message',received.get('embedded_key')),recovered=None,score=received.get('score'),bit_error_rate=None)
        filename=Path(image).name
        if filename not in manifest['artifacts']: manifest['artifacts'].append(filename)
        manifest.update(verification_scope='bounded CPU exercise; no paper reproduction or false-positive calibration', command_entrypoint=f'python implementations/shared/run_lab.py {slug} create')
        (output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
        print(json.dumps({'saved_image_manifest':manifest},indent=2))
    elif action in {'detect','evaluate'}:
        module = 'extract' if action=='detect' and package in {'hidden_lab','rosteals_lab'} else action
        args = ['--checkpoint',checkpoint,'--image',image]
        if action=='evaluate' and package in {'hidden_lab','rosteals_lab'}: args += ['--message',message]
        execute(module,args,action)
    elif action == 'controls':
        # Run source tests separately so package names from different labs never collide.
        execute_tests = subprocess.run([sys.executable,str(ROOT/'shared/verify_semantics.py'),slug],cwd=lab,env=env,text=True,capture_output=True,timeout=180)
        (output/'controls.stdout.txt').write_text(execute_tests.stdout,encoding='utf-8')
        (output/'controls.stderr.txt').write_text(execute_tests.stderr,encoding='utf-8')
        if execute_tests.returncode: raise RuntimeError(execute_tests.stderr)
        print(execute_tests.stdout.strip())
    else: raise ValueError(action)

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('slug')
    parser.add_argument('action',choices=['create','detect','evaluate','controls'])
    args=parser.parse_args()
    run(args.slug,args.action)
