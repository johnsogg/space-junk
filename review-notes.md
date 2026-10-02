# Space Junk review checklist

Open items from the 2026-10-01 review of the reference solution, to work through
before turning it into a homework assignment. Fixed items are removed.

## Bugs

- [x] **Crash after the last level** (`game.js:121-122`). This one is known and
  has a note in the code. `levels[3]` is `undefined`, so `new Level(undefined)`
  throws when it reads `.name`.
- [x] **Lives reset to 3 on every level** (`level.js:26`). `lives` lives on
  `Level`, and a new `Level` is built for each level, so losing a life won't
  carry over. Lives belong to the whole game, like `score`, so they should go on
  `Game`. A `MAX_LIVES` constant would also replace the bare `3` (the spec calls
  it `maxNumLives`).
- [x] **During the loading screen, the game keeps simulating.** The ship still
  flies, and the finished level's timer keeps counting down under the overlay.
  Skip input, movement, and `level.move()` while loading, but keep the
  `playStateElapsed` block running, or the game will get stuck on "Loading."
- [x] **Both overlays can stack.** If the game is paused during loading, you get
  two scrims plus "Paused" and "Loading" drawn on top of each other at the
  center (`game.js:157-162`).
- [x] **After delivery, the beam comes back right away if Space is still held.**
  This is fine unless you want players to let go and press Space again.

## Comments that are wrong or stale

- [! ] `level.js:35-36` (the `Level.draw` doc): it now draws the timer, score,
  lives, and junk. "All the game entities other than the magpie" is still wrong,
  since the Mothership is drawn by `Game`.
- [x] `game.js:208` says "show some message for a few seconds." It's 1 second
  (`LOAD_WAIT_TIME`).
- [! ] `level.js:53` "X offset is off the edge": "off" reads like "beyond the
  edge." Something like "padded in from the left edge" would be clearer.
- [! ] `magpie.js:10` says captured junk sits "inside the beam," and the README
  says it "rides in the beam." The beam is now always off while carrying.
- [! ] `game.js:39` "Input controller for keyboard/mouse": there is no mouse
  input.
- [! ] `physics.js:56` "shift … either right or left": the code also shifts up
  and down.
- [ !] **The README is stale:**
  - [ ] "Current state" lists score, lives, and level progression as not built,
    and delivery as in progress.
  - [ ] The "Known issues" item about commented-out `let` lines in `sketch.js`
    is out of date; those lines are gone.
  - [ ] The "Known issues" item about `Level.draw`'s doc comment is out of date.
  - [ ] The code-layout sections don't mention `playState`, loading, dropoff,
    scoring, lives, `captureJunk`, or `dropoffTime`.

## Code first-year students may find confusing

- [ ] **The lives icons pass a made-up physics object:**
  `Magpie.drawMagpie({ physics: { rotation: 0.2 }, ... })` (`level.js:60`).
  `drawMagpie` only reads `physics.rotation`. Taking `{ rotation, beam }`
  instead would make both callers simpler and avoid the fake object.
- [x ] **`junk.caught` is dead code.** It's set (`junk.js:20`, `game.js:105`),
  but caught junk is removed from `level.junk` right away, so the `!junk.caught`
  check in `level.js:77` is always true. It's also the only `Junk` field without
  a declaration at the top of the class.
- [x] **Capture is split across two places.** `game.js:105` sets `junk.caught`,
  and `captureJunk` does the rest. If `caught` stays, move it into
  `captureJunk`.
- [x] **`enableBeam`'s two `if`s** (`magpie.js:144-148`) read like a puzzle.
  Something like `this.beam = v && !this.capturedJunk` would be clearer.
- [x] **`capturedJunk` starts as `undefined`** (never set in the constructor)
  but is later set to `null`. `isLevelComplete` handles this with `== null`, the
  only loose `==` in the codebase. Setting `= null` in the constructor and using
  `===` would avoid teaching that trick.
- [ ? ] **Classes reach into the `game` global.**
  - `Mothership.resolveDropoff` reads `game.magpie` and calls
    `game.updateScore`, even though `Game` is the one calling it. Compare
    `resolveBeam`, which lives in `Game` and uses `this`.
  - `Level.draw` reads `game.score` (`level.js:46`).
  - Passing these values in, or moving the dropoff logic into `Game`, would make
    the data flow easier to follow.
- [ ] **The two guards for `completeLevel()` do the same check** (`sketch.js:32`
  and `game.js:205`), so the one inside `completeLevel()` can never trigger.
  That's fine as a lesson in defensive programming, but a student may wonder why
  the check appears twice.
- [!] **`resolveBeam` returns nothing when no junk is caught.** That gives
  `undefined` implicitly. An explicit `return null` would be clearer.
- [ ? ] **`caught.reduce(...)`** (`game.js:146`) is advanced for first-year
  students. A plain loop tracking `best` says the same thing.
- [! ] **`() => (game.paused = true)`** (`sketch.js:18-19`) is an assignment
  wrapped in parentheses as an expression body. Braces with a statement would be
  clearer.
- [ !] **Small inconsistencies:**
  - [! ] `offset: { x: this.physics.x, ... }` in `magpie.js:30` vs
    `offset: this.physics` everywhere else.
  - [! ] `0 + Magpie.DOME_HEIGHT / 2` at `magpie.js:75`.
  - [! ] `let winX/winY` at `magpie.js:89-90` could be `const`.
  - [! ] `LOAD_WAIT_TIME` has no `_MS` suffix, unlike the constants next to it.
  - [? ] The code mixes `Math.abs`/`Math.max` with p5's `dist`/`sin`/`random`.
- [ ! ] **Unused or leftover setup:**
  - [ ?] `index.html` loads `p5.sound`, which nothing uses, and the page title
    is still "p5 sketch".
  - [? ] `package.json` has `"main": "magpie.js"`.
