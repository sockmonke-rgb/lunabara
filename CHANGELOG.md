# Lunabara changelog

Lunabara was called Lunarium up to 0.33.

Probe builds 0.1–0.6 were published as the "Astrobara V4 3D probe". Device results are from an iPhone (iOS 18.7, dpr 3) inside the Claude app.

## 0.53
On device (0.52): the chat, look and hide-UI buttons showed on top of the loading screen.
- **The loading screen now covers everything.** The round buttons, the camera-feed label and the lend-a-hand button stay hidden until the colony is up, and the loading screen sits above all of them.

Checked here: smoke passes. A render taken while the page was still marked as loading showed none of the round buttons. Not verified on device yet.

## 0.52
On device (0.51): 60 fps at the Wallow with the bathhouse (509 draw calls, sim 1.3 ms). The Diag window couldn't be closed by tapping the view behind it. In landscape its Close button was off the screen, and the hide-UI button sat on top of it.
- **Tap anywhere outside the Diag window to close it.** A light shade sits behind the window while it's open, and a tap on the shade closes it without also tapping the scene. Close and Escape still work.
- **The Diag window always fits the screen.** In landscape the text box gets shorter, so the buttons stay on screen, Close included.
- The Diag window now sits above the round buttons in the top right.

Checked here: smoke, reset and errlog pass. A headless render at 844×390 landscape shows Close on screen, and a tap on the shade closes the window. Not verified on device yet.

## 0.51: room to breathe, and a bathhouse
On device (0.50). Feedback:
- The wheel runner's head and body didn't move with its legs.
- The loading bar didn't fill the screen and wasn't full when loading ended.
- Capybaras' heads and bodies collided as a greeting ended.
- The base was cramped. Spread it out, perhaps with the wallow enclosed and its footprint setting the spacing, while keeping the Earth views.

**Layout**
- **The base is spread out along the rim and back from the crater edge.** Buildings had 1–2 m between them; now there are 3–9 m. The level ground reaches further along the rim and north, but not further into the crater, so the crater side stays as it was: the greenhouse's edge, the ice-mine bench, the core-drilling spots and ROVER-1's ice loop.

  | | 0.50 | 0.51 |
  | --- | --- | --- |
  | Habitat | −6, 3 | −9, 4.5 |
  | Greenhouse | −7.5, −5.5 | −11, −6.3 |
  | Wallow / bathhouse | 5.5, 5.5 | 8.6, 8.6 |
  | Wheel | 8, −3.5 | 12.5, −4 |
  | Lab | 1.2, 8.8 | 1.8, 13.5 |
  | Comms tower | 11.5, 8.5 | 17, 13.5 |
  | Reactor | −12.8, −0.8 | −19, −1 |
  | Life support | 4.5, 0.3 | 6.5, 0.4 |
  | Mass driver | 13, −2 | 19.5, −2.5 |
  | Nursery | −9, 12.5 | −12.5, 17.5 |
  | Landing pad | −15.5, 4.5 | −23, 6.5 |
  | Compost | −4.5, 9 | −6.5, 13 |
  | Solar masts | further out along the rim | |

- **Ground and routes moved with it.** Graded ground sits under the pad, the comms seats, the nursery and the reactor. ROVER-1's cargo run now goes north of the habitat to the pad's north side, where the rover's crates are stacked.
- **Composition kept.** The wallow, comms and nursery shots still frame Earth over the horizon.

**The bathhouse.** The wallow is now under a pressurised glass dome, since open water would boil away in the vacuum.
- **Airlock:** on the base side, with a rack of spare helmets just inside.
- **Helmets off:** inside, the capybaras take their helmets off and float a yuzu on their heads.
- **Routes:** walkers go in and out by the airlock and the ramps, and the glass is solid. Pups steer round the pool inside the dome. A capybara leaving uses the ramp by the door.
- **No greetings** in or right by the bathhouse.

**Smaller fixes**
- **Wheel:** the runner's body bounces at each footfall, rocks fore and aft and sways, and its head bobs against the stride.
- **Greetings:** two capybaras rise before closing in, then step back apart while still upright, and only then drop, so their bodies never meet. The nuzzle lasts about a second longer.
- **Loading bar:** spans the full width of the screen and finishes full before the splash fades.

Checked here: all tests pass. navsim has the new layout and counts bathhouse wall crossings (0 on 5 seeds). `collide.js` also fails on walking through the bathhouse glass (0), and on sudden spins (0.3 per walking minute). Renders confirmed the layout from above, the bathhouse with a bather's helmet off and a yuzu on its head, and every station camera. Not verified on device: performance with the dome (one more large glass surface) and how the new spacing reads on the phone.

## 0.50
On device (0.49): 60 fps everywhere. Habitat at night: 372 draw calls, sim 0.6 ms. Ice mine at night: 296 draw calls, sim 1.0 ms. Feedback:
- At the wallow a capybara's head went missing, then popped back.
- Soaks were too short.
- The games covered what they change (the Lab monitor, the wallow).
- Walkers spun round more than 135° as if their goal kept changing.
- Waving at the camera didn't work: the camera swung 180° and the capybara didn't turn.

**Changes**
- **A GAME view.** View now cycles orbit → top → shoulder → POV → **game** at any station. The games live only there now, so shoulder and POV are clean shots. Each station has its own game camera, close on whatever the game changes:
  - **Screens:** the Lab monitor, the Comms console, the Greenhouse crop monitor and the Life support panel.
  - **Lights and rings:** the incubators, the reactor ring and the wheel.
  - **The rest:** the pool from above, the mine rig, the mass-driver coils, the pad (tilting up to a lander) and ROVER-1 from behind.
  
  The picture is shifted so its subject sits up and to the left, clear of the button and bar. The station card, chat and log are hidden in this view, and the button sits lower. Taps on the scene do nothing here, so they can't hide the game.
- **Missing head:** fixed. Station POV views hid the followed capybara's head as if the camera were in its helmet, but the Wallow POV camera sits behind the bather. The head is now hidden only in a real helmet cam.
- **Longer soaks:** 35–60 s in the wallow (was 6–11).
- **No more sudden spins.** There were two causes:
  - **Zigzag plans.** The route planner could leave detour points that zigzagged back and forth (one plan had 9 waypoints within half a metre). Plans are now straightened: any waypoint that can be skipped in a clear straight line is dropped. Doors, ramps and exit points are never skipped.
  - **Instant turns.** Walkers turned instantly. They now turn at most about 200° a second (twice that on the last metre to a waypoint), and slow through a turn. More than about 80° off, they turn on the spot before walking.
  
  Headless: sharp turns (over 135° within 0.6 s) fell from 3.2 to 0.4 per walking minute.
- **Head-on meetings:** two walkers meeting in a doorway now step to their right instead of shoving each other back and forth. One that's been shoved for a while slips past. This stopped a deadlock at the greenhouse door that the straighter paths had exposed.
- **Waving at the camera:** cut. Goodnight and good morning are now waves toward Earth (the capybara turns to face it), and a crewmate stepping off the lander waves toward the base. The chase camera no longer swings round.
- **Water in one-sixth gravity.** A capybara settling in, a pup hopping in or a yuzu landing throws a splash that rises about six times higher than it would on Earth and falls slowly. The surface sloshes gently with a long, slow period.
- A soaking pup's spot is kept inside the pool. It used to jitter on the rim.

Checked here: all tests pass. `collide.js` now also fails on sudden spins, and `assist.js` plays in the game view. Renders confirmed the game view at all 14 stations (screens and subjects up and left, clear of the button) and the bather's head in Wallow POV. Not verified on device yet.

