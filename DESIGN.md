# Lunabara: design

Lunabara is a place you watch, not a game you win. The colony runs itself; the pleasure is noticing what the capybaras are doing and why.

The colony is also a **livestream**. Everything you see is a camera somewhere in the base, Earth is watching, and the capybaras know it.

## Pillars

1. **Passive first.** Nothing needs the player. Every system resolves through capybara behaviour.
2. **Needs drive behaviour.** What the colony lacks shapes what capybaras choose to do, so the scene always has a reason behind it.
3. **Small moments matter.** Greetings, a pair watching Earth cheek to cheek, a yuzu in a helmet, a paw raised at the lens. These are the point, not decoration.
4. **Real moon, gentle tone.** Grounded in real south-pole conditions (low circling sun, permanent shadow in the crater, Earth low on the horizon), told through capybaras rather than nations.
5. **One file, one phone.** Single self-contained HTML, tested on iPhone, holding 60 fps.

## Setting

- The base is spread along the rim (0.51): 3–9 m between buildings, the level ground reaching along the rim and away from the crater but not into it. The wallow sits in a pressurised glass bathhouse (open water would boil away in the vacuum), and its footprint sets the spacing of the rest.

- Base pad on the Shackleton crater rim; the crater bowl lies to the south (−z).
- **The kit (0.55)** follows real moon-base concepts, with no agency, company or national marks: an inflatable habitat in a steel frame with a round-hatch airlock, a hex-panel lab drum with a seedling bay, a greenhouse under a honeycomb frame, a landing pad with a bag berm and light masts, cargo landers with foil-wrapped bays and four tanks, an uplink of spoke dishes aimed at Earth (it carries the stream), and amber chevrons along the rover roads. From NASA's moon-base renderings (0.56): solar arrays standing on the landers that brought them, a radioisotope generator powering the ice mine at the edge of the shadow, and a small hopper drone that scouts the shadowed crater. Supply landers come straight down over the pad, upright, and leave by pitching over toward Earth.
- The sun circles the horizon about 3° up. Light is judged by a binary line-of-sight rule like Astrobara's `litAt()`: the pad readout shows LIT or IN SHADOW.
- Earth sits about 6° above the horizon to the north-east. Comms seats and the wallow face it. It spins on a tilted axis and is lit by the same sun, so it shows phases: full when the sun is behind the colony, new when the sun is behind Earth. Earthlight on the Moon's night side follows that phase.

## The stream

Every view is a device in the colony, with its own label and look (top left of the screen):

| View | Camera | Look |
| --- | --- | --- |
| Orbit | DRONE-1 | Clean, slight hover |
| Top | DRONE-1 · OVERHEAD | Crosshair, altitude, heading, drone battery |
| Shoulder on a capybara | DRONE-2 · CHASE | Clean |
| First person | HELMET CAM | Heavy vignette, the wearer's O2 |
| Station, shoulder or POV | CCTV `CAM NN · STATION` | Scanlines, grain, a rolling band |
| Rover | ROVER-1 dash cam / rear cam | CCTV |
| Habitat, at night | `CAM · HABITAT · IR` | Night vision: green, grain, sleepers on the rug with helmets off |

- **Viewers** grow with the colony's progress (reactor, driver, capsules, pups, landers, crewmates) and spike on big moments.
- **Chat** reacts only to real events and to the camera on air, with a quiet trickle of ambient lines between. It never invents events. Viewers are on Earth.
- **The capybaras know.** They don't play to the lens (0.50 cut waving at the camera); they wave to Earth instead. The last one into the habitat at night turns and waves goodnight toward Earth, and the first out at sunrise waves good morning. Crewmates from Earth wave toward the base as they step off the lander.
- The stream is fiction layered on the colony: it changes what you see and hear, never what the colony does. Waves are the one exception, and they only pause a capybara for a few seconds.

## Lending a hand

