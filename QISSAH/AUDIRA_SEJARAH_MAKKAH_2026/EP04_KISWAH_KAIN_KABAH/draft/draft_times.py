import json,sys
t=json.load(open('src/scenes/kiswah/timeline.json',encoding='utf8'))
out={}
for c in t['chapters']:
    a,b=c['start'],c['end']
    ts=[a+1.2]+[a+(b-a)*f for f in (0.18,0.34,0.5,0.66,0.82,0.97)]
    if c['id']=='c09_payoff': ts=[a+1.2,a+(b-a)*0.25,a+(b-a)*0.4,a+(b-a)*0.75,t['voEnd']+6,t['total']-6,t['total']-4]
    if c['id']=='c00_hook': ts=[0.2,3.2,6.5,11.5,15.5,23.5,29.5]
    out[c['id']]=[round(x,2) for x in ts]
json.dump(out,open('out/draft_times.json','w'),indent=1)
print(','.join(f'{x}s' for v in out.values() for x in v))
