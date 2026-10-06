# Working with Claude on Lunabara

Suggested project instructions (paste into the project's custom instructions):

> Lunabara is a passive 3D moon-colony terrarium, told as a livestream: helmeted capybaras on the Shackleton crater rim, built as one self-contained HTML file with three.js r128, tested on an iPhone in the Claude app. Treat what I report about the running build as real. If your reading of the code disagrees, ask for a screenshot or a Diag paste rather than explaining why it can't happen. Ship each change as a new probe build published to the same artifact, with a changelog entry, and say plainly what was and wasn't verified on device. Keep 60 fps on the phone; check the Diag numbers after any change that adds geometry, lights or per-frame work.

## How builds work

- Each change is a numbered probe (0.7, 0.8…) published to the same artifact link, so the phone always opens the latest.
- Older builds stay in the artifact's version history, so an old build can run alongside a new one.
- Each probe is also committed to the GitHub repo, `sockmonke-rgb/lunabara` (as `index.html`, with the changelog, docs and `tools/`), and pushed to `main`. `npm test` there runs every headless check.
- Every build bumps the version in the title chip and the first line of Diag.
- **Every publish also updates the project:** the build file, CHANGELOG, and any doc the change touches. 0.40 went live without its notes or file reaching the project, and 0.41 had to reconstruct them from the code.
- Before building, Claude reads the live artifact, not just the project copy, and builds on whichever is newer.

## Verifying

- The phone is the only real test of feel and frame rate.
- Before publishing, Claude checks the script parses and runs the headless tests (`smoke.js`, `restore.js`, `reset.js`, `errlog.js`) and `navsim.js` for five seeds. See TESTPLAN.
- Claude can render the 3D scene in its workspace: `shots.py` loads a build in headless Chromium (SwiftShader, so fps there means nothing), with a test hook added to its own copy of the page, runs a scripted scenario (`scenario.json`: wait, run a line of script, screenshot) and saves screenshots and the Diag. three.js r128 comes from a sparse git clone of the three.js repo (`git clone --depth 1 --branch r128 --filter=blob:none --sparse https://github.com/mrdoob/three.js`, then `git sparse-checkout set build examples/js/controls`), because the workspace can't reach the CDNs.
- The Diag panel is the shared source of truth: fps by second, worst frame, sim vs draw time, draw calls, triangles, resolution, colony state, stream, lander and crew.

## Lessons carried over from Astrobara

- iOS standalone (home screen) mode is a recurring risk: stale viewport sizes after rotation, touch offsets.
- Keep the single file load-bearing: iOS-only testing makes multi-file work impractical.
- The sunlight rule is a game rule, not a lighting model; keep it binary even when the rendering is soft.

## Performance lessons from the probes

- Anything heavy per frame in JavaScript locks iOS to 30 fps; keep sim time under about 2 ms.
- Terrain maths is cached on a grid; don't call the full height function in per-frame loops.
- The ground fills the screen, so it uses cheap lighting; lights at zero brightness still cost, so hide them.
- Compile all shader variants behind the loading screen so toggles don't stall. That includes things hidden at boot (the habitat interior, the lander): show them for the compile, then hide them.

## Animation lessons

- The walk cycle pulls every leg back toward rest each frame, so an eased pose on top only gets about a third of the way to its target. Rearing poses from the Moon Suits page look right that way. A pose that must land exactly (the wave) is set outright and scaled by a 0–1 amount that rises and falls instead.
- Tie the gait to distance walked, not time, or feet skate when the speed changes.