## 0.49: collision, and every station comes alive
On device (screenshots of 0.48): capybaras clipped through each other and into the sides of the wallow, and the yuzu floated through them. Several stations were empty or unreadable. The Ice mine and Wheel were too dark (at night especially), and the Ice mine camera looked the wrong way. The Comms camera showed nothing, the Nursery had no props, and the habitat read as a bare room. Mark asked for a collision pass plus a diegetic and believability pass on every station.

**Collision**
- **Wallow ramps.** Two ramps, one on the base side (west) and one on the comms side (east), with treads and hand rails. Capybaras and pups walk up a ramp, over the rim and down into the water, and leave the same way. Their feet follow the ramp and their bodies pitch with the slope. A capybara standing about in the water now stays in the water instead of popping up to ground level. Greetings don't start in the water or on a ramp; a greeting had been able to drag one out through the side.
- **Personal space.** Capybaras and pups ease apart instead of walking through each other. A capybara at work on a fixed spot gives way less than one walking about. Greeting partners and the pair on the comms seats may stand close. A capybara on its last steps into a shared spot (the airlock, the compost bin) isn't blocked, so it still arrives. Headless: bodies inside each other went from 0.77% of pair-frames to 0.04%.
- **Yuzu float and get nudged.** Each yuzu drifts on a slow swirl, bobs, rolls, and is pushed aside by a bather's body and helmet. The yuzu keep apart from each other, and out of the ramps and the pool wall.
- **Pups use the ramps too**, including a pup that runs from the wallow to catch ROVER-1. A pup on a ramp that's headed elsewhere walks down to the ramp's foot first.
- **No more walking through the greenhouse glass.** A capybara just outside the greenhouse's corner could be routed "out through the door", straight through the glass. The door is now used only from really inside.
- **The rover shoves first, then the buildings,** so a shove from ROVER-1 can't leave a capybara inside a building.
- **Heads can't turn into the glass** or the neck ring: the head's turn is capped.
- The peel-scooping spot moved 20 cm back from the wallow, because routes to it had been allowed through the pool.

**Believable ground**
- **The ice mine has a bench.** The crater wall there drops about 3 m per metre: the rig stood on a cliff face, with the capybaras "checking" it from 6 m above. A level shelf is now cut into the wall. The rig, ROVER-1's stop and the capybaras all share it, and rocks are kept off it.
- **Graded pads** under buildings that sat on the slopes off the base: the landing pad was tilted about 30°, the comms tower and its seats sat on a hillside, and the nursery dome was half buried in one.

**Every station, alive**
- **Screens**, drawn only while their station (or a capybara working there) is on camera:
  - **Lab:** a bigger bench monitor running the core analysis: a spectrum with a sweep line, mineral readings for the sample, and a MATCH bar that ANALYSE fills. A logged sample flashes **LOGGED ✓**, whether a capybara or you logged it.
  - **Comms:** a console by the Earth seats, with Earth turning (with its real phase), the Moon, and data packets travelling both ways over the link. SIGNAL sends a heart home and lights the beacon.
  - **Greenhouse:** a crop monitor by the door that pages through the bay (fruit on each tree), the soil (water, compost, N-P-K), growth over time and the light schedule. While you WATER it reads WATERING.
  - **Life support:** oxygen, CO2 and fan speed. When the filters are due, it blinks FILTER SWAP DUE.
  - **Nursery:** a baby monitor with a heartbeat trace, the pups' names and the time to the next pup.
  - **Habitat:** a wall screen showing Earth.
- **Running lights:**
  - Once the reactor is online, light chases round its ring. While it's being built, a WELD flashes the ring.
  - Rings of light rise up the life-support tanks, faster while a capybara services them or you FILTER; the scrubber fan spins up too.
  - Rim lights on the wheel follow its spin, and a CHEER sets them racing gold.
  - Approach lights round the landing pad run while a lander is coming in, and flash green for a good GUIDE.
- **The greenhouse moves:** sprinklers on the ridge mist on a timer and whenever you WATER, the trees stir, and the soil dries slowly.
- **The ice mine works:** the drill shaft turns while the rig is busy (a capybara on it, ROVER-1 loading, or you drilling), dust kicks up, and the ice band brightens.
- **Nursery:** three incubators and the baby monitor on the camera side, with toy blocks. An incubator glows warm for each pup. LULLABY sends notes up and slows their glow.
- **Habitat, lived in:** four beds round the wall with pillows and folded blankets, a braided rug, a low table with a teapot and mugs, shelves of books with a potted yuzu, plants, string lights and the Earth screen. The walls are warmer. The ceiling lamp dims to a night light at night, and further for a while after TUCK IN. The habitat camera now looks across the room instead of straight down at the rug.
- **Every game answers in the world:** sparks and a ring flash (WELD), rising rings (FILTER), mist (WATER), a churning heap (TURN), racing rim lights (CHEER), a ripple where the yuzu lands (DROP), dust behind the rover (BOOST), the drill spinning (DRILL), notes (LULLABY), green pad lights (GUIDE), a packet and the beacon (SIGNAL), the monitor (ANALYSE) and the lamp dimming (TUCK IN).
- The wallow ripples round bathers now and then.

**Light at night, and in the crater's shadow**
- **A lamp at each station** without a light of its own (Wheel, Lab, Life support, Compost, Comms, Mass driver, Landing pad, Nursery, Reactor), plus two floodlights on the ice-mine rig. The fixtures glow, brighter at night.
- **One real light, the station lamp,** goes to whichever station is on camera: at night, and by day at a station in shadow (the ice mine). Following a capybara at night, it becomes that capybara's headlamp. Otherwise it lights the mine. It's one extra light at night, and a single light by day only in shadow. All three light sets are compiled behind the loading screen.
- **Station cameras turn their gain up in the dark,** like real CCTV.
- Helmet and pack lamps brighten at night.

**Pups at stations.** While a parent works, its pup has its own thing to do:

| Station | What the pup does |
| --- | --- |
| Wheel | Cheers the runner (hops and stands up) |
| Greenhouse | Nibbles grass alongside |
| Lab | Stands up to peek at the monitor |
| Reactor, mass driver | Watches the welding from a safe distance |
| Life support | Watches the oxygen rings rise |
| Compost | Digs alongside |
| Wallow edge | Fishes for peels |
| Comms | Watches Earth beside the seats |
| Crater edge | Watches the drill |
| Ice mine | Peers at the tank |
| Solar mast | Chases dust round its parent |
| Airlock nap | Naps alongside |
| Landing pad | Watches the lander |

**Cameras**
- **Ice mine:** along the new bench, not down the cliff.
- **Nursery:** from downhill, with the base behind the dome and the incubators in front.
- **Landing pad:** higher, clear of the solar mast.
- **Mass driver:** takes in the whole rail.
- **Comms:** the new console is in view.

**Also**
- Fixed: 0.48 had commented out the line that drains the hold bar after a release.
- Draw calls: 308 → 332 at the Ice mine at night (headless count). The ramps, the lamp fixtures and each station's props are merged into one draw per material, and small props don't cast shadows.

Checked here: all tests pass, including the new `collide.js` and navsim's new wallow side crossings (0 on 5 seeds; 37–50 with the ramps removed). Renders of every station by day and night, the ramp walk-in with yuzu being pushed, pups at the Lab and the Wheel, the habitat interior and the reframed cameras all looked right. Not checked in renders: the greenhouse sprinklers, the note sprites and every game's world response (these were checked in code only). Performance on device is unknown: please send a Diag from the Ice mine at night and from the habitat.

