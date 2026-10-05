# Renders a Lunabara build in headless Chromium (SwiftShader) with three.js r128 served locally,
# and a test hook injected into the page copy (the shipped file is unchanged). Usage: python3 shots.py build.html outdir
# Needs: Python Playwright with Chromium; three.min.js and OrbitControls.js (r128) next to this file; scenario.json next to it.
# Scenario steps: ["wait", sim seconds], ["sleep", real seconds], ["js", "script using window.__lb"], ["shot", "name"].
# Fonts and anything else off-site are blocked, so the Diag shows one "load failed" for the font stylesheet. fps here means nothing.
import sys, os, json, time
from playwright.sync_api import sync_playwright

build, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
html = open(build, encoding='utf8').read()
hook = """
  window.__lb={capys,pups,colony,landerS,startWave,H,makePup,POOL,follow:c=>follow(c),setView:v=>setView(v),goStation:i=>goStation(i),STATIONS,camera,controls,SUN,
    get speed(){return speed;}, set speed(v){speed=v;}, LOOK, applyLook, diag:()=>diagText(), get t(){return t;}};
  mapStep();
})();
})();"""
assert html.count("  mapStep();\n})();\n})();") == 1
html = html.replace("  mapStep();\n})();\n})();", hook)
three = open(os.path.join(here, 'three.min.js'), encoding='utf8').read()
orbit = open(os.path.join(here, 'OrbitControls.js'), encoding='utf8').read()

def route(r):
    u = r.request.url
    if u.endswith('three.min.js'): return r.fulfill(body=three, content_type='application/javascript', headers={'Access-Control-Allow-Origin': '*'})
    if u.endswith('OrbitControls.js'): return r.fulfill(body=orbit, content_type='application/javascript', headers={'Access-Control-Allow-Origin': '*'})
    if u.startswith('http://lunabara.test/'): return r.fulfill(body=html, content_type='text/html; charset=utf-8')
    return r.abort()

with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 430, 'height': 860}, device_scale_factor=1)
    logs = []
    pg.on('console', lambda m: logs.append(m.text))
    pg.on('pageerror', lambda e: logs.append('PAGEERROR ' + str(e)))
    pg.route('**/*', route)
    pg.goto('http://lunabara.test/index.html')
    pg.wait_for_function('window.__lb && document.getElementById("load").hidden', timeout=180000)
    def shot(name): pg.screenshot(path=os.path.join(out, name + '.png'))
    def run(js): return pg.evaluate(js)
    def wait_sim(sec):
        t0 = run('__lb.t')
        while run('__lb.t') - t0 < sec: time.sleep(0.2)
    for step in json.load(open(sys.argv[3] if len(sys.argv)>3 else os.path.join(here, "scenario.json"))):
        kind = step[0]
        if kind == 'js': print(step[1][:60], '->', run(step[1]))
        elif kind == 'wait': wait_sim(step[1])
        elif kind == 'sleep': time.sleep(step[1])
        elif kind == 'shot': shot(step[1])
    open(os.path.join(out, 'diag.txt'), 'w').write(run('__lb.diag()'))
    open(os.path.join(out, 'console.txt'), 'w').write('\n'.join(logs))
    b.close()
