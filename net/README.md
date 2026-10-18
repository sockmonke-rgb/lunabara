# Lunabara net probe

A separate artifact that tests co-op for the survival revamp (Raft-style, first person and over the shoulder, still capybaras). The terrarium is untouched.

- **Where it runs:** as a claude.ai artifact, because co-op uses the artifact's shared room and database. Mark shares the artifact link with whoever is testing; each build is a new version of it. Opened anywhere else, GitHub Pages included, it plays solo and says so.
- **Source:** `net/lunabara-net-probe.html`, one file, currently 0.4. Each version is its own commit in this folder's history.
- **Test:** `node net/coopsim.js net/lunabara-net-probe.html` (also part of `npm test`).

## How to test
1. Open the net probe link on the iPhone in the Claude app.
2. Open the same link on a second device: another phone, an iPad, or a desktop browser. The same account in two places counts as two players; the Diag lists the other one as "your other tab". To play with someone else, share the artifact with them at Contributor level. A Viewer can move but can't ping or wave, and their Diag shows `blocked: echo,ping,pong,act`.
3. Walk around together for a minute. Jump, wave, and switch to first person (1P) and back. Walk into each other: you should ease apart, not pass through. On a keyboard: WASD walks, Q/E turn the camera, Space jumps, G waves, F uses a terminal, V switches camera, B builds.
4. Build: tap Build, pick a piece, turn it with the 15° buttons, aim with the ring in the middle of the screen, and tap Place. With a mouse, the ring follows the pointer: point, turn with the wheel or R (Shift+R back), and click. Remove takes pieces away. Build something together, then close and reopen the link: it should all still be there.
5. Build up: aim at a wall with Wall to put one on top; aim at a wall with Floor to put a roof on a room; aim at a crate's top with Crate to stack. Jump over a single wall or rail, and jump while building (Space, or the Jump button left of the turn buttons). Jump under a roof's edge: the head should stop at it.
6. Science terminal: place a Terminal, stand in front of its screen and tap Use terminal (F on a keyboard). Alone you turn both dials. With two of you at it, each gets one dial: match the dashed signal together and hold it for 1.5 s.
7. Nuzzle: stand within about 2.5 m of each other, face each other, and both tap Wave within a couple of seconds.
8. Leave and come back: put one device's app in the background, then reopen the link. The other screen should show that player as away at once, and drop the old capybara when the new page arrives.
9. On each device, tap the readout (top right), then Copy, and paste it back to Claude. For the start-up dip on the phone, copy it at least 15 s after opening.
10. To start over: in the Diag, tap Clear all twice. It deletes every piece for everyone.

What to look for: whether the room connects inside the Claude app on iPhone; the ping; whether the other capybara moves smoothly or rubber-bands or stutters; how fast a piece appears on the other screen; whether the nuzzle lines up on both screens; whether suits stay put when someone joins; fps.

Building needs write access to the artifact's data. Mark (owner) has it. A guest invited by email as an Editor has it only while the artifact is not also shared by public link.