## 0.48
On device (0.47): the Greenhouse hold filled too fast and punished overshooting by restarting, and KIWI's head was stuck turned towards something off screen.
- **Greenhouse WATER is gentler.** The bar takes 3.2 s to fill (was 2.2). Holding past the top no longer restarts the bar: it stays full until you let go, which counts as a plain **MISS**. The lit zone is wider (22%, was 16%). A missed hold keeps your streak.
- **Pup heads no longer stick.** For pups, only the head's up-down tilt was reset each frame, so after a pup looked at the camera (waving with its parent) or at a launch or lander, its head stayed turned that way. The whole head now resets every frame, at the parent's side, riding the rover and waiting for it, and pups gently look about.

Checked here: all tests pass. The pup fix follows from the code; it wasn't reproduced in a render. Not verified on device yet.

## 0.47
On device, 0.46 at 45–60 fps. The station games work. Feedback: the button should say what to do, mashing beat the Wheel and Compost games, the Greenhouse game vanished too fast, and the landing was too short to play.
- **The button says what to do.** A small line above the station's word: TAP (ring and sweep), HOLD, which turns to **RELEASE** while you hold, and TAP · TAP (the rhythm game). The hint under it now spells the game out ("tap while the marker is in the lit zone", "hold, then release in the lit zone", "tap steadily to keep the bar in the zone").
- **Wheel and Compost: no more mashing.** The tap-fast game is now a rhythm game. Each tap pushes the bar up and it sinks between taps. Only a tap that lands the bar inside a narrow lit band scores (PERFECT near the middle). A tap that pushes it over the top reads **TOO FAST**: the bar empties and there's a short pause before you can tap again. The band moves now and then. Headless check: over 15 s, 150 mashed taps scored 15, and tapping whenever the bar sank to the bottom of the band (49 taps) scored 40.
- **Greenhouse:** the WATER game is always open. It disappeared once the trees were full, which in a thriving colony was almost at once. With the trees full, watering keeps fruit growing fast (+10 s of the growth boost per good go). The hold fills more slowly (2.2 s, was 1.3), so there's time to aim for the zone.
- **Landing:** the descent takes 22 s (was 12). GUIDE is open for the whole approach and descent, and it no longer shortens the wait. Five good goes make a **perfect landing**: "Viewers guided a perfect landing", everyone cheers up (so waves are likelier) and viewers pour in. The Landing pad status shows "guidance n/5".
- Diag: the `lend a hand:` line also shows the current game, bar and zone.
- The button's text is changed in place rather than rebuilt, and a hold captures the finger, so a hold isn't dropped if the finger slides.

Checked here: all tests pass. assist.js now checks that a steady rhythm beats mashing at the Compost bin. Renders confirmed "TAP · TAP / TURN" with the band at the Compost bin, and "HOLD" turning to "RELEASE / WATER" while the Greenhouse bar fills. Not verified on device yet.

## 0.46 — a game at every station
On device (screenshots of 0.45): 58–60 fps. Asked for a thematic minigame at the other stations. The screenshots also showed several POV station cameras inside or against buildings (Lab, Nursery, Ice mine).
- **Every station has its own game** in shoulder or POV view, whenever there's something to do there. There are four kinds:
  - **Ring:** a ring closes in on the button; tap as it meets the edge.
  - **Sweep:** a marker runs along a bar; tap while it's in the lit zone.
  - **Hold:** hold the button to fill the bar, and let go inside the lit zone. Letting go early reads "TOO SHORT", late "TOO LONG".
  - **Tap fast:** keep the bar up; while it's high, every tap counts.

  | Station | Game | What it does |
  | --- | --- | --- |
  | Reactor | WELD (ring) | Reactor progress, sparks, welders ×3 for 4 s |
  | Mass driver | WELD (ring) while building; CHARGE once built | Driver progress; then brings the next launch closer (−5 s a perfect) |
  | Life support | FILTER (ring) | Oxygen |
  | Greenhouse | WATER (hold) | Fruit grows |
  | Compost | TURN (tap fast) | Compost fills |
  | Wheel | CHEER (tap fast) | The wheel spins faster; the runner keeps going longer and cheers up |
  | Wallow | DROP (sweep, the marker is a yuzu) | Drops a yuzu from the greenhouse into the wallow; a bather cheers up |
  | Rover | BOOST (ring) | ROVER-1 drives twice as fast for a few seconds (ice loop and cargo runs) |
  | Ice mine | DRILL (hold, dust) | Ice for the air and the crops: oxygen and a little fruit |
  | Nursery | LULLABY (ring) | The next pup comes sooner (−3 s a good go); pups cheer up |
  | Landing pad | GUIDE (sweep, only while a lander is inbound) | Brings the lander in sooner (−3 s a good go) |
  | Comms | SIGNAL (sweep) | Sends a heart to Earth; viewers pour in |
  | Lab | ANALYSE (sweep) | Every 6 points logs a core sample ("Viewers helped log core sample #n") |
  | Habitat | TUCK IN (hold, at night with sleepers) | The sleepers wake up in a good mood, so they're more likely to wave |

  The button hides when there's nothing to do there (for example, Wallow with 6 yuzu floating or no fruit to pick, or Landing pad with no lander coming). Cheering someone up sets the good mood that 0.44's waves need.
- **Station POV cameras stay out of buildings.** The closer POV shot is now a bit further out and at least 1.6 m up, and it's pushed out of every building's footprint. Nursery and Compost cameras are further back overall, because both buildings are small.
- The Lend a hand bar sits to the left of the button and its hint is right-aligned, so neither runs off the screen.

Checked here: all tests pass. assist.js now also checks the tap-fast game (43 hits from 50 fast taps at the Compost bin) and the sweep game (20 hits from 120 untimed taps at the Lab: untimed taps land sometimes, not always). Renders confirmed the ANALYSE sweep at the Lab (camera now outside the building), the WATER hold with the bar filling, and the DROP sweep with a yuzu marker over the wallow. The hold game was driven with pointer events in the render, not a real finger. Not verified on device yet.

## 0.45
On device, 0.44 at 58–60 fps. The Wheel station works, but runs were too short. Asked for a pause, and a way to help at a station from its first-person view.
- **Longer runs on the wheel:** 25–40 s (was 6–10), and the wheel is picked a little more often.
- **Pause:** Speed now cycles ×1 → ×2 → ×4 → ×8 → **Paused** → ×1. Paused stops the colony: sun, capybaras, rover, launches, countdowns. The cameras, the Look settings and the Diag still work, and chat goes quiet.
- **Lend a hand.** When you watch a station through its own camera (shoulder or POV) and it has work to do, a round button appears on the right with a ring closing in on it. Tap as the ring meets the button's edge:
  - **PERFECT** (close) or **GOOD** (near) adds a little progress straight away. It also makes the capybaras working there go three times as fast for 4 s.
  - **MISS** resets the streak. The feedback shows the streak ("PERFECT ×5").
  - Stations and their work: **Reactor** (WELD, sparks fly; it goes through the same milestones, including "Fusion reactor online"), **Mass driver** (WELD, once the reactor is online), **Life support** (FILTER, oxygen), **Greenhouse** (WATER, fruit), **Compost** (TURN).
  - It runs on real time, so it plays the same at any speed, and it's hidden while paused, in cinema mode and with the UI hidden.
  - Chat notices ("Viewers lent a hand at the Reactor"), once per station and again at a streak of 8.
  - The colony's own pace is unchanged: helping is a bonus, not a requirement. In a headless test, 20 s of good taps added 10.5% to the reactor, against 6% for 20 s of the capybaras alone.
