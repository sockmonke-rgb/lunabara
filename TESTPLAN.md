# Lunabara test plan

## Automated (run before every build)

| Check | How | Pass |
| --- | --- | --- |
| Script parses | Extract the game script (the block containing `const BUILD=`), `node --check` | No syntax errors |
| Smoke | `node smoke.js <build>.html` | Frames run and every click has a handler; `errors: 0`; PASS: old lunarium save loaded and moved to lunabara. With chat on, its stream, lander and crew lines print at the end |
| Restore | `node restore.js <build>.html` | PASS: pups born from a restored colony; PASS: arrivals restored; `errors: 0`; if a night fell, at least one goodnight |
| Reset | `node reset.js <build>.html` | PASS: reset erased every copy |
| Lend a hand | `node assist.js <build>.html` | PASS: lending a hand speeds the reactor; PASS: pause stops the colony |
| Collision | `node collide.js <build>.html` | PASS: bodies keep apart (under 0.25% of pair-frames), the wallow is entered by its ramps, nobody stuck, fewer than 1 sharp turn per walking minute |
| Error log | `node errlog.js <build>.html` | PASS: error log keeps file, line and stack; outside "Script error." counted apart |
| Routes | `node navsim.js` with seeds 7, 11, 23, 99, 314 (20 simulated minutes, 7 capybaras, moving rover, some starting inside the greenhouse, by the airlock or on the landing pad) | Unfinished trips 0; overlap 0.00; greenhouse wall, habitat dome, pad, wallow side and bathhouse wall crossings 0 |
| Renders | `python3 shots.py <build>.html out/` with a scenario for what changed | Screenshots show the change; the Diag has no errors other than blocked fonts |

When a building or place is added, add it to the obstacle and place lists in `navsim.js` (0.49 added the comms console, `commsdesk`, and moved the mine and the peel-scooping spot). A place within an obstacle's radius + 0.55 m counts as inside it, and routes to it may cut through that building: keep new places clear (0.41's first stowing spot did this to the habitat).

## On device (iPhone)

Open the build, wait about 20 seconds, then tap the fps panel (top right) → **Copy** and paste it back. The Diag's `errors:` line should read 0.

