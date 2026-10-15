"""Run bounded CPU demonstrations and retain exact commands and measured output."""
import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
import time

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('slugs',nargs='*')
parser.add_argument('--controls-only',action='store_true',help='Recheck existing saved artefacts without recreating them')
args=parser.parse_args()
slugs=args.slugs or sorted(p.name for p in (ROOT/'implementations').iterdir() if (p/'configs/smoke.toml').exists() and not p.name.startswith('_'))
destination=ROOT/'docs/lab-verification.json'
records=json.loads(destination.read_text()).get('labs',{}) if destination.exists() else {}
for slug in slugs:
    record={'slug':slug,'python':sys.version.split()[0],'run_at':datetime.now(timezone.utc).isoformat(),'classification':'prerequisite-exercise','scope':'Bounded CPU execution and semantic checks. Recovery can fail. No diffusion model, statistical calibration or reproduction.','commands':[]}
    if args.controls_only:
        record=records[slug]
        record['commands']=[r for r in record['commands'] if not r['command'].endswith(' controls')]
        record['controls_updated_at']=datetime.now(timezone.utc).isoformat()
    for action in (['controls'] if args.controls_only else ['create','detect','evaluate','controls']):
        command=[sys.executable,str(ROOT/'implementations/shared/run_lab.py'),slug,action]
        started=time.monotonic()
        result=subprocess.run(command,cwd=ROOT,text=True,capture_output=True,timeout=240)
        record['commands'].append({'command':f'python implementations/shared/run_lab.py {slug} {action}','exit_code':result.returncode,'seconds':round(time.monotonic()-started,2),'stdout':result.stdout,'stderr':result.stderr})
        print(slug,action,result.returncode,flush=True)
        if result.returncode: break
    record['status']='passed' if len(record['commands'])==4 and all(x['exit_code']==0 for x in record['commands']) else 'failed'
    records[slug]=record
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(json.dumps({'schema_version':1,'meaning_of_passed':'Commands and behavioural assertions completed; does not mean the watermark recovered successfully.','labs':records},indent=2),encoding='utf-8')
raise SystemExit(0 if all(records[s]['status']=='passed' for s in slugs) else 1)
