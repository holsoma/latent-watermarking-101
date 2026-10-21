"""Publish only the four verified CPU image examples, never model checkpoints."""
import hashlib
from copy import deepcopy
import json
from pathlib import Path
import shutil
import tomllib

ROOT=Path(__file__).resolve().parents[2]
report=json.loads((ROOT/'docs/lab-verification.json').read_text())
for slug in ['hidden','rosteals','stable-signature','zodiac']:
    record=report['labs'][slug]
    if record['status']!='passed': raise RuntimeError(f'Cannot publish unverified {slug}')
    source=ROOT/'implementations'/slug/'outputs/handbook'
    manifest=json.loads((source/'manifest.json').read_text())
    if manifest.get('measurement_stage')!='saved PNG reloaded through detector':
        raise RuntimeError(f'{slug}: stale measurement stage')
    destination=ROOT/'public/experiments/handbook'/slug
    destination.mkdir(parents=True,exist_ok=True)
    artifacts=[]
    for filename in manifest['artifacts']:
        if not filename.endswith('.png'): continue
        shutil.copyfile(source/filename,destination/filename)
        artifacts.append({'file':filename,'sha256':hashlib.sha256((destination/filename).read_bytes()).hexdigest()})
    supplied_config=tomllib.loads((ROOT/'implementations'/slug/'configs/smoke.toml').read_text())
    config=deepcopy(manifest.get('config', supplied_config))
    if 'training' in config:
        config['training']['steps']=manifest['steps']
        config.setdefault('output',{})['directory']='outputs/handbook'
    else:
        config['steps']=manifest['steps']
        config['output_dir']='outputs/handbook'
    effective_run={'steps':manifest['steps'],'device':manifest['device'],'output_dir':'outputs/handbook','message':manifest.get('message'),'cli_overrides':{'output_dir':'outputs/handbook'}}
    evidence={'slug':slug,'run_at':record['run_at'],'python':record['python'],'classification':'prerequisite-exercise','config':config,'supplied_config':supplied_config,'effective_run':effective_run,'commands':[r['command'] for r in record['commands']],'saved_image_detection':manifest['saved_image_detection'],'bit_error_rate':manifest['bit_error_rate'],'artifacts':artifacts,'limitations':'Single bounded CPU fixture. Command success is not message recovery, paper reproduction or calibrated detection.'}
    (destination/'run.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
    print(slug,manifest['bit_error_rate'])
