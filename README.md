# Space Junk

My reference solution to the Space Junk homework for my CF1 class. It is a work
in progress. This README is a working note for picking the project back up; it
will be rewritten later.

The spec lives in the course book repo:
`../2026-cf1-cf2-rebuild/book/src/units/homework/chapters/space-junk-game/sections/description.mdx`

## The game

You fly a small ship, the **Magpie**. You use its tractor beam to grab floating
**space junk** and carry it to a cargo ship, the **Mothership**. The Mothership
pulls in junk that stays inside its field for `timeToGrabJunk` ms. When all the
junk is collected, you move on to the next level. You score points for junk,
with a bonus for speed, and for completing levels. If the **timer** (counting
down from `mapStartingTime`) runs out, you lose a Magpie. The game is over when
you run out of Magpies (`maxNumLives`). Later levels add **comets** and a
**star** that destroy the Magpie on contact.

The map is black and wraps around at every edge: anything that overlaps an edge
also appears on the opposite side, including at the corners.

**Phase 1** (currently "enough for full credit" in the spec): Magpie,
Mothership, junk, timer, score, lives, and edge wrapping. Comets and the star
come after Phase 1.

> **Plan: re-phase the spec.** Phase 1 as written is too ambitious and will
> frustrate students. Edge wrapping in particular is too complex for it: it
> needs both position wrapping and drawing nine copies with `drawEverywhere`.
> Move wrapping to a later phase. When fleshing out the description, break it
> into bite-size phases, each with a worked example. The worked examples will
> be reverse-engineered from this repo, so this repo should be a complete,
> working game before going back to the book.

### Controls

- `w` thrust forward, `s` reverse thrust
- `a` rotate counter-clockwise, `d` rotate clockwise
- Hold `Space` for the tractor beam
- `~` or `` ` `` toggles debug graphics (not in the spec)

## Current state

Working: the Magpie flies (thrust, reverse, rotate, drift) and shows its beam
while Space is held. Junk drifts slowly. The Mothership drifts and draws, with
its pickup circle in debug mode. Junk held in the beam for
`Game.JUNK_CATCH_TIME_MS` is captured and carried under the ship, and the beam
switches off until it's delivered. Carried junk that stays in the Mothership's
pickup circle for `Game.JUNK_DROPOFF_TIME_MS` is delivered and scores
`Game.SCORE_DROPOFF`. When a level is cleared, a "Loading next level..." overlay
shows for `Game.LOAD_WAIT_TIME_MS`, then the next level loads. The timer, score,
and remaining lives are drawn. Everything wraps at the edges. Debug graphics
toggle on and off, and the game pauses when the window loses focus.

Not built yet: losing a life, anything happening at the end of the timer, game
over, a time bonus, comets, and the star.

## Running it

These are plain p5.js files with no build step. p5 2.3.2 is loaded from a CDN in
`index.html`. The page must be served over HTTP, not opened as `file://`,
because `loadJSON` uses `fetch`. Use the VS Code **Live Server** extension
(port 5500).

`npm install` is optional. It only provides editor support: the p5 type
definitions for autocomplete (through `jsconfig.json`) and ESLint. The game
itself never uses `node_modules`.

## Code layout

Every file is a global `<script>` loaded in `index.html`, with no ES modules.
Script order doesn't matter much, because nothing runs until p5 calls
`setup()`.

- **`sketch.js`**: the single `game` global. `async setup()` creates the
  canvas, then `game = await Game.load()`, then adds window `blur`/`focus`
  listeners that set `game.paused`. `draw()` clears the background, calls
  `game.move()` with `deltaTime` capped at `MAX_DELTA_MS` unless paused, then
  `game.draw()`. Last, if the game is `"playing"` and `game.isLevelComplete()`,
  it calls `game.completeLevel()`.