## How it works
- **Presence carries each capybara:** position, feet height, facing, speed, suit, first-person flag, action and its progress, a hidden flag, seconds in the room, and at a terminal its id and the player's dial. Absolute state at a fixed rate (20/s by default; 10, 15, 20 or 30 from the Diag). About 140 bytes.
- **Events carry moments:** the wave (`act`), the nuzzle start, piece changes (`build`), a solved terminal round (`term`), plus three probes: `echo` (your own event back through the relay, once a second), and `ping` / `pong` (to each other player and back, once a second).
- **Remote capybaras are drawn a little behind their newest update**, interpolated on the sender's own clock. The clock offset is the smallest (arrival − send time) seen in the last 10 s, so a phone whose clock is minutes off still lines up. Past the newest update, a capybara is extrapolated for up to 250 ms, then held. With Smooth auto (the default), each player's delay is their median update gap plus jitter p95 plus 12 ms, kept between 40 and 300 ms and eased 40 ms a second. The Diag cycles auto, 120, 200, off and 60 ms.
- **Away and gone:** a page going to the background sends a hidden flag. A player hidden, or silent for 3 s, shows as away (dimmed tag). Silent for 20 s, or replaced by a newer live page on the same account, they're removed from the screen.
- **Suits:** the artifact's owner always wears Engineering. Everyone else waits until they know they aren't the owner and have been in the room 1.2 s, then takes the first free suit (Science, Operations, Comms). Whoever has been in the room longer keeps theirs; a change waits until a clash has lasted two checks.
- **Both devices build the same world:** rocks and craters come from fixed seeds. The pad beacon blinks on each device's own clock.
- **Pieces** live in the artifact's database, one document per piece in the collection `pieces`: `{v, k, x, z, r, y, by, t}`, plus `n` on a terminal. `k` is the kind (0 floor, 1 wall, 2 rail, 3 lamp, 4 crate, 5 terminal), `r` the turn in 15° steps (0–23), `y` the height of its base, `by` the placer's id and `t` their clock. Pieces saved by 0.2 have no `y`: floors load on the ground, anything else on a ground floor under it (0.1 m) or the ground. A `build` event (`add` or `del`) goes out at the same moment, so the other screen shows the change before the database delivers it. What's shown is the database's pieces, plus pieces heard about but not yet saved (dropped after 60 s), minus pieces just removed (held off for 20 s).
- **Placement:** the aiming ring is a ray from the camera (through the middle of the screen on touch, through the pointer with a mouse); what it hits decides where a piece goes. On bare ground: free, turned in 15° steps, snapping to ground floors and walls. On a floor's top: a floor goes beside it at the same height; anything else stands on it and snaps to its edges. On a crate's top: crates, lamps and terminals stack. On a wall: a wall goes on top; a floor goes on top as a roof, on the side that already looks like a room. On any other face: next to it, on whatever is under it. A piece within 0.6 m of a neighbour's slot at the same height, turned within one step of it, snaps in. Floors don't overlap floors and nothing else overlaps anything else, where their heights overlap (walls and rails are shortened 16 cm at each end for that test, so two meet at a corner). Floors only go on the ground, beside floors or on walls, and nothing hangs in the air. Nothing goes on the landing pad. The cap is 600 pieces; the database holds 25,000 documents.
- **Moving:** jump 3.4 m/s up against 3.05 m/s² down: about 1.9 m high, 2.2 s in the air, also while building. You step up 0.35 m without jumping and land on the highest floor, crate, wall top or roof you were above. A raised floor overhead stops a jump where any part of the capybara is under it: the helmet (centre 0.87 m ahead of the middle, top 1.37 m up) or the body (three points along it, top 1.08 m up). Walls, rails, lamps, crates and terminals push you out (a 0.38 m circle against each footprint) only where they're at your body's height, so you can jump over a single wall or rail; a raised floor pushes you out while it's at body height, so a jump can't carry you sideways into a roof's edge. Players ease apart inside 0.9 m; each moves only their own capybara. The shoulder camera pulls in when a piece is between it and you.
- **Nuzzle:** both players wave within 2.5 s of each other, within 2.6 m, on the same level, each facing the other within about 57°. The player with the lower peer label picks the meeting point and sends it as a `nuzzle` event. Both walk to marks 0.8 m either side of it, rise until their helmets touch, tilt their heads, drop and step back (4.5 s in all). Hearts show over both helmets. The action and its progress travel in presence (`a`, `ap`), so every screen poses it the same.
- **Desktop keys:** WASD walk, Q/E turn the camera (1.9 rad a second, also while building), drag to look, wheel zooms (turns the piece while building, exactly 15° a notch), Space jumps, G waves, F uses or leaves a terminal, V switches camera, B builds, R turns the piece (Shift+R back), Enter or a click places, ` opens the Diag.
- **Clear all (debug):** two taps in the Diag. Every piece shown is held off for 60 s on every screen (a `build` event `{op:'clear'}`), and the database deletes go three at a time, retrying when the database says slow down.
- **Science terminal:** two dials, frequency and amplitude, draw a signal over a dashed target. Match is the product of how close each dial is (each falls to zero 0.1 away). Holding a match of 70% or more for 1.5 s logs a sample. With two players at one terminal, the lower peer label turns frequency and the other amplitude; alone, you turn both; a third watches. Each player's dial travels in presence; the lower peer label decides when the hold is done, sends `term` solved, and saves the round count `n` on the terminal's document. Each round's target is worked out from the terminal's id and `n`, so every screen agrees without sending it.

## Changelog

### net 0.4: desktop keys, jumping while building, the head under roofs
Mark and his partner played 0.3 (Mark on the iPhone, his partner in the desktop app). Their list: use Q and E to turn the camera, because placing with the mouse is hard; move wave off E and use F to interact; has the rotation angle changed?; a debug option to clear all objects; you can't jump while holding a building piece; the front of the body clips through the roof when jumping (with a screenshot).

**Desktop**
- **Q and E turn the camera** (about 110° a second), in build mode too.
- **Building aims at the mouse pointer:** no dragging to aim. The ring follows the pointer; the wheel or R turns the piece (Shift+R back) and a click places it. Touch still aims with the ring in the middle.
- **G waves; F uses a terminal,** and F or Esc leaves it. F with no terminal near says so. F no longer places; Enter or a click does.
- The key list stays at the bottom left, dimmed, instead of fading out.

**Rotation**
- The wheel now turns a piece exactly 15° a notch. 0.3 counted 90 units a step, so a mouse sending 100–120 units a notch sometimes turned 30° at once, which may be the change in angle you noticed. Trackpads still add up small movements.
- Snapping can also set the angle: a wall on a floor's edge, a wall on a wall, a roof and a floor beside a floor take their neighbour's angle. The Diag's new `last placed:` line says when that happened ("wall at 0° (you had 15°; snapped set it)").

**Jumping**
- **Jump while building:** Space, or the new Jump button left of the turn buttons on the phone. The piece info at the bottom left moved up to make room.
- **No more head through the roof:** the ceiling test covered only the capybara's middle, but the helmet sits 0.87 m ahead of it and 1.37 m up. In the screenshot the middle was outside the roof and the head under it, so the jump went to full height. Now the helmet and three points along the body are tested, and a roof's edge also blocks sideways while it's at body height.

**Clear all (debug)**
- In the Diag: tap Clear all, then again within 4 s ("Tap again: clear 57"). Every screen empties at once and says "Someone cleared all the pieces." The database deletes go three at a time and retry when the database says slow down. The Diag's `clear all:` line shows how many were deleted, how long it took, retries and errors. View-only players can't use it.

**Diag**
- Time in the background no longer counts as a frame. On the partner's desktop in 0.3 a window put away for 22 s showed as a 22,117 ms worst frame and seconds at 1 and 2 fps. Now the first frame back starts a fresh second, and the `hidden:` line says how many gaps were left out and the longest.
- New: wheel deltas and piece turns, seconds of Q/E turning, jumps while building, `last placed:` and `clear all:`.

Checked here: all scripts parse. `coopsim.js` passes 132 checks (107 from 0.3, with waves now on G and the terminal opened and left with F, plus 25 new):
- **Roofs:** with an overhanging roof floor, standing just outside it facing in, the jump stops at 0.33 m (0.3 went to 1.87); facing away with the tail under it, 0.62 m; a step further out, a full jump (1.87 m); running and jumping toward the edge from outside, the body never enters the roof.
- **Keys:** holding Q for 0.5 s turns the camera 0.95 rad left, E the same right while building without touching the piece; R and Shift+R turn the piece; Space and the build-pad Jump button jump while building; F opens and leaves the terminal and says so when none is near.
- **Wheel:** two notches of 100 turn 30°, three of 120 exactly 45° (0.3 made it 60°), small trackpad steps add up to one turn, a notch counted in lines turns once.
- **Diag:** a wall snapped from 15° to 0° is reported; 6.9 s in the background isn't the worst frame (17 ms).
- **Clear all:** the first tap only asks and disarms after 4 s; two taps empty both screens within 170 ms and the other player is told; with a quarter of deletes refused as "slow down", all 21 land in 4.4 s with 7 retries and never more than three at once; a piece placed after the clear shows on both, and nothing comes back after the 60 s hold-off.
- The same tests run against 0.3 fail the roof and build-jump checks, so they catch what was reported.

After publishing, the live database's 57 pieces were loaded through 0.4's code here: all shown, none rejected, 38 from 0.2, 9 raised (roofs at 1.6, 1.7 and 3.3 m, two walls on walls, a crate on a roof), matching Mark's Diag. A headless render of the interface (3D stubbed) at 390×844, 844×390 and a 1280×720 desktop showed the build Jump button clear of the piece info, the Diag's five buttons, and the ring following the mouse.

Not verified on device: aiming with the mouse pointer in the real 3D view, how Q/E turning feels, the roof fix in 3D (including roofs on walls standing on the ground, 1.6 m), the build Jump button under a thumb, and Clear all against the real database (it wasn't run on the live pieces).

### Device results for net 0.3 (17 October)
Mark played on the iPhone (iOS 18.7, Claude app 1.261014). His partner, a guest on the artifact, played in the Claude desktop app on Windows. Mark's Diag was copied 2 s after opening; his partner's after a long session.
- **Away works on a real device:** when Mark copied his Diag, his partner's window was in the background, and his Diag showed them as "away (page in background)" rather than as a frozen capybara.
- **Building up worked:** the world had 57 pieces, 9 of them raised: roofs at 1.6, 1.7 and 3.3 m, walls on walls and a crate on a roof. His partner placed 8 and removed 31, all saved (median 305 ms, max 328). Mark's 12 new pieces reached his partner by event first; the database caught up a median 2.8 s later (max 5.3 s).
- **Moving:** his partner jumped 59 times with 16 ceiling bumps, was eased apart for 73 frames, bumped walls 5,534 times, used the wheel 109 times, and the camera pulled in for 3,511 frames.
- **Terminal:** 2 samples logged on the one terminal; his partner used it once and their page heard both solves.
- **Connection (partner):** echo median 113 ms, p90 119, none lost of 735; one blip of 0.4 s, no drops; 1,328 events, none failed.
- **Frames:** his partner's desktop ran 60 fps, sim 0.11 ms, draw 0.26 ms, 40 draw calls, 25k triangles. Its 22,117 ms "worst frame" was the window in the background (fixed in the 0.4 Diag). Mark's phone: 41 draw calls, 25.8k triangles, sim max 3.0 ms during load. Its first second ran at 30 fps while the page was visible but not yet focused ("v-"), then 55 fps once focused: one data point for the start-up dip, which needs a Diag copied after 15 s or more.

### net 0.3: building up, jumping over, the science terminal
Mark and his partner played 0.2 together and sent a list: use the mouse wheel on desktop; allow vertical stacking, wall on wall and floor on top of walls; a partner who disconnected and reconnected left their avatar in the game; you can't jump over a rail or a single wall; avoid colliding with each other; the muzzle nuzzle works; after a while the other character disappeared; when another player joins, your suit keeps changing colour until they've arrived; and add a placeable interactive object, perhaps a science terminal with a co-op minigame.

**Building up**
- The aiming ring now hits pieces as well as the ground, and what it's on decides where the piece goes. Aim at a wall with Wall to put a wall on top of it. Aim at a wall with Floor to put a roof on, on the side that already looks like a room (other walls meet there, there's a floor below, or it faces you). Aim at a roof with Floor to extend it. Aim at a crate's top to stack crates, lamps or terminals. Aim at any side to put a piece next to it.
- Raised pieces snap to their neighbours at the same height. The line bottom left shows how high the piece is, "on the wall" or "roof" when it clicks into place there, or why it won't go ("Needs something under it", "Floors go on the ground, beside floors or on walls").
- Each piece now saves its height. The 68 pieces built in 0.2 have none and load where they were: checked against the live database after publishing (11 floors and 16 other pieces on the ground, 41 on a ground floor).

**Moving**
- **Jump over a single wall or rail:** jumps go 1.9 m up and last about 2.2 s (they were 1.5 m and 2 s), and walls and rails only stop you where they're at your body's height. Two walls stacked (3.3 m) can't be jumped.
- **Land on things:** floors, crates, wall tops and roofs. A roof overhead stops a jump inside a room.
- **No walking through each other:** players ease apart when closer than 0.9 m (not during the nuzzle). Each moves only their own capybara, softly, because the other is drawn a little late.
- **Camera inside rooms:** the shoulder camera pulls in when a wall is between it and you.
- **Mouse wheel:** zooms the shoulder camera (2.2–7 m); while building, each notch turns the piece 15°.

**Players who leave**
- In 0.2, the partner's earlier page, hidden but still open, stayed on Mark's screen frozen for about 4.5 minutes because it still answered pings. Then it went, which is most likely the character Mark saw disappear after a while (to be confirmed).
- Now a page going to the background says so, and shows as away at once. A player silent for 3 s shows as away; silent for 20 s, or back as a new page on the same account, the old capybara is removed at once. The player count counts only live players.

**Suits**
- In 0.2 a joining player who didn't yet know whether they were the owner took Engineering, which moved the owner, and then both moved back. Now the owner always wears Engineering, a joiner waits 1.2 s in the room before picking the first free suit, whoever has been there longer keeps theirs, and a change needs the clash to last two checks. The Diag counts suit changes.

**Smoother by default**
- Sending is 20/s (was 15), and smoothing is auto. On Mark's phone, Smooth 60 ms drew his partner extrapolated 27% of the time: the delay has to cover the gap between updates plus their jitter. Auto sets each player's delay from their own gaps and jitter.

**Science terminal (co-op minigame)**
- New piece, Terminal: a desk console with a screen. Stand in front of the screen and tap Use terminal (U on a keyboard). The spectrometer opens: a dashed target signal and yours, with two dials, frequency and amplitude. Match the shape and hold it for 1.5 s to log a sample; a new target follows.
- With two players at one terminal, each gets one dial, so neither can solve it alone. Alone, you turn both. A third player watches.
- The samples logged are saved on the terminal, so a late joiner sees the count. Your capybara stands at the desk with its paws on it, on every screen. Leave closes it; so does someone removing the terminal.

**Fixes and Diag**
- The helmet collar ring drew black (metal with nothing to reflect); it's now a matt metal.
- The terminal panel is compact in landscape.
- Diag: startup visible/focused by second (to find out what holds the 30 fps start), wheel events, camera distance and frames pulled in, suit changes, live players, each player's state (live, away, superseded) and buffer, raised pieces, pieces from 0.2, feet height, ceiling bumps, frames eased apart, and a terminals line.

Checked here: all scripts parse. `coopsim.js` passes 107 checks, among them:
- **Stacking:** four walls make a room on a floor; a wall goes on a wall at 1.7 m; a floor aimed at a wall roofs the room, not outside it; a second roof floor goes beside the first; a crate goes on the roof and a crate on that crate. The other player has the same pieces at the same heights.
- **Moving:** falling onto the stacked crates lands on top (feet 3.40 m) and the other player draws it; inside the room you stand under the roof and a jump bumps it; a single wall stops a walk and a jump clears it; two stacked walls can't be jumped; walking into another player stops 0.94 m apart.
- **Legacy and wheel:** 0.2 pieces with no height load where they were; two wheel notches turn a piece 30°.
- **Leaving:** a page going to the background shows as away at once; coming back as a new page hides the old one at once and the count ignores it.
- **Suits:** the owner keeps Engineering while someone joins (no changes); an existing player keeps theirs and the joiner picks a free one first time.
- **Smoothing:** auto settles on gap plus jitter (63 ms at 30 updates a second with 18 ms jitter).
- **Terminal:** placed facing its builder; Use terminal shows in front of it; alone you turn both dials and a hold logs a sample; the count is saved and reaches the other player; two at a terminal each turn one dial; one dial right isn't enough; both right logs it on both screens; each draws the other at the desk; a late joiner sees the count.
- The nuzzle, persistence, removal, refused saves and view-only checks from 0.2 still pass, with no page errors.

After publishing, the live database's 68 pieces from 0.2 were loaded through 0.3's code here: all 68 shown, none rejected, all treated as 0.2 pieces at their old heights. A headless render of the interface (3D stubbed) at 390×844 and 844×390 showed the piece picker with Terminal, the Use terminal button and the terminal panel placed cleanly.

Not verified on device: how stacking and roofs feel to aim with a thumb, the jump height, the personal-space push, the camera pulling in, the terminal in 3D and its dials under a thumb, whether suits now stay put on a real join, whether the away and superseded logic catches a real reconnect, the wheel on a real mouse, and fps with the terminal and raised pieces.

### Device results for net 0.2 (17 October)
Mark played on the iPhone; his partner in the Claude desktop app on Windows. Both sent their Diags.
- **Building together worked:** 68 pieces at the end (11 floors, 50 walls, 4 rails, 2 lamps, 1 crate). His partner placed 32 and removed 1, all saved, median 308 ms (max 373). All 39 of Mark's pieces reached his partner by event first; the database caught up a median 3.1 s later (max 6.7 s), so the event is what made building feel instant.
- **The nuzzle worked** (Mark: "muzzle works").
- **The leftover partner:** his partner's earlier page, hidden but open, stayed on Mark's screen frozen for about 4.5 minutes while still answering pings, then disappeared (most likely the "disappeared after a while"). Fixed in 0.3.
- **Smoothing:** at Smooth 60 ms Mark's phone drew his partner extrapolated 27% of the time. 0.3 defaults to auto.
- **Start-up dip:** Mark's phone ran 30 fps for about the first 11 s and the first touch didn't end it, so that idea is out. 0.3 logs whether the page is visible and focused each second.
- **Partner's desktop:** 60 fps throughout (58 in the first second), worst frame 17 ms, sim 0.08 ms, draw 0.27 ms, 40 draw calls, 26k triangles. Room ready in 9 ms, first connect 173 ms, no drops. Sent 20/s at 103 bytes; 1,203 events, none failed; echo median 110 ms, p90 113, none lost of 536. 1,500 wall bumps.

### net 0.2: building together, and the nuzzle
Mark asked for placement he can customize: pieces always on the ground, rotation in 15° steps, painting later. He also asked whether waving face to face could set off the muzzle nuzzle.

**Building**
- **Build** opens the piece picker: Floor (2×2 m plate), Wall (2 m), Rail (2 m), Lamp, Crate, and Remove. A ghost of the piece follows the ring in the middle of the screen, 1–6 m ahead of you. It's green when it fits and red when it doesn't, and the line bottom left says why: blocked, on the pad, or the limit reached.
- **Turning:** the two arrow buttons turn the piece 15° each way. Building starts square to where you're looking.
- **Snapping:** close to a neighbour and turned within 15° of it, a piece clicks into place. Floors snap edge to edge, walls and rails onto floor edges or end to end. It says "snapped". Turned further, it stays free.
- **Place** puts it down. Remove deletes the piece under the ring, preferring a wall or crate over the floor under it.
- **Shared and kept:** pieces show on the other screen by room event, and are saved in the artifact's database, so they're still there after a reload and a late joiner loads them all. If a save is refused, the piece is taken back on every screen and building switches off for that player. A view-only player's Build button is greyed out.
- **Walls block:** you can't walk through walls, rails, lamps or crates, and you stand on floors.
- **Keyboard:** B toggles building, 1–6 pick a piece, Q and R turn, F, Enter or a mouse click places.
- All of one kind draws as one instanced mesh, so 600 pieces cost about six draw calls.

**Nuzzle**
- Wave facing each other, close together, within a couple of seconds of each other. Your capybaras walk to their marks, stand up on their hind legs until their helmets touch, tilt their heads together with a blush, send up hearts, then drop and step back. You can't move during it (4.5 s). In first person, the camera turns to your partner.
- The Diag's `nuzzles:` line says why a mutual wave didn't start one ("too far apart (3.1 m, need 2.6)", "not facing (you 80°, them 10°, need 57)").
- Waves (and the nuzzle) are now posed from presence, so they line up with the movement on the other screen.

**Fixes and Diag**
- **Rocks and craters no longer vanish when the meeting pad is out of view.** three.js r128 culls an instanced mesh by its base shape at the world's origin, so they disappeared whenever the camera looked away from the pad. Found while reading the code; not reported from the device.
- Start-up fps is listed for 12 s, with the time of your first touch, to test whether the 30 fps start ends at the first touch.
- New `--- build` section: database state, snapshots, pieces by kind, saved, waiting and just removed; your placements, removals, save errors and save time; for others' pieces, how many came by event first and how far behind the database was; build mode, wall bumps, and whether you're standing on a floor.

Checked here: all scripts parse. `coopsim.js` now also has a fake shared database, slower than the room (writes land after the uplink plus 150 ms). All 75 checks pass, the 41 from 0.1 plus:
- **Building:** the ghost lands where you aim; a placed floor shows at once, reaches the other player by event within 170 ms and from the database 133 ms later, and the save is confirmed in 217 ms. A second floor snaps exactly 2 m along; turned 30° it doesn't, turned 15° it does and squares up. A floor over a floor and anything on the pad are blocked. A wall snaps to a floor's edge and stands 0.1 m up, and a second wall meets it at the corner. A crate goes anywhere on the floor at 135°.
- **Collisions and removal:** walking into the wall stops 0.38 m short, and the other player draws you standing on the floor. Remove picks the wall over the floor; the other screen loses it within 170 ms, and the database and both screens agree.
- **Persistence and access:** a late joiner loads every piece. A refused save is taken back everywhere and switches building off. A view-only player can't build.
- **Nuzzle:** waving face to face starts it on both, led by the lower peer label. The two stand on marks 1.60 m apart, each draws the other mid-nuzzle, it ends on both 2.30 m apart, and four hearts show on each screen. Facing away, nothing starts, and the Diag says why.

After publishing, one probe piece in the page's own format was written to the live database, read back at view level and deleted. A headless render of the interface (3D stubbed) at 390×844 and 844×390 showed the build picker, pad and info line placed cleanly in both.

Not verified on device: how placement feels under a thumb (aim, reach, the ghost), how the snapped pieces and the nuzzle look in 3D, real database timing, and fps with pieces placed.

### Device results for net 0.1 (17 October)
Mark played on an iPhone (iOS 18.7, Claude app 1.261014). His partner, a guest on the artifact with edit access, played in the Claude desktop app on Windows. About 105 s together, with Diags from both sides.
- **Connected in both apps:** room ready in 5 / 14 ms, first connect 221 / 360 ms. No drops, no blips, no event errors. Names resolved both ways.
- **Latency:** echo median 122 / 110 ms (one pass through the relay). Ping between players median 232 / 231 ms, p90 under 245 ms (two passes), so about 115 ms one way.
- **Loss and smoothness:** 0 of about 105 pings lost each way, and 0 of 122 / 106 echoes. Jitter p95 22 / 19 ms. Updates too late for the 120 ms buffer: 0 of 1551 and 0 of 1610. Drawn interpolated 99% / 98% of frames.
- **Rates:** Mark sent 20/s and his partner received 20.0/s; his partner sent 15/s.
- **Phone performance:** 60 fps (low 59), worst frame 39 ms, sim 0.25 ms, draw 0.68 ms, 24 draw calls, 22k triangles. The first 8 s ran at 30 fps before going to 60, like the terrarium's start-up dip in 0.56–0.57.
- **Desktop:** 60 fps, 56 draw calls, 30k triangles. Wake lock was refused on both.

### net 0.1: first co-op probe
- Flat regolith with seeded rocks and craters, a hex meeting pad with a beacon, stars, and Earth at half phase.
- **Controls:** a floating stick under the left thumb walks; dragging with the right thumb looks. Jump (about 2 s in the air, 1.5 m up), Wave (stands up and waves, with blush), and 1P/3P to switch between first person and over the shoulder. On a keyboard: WASD, drag to look, Space, E, V.
- A compact version of the terrarium's capybara: head C in a helmet, division suit with stripes, walk cycle stepped by distance, and a blob shadow.
- **Name tags** over other players come from the user capability. They show the ping, or "paused" when that player's updates stop.
- **Diag:** fps by second, worst frame, sim and draw time, draw calls, triangles, resolution, connection state (first connect, drops over 2 s, blips), players, guests, other tabs, send rate and bytes, event errors, echo (last, median, p90, max, lost), and per player: update rate, gaps, jitter p95, updates too late for the buffer, skipped updates, ping (median, p90, max, lost), and how they were drawn (interpolated, extrapolated, held). Buttons: Send rate, Smoothing, Copy, Close.
- Opened outside the app, or where the room capability isn't available, it plays solo and says so.

Checked here: all scripts parse. `coopsim.js` runs two pages, then three, on one fake clock, joined by a fake room with 60–80 ms per relay pass, jitter, 20% event loss for 10 s, a 3 s disconnect, a second phone 12 minutes ahead, and a Viewer who can't send events. All 41 checks pass:
- B draws A within 1.3 cm of A's real path, 183 ms behind, interpolating every frame, with steady steps at full speed.
- Echo reads one relay pass and ping two. Updates arrive at the chosen rate.
- Wave and jump reach the other player.
- A paused page is extrapolated, then held, then picked back up.
- Losses are counted, and the Viewer is blocked once with no retry storm. A player who leaves is removed with their tag.
- A drop over 2 s shows "Reconnecting".
- No page errors.

A headless render of the interface (the 3D library couldn't be fetched here, so stubbed) at 390×844 and 844×390 showed the chips, buttons and Diag placed cleanly; it caught the Diag showing at load, which was fixed before publishing. `navsim.js` was not run: this build has none of the terrarium's routing.

Not verified: anything on the real room. That includes whether it connects inside the Claude app on iPhone, real ping and jitter, how the movement feels, and fps on device.