The one place the viewer can touch the colony. Every station has a game view (View → game), a camera close on whatever the game changes, framed so the button doesn't cover it. There a small game that fits it (weld, filter, water, turn, cheer, drop a yuzu, boost the rover, drill, lullaby, guide the lander, signal Earth, analyse, tuck in): good taps add a little progress and speed up the capybaras there for a few seconds. It's always optional. The colony runs at its own pace without you, and helping only makes it faster. (Open question: slow the colony's base pace so helping matters more.)

## Colony loops

```
ice mine ──► water ──► wallow ◄── yuzu ◄── greenhouse ◄── compost
                          │                                  ▲
                          └──── old yuzu become peels ───────┘
crater edge ──► core sample ──► lab ──► samples logged
reactor site ──► ring ──► shielding ──► coil ──► online (glows only at night)
reactor online ──► mass driver (rail ──► coils ──► capacitors) ──► He-3 capsules to Earth
rover loop ──► He-3 canister (3 per capsule)
every 3 capsules ──► supply lander from Earth ──► 3 crates carried to the habitat + 3 hauled by ROVER-1 (yuzu, CO2 filters, seedlings)
landers 2 and 3 ──► a new crewmate each (SORA, MOMO), named by chat
compost ≥ 80% ──► spread in the greenhouse ──► faster fruit
CO2 scrubber ──► oxygen (drifts down; capybaras swap filters below ~92%)
```

## Progression

The colony moves through acts. Each is passive: the player watches it happen.

1. **Bootstrap.** Build the fusion reactor. The first pup comes once it's online.
2. **Export.** Build the mass driver and throw He-3 home, three canisters a capsule.
3. **Exchange** (0.41). Earth writes back: a supply lander for every 3 capsules, bringing crates and, twice, a new crewmate.
4. **Descent** (next). A cable tram down into Shackleton's permanently shadowed floor, where the real water ice is. It is IN SHADOW under the binary rule even at lunar noon, so it's lit by lamps: a night place by day, with its own camera. Earned by landers (the tram arrives in parts).
5. **Outposts.** A crater-floor observatory, a second greenhouse with a different crop, a longer rover route. Each arrives by lander.
6. **Seasons.** The colony keeps living once everything is built: the sun's height changes through the year, meteor showers, anniversaries of the first launch.

## Places and activities

| Place | Activity | Driven by |
| --- | --- | --- |
| Greenhouse | Graze the grass bed, or pick a yuzu for the wallow | Fruit on the trees; fewer than 3 yuzu in the wallow |
| Wallow (bathhouse) | Soak facing Earth under a glass dome, helmets off (in by the airlock, down a ramp); wear a yuzu on the head when yuzu are floating | Always popular |
| Wallow edge | Scoop peels | Peels waiting |
| Compost bin | Feed peels, turn the compost | Peels carried in; compost above 0 |
| Science lab | Run experiments, log carried core samples | Samples brought back |
| Crater edge | Drill a core (standing up), leave a marker flag | Baseline, daytime only |
| Reactor site | Weld, fit shielding, wind coils, then check | Reactor under 100% |
| Life support | Swap CO2 filters, check tanks | Oxygen under 92% |
| Comms tower | Watch Earth; pairs sit cheek to cheek and send hearts toward Earth | Two seats |
| Workout wheel | Run | One at a time |
| Solar masts, ice mine | Brush dust, check the mine | Baseline |
| Landing pad | Watch a lander come in (standing), then unload a crate | A lander announced or on the pad |
| Habitat airlock | Stow a crate; nap by the airlock; sleep inside at night | A carried crate; night rhythm |

Divisions weigh their own jobs 1.8×: Engineering (reactor, mass driver, solar masts), Science (lab, crater drilling, comms), Operations (greenhouse, life support, compost, peels, ice mine, unloading).

## Stations feel alive

Every station shows that it's working, in the world: screens that read the colony (lab analysis, the Earth link, crop monitor, air, baby monitor), lights that run when it's busy (the reactor ring, rising rings on the oxygen tanks, the wheel's rim lights, the pad's approach lights), and moving parts (sprinklers, the mine's drill shaft). Every lend-a-hand game answers with something you can see there. At night each station has its own lamp, and one real light follows the camera to the station being watched. Buildings stand on level, graded ground: the ice mine on a bench cut into the crater wall, the pad, comms and nursery on graded pads. The habitat reads as a home even when it's empty.

## Look

Each capybara wears its division's EVA suit (Engineering charcoal with amber bands and helmet lamps; Science white with blue stripes and a gold visor; Operations white with green stripes), dark boots, a life-support pack and a single clear bubble helmet on a metal neck ring. Inside is head C, lit faintly by a helmet light so the face reads even with the sun behind: a lathe-turned capybara head with a broad dark nose pad, small high eyes and small round ears, in the capybara's own fur colour. Expressions follow what it's doing: content, happy (magenta blush), zen, sleepy, curious, focus, chewing.

## Movement

- **Walk** (from the Moon Suits page): a diagonal gait whose stride follows the distance walked (a full stride per metre), each foot lifting as it swings forward. The body floats 4.5 cm at the top of each step and sways a little; the head looks about. Pups step quicker and shorter.
- **Standing:** breathing, weight shifting, looking around.
- **Rearing up** on the hind legs to drill, to watch a launch, to nuzzle, to watch Earth now and then, and to wave at the camera.

## Social behaviour

- **Greetings:** two capybaras meeting head-on walk in to arm's length, rise while closing in, nuzzle upright with hearts, then drop and step back; or a quick helmet bump and sniff. Each waits 35–55 seconds before greeting again, and the same two not for 150 s.
- **Earth watching:** a single watcher sends a small heart toward Earth every few seconds; a pair leans in and sends bigger ones more often, and they leave together.
- **Waving:** see The stream.

## Pups

Once the reactor is online, the first pup comes after two minutes and the next every five, up to three. Low oxygen or an empty wallow slows the countdown to a quarter. Pups wear a small copy of the parent's suit, follow the parent, join them in the wallow and sleep in the nursery. While the parent works a station, the pup has its own thing to do there: cheering at the wheel, nibbling grass, peeking at the lab monitor, watching welding from a safe distance, chasing dust round a mast. Every few minutes one walks to the rover stop by the base and waits; the rover pauses to let it on, carries it out to the mine and back, and pauses again to let it off.

## Big moments

The view shakes when the reactor comes online (a long rumble), at every launch (a short one) and when a lander touches down (a small one). Android phones also buzz; iPhone doesn't let web pages vibrate.

## Meteor showers

Every 7–11 minutes: streaks overhead and distant flashes for 25 seconds. Capybaras look up; afterwards dust on the solar masts draws them to clean it.

## Night rhythm

At lunar night, two capybaras are picked for watch duty. Everyone else walks to the habitat and goes inside; the last one waves goodnight first. Z's rise from the roof while anyone sleeps, and the habitat camera switches to night vision. At sunrise they come out and stretch, and the first one waves good morning.

## Views

Capybara views: orbit, top-down, shoulder cam and first-person POV. Stations, for everything that isn't a capybara: Rover, Wallow (the bath postcard), Habitat, Reactor, Greenhouse, Wheel, Lab, Life support, Compost, Comms, Mass driver, Landing pad, Nursery and Ice mine, each with a live status line. In first person the workout wheel is hidden while its runner is followed, because the spokes strobe.

## Open ideas

- Descent: the crater-floor tram (see Progression).
- Chat names pups too, and a way to see who's who (a roster card).
- Seasons of light as the sun's height changes.
- Ambient sound: suit breathing, the scrubber fan, water in the wallow, the lander's engine.
- Pups crowding a station camera's lens.