- **`game.js`**: `Game` ties everything together. It holds `levels` (all level
  configs), `levelIdx`, `level` (the loaded `Level`), `playState` (`"playing"`
  or `"loading"`), `playStateElapsed`, `magpie`, `mothership`, `inputs`,
  `debug`, `score`, `lives`, and `paused`. Constructors can't be async, so the
  static `async load()` fetches `./levels.json` and returns
  `new Game({ levels })`. The constructor starts with `DEFAULT_NUM_LIVES`, loads
  level 0, and places the Magpie at a random spot in the middle half of the
  screen with a random rotation, and the Mothership the same way with a slow
  drift.
  - `move(delta)` applies input, moves the Magpie, Mothership, and level (the
    level's timer only counts while `"playing"`), then calls
    `resolveBeam(delta)`. That adds or drains each junk's `beamTime` and returns
    the in-beam junk with the most `beamTime` once it passes
    `JUNK_CATCH_TIME_MS` (or `null`). `move` hands that junk to
    `magpie.captureJunk()` and removes it from the level. Then
    `resolveDropoff(delta)` adds or drains the carried junk's `dropoffTime`,
    depending on whether it's inside the Mothership's pickup circle (using
    `wrappedDist`), and returns true once it passes `JUNK_DROPOFF_TIME_MS`.
    `move` then clears `capturedJunk` and scores the delivery. While
    `"loading"`, `move` also adds `delta` to `playStateElapsed`, and once it
    reaches `LOAD_WAIT_TIME_MS`, it builds the next `Level` and goes back to
    `"playing"`. Gameplay keeps running behind the loading overlay on purpose,
    but the level timer is stopped.
  - `draw()` draws the level (passing in the score and lives), Mothership, then
    Magpie, then at most one overlay: "Paused" if paused, otherwise "Loading
    next level..." if loading.
  - `isLevelComplete()` is true when the level has no junk and the Magpie isn't
    carrying any. `completeLevel()` switches to `"loading"` and resets
    `playStateElapsed`. `updateScore(reason)` adds `SCORE_DROPOFF` for a
    `"dropoff"`.
- **`mothership.js`**: `Mothership` is a rectangle with a `physics` and a
  `PICKUP_DIAMETER` circle, drawn in debug mode. `Game` uses the circle for
  delivery.
- **`level.js`**: `Level` is built from one `levels.json` entry. It holds the
  `name`, the `junk` array, and `time` (`{ initial, elapsed }`). `timeLeft()`
  returns the remaining ms. `draw(score, lives)` draws the timer, the score, a
  small Magpie for each life, then the junk. `move(delta, { countTime })` adds
  `delta` to `time.elapsed` (unless `countTime` is false) and moves the junk.
  `removeJunk(junk)` takes a caught piece out of the `junk` array.
- **`physics.js`**: `Physics` holds `x`, `y`, `dx`, `dy`, and `rotation`
  (radians). Velocity is in pixels per second. `move(delta, { constrain })`
  adds velocity × elapsed time to position and, if `constrain`, wraps the
  position into `[0, width)` × `[0, height)`. `rotate(rate, delta)` turns it
  (radians per second). `thrust(accel, delta)` speeds it up along the facing
  direction (pixels per second, per second). `draw()` draws debug graphics: a
  circle, a thin line to where the object will be in half a second, and a
  thick 10px direction line.
- **`magpie.js`**: `Magpie` holds a `physics`, a `beam` flag, and
  `capturedJunk` (a `Junk` or `null`). `captureJunk(junk)` stores the junk and
  turns the beam off. `enableBeam(v)` can always turn the beam off, but only
  turns it on when nothing is being carried. The static `drawMagpie()` draws the
  ship at the origin (beam triangle, dome, platform, window). `draw()` draws the
  captured junk at `(0, CARGO_Y)` in the ship's frame, under the ship.
  `move()` also updates the captured junk's real position with
  `worldToScreen`. `beamContains({ x, y })` tests a canvas point against the
  beam triangle with `screenToWorld`, running through `drawEverywhere` so
  wrapped copies of the beam count.
- **`junk.js`**: `Junk` is a circle with a random position and a slow random
  drift. `beamTime` (ms) is how long it has been in the beam, and it drains
  when the junk is out of the beam. `dropoffTime` (ms) works the same way for
  the Mothership's pickup circle. The static `drawJunk()` draws the shape at
  the origin.
- **`inputs.js`**: `Inputs.handleKeyDown(delta)` checks `keyIsDown()` for WASD
  and Space, and applies them to the Magpie (thrust 360 px/s², reverse 180
  px/s², turning 2.4 rad/s). The global `keyPressed()` toggles
  `game.debug` on `~` or backtick (guarded, since `game` is undefined until
  `load()` finishes). It returns `false` only for keys in `SCROLL_KEYS` (Space
  and the arrows).
- **`utils.js`**: `drawEverywhere({ offset, drawFn })` draws 9 copies (3×3
  grid) for wrapping. `timeToStringParts(ms)` returns `{ minutes, seconds }`
  strings, like `"4"` and `"03"`.
- **`levels.json`**: an array of level configs, `{ name, junk, time }`. `junk`
  is a count and `time` is in ms.

## Conventions and decisions

- **Frame order:** input → move → draw. Within drawing, the level (timer, score,
  lives, then junk) comes first, so the timer is under everything, as the spec
  requires. The Mothership, the Magpie, and any overlay come after.
- **Rotation 0 means the ship faces up (−y).** Positive rotation turns
  clockwise, because y points down on screen. Forward is
  `(sin(r), -cos(r))`.
- **Velocity is in screen coordinates.** Rotation only changes the direction of
  thrust, which gives Asteroids-style drift.
- **Time flows in as `delta` (ms), like Godot's `_process(delta)`.** Only
  `sketch.js` reads p5's `deltaTime` global. It passes it to `game.move(delta)`,
  which passes it down to every `move()`, `handleKeyDown()`, and resolve step.
  Rates are per second (velocity in px/s, thrust in px/s², turning in rad/s,
  drift around 12 px/s), and `Physics` converts with `delta / 1000`. Motion is
  the same speed at any frame rate. The old per-frame numbers were these ×
  1/60 (velocity, turning) or × 1/3600 (thrust).
- **Wrapping takes two things:** the position must wrap (`Physics.move` with
  `constrain`), and the object must be drawn with `drawEverywhere`. Nine copies
  are needed to cover the corners, not five.
- **Wrap with `while` loops, not `%`.** JavaScript's `%` keeps the sign of the
  left side, so `-5 % 800` is `-5`, not `795`. The loops read the same way the
  idea does: "off the left edge, shift right one screen."
- **`drawFn` draws around the origin (0, 0).** `drawEverywhere` has already
  translated to the object's position.
- **Two kinds of draw functions.** An instance `draw()` expects a clean canvas
  and places itself with `drawEverywhere`. A static `drawX()` (`drawMagpie`,
  `drawJunk`) expects the transform to already be at the object's center and
  draws around (0, 0). **Never call a `draw()` from inside another
  `drawEverywhere`**: it translates a second time, and with 81 copies, all in
  the wrong place, the object seems to vanish with no error. To draw one thing
  attached to another (junk under the ship), call the static shape draw from
  inside the parent's callback.
- **Screen vs. world in p5:** p5's "world" means the current transformed frame,
  and "screen" means canvas pixels. To move between a ship's frame and the
  canvas, `push()`, `translate`/`rotate` exactly as the draw code does, call
  `worldToScreen` (frame → canvas) or `screenToWorld` (canvas → frame), then
  `pop()`. This only gives correct results where the transform starts clean,
  like `game.move()`, which runs before any drawing.
- **Attached objects have two positions to keep in sync.** Captured junk is
  drawn from `Magpie.CARGO_Y` in the ship's frame, and its `physics` is set from
  the same constant in `Magpie.move()`. If those drift apart, what you see and
  what the game logic uses stop matching.
- **Debug graphics:** each object's `drawFn` calls `this.physics.draw()` when
  `game.debug` is on, after the object draws itself. At that point the
  transform is translated but not rotated, which `Physics.draw` expects,
  because `dx` and `dy` are in screen coordinates.
- **Only swallow the keys you mean to.** A p5 key handler that returns `false`
  calls `preventDefault()`, so returning it for every key breaks browser
  shortcuts like Cmd-R. Scroll keys are still swallowed so the game doesn't
  scroll a parent page when embedded in an iframe.
- **Timers use game time, not wall-clock time:** the level adds `delta` to
  `time.elapsed` in `move()`, and remaining = `initial - elapsed`. Anything
  that skips `move()`, like pausing, stops the timer for free. `Game` also
  passes `countTime: false` while loading, so a cleared level's timer stops.
  The loading delay (`playStateElapsed`) works the same way. Don't use
  `millis()` for game timers; it keeps counting while paused.
- **Pausing is a flag, not `noLoop()`.** `sketch.js` skips `game.move()` while
  `game.paused` is set, but still draws, so the frozen scene and the "Paused"
  overlay stay on screen. It pauses on window `blur` (switching tabs or apps)
  and resumes on `focus`.
- **`delta` is clamped to `MAX_DELTA_MS` (50) in `sketch.js`.** When a tab is
  hidden, the browser stops calling `draw()`, so pausing alone isn't enough.
  On `focus` the game unpauses, and the next `deltaTime` covers the whole time
  the tab was hidden. Unclamped, that one frame would jump every object
  seconds along its path and finish every capture timer at once. The cost:
  below 20 fps the game runs in slow motion instead of skipping ahead.
- **Held keys are polled with `keyIsDown()` every frame**, not handled with key
  callbacks, which only repeat at the OS key-repeat rate. One-shot toggles
  (like debug) use `keyPressed()`.
- **Levels are declarative JSON.** Keep data in `levels.json` and have `Level`
  create the objects from it.
- **Use `Math.*` for math.** `Math.sin`, `Math.hypot`, `Math.max`, and so on,
  even where p5 has its own version. The one p5 math function used is
  `random(min, max)`, because `Math.random()` has no range.
- **Objects get what they need from their caller, not the `game` global.**
  `Game` passes `score` into `Level.draw(score)`, and delivery is checked in
  `Game.resolveDropoff()` because `Game` owns both ships. The exception is
  `game.debug`, a game-wide setting that every `draw()` reads.
- **Names to avoid:** the global `map` (hides p5's `map()`) and the class `Map`
  (replaces JavaScript's built-in `Map`).

## Tooling

- `.prettierrc` plus `.vscode/settings.json`: 2-space indentation, format on
  save with Prettier, and `detectIndentation` turned off so the indent-rainbow
  extension agrees with Prettier.
- `jsconfig.json` includes `node_modules/p5/types/global.d.ts`, so p5 globals
  autocomplete. Don't use `@types/p5`; it only covers p5 1.x.
- `eslint.config.mjs` has one rule: `no-restricted-syntax` bans `for...in`
  (use `for...of`). It does not have `no-undef`, so it won't catch assignments
  to undeclared names.
- p5 2.x details: there is no `preload()` (use `async setup()` with `await`),
  `draw()` doesn't start until an async `setup()` finishes, and `keyIsDown()`
  takes strings (`"w"`, `"KeyW"`, `"Space"`), not numeric keycodes.

## Known issues / TODO

- Finishing the last level crashes: `levelIdx` goes past the end of `levels`.
  This is left in on purpose, as an exercise noted in `Game.move()`.
- The timer is drawn in p5's default small text. The spec asks for large,
  easy-to-read text.
- There's no `windowResized()`. The canvas keeps its starting size when the
  window changes, and wrapping uses that size.
- The timer counts down to `0:00`, but nothing happens when it gets there.