- Reactor and mass-driver progress now go through one place for both the capybaras and your taps, so milestones fire whoever crosses them.
- Diag: a `lend a hand:` line (hits, perfects, best streak, where it's up now). `speed:` reads "paused" when paused.
- New test `assist.js`: taps the Reactor button in time and checks it speeds progress, then checks Pause stops the colony and ×1 comes back.

Checked here: all tests pass, including the new one. A render confirmed the WELD button and ring at the Reactor station. Not verified on device yet, including how the timing feels under a thumb.

## 0.44
On device (screenshots on 0.42): the shoulder camera on BRUNO in the wheel was too close and too dark to see what was happening, the Landing pad's orbit view opened with a solar mast in the way, and capybaras waved too often.
- **Wheel station.** A new station, between Greenhouse and Lab. It looks side-on through the wheel from whichever side the sun is on, so the runner is lit, and the status line names the runner.
- **Following a capybara in the wheel:** the shoulder shot is pulled back to 5.8 m (was 3.6) and aimed at the middle of the wheel, so the whole wheel and its runner are in frame. It is also taken from the sunlit side.
- **Stations open from their own side in orbit.** Tapping to a station in orbit view used to keep your previous angle, which for the Landing pad put the mast at (−13, 9) between you and the pad. Each station now opens from its showcase side, and you can still drag round from there. The Landing pad opens from out west, with the pad in front and the base behind it, so nothing stands in the way.
- **Rarer waves, with conditions.** Before, any capybara near the camera could wave, including walkers and workers, about once every 12 s across the colony. Now:
  - It must be standing about, or resting at the comms seats or by the airlock. Not walking, working or carrying.
  - The camera must be close (7 m, or 25 m if you follow it), in view and in front of or beside it.
  - It must be in a good mood: 40–60 s after a greeting, a soak in the wallow, a launch, a landing or a new pup. The exception is when the camera is right up close (under 4 m).
  - At most one wave every 40 s across the colony, and 3–5 minutes before the same capybara waves again. Starting to follow someone makes them wave only 30% of the time, and only in a good mood.
  - Goodnight, good morning and crewmates stepping off a lander still always wave.

Checked here: all tests pass. Renders confirmed the Wheel station with TUPI running, lit from the sun side, and the Landing pad's orbit view with the pad clear in front of the base. The follow shot of a runner in the wheel wasn't captured here. Not verified on device yet.

## 0.43
On device, 0.42 at 60 fps (low 59), 446 draw calls, 159k triangles, sim 0.8 ms, 0 errors. Test lander works. LUNA's head was dark and unreadable when she waved.
- **Helmet light.** With the sun 3° up and behind a capybara, its head went nearly black inside the bubble. The fur and ears now glow faintly in their own colour, like a small lamp in the helmet (0.32 by day, 0.55 at night). No real light is added, so it costs nothing per frame.
- **The shoulder camera swings round for a wave.** In 0.42 it slid straight from behind to in front, through the capybara's body, which is part of what you saw. It now goes round on an arc at the same distance, rising to head height in front, and swings back afterwards.
- **A crowd at the landing.** When a lander is announced, up to three capybaras who aren't busy go to a watching spot beside the pad. They stand up on their hind legs to watch it come in and cheer it down. When they're done watching, they help unload. While a lander is descending or lifting off, capybaras around the base who are free stand up and follow it with their heads, as they do for launches. Unloading is also more popular (weight 4.5, was 3), with room for three workers at once.
- **ROVER-1 hauls cargo.** Every lander now brings 6 crates: 3 for the capybaras to carry and 3 stacked on the pad's west side for the rover. At its next stop at the base, ROVER-1 leaves its ice loop and drives to the pad on its own route, south of the greenhouse and west of the reactor. It loads the 3 crates onto its roof, drives back and unloads them at the base (fresh yuzu, full oxygen, faster fruit), then returns to the ice loop. It waits if a pup is riding or waiting. The lander stays until the rover has its cargo, or up to 5 minutes. Rocks are cleared off the route.
- Test lander's ETA is now 12 s, so the crowd has time to arrive.
- Diag `lander:` line: crates for the rover, cargo runs, and who's watching at the pad.

Checked here: all tests pass. restore.js now requires at least one cargo run (it saw 4). Routes pass for 5 seeds with the watching spot. Renders confirmed LUNA's face readable with the helmet light and the camera in front for her wave, three capybaras standing to watch the test lander, and the rover loading at the pad (from the Diag). Not verified on device yet.

## 0.42
On device, 0.41 at 60 fps (low 59), reactor 37%. BRUNO waved at the chase camera with his back to it, and heads tended to snap upward.
- **Waves face the camera.** Both bugs came from the shoulder (chase) camera, which sits behind the capybara it follows and turns with it. A waving capybara turned to face the camera, so the camera swung round behind it again. It also aimed its head at a point behind and above itself, and that pitched the head straight up. Now:
  - While the capybara you follow in shoulder view waves, **the camera comes round to its front**, then returns behind it. That capybara doesn't turn.
  - Others turn to face the camera while idle or walking (before, only walkers turned).
  - Wavers look at where the camera is now, not where it was when the wave began.
  - A look target behind the head can tilt it up only a little (0.2 rad, was 0.6). This also covers any other up-snap from a target behind.
- Starting to follow someone makes them wave 45% of the time (was 70%).
- **Test lander** in the Diag: brings a lander down within 6 s and cuts to the Landing pad camera, so you can see a landing before the colony earns one. It counts as no delivery and brings no crewmate; its crates still work.
- Diag: a `next lander:` line says what the next lander is waiting on (e.g. "reactor 37% → mass driver → 3 capsules"). Real landers need the reactor online, then the mass driver built, then 3 capsules sent.

Checked here: all tests pass (smoke now presses Test lander). Renders confirmed the shoulder camera coming round to the front for BRUNO's wave, a capybara turning from facing away to face the orbit camera, and the test lander descending in a fresh colony. Not verified on device yet.

## 0.41 — on camera
The capybaras know they're live, Earth writes back after the mass driver, and the walk cycle from the Moon Suits page.

**They know they're on camera**
- **Waving at the lens.** Now and then a capybara near the camera, or the one you're following, stops, stands up on its hind legs, looks straight into the lens and waves a front paw (happy face). When you start following someone, they notice the chase drone about 1.4 s later, 7 times out of 10. A pup near its parent waves along. Waves are spaced out (12 s between any two, 45–90 s for the same capybara), and chat reacts ("MOCHI WAVED 😭", "hi MOCHI!! 👋").
- **Goodnight.** At lunar night, the last capybara to reach the airlock (not counting the two on watch) turns and waves goodnight to the stream before going in. "PIP said goodnight to Earth".
- **Good morning.** At sunrise, the first one out stops to wave.

**Past the mass driver: supply landers**
- A **landing pad** west of the reactor (amber ring).
- **Every 3 capsules sent home earns one lander back from Earth.** It's announced with a 45 s countdown, comes down on its engine in 12 s (flame, dust, a small shake at touchdown), and unloads 3 crates.
- Capybaras carry the crates to the habitat airlock (Operations prefers the job). Each crate does something: **fresh yuzu** (+6 fruit on the trees), **spare CO2 filters** (oxygen to 100%) or **yuzu seedlings** (faster fruit for 5 minutes). Then the lander lifts off for Earth.
- **The 2nd and 3rd landers each bring a new crewmate**, named by chat: **SORA** (Science) and **MOMO** (Operations). They step off the lander, wave at the camera, and everyone comes to say hi. Crewmates are saved with the colony, like pups, and can have pups of their own. The colony tops out at 9 adults.
- A colony that already sent capsules (yours may have hundreds) catches up one lander at a time, with a 90 s pause between them.
- **Landing pad station:** the camera tilts up to follow a lander coming down. Tour cuts to it for the landing.
- The colony readout's first line shows the next lander once the driver is ready ("landers 1 · next in 2", "lander T-30s", "lander on the pad"). The viewer count rises with landers and crewmates.

**Walk cycle (from the Moon Suits page)**
- The legs now step with the **distance actually walked**: a full stride per metre, so feet no longer skate at any walking speed.
- The 0.32 m bunny-hop is gone. The whole capybara **floats 4.5 cm at the top of each step**, with a small sway. The walk swings less (0.38, was 0.6), with the same knee lift.
- The head **looks around** while walking. Standing still, capybaras **breathe** and **shift their weight**.
- Pups take **quicker, shorter steps** (0.3 m stride, more knee lift) and float 3 cm.

**Other**
- The habitat has 9 sleeping spots on the rug (was 7), for the new crewmates.
- Diag: new `lander:` and `crew:` lines (lander state, landers earned and landed, crates, crewmates from Earth, adults, waves at the camera).

Checked here: all tests pass (smoke with chat on: 39 clicks, 5 landers, 2 crewmates, 3 waves, 0 errors; restore: pups born, SORA restored, 2 landers, a night with a goodnight; reset; errlog). Routes pass for 5 seeds with the pad and the two new places, 0 pad crossings. Real three.js renders (SwiftShader) confirmed: a capybara standing to wave with its head turned to the lens, the lander coming down against the stars with its flame, the lander on the pad with crates, and SORA stepping off and waving. With the lander and 8 adults in view, one render counted 595 draw calls and 212k triangles; the old top view on device was 903 calls at 58.5 fps. **Not verified on device yet**, including fps and how the wave reads at phone size.

## 0.40 — the colony is a livestream
Published 26 September. Its notes weren't saved to the project at the time; this entry is written from the code.
- **Camera feeds.** Each view is a camera in the colony with its own look and label, top left: DRONE-1 for orbit and top (it hovers slightly; the top view has a crosshair and an ALT/HDG/BAT readout), DRONE-2 CHASE for shoulder, HELMET CAM for first person (O2 readout), CCTV `CAM NN · STATION` for station shoulder and POV (scanlines, grain, a rolling band), ROVER-1 dash cam and rear cam. The looks are two light full-screen draws over the finished frame, with no extra render target.
- **Habitat camera** (new station): a surveillance camera high on the wall inside the habitat. At night it switches to **night vision** (green, IR). Sleepers lie curled on a rug with their helmets off, breathing. The interior is drawn only while this camera is on. The habitat shell's end caps were removed because they blocked it.
- **Viewer count** ("LIVE 1.7K watching"), built from the colony's progress, with spikes on big events that halve every 50 s.
- **Chat.** It reacts to real colony events (meteors, pups, launches, the reactor, rides) and to the camera on air, with occasional ambient lines. It never invents events. With chat on, log notes go into the chat as ◆ system lines. Tap the chat to open the full chat and event log. The chat button (speech bubble, top right) turns it on or off.
- **MET** (mission elapsed time) clock on the feeds, saved with the colony.
- The Look panel gains "Camera feeds on/off".

## 0.39
On device, 0.38: the drilling head no longer flips, but still moved. Matrix at ×1, landscape, top view: 58.5 fps average (low 51), pixel ratio 2, 903 draw calls with the whole base in view. Two "Script error." lines with no file at 73.8 s.
- **The drilling head holds still.** It looked at the drill bit, which rises and falls, so the head nodded with it. It now looks at the hole, which doesn't move. Headless check: the head angle stays within 0.003 rad for the whole drill.
- **Diag:** a "Script error." with no file comes from a script served by another site (the app around the page), not the game. The browser hides its details on purpose. These are now listed apart ("plus N hidden Script error. from outside the game"), so `errors:` counts only the game's own.

Checked here: all three tests pass; drilling renders without errors. Not verified on device yet.

## 0.38
On device, 0.37 in Matrix at ×8 speed: 16 fps (low 9), drawn at 3× pixel ratio, sim 7.7 ms, one frame of 679 ms. PIP's head flipped around while drilling a core.
- **Drilling head flip fixed.** Standing up to drill puts the bit almost straight below and slightly behind the head, relative to the body. The head's left–right angle was worked out from that and swung between its two limits whenever the drill judder nudged the bit across the middle. Now a target behind or below counts as straight ahead, and the head eases toward where it's looking instead of snapping. The same fix covers following the launch capsule.
- **The head eases between poses:** arriving at a job, starting to drill, stopping. In a headless run of three drilling trips, the biggest single-frame head jump went from 2.1 rad (120°) to under 0.3.
- **ASCII draws at no more than 2× the screen's resolution** (it was 3×, more than twice the pixels). It also gets the automatic resolution drop Clean has when fps sags. Pixel keeps 3×; its blocks don't need more.
- Part of that Matrix reading is ×8 speed rather than Matrix: at ×8, the colony and the terrain's sun shading update 8 times a frame (sim 7.7 ms against 0.9 at ×1).

Checked here: all three tests pass, drilling renders with the head steady on the bit, and Matrix still renders. Not verified on device yet.

## 0.37
On device, 0.36 ran at 60 fps (low 44 while booting), with 384 draw calls, 161k triangles, sim 0.9 ms and no errors.
- **Look and Hide UI** are now two small icon buttons, a gear and an eye, in the top right under the fps panel. They no longer overlap the colony panel. If a narrow screen would make them touch it, they drop below it. They hide while the Look panel is open, and the panel now sits above them.
- **First person:** the capybara you're riding with no longer draws its own head, helmet or neck ring, so the view is clear. Everyone else still shows theirs.
- **Pups on the rover** take turns: about 3 s standing on their hind legs looking around, then back on all fours. Happy face throughout.
- **Watching Earth:** now and then the watcher stands on its hind legs, for about 5 s out of every 16. A pair at the comms seats stands up together.
- **Matrix:** picking the Matrix style sets up the whole Matrix look: ASCII, falling rain, mirrored katakana and digits, edges off, 6 px cells. Each setting can still be changed afterwards.

Checked here: all three tests pass. Real renders confirmed the clear first-person view, the new button spot, the Matrix preset, a pup standing and dropping on the rover, and a comms watcher standing. Not verified on device yet.

## 0.36 — new capybaras, division suits, looks
Everything from the Capybara Head Concepts and Capybara Moon Suits pages, plus craters and the ASCII looks.

Capybaras:
- **Head C (Sculpted)** replaces the brick head. It turns inside a helmet that stays fixed on the suit's neck ring, and a seal closes the ring so no suit shows inside the glass.
- **Expressions**, chosen by what the capybara is doing: content, happy (magenta #E53B7A blush that ignores lighting, draped onto the cheek), zen (wallow), sleepy, curious, focus (half-closed eyes while welding or drilling), and chewing (grass blades and round cheek pouches under the eye).
- **Division suits.** Every adult belongs to a division, and its suit shows it, like a crew uniform rather than a flag:
  - Engineering (PIP, BRUNO, NILO): matte charcoal with amber bands and helmet lamps. Prefers reactor, mass driver and solar masts.
  - Science (LUNA, TUPI): white with blue stripes and a gold sun visor. Prefers lab, crater drilling and comms.
  - Operations (MOCHI, YUZU): white with green stripes. Prefers greenhouse, life support, compost, peels and the ice mine.
  - A division's own jobs weigh 1.8× when a capybara picks what to do next; it still does everything else.
- **Pups wear their parent's suit**, with no tool arm.
- Stripes are painted onto the suit (flush, no shells sticking out). Knee bellows and a proper walk cycle with bending knees.
- A faint self-glow in the suit's own colour. The pole sun sits 3° up, so any face turned from it went black and white suits read as dark.

Activities:
- **Welding** at the reactor and mass driver: a tool arm unfolds from the chest, sparks fly and the helmet darkens like welding glass.
- **Rearing up on the hind legs** to drill a core (drill rig in front, dust), to watch a launch (head tracks the capsule) and to nuzzle.
- **Greetings are choreographed:** approach to arm's length, rise while closing in, nuzzle upright with hearts, drop and step back. Sniffs are a helmet bump with a head tilt. No more clipping at the start.
- **Greenhouse grass:** a grass bed along the greenhouse. Capybaras graze there (head down, chewing face) instead of "eating citrus".
- The follow panel shows the division: "LUNA · SCIENCE".

Looks:
- **Crater relief:** small craters and pebbles pressed into the ground as a normal map. Settings: on/off and depth.
- **Pixel button cycles Clean → Pixel → ASCII.** Clean is the default.
- **Look button** (gear, next to Hide UI) opens the settings: look, relief and depth, and for ASCII the tune, colour style, Matrix rain, characters, edges and cell size. Defaults resets them. The choice is kept on this device.
- ASCII uses the settings from the Lunabara ASCII Look page. If the phone's font lacks the chosen characters it falls back to Latin.

Checked here: all three tests pass (smoke 33 clicks with rides and births, restore, reset). Routes pass for 5 seeds with the greenhouse target moved to the grass bed. Real three.js renders confirmed welding, the greeting, watching a launch, drilling, grazing, the three division suits, craters in Clean, Pixel, ASCII and Matrix, and the Look panel. About 350–460 draw calls and 155–180k triangles in those renders; 0.35 on device was 514 calls and 128k. **Not verified on device yet, including fps.**

Test tools: they now find the game script by content instead of position, and stub `removeItem`, which 0.34's save migration calls.

## 0.35
- The two three.js scripts load with `crossorigin`, so library errors show their real message in the Diag instead of "Script error.". If that load fails, a fallback loads them the old way; the Diag's "3d library" line says which happened.
- The error log starts before the library loads and keeps the file, line and first stack lines of up to 5 errors plus the latest.

## 0.34
- Renamed to Lunabara. Saves move to the key `lunabara`; older `lunarium` and `astrobara-v4-probe` saves are read once and the old key removed.

## 0.33
- Capybara head, rebuilt from reference photos. A capybara's head is a long blunt brick: flat on top from the ears to the nose, with the muzzle as tall as the skull. It has a broad flat dark nose pad high on the front, small eyes high on the sides, and small round darker ears up at the back. 0.32's was a ball skull with a narrower tapering snout and a round nose tip, which read as a dog.
- Helmet: one clear sphere with a metal collar at its base, where it meets the suit. The tinted visor layer is gone, and so is the upright ring that looked like a hoop in front of the face. It draws only its near side, so the far side no longer muddies it.
- Fur on the head: a fine strand texture tiled small, on a bright base so it doesn't darken the coat colour. One small texture shared by every capybara.
- Checked the proportions with side and front drawings made from the exact shapes in the code. All three tests pass. Not verified on device yet.

## 0.32
- On device, 0.31's capybaras didn't fit their suits: the fur body was longer than the suit (0.72 against 0.68), a second fur shape stuck up through its back, and the backpack was half buried in the rear. 52 fps.
- The suit is now the body. Fur shows only on the head inside the helmet, still in each capybara's own colour. Legs are suited, with dark boots. The life-support pack sits on top of the back again, where carried things rest.
- Fur texture removed: it was mostly hidden by the suit, and it meant an extra texture per coat colour.
- Lighter model: about 7,200 triangles per capybara (from about 17,400) and 21 parts (from 29). The whisker dots are gone (six tiny parts each), the tiny face parts no longer cast shadows, the eyes are no longer glossy, and the shadow map is back to 1024 (soft filtering kept).
- On device: suits fit, 57 fps. But the helmet was hard to read, the head showed no fur, and the snout looked like a dog's.

## 0.31 — merged with ChatGPT's 0.29 and 0.30
ChatGPT's two builds started from 0.28, so they had neither buzz nor shake. This build is our 0.30 with their changes on top.

From their builds:
- **New capybara model:** smoother body with shoulders, rounded ears, glossy eyes, nose and whisker dots, a white EVA suit with a dark backpack and boots, a metal neck ring, a tinted visor inside a glossier helmet, and a subtle fur texture.
- **Look:** smooth shading instead of faceted (flat shading off), softer and sharper shadows (soft filtering, 2048 map instead of 1024), sun 25% dimmer and earthshine a little brighter, 4,200 smaller stars instead of 1,800.
- **Physically correct lights:** in three.js r128 this only changes how the three night lamps (habitat, greenhouse, pool) fade with distance, so nights may look darker around them.
- **Hide UI button:** clears the whole interface in any view, including orbit and top. The button stays so you can bring it back.
- Tighter spacing on small screens and in landscape. The log also repositions when the visible screen area changes. On a keyboard, Escape closes the Diag and H toggles the interface. The version number is kept in one place.

Changed while merging:
- The Hide UI button sat on top of the follow panel in portrait. It now sits just under the fps panel, top right. Labels are Hide UI / Show UI (were HUD off / SHOW UI).
- Their landscape buttons were 40 px tall. They stay at 44 px, the comfortable minimum for a tap, with their smaller text.
- The new model made its own copy of about 25 shapes and 7 materials for every capybara and pup. They now share one set: same look, far less for the phone to upload and track.
- Title reads "probe 0.31 · Shackleton rim" (their build added "CINEMATIC REAL").
- smoke.js presses Hide UI twice. All three tests now provide `setInterval`, which the new layout code uses.

Checked: all three tests pass (smoke 33 clicks, restore 2 pups, reset). Portrait and landscape layout checked in a phone-sized browser. The 3D scene can't be rendered here, so the new look and its frame rate are untested. The model, 2048 soft shadows and glossy helmets cost more than before; watch the Diag's fps and triangle count.

## 0.30
- Screen shake instead of a buzz: a strong rumble (1.4 s) when the fusion reactor comes online, a short one (0.7 s) at every launch. It runs on real time, so it feels the same at ×8, and it's scaled to how far the camera is, so first person doesn't jolt harder than orbit. With Reduce Motion on, it's much gentler.
- The camera is put back exactly after each frame, so shaking never nudges your view.
- Android phones still buzz as well. iPhone can't.
- The Diag button is now **Test shake**: it closes the Diag and shakes. The Diag `buzz:` line also counts shakes.
- Headless run: 2 launches, 2 shakes. Not verified on device yet.

## 0.29
- Buzz: the phone vibrates when the fusion reactor comes online (a long triple pulse) and at every mass-driver launch (one pulse).
- Android browsers can vibrate on request. iPhone Safari never has. On iPhone the game uses the one known workaround instead: a hidden on/off switch that gives a haptic tick when toggled. It's documented as working only during a tap, so events that happen on their own may stay silent on iPhone.
- Diag → **Test buzz** fires the same pattern from a tap. The Diag `buzz:` line counts buzzes sent, the last reason, and the method used.
- On device: no buzz on iPhone, even from the Test button. The workaround doesn't work inside the Claude app.

## 0.28
- In landscape the log stacked above the bottom bar and landed over the colony panel. Now, when the screen is wide and short, it sits just above the buttons, in the space left of the follow panel. It keeps the old spot in portrait, or if there's no room beside the panel.
- Checked in a landscape phone-sized browser (932×430): the log sits beside the follow panel and above the buttons, clear of the colony panel.
- Not verified on device yet.

## 0.27
- No pups since 0.25. Since then every session loads from the account save, because the app clears the device copy between sessions. The colony the account save hands back is read-only. When the countdown ended, the game reset it to zero and then tried to add the pup to that read-only list. That threw an error, so no pup appeared. The error was invisible, because the next frame was already booked and the game carried on. So the countdown just started over, again and again. I should have found this from the code the first time you reported it, instead of suggesting the countdown was still running.
- Now a restored colony is copied into the game's own memory first, and the countdown only resets once the pup is really added.
- The Diag has an `errors:` line: how many errors the game has hit and the last one. It should read 0.
- New `restore.js` test starts from a read-only restored colony: it fails on 0.26 with the same error and passes on 0.27 (2 pups born, 2 rides).
- Verified on device: pups born again, errors 0.

## 0.26
- Reset colony didn't always reset. It erased the device copy, but the game's autosave and the save the page makes as it reloads wrote the old colony straight back. After the reload, that copy loaded and was saved to your account again. Your account record shows it: rewritten from scratch at 18:12 with the old colony (181 launches, 3 pups). Now a reset blocks every save before it erases anything.
- New `reset.js` test: it fails on 0.25 (device copy left behind) and passes on 0.26.
- Opened as a file copy rather than the Lunarium link, the game now says so after a few seconds: "File copy: progress stays on this device. Open the Lunarium link for your colony".
- Verified on device: reset erased the old colony, and a fresh one reloaded from the account after reopening. 60 fps once Low Power Mode was off (it caps pages at 30).

## 0.25
- Your 0.24 Diag read "loaded from new colony" even though the colony carried on (3 pups, 181 launches in the account record). The account check is slower than the first autosave, so a fresh colony could save before the account copy arrived and look newer than it. Nothing was lost this time, but it could have overwritten the account save.
- Now nothing is saved until the account copy has been checked (or 10 s pass). The newer of the two is kept, compared against what this device loaded at start.
- The Diag save line ends with what happened at load, e.g. "(device copy found, account copy newer, restored)".
- Not verified on device yet.

## 0.24
- Rover rides, three problems:
  - A ride only started if a pup happened to be within 14 m as the rover passed, and then only 60% of the time, so rides were rare.
  - When one did happen, the He-3 note from the same moment replaced "hopped on ROVER-1" on screen, so you'd never see it.
  - The rover's own push zone covered the spot where a pup would wait.
- Now, when a ride is due, a pup leaves its parent and walks to a stop by the base ("waiting for ROVER-1"). The rover pauses there to let it hop on, and pauses again a loop later to let it off. A pup gives up after two minutes of waiting.
- smoke.js now drives a real-length rover loop and counts pup rides and births (2 rides, 1 birth in 16,000 frames).
- Not verified on device yet.

## 0.23
- Pups still weren't coming. Your saved colony showed the countdown at only 29 s after minutes at ×8, with 2 yuzu at that moment. Oxygen drifts below 90% and yuzu dip below 2 every few minutes (every few seconds at ×8), and each dip paused the countdown. Now only a full nursery or an offline reactor stops it. Low oxygen (under 88%) or an empty wallow just slows it to a quarter.
- The colony readout shows the countdown ("pups 0 (next 84s)"); Nursery and Diag show it too, with the reason when it's slowed.
- Smoke run with a thriving colony: two pups born in 170 simulated seconds. Not verified on device yet.

## 0.22
- Pups: the countdown was 7 minutes, wasn't saved, and restarted every time the page opened, so pups rarely arrived. Now the first pup comes 2 minutes into a thriving colony and the next ones every 5, and the countdown is saved with the colony.
- The Nursery station shows the next pup's timing or what's holding it back ("waiting for 2 yuzu in the wallow"); Diag shows the same.
- Smoke test passed. Not verified on device yet.

## 0.21
- The Time button is highlighted whenever time is running (Auto, Sun on, Night) and dark only on Sun off, when the sun is held still. Before, Auto was on but not highlighted.
- Verified: 0.20's account save is working. The saved record matched the phone (reactor 38%, 10 samples, 12 He-3), written 8 times.

## 0.20
- Saves now go to your claude.ai account as well as the browser. Progress was only kept in browser storage, which the app doesn't reliably keep between sessions. The page now also saves to a private per-viewer record on the artifact (the `db` and `user` capabilities), at most every 15 s and whenever the page is hidden or closed. On load, whichever copy is newer wins, and "Colony restored" appears when it came from your account.
- Diag has a save line: device ok/blocked, account on/error, where the colony was loaded from, and when it was last saved.
- **Reset colony** in the Diag panel: tap once to arm it, tap again within four seconds to erase both saves and restart from a fresh colony.
- Every citrus has a small leaf: on the trees, floating in the wallow, carried, and in the helmet.
- Smoke test now also checks that restoring a save doesn't throw (it caught a load-order bug before publishing). Not verified on device yet.

## 0.19
- Rover rides: now and then, as ROVER-1 passes the base, a nearby pup hops up onto its roof and rides one full loop out to the ice mine and back, then hops off and runs back to its parent. First chance about a minute after pups exist, then every 2.5–4.5 minutes. The rover's status and the pup's show the ride; Diag shows the rider and time to the next ride.
- Smoke test passed (it can't drive the rover loop, so the ride itself is unchecked). Not verified on device yet.

## 0.18
- Device: a 20-minute soak of 0.17 ran with no crashes; 60 fps.
- Pixel-view stars: point size is multiplied by the screen's pixel ratio (3 on iPhone), so each star was 3×3 art pixels. They're now exactly one art pixel.
- Pups no longer flicker or spin round: they walk only when they've fallen behind and stop once close (no switching every frame), their spot behind the parent is smoothed when the parent turns, and they ease in and out of the water instead of popping. A third pup has its own spot instead of sharing the second's.
- Pups are a warm capybara brown; the old light tan washed out to near white in the low sun.
- Night light is a little warmer and fuller, so fur keeps its colour after dark instead of going grey-blue.
- Smoke test passed. Not verified on device yet.

## 0.17
- Fast forward: a **Speed** button cycles ×1 → ×2 → ×4 → ×8. The whole colony (sun, capybaras, rover, building, launches, showers, births) runs several small steps per frame, so capybaras still path correctly at ×8. The camera and screen update once per frame.
- Speed took Diag's button slot. Diagnostics now open by tapping the fps panel in the top right ("tap for diag").
- Wallow station: the camera only cuts to a capybara that is actually soaking. Capybaras walking over, or getting out, no longer pull it away from the pool; it holds on the empty pool until the next one settles in.
- Smoke test (now pressing Speed and the fps panel too) passed. Not verified on device yet.

## 0.16
- Earth spins on a tilted axis (23.4°), about one turn every 3.5 minutes, and is lit by the same sun as the Moon. As the sun circles, Earth goes through phases: full when the sun is behind the colony, a thin crescent when the sun is behind Earth.
- New Earth texture: continents, ice caps and clouds, a blue glow on the sunlit edge, and city lights on the night side.
- The faint light on the Moon's night side now follows Earth's phase: brighter nights under a full Earth.
- Diag shows Earth's lit fraction.
- Smoke test passed. Not verified on device yet.

## 0.15
- Mass driver: once the reactor is online, capybaras build a magnetic launch rail aimed at Earth (rail, then coils, then the capacitor bank). The rover brings back one He-3 canister per loop; every three are loaded into a capsule and launched down the rail toward Earth. Ten launches logs "Escape velocity".
- Compost at 80% or more: a capybara bags half of it and spreads it in the greenhouse, which speeds fruit growth for five minutes. Before, compost just stopped at 100%.
- Pups and nursery: when the reactor is online, oxygen is above 90% and at least two yuzu are floating, a pup is born every seven minutes, up to three (KIWI, SUDACHI, KUMQUAT). Pups tag along after a parent, splash in the wallow with them, and sleep in the new nursery dome at night.
- Meteor showers: the first comes about 90 s in, then every 7–11 minutes. 25 s of streaks and a few distant flashes; capybaras stop to look up; afterwards dust on the solar masts draws them to brush it off.
- Focus ring: a pulsing amber ring on the ground under whoever you're following, and the Next capy button shows their name.
- Time defaults to Auto: a 6-minute day and 2.5-minute night take turns. The button cycles Auto → Sun on → Sun off → Night.
- Stations gain Mass driver and Nursery. Colony readout gains a third line: samples, He-3, capsules sent, pups.
- navsim.js: since 0.8 a resync had silently dropped most destinations from the sim, so it only tested 7 of the places. All 16 are back. The first nursery spot trapped capybaras in a gap by the habitat, so it moved north. 5 seeds: 0 unfinished trips, no clipping.
- New smoke.js: runs the game script headlessly (3D stubbed) for 16,000 frames and presses every button. Passed: no errors.
- Not verified on device yet.

## 0.14
- What you watch and how you watch it are now separate. Next capy, Stations and tapping pick the subject; View picks the camera (orbit, top, shoulder, POV) and works on any subject. For example: Stations → Rover, then View → POV, then View → orbit → top, and it stays on the rover.
- Station cameras by view: orbit and top aim at the station; shoulder is its showcase shot; POV is a closer, lower shot. For the Wallow, shoulder and POV give the bath postcard; for Comms, the seats facing Earth.
- New **Tour** button: every 12 s moves to the next subject, alternating stations and capybaras, and keeps your current view.
- Sun on and Night merged into one **Time** button: Sun on → Sun off → Night.
- Rover now has six wheels with rocker-bogie arms.
- Not verified on device yet.

## 0.13
- The Rover button is now **Stations**. Each tap moves to the next non-capybara view: Rover, Wallow (the bath postcard), Reactor, Greenhouse, Lab, Life support, Compost, Comms, Ice mine. The button shows which station you're on.
- Each station has its own slow-drifting camera and a live status line, e.g. "Reactor · 15% built · NILO at work", "Life support · Oxygen 91% · filters due", "Comms · LUNA and PIP watching Earth".
- Bath moved out of the View cycle, which is now orbit → top → shoulder → POV. View or Next capy leaves a station.
- Station cameras only watch; tap to hide the interface.
- Not verified on device yet.

## 0.12
- Routing, three bugs behind the stuck and wall-walking capybaras:
  - A capybara standing right against a building couldn't plan away from it, because every route out counted as hitting it. It kept walking into the wall. Routes that start by moving away from a building no longer count as hitting it.
  - A detour could be picked that didn't actually get around the building, so the capybara stood still. Detours must now clear it.
  - Heading to a place, capybaras were allowed through that place's whole building (e.g. through the habitat dome to reach the airlock). Now they may only enter a building their destination sits inside: the pool, the wheel, the greenhouse.
  - Leaving an area it's stuck in, a capybara steps out the nearest way instead of straight toward its target.
- The previous navsim only counted finished trips, so stuck capybaras never showed up. It now reports unfinished trips. It found all seven stuck in the gaps by the lab and pool; now 0 across five seeds.
- Greetings: 35–55 s cooldown (was 14–25), the same two won't greet again for 150 s, and greeting can't drag a capybara into a building.
- Bath view is a camera only: it shows whoever is soaking, pans to the next bather, and holds on the empty pool ("The wallow is quiet. Waiting for a bather.") when nobody is in. It no longer sends a capybara to the wallow or adds a yuzu.
- Not verified on device yet.

## 0.11
- Bath view framing: the camera sat 0.8 m to the side, which put the capybara just outside a portrait phone's narrow width (about ±15° across). It now sits almost directly behind and aims between the helmet and Earth, keeping both in frame: capybara about 10° below centre, Earth about 12° above.
- Not verified on device yet.

## 0.10
- Flashing after the splash: resolution changes resized the canvas right after a frame was drawn, so iOS showed a blank frame. Resizes now happen just before drawing. Automatic resolution also waits 10 seconds before judging, and only drops after 3 low seconds in a row.
- With the interface hidden, a small caption shows who you're watching and what they're doing, e.g. "MOCHI · soaking in a yuzu bath, watching Earth". Made for screenshots.
- Not verified on device yet.

## 0.9
- In shoulder, POV and bath views, a tap hides or shows the whole interface, buttons included. Tapping another capybara in shoulder or POV switches to it. Before, a tap outside bath view let go of the capybara and dropped back to orbit.
- Log notes moved to the lower left, just above the controls, so they never cover the title panel.
- Not verified on device yet.

## 0.8
- Splash screen: pixel capybara, LUNARIUM title and a progress bar. It stays up at least 1.2 s and fades out after the first frames have drawn, hiding the black flash at boot.
- Greenhouse: a capybara inside it always leaves through the open east end, however it got in. Before, one pushed in by the rover could walk out through the glass.
- Squeezing past when blocked now only passes the rover and small things (masts, comms, compost), never buildings.
- Rover loop moved about a metre further from the greenhouse door.
- navsim.js now starts four capybaras inside the greenhouse and counts wall crossings: 0.7's routing gave 65, 0.8's gives 0. 549 trips, all arrived.
- Not verified on device yet.

## 0.7 — Lunarium
- Renamed to Lunarium.
- Yuzu bath: capybaras pick yuzu in the greenhouse and float them in the wallow. Wallowing capybaras face Earth and wear a yuzu inside their helmet.
- Compost loop: old yuzu become peels; capybaras scoop them to a new compost bin, which speeds fruit growth in the greenhouse.
- Night rhythm: two capybaras stay on watch; the rest sleep in the habitat, with Z's rising from the roof.
- New "bath" view: the postcard shot of a capybara in the wallow watching Earth. Tap to hide the interface.
- Earth raised to 6° so it clears the far ridge from the wallow.
- Colony readout gains a second line: yuzu, peels, compost.
- Route sim: 266 trips in 20 simulated minutes, all arrived, no clipping.
- Not verified on device yet.

## 0.6
- Science lab, crater-edge core sampling with marker flags, and carried sample cases.
- Fusion reactor construction site that grows in stages and glows only at night once online.
- Life support with oxygen that drifts down and gets serviced.
- Needs-weighted activity choice; colony readout; fading log notes; progress saved on the device.
- Hearts made smaller and true pink.

## 0.5
- Comms tower seats facing Earth; single watchers and cheek-to-cheek pairs send hearts toward Earth.
- Ground switched to per-vertex lighting; night lights switched off by day; shadow map back to 1024.
- Device: 60 fps in normal view at dpr 2 (sim 0.2 ms, 314 draw calls, 117k triangles incl. shadow pass).

## 0.4
- Terrain heights cached on a grid so the sun test is array lookups. Device: sim time dropped to 0.4 ms per frame.
- Routing: walk out of anything you start inside, then plan; squeeze past after two blocks in a row; masts counted separately.
- Stars vary in brightness; one art pixel each in pixel view.

## 0.3
- Loading screen; slice-by-slice terrain shading with partial uploads; dynamic resolution.
- True pixel pass: render to a small target, nearest-neighbour upscale, dithered palette.
- Shoulder cam; wheel hidden in first person; capybara greetings with pixel hearts.
- Device: locked at 30 fps (processor-bound; fixed in 0.4).

## 0.2
- Ridges block shadows (sunk shadow-only copy of the ground); soft sun-edge shading.
- Route planning through doors and around buildings; rover loop moved clear of the greenhouse.
- Views: orbit, top, POV; tap to follow the rover.
- Device: 30 fps, 182k triangles (too heavy; reduced in 0.3).

## 0.1
- First 3D scene: crater rim, base, seven capybaras, rover, solar masts, day/night, pixel look, diagnostics.
- Device: 47–53 fps at dpr 2.