| # | Check | Pass |
| --- | --- | --- |
| D0 | Boot | Splash fades in and out smoothly; no black flash |
| D1 | Startup fps by second | Reaches 60 within a few seconds; no second at 1 |
| D2 | Normal view fps | 55–60, sim under 2 ms |
| D3 | Pixel view fps | 60; toggling doesn't freeze |
| D4 | Night toggle | No stall; windows, grow light and pool glow come on; Z's over the habitat |
| D5 | Tap accuracy | Tapping a capybara or the rover follows the one you meant |
| D6 | Rotation | Rotate the phone twice; the scene fills the screen and taps still land |
| D7 | Home screen launch | Add to home screen, launch, rotate; controls line up |
| D8 | First person in the wheel | No strobing |
| D9 | Wallow station | A capybara in the wallow, yuzu in its helmet, Earth visible above the ridge |
| D11 | Stations | Each station frames its subject in all four views; no camera inside a building or the ground |
| D12 | Subject vs view | Stations → Rover, View → POV → orbit → top: still on the rover, Stations button still reads Rover |
| D13 | Tour | Advances every 12 s and keeps the current view |
| D14 | Meteor shower | About 90 s in: streaks overhead, capybaras look up, log note |
| D15 | Launch | With the driver built and 3 He-3: capsule charges, runs the rail, climbs toward Earth |
| D16 | Focus ring | Ring under the followed capybara, rover or pup; Next capy shows the name |
| D17 | Earth | Slowly spinning; lit side faces the sun; city lights on the dark side; phase changes as the sun circles |
| D18 | Speed | ×8 holds a steady frame rate; capybaras still path cleanly; back to ×1 is smooth |
| D19 | Wallow calm | On the Wallow station, the camera doesn't move when a capybara walks over, only once one is soaking |
| D20 | Rover ride | With pups: one hops onto the rover at the base, rides the loop, hops off and rejoins its parent |
| D22 | Landscape log | Rotate to landscape and follow a capybara: log notes (or chat) appear above the buttons, never over the colony panel |
| D23 | Shake | Diag → Test shake: the view rumbles, then settles exactly where it was. A launch gives a short shake, the reactor coming online a longer one, also at ×8 |
| D24 | Hide UI | Tap Hide UI in orbit: everything clears except the Show UI button; tap it and the interface returns. The button never covers the follow panel, in portrait or landscape |
| D25 | New look | Capybaras show the head C model and division suits; 55–60 fps in normal view; the Diag triangle count is noted; night lamps still light the base |
| D27 | Camera feeds | Top view reads DRONE-1 · OVERHEAD with a crosshair and ALT/HDG/BAT; a station in shoulder reads CAM NN with scanlines; first person reads HELMET CAM; fps stays 55–60 with feeds on |
| D28 | Habitat night vision | At night, Stations → Habitat: green night vision, sleepers on the rug with helmets off, breathing |
| D29 | Chat | Chat lines appear after real events (a launch, a shower, a pup) and fade; tapping the chat opens the full log; the chat button turns it off and the log notes come back |
| D30 | Walk | Follow a capybara in shoulder view: feet step with the ground (no skating), a small float per step, no bunny-hop; pups step quicker |
| D31 | Wave | (0.50) Nobody waves at the camera any more; the chase camera never swings round. Goodnight and good morning are waves toward Earth, and new crewmates wave toward the base |
| D32 | Goodnight | At lunar night, the last capybara at the airlock turns and waves before going in; "said goodnight to Earth" appears |
| D33 | Lander | Diag → Test lander shows one within 12 s on the Landing pad camera. For real: after every 3rd capsule: "Earth sent a supply lander · ETA 45 s", the Landing pad station tilts up to follow it down, dust and a small shake at touchdown, crates carried to the airlock, then lift-off. The 2nd and 3rd landers each bring a crewmate who steps off waving. fps with the lander in view is noted |
| D35 | Landing crowd and rover | With a lander coming: up to three capybaras stand watching beside the pad, then help unload; ROVER-1 leaves its loop, loads 3 crates at the pad and brings them to the base. Faces inside helmets are readable with the sun behind them |
| D36 | Wheel | Stations → Wheel: side-on, runner lit; following a runner in shoulder view shows the whole wheel |
| D37 | Station orbit | Stations → Landing pad in orbit view: nothing between the camera and the pad |
| D38 | Pause | Speed → … → Paused: everything stops, the camera still moves; next tap returns to ×1 |
| D39 | Lend a hand | Stations → Reactor, View → shoulder: the WELD button appears; taps as the ring meets the edge read GOOD or PERFECT with sparks, and the reactor % climbs faster. fps stays 55–60 |
| D40 | Station games | At each station in shoulder or POV: the right game appears (see CHANGELOG 0.46); holding WATER at the Greenhouse fills the bar and scores on release; the button shows TAP / HOLD→RELEASE / TAP · TAP; at the Wheel and Compost, mashing reads TOO FAST and a steady rhythm scores; a lander's descent lasts about 22 s and GUIDE stays up for it; tapping doesn't zoom the page; the bar and hint stay on screen |
| D41 | POV cameras | Every station in POV: the camera is outside the buildings |
| D42 | Wallow ramps | A capybara walks up a ramp, over the rim and down into the water; leaving, it climbs out the same way. Nobody passes through the pool's side. Yuzu slide aside from a bather instead of passing through it |
| D43 | Personal space | Capybaras and pups don't stand inside each other; a crowd at the airlock or the pad spreads out, and everyone still gets where they're going |
| D44 | Screens | Lab, Comms, Greenhouse, Life support, Nursery and the habitat's Earth screen are readable and change over a few seconds; ANALYSE fills the Lab's MATCH bar |
| D45 | Station lights | At night every station camera shows its subject; the Wheel and Ice mine are lit; the reactor isn't blown out. Reactor ring chase, life-support rings, wheel rim lights and pad approach lights run when they should |
| D46 | Game responses | Each station's game answers in the world (see CHANGELOG 0.49) |
| D47 | Pups at stations | Follow a pup while its parent works: it does that station's thing (cheers at the wheel, nibbles in the greenhouse, peeks at the lab monitor…) |
| D48 | Performance | Diag at the Ice mine at night and on the habitat camera: 55–60 fps, sim under 2 ms; note draw calls |
| D49 | Game view | At each station, View → game: a close camera on what the game changes, with its subject up and left and the button and bar clear of it; no station card or chat over it. Shoulder and POV show no game button |
| D50 | Walking turns | Walkers don't swing round sharply mid-walk; they turn on the spot at a capybara's pace before setting off |
| D51 | Wallow | Soaks last 35–60 s; the bather's head is always there in Wallow POV; a splash rises slowly and hangs |
| D52 | Bathhouse | The wallow is under a glass dome; capybaras go in and out by the airlock (west side) and never through the glass; inside, helmets come off and a soaking capybara wears its yuzu on its head; fps with the dome in view is noted |
| D53 | Spacing | Orbit over the base: buildings have room between them; the Wallow, Comms and Nursery shots still frame Earth |
| D54 | Loading | The bar spans the screen and is full when the splash fades |
| D55 | Wheel and greetings | A runner's body and head bounce and sway with its stride; after a nuzzle, two capybaras step apart before dropping, never into each other |
| D34 | Crewmates kept | Close the app fully after a crewmate has arrived, reopen: the crewmate is still there (Diag `crew:` line) |
| D10 | Progress kept | Close the app fully, reopen: "Colony restored" and the same reactor, samples, pups; Diag save line reads account on |
| D21 | Reset | Diag → Reset colony twice: page reloads to a fresh colony; reopening doesn't bring the old one back |

## Watching checks (5 minutes of play)

- No capybara stands still against a building for more than a few seconds (a wave lasts under 3 s).
- Oxygen recovers after dropping under 92%.
- Peels get scooped and the compost fills.
- Two capybaras greet at least once, and no capybara greets over and over.
- Station views never change what a capybara is doing.
- Chat never mentions an event that didn't happen.
