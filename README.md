# Lunabara

A passive 3D moon-colony terrarium, told as a livestream. Seven capybaras in bubble helmets live on the Shackleton crater rim at the lunar south pole. You watch them go about their day through the colony's cameras: drilling core samples, building a fusion reactor, launching helium-3 home, unloading supply landers from Earth, and soaking in yuzu baths while Earth hangs on the horizon. Earth is watching too, and the capybaras know it.

Lunabara (called Lunarium up to 0.33) grew out of the Astrobara V4 3D test scene. Astrobara stays a turn-based survival game; Lunabara is its own project.

- **Built by:** Mark Florentino LLC
- **Built with:** Claude (credited here and on the store page, not in the game)
- **Current build:** probe 0.56 (`index.html`)

## How it runs

- One self-contained HTML file. Open it in a browser; there's no build step.
- 3D is three.js r128. It loads two scripts from public CDNs:
  - `cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
  - `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js`
- To make it fully offline and truly single-file, paste those two scripts inline. That adds about 650 KB.
- Colony progress is saved in the browser (key `lunabara`; the look and stream settings under `lunabara-look`) and, when opened as the claude.ai artifact, in a private per-viewer record on the artifact (`data/users/<you>/colony`). The newer copy wins on load. The save includes pups, crewmates from Earth, landers landed and the mission clock. **Reset colony** in the Diag panel erases both copies.

## Controls

| Control | What it does |
| --- | --- |
| Drag / pinch | Orbit and zoom |
| Tap a capybara or the rover | Follow it |
| Time | Auto (6-minute day, 2.5-minute night) → Sun on → Sun off → Night |
| Look (Clean / Pixel / ASCII) | Cycles the render look: Clean, Pixel (low-res, dithered palette) or ASCII (characters, optional Matrix rain) |
| Speech bubble (top right) | Chat on or off. Tap the chat itself to open the full chat and event log |
| Gear (top right) | Look settings: crater relief and depth, the ASCII options, and camera feeds on or off. Matrix sets up the full Matrix look |
| Shadows | Live shadows on or off |
| View | Camera: orbit → top → shoulder → POV, and at a station → **game** (its lend-a-hand camera). Works on whatever you're watching |
| Next capy | Follow the next capybara (crewmates from Earth and pups included) |
| Stations | Watch the next non-capybara: Rover, Wallow, Habitat, Reactor, Greenhouse, Wheel, Lab, Life support, Compost, Comms, Mass driver, Landing pad, Nursery, Ice mine |
| Tour | Moves to the next subject every 12 s, alternating stations and capybaras. Cuts to the pad when a lander comes down |
| Speed | ×1 → ×2 → ×4 → ×8 → Paused |
| Lend a hand | View → game at any station (0.50; was shoulder or POV) while it has something to do: a small game on the right (ring, sweep, hold or tap fast) helps the colony. See CHANGELOG 0.48 for what each station's game does |
| Eye (top right) | Hide UI: clears the interface in any view; tap again to bring it back (H on a keyboard) |
| Tap the fps panel | Diagnostics to paste back to Claude, Test lander, Test shake, and Reset colony. Tap outside the window to close it |

The **Wallow** station is the postcard shot: a capybara in the wallow under the glass bathhouse, helmet off and a yuzu on its head, watching Earth. Capybaras come in by the airlock and walk down a ramp into the water, and the floating yuzu drift aside as they pass. The **Habitat** station is the night-vision camera over the sleepers. In shoulder, POV and every station, tap the screen to hide or show the interface.

## Live build

The Lunabara artifact link always opens the newest build; each publish replaces it in place, and older builds stay in its version history. `index.html` in this repo is the same build as the live artifact (0.51 at the first commit). Opened anywhere other than the artifact, progress is saved on that device only.

## Tests

Node 18 or later, no dependencies. From the repo root:

```
npm test
```

That parses the game script and runs every headless check below against `index.html`, plus the route sim on five seeds. Each check prints PASS or FAIL. See TESTPLAN for what passing means and the on-device checks.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The game: the current build, one self-contained file (older builds are in the artifact's version history and this repo's history) |
| `DESIGN.md` | What Lunabara is: pillars, the stream, systems and the progression beyond the mass driver |
| `CHANGELOG.md` | Every probe build and what changed |
| `TESTPLAN.md` | Automated checks, device checks and the diagnostics to collect |
| `WORKING-WITH-CLAUDE.md` | How builds are made, delivered and verified |
| `tools/navsim.js` | Headless capybara route simulation (`node tools/navsim.js [seed]`) |
| `tools/smoke.js` | Headless crash test: runs the game for 16,000 frames with chat on and presses every button (`node tools/smoke.js index.html`) |
| `tools/restore.js` | Checks a colony restored from the account save: pups are born, crewmates from Earth come back, landers land, and night brings a goodnight (`node tools/restore.js index.html`) |
| `tools/reset.js` | Checks Reset colony erases both saved copies, including the saves the page makes while reloading (`node tools/reset.js index.html`) |
| `tools/collide.js` | Checks capybaras and pups keep apart, use the wallow ramps and the bathhouse airlock, and nobody gets stuck on a trip (`node tools/collide.js index.html`) |
| `tools/assist.js` | Checks lending a hand speeds the reactor and Pause stops the colony (`node tools/assist.js index.html`) |
| `tools/errlog.js` | Checks the Diag error log keeps file, line and stack, and counts outside "Script error." lines apart (`node tools/errlog.js index.html`) |
| `tools/props.js` | (0.55) Checks nobody walks through the landing pad's berm or light masts, or the uplink dishes, over 25 minutes with landers coming (`node tools/props.js index.html`) |
| `tools/harness.js` | Loads a build headlessly with a hook into its internals; used by `props.js` |
| `tools/shots.py` | Renders a build in headless Chromium with a scripted scenario and saves screenshots and the Diag (see WORKING-WITH-CLAUDE). Needs three.js r128's `three.min.js` and `OrbitControls.js` next to it; they're not committed |
| `tools/scenario.json` | Example scenario for `shots.py`: a wave, a lander coming down, a crewmate stepping off |
| `tools/test-all.sh` | What `npm test` runs |
| `LICENSE` | MIT |

## License

MIT. See `LICENSE`.
