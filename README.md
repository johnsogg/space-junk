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
`Game.JUNK_CATCH_TIME_MS` is captured and rides in the beam. Everything wraps at
the edges. The level timer counts down. Debug graphics toggle on and off.

In progress: releasing captured junk and delivering it to the Mothership.

Not built yet: score, lives, level progression, anything happening at the end
of the timer, comets, and the star.

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
  canvas, then `game = await Game.load()`. `draw()` clears the background, then
  calls `game.move(deltaTime)` and `game.draw()`.
- **`game.js`**: `Game` ties everything together. It holds `levels` (all level
  configs), `levelIdx`, `level` (the loaded `Level`), `magpie`, `inputs`, and
  `debug`. Constructors can't be async, so the static `async load()` fetches
  `./levels.json` and returns `new Game({ levels })`. The constructor loads
  level 0 and places the Magpie at a random spot in the middle half of the
  screen with a random rotation, and the Mothership the same way with a slow
  drift. `move(delta)` applies input, moves the Magpie, Mothership, and level,
  then calls `resolveBeam(delta)`. That adds or drains each junk's `beamTime`
  and returns the in-beam junk with the most `beamTime` once it passes
  `JUNK_CATCH_TIME_MS`. `move` then hands that junk to the Magpie and removes
  it from the level. `draw()` draws the level, Mothership, then Magpie.
- **`mothership.js`**: `Mothership` is a rectangle with a `physics` and a
  `PICKUP_DIAMETER` circle, drawn in debug mode.
- **`level.js`**: `Level` is built from one `levels.json` entry. It holds the
  `name`, the `junk` array, and `time` (`{ initial, startedAt }`).
  `timeLeft()` returns the remaining ms. `draw()` draws the timer text, then the
  junk. `move()` moves the junk.
- **`physics.js`**: `Physics` holds `x`, `y`, `dx`, `dy`, and `rotation`
  (radians). `move({ constrain })` adds velocity to position and, if
  `constrain`, wraps the position into `[0, width)` × `[0, height)`.
  `rotate(amt)` turns it. `thrust(amt)` pushes along the facing direction.
  `draw()` draws debug graphics: a circle, a thin line to where the object will
  be in 30 frames, and a thick 10px direction line.
- **`magpie.js`**: `Magpie` holds a `physics`, a `beam` flag, and
  `capturedJunk` (a `Junk` or nothing). The static `drawMagpie()` draws the
  ship at the origin (beam triangle, dome, platform, window). `draw()` draws the
  captured junk at `(0, CARGO_Y)` in the ship's frame, under the ship.
  `move()` also updates the captured junk's real position with
  `worldToScreen`. `beamContains({ x, y })` tests a canvas point against the
  beam triangle with `screenToWorld`, running through `drawEverywhere` so
  wrapped copies of the beam count.
- **`junk.js`**: `Junk` is a circle with a random position and a slow random
  drift. `beamTime` (ms) is how long it has been in the beam, and it drains
  when the junk is out of the beam. The static `drawJunk()` draws the shape at
  the origin.
- **`inputs.js`**: `Inputs.handleKeyDown()` checks `keyIsDown()` for WASD and
  Space, and applies them to the Magpie. The global `keyPressed()` toggles
  `game.debug` on `~` or backtick (guarded, since `game` is undefined until
  `load()` finishes). It returns `false` only for keys in `SCROLL_KEYS` (Space
  and the arrows).
- **`utils.js`**: `drawEverywhere({ offset, drawFn })` draws 9 copies (3×3
  grid) for wrapping. `timeToStringParts(ms)` returns `{ minutes, seconds }`
  strings, like `"4"` and `"03"`.
- **`levels.json`**: an array of level configs, `{ name, junk, time }`. `junk`
  is a count and `time` is in ms.

## Conventions and decisions

- **Frame order:** input → move → draw. Within drawing, the level (timer, then
  junk) comes before the Magpie, so the timer is under everything, as the spec
  requires.
- **Rotation 0 means the ship faces up (−y).** Positive rotation turns
  clockwise, because y points down on screen. Forward is
  `(sin(r), -cos(r))`.
- **Velocity is in screen coordinates.** Rotation only changes the direction of
  thrust, which gives Asteroids-style drift.
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
  attached to another (junk in the beam), call the static shape draw from
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
- **Timers use wall-clock time:** remaining = `initial - (millis() - startedAt)`.
  `millis()` is the time since the sketch started, not per frame.
- **Held keys are polled with `keyIsDown()` every frame**, not handled with key
  callbacks, which only repeat at the OS key-repeat rate. One-shot toggles
  (like debug) use `keyPressed()`.
- **Levels are declarative JSON.** Keep data in `levels.json` and have `Level`
  create the objects from it.
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

- `sketch.js` still has the commented-out `let` lines from before the `Game`
  refactor.
- `Level.draw()`'s doc comment mentions lives and score, which it doesn't draw.
- The timer is drawn in p5's default small text. The spec asks for large,
  easy-to-read text.
- There's no `windowResized()`. The canvas keeps its starting size when the
  window changes, and wrapping uses that size.
- The timer counts down to `0:00`, but nothing happens when it gets there.
- **Pause and huge deltas.** When the tab loses focus, p5 stops calling
  `draw()`. When you come back, the first `deltaTime` can be several seconds
  long. That one frame could fully capture junk under the beam or drain every
  capture meter at once. Clamp the delta in `sketch.js`, e.g.
  `Math.min(deltaTime, 50)`. Related: add a real pause, and decide whether the
  level timer should stop during it. It currently uses `millis()`, so it keeps
  running.
- **Thread `delta` (ms) through every `move()`.** `Game.move` →
  `resolveBeam(delta)` is being built first. After that, make the other `move()`
  methods take `delta` so they're consistent. Only `sketch.js` should read p5's
  `deltaTime` global (Godot's `_process(delta)`, but in ms).
