# Space Junk starter code

This folder is the student starter for the Space Junk homework. It is the
reference game (the parent folder) with some method bodies replaced by stubs.
Students paste these files into a p5.js web editor sketch and fill in the
stubs. This README is for the instructor and is not part of the sketch.

The homework description lives in the course book repo:
`../2026-cf1-cf2-rebuild/book/src/units/homework/chapters/space-junk-game/sections/description.mdx`

## Keep this in sync with the reference

**When you change the reference implementation, check whether the change
belongs here too.** The starter is a hand-made copy, not generated, so the two
drift apart silently. In particular:

- **Given code** (anything without a `TODO`) should match the reference,
  except for the simplifications listed below.
- **Stubbed methods** keep the reference's name, parameters, and doc comment.
  If you rename a method or change what it takes or returns, update the stub,
  its `TODO` comment, and the homework description.
- **Constants** (`Game.JUNK_CATCH_TIME_MS`, `Magpie.BEAM_WIDTH`, and so on) are
  named in the homework description, so renaming one means editing the book
  too.
- If you change what a phase asks for, update the matching worked example in
  the book.

A quick check: replace each stub with the reference's method body. The game
should then play exactly like the reference does for one level, without wrapping.

## Simplifications compared to the reference

- **One level and no `levels.json`.** `Game.LEVEL` holds the single level
  config, and `setup()` is not `async`. There's no `"loading"` play state. When
  the level is cleared, an "All clear!" message stays on screen and the timer
  stops.
- **No edge wrapping in the drawing.** `drawEverywhere` draws one copy, not
  nine. `Physics.move` still wraps positions (that part is given), so objects
  jump from one edge to the opposite one. There's no `wrappedDist`; students
  use p5's `dist()` in `resolveDropoff`.
- **No `p5.sound`** script tag.
- **`drawPlaceholder()`** (in `utils.js`) is starter-only. Each unfinished
  shape stub calls it with the object's size constants, so every object is
  visible at its real size and shows its facing direction from the start.
- `Game.drawPaused()` is generalized to `Game.drawMessage(message)`.

## Stubs by phase

Each phase is one rubric item (2 points each, 10 total). All `TODO` comments
are tagged with their phase. Every stub does nothing or returns a safe value,
so the sketch runs at every stage.

| Phase | What students build | Stubs |
|---|---|---|
| 1 | Draw the Magpie, Junk, and Mothership | `Magpie.drawMagpie`, `Junk.drawJunk`, `Mothership.drawMothership` |
| 2 | Fly the Magpie | `Physics.move` (the velocity part), `Physics.rotate`, `Physics.thrust`, `Inputs.handleKeyDown` (WASD) |
| 3 | Tractor beam and catching junk | Beam triangle in `Magpie.drawMagpie`, `Magpie.enableBeam`, `Inputs.handleKeyDown` (Space), `Game.resolveBeam` |
| 4 | Carry and deliver junk | `Magpie.captureJunk`, cargo drawing in `Magpie.draw`, `Game.resolveDropoff`, `Game.updateScore` |
| 5 | Timer, score, and lives display | `Level.timeLeft`, the HUD in `Level.draw`, `timeToStringParts` |

How things look between phases:

- **Before phase 3**, nothing can be caught.
- **After phase 3 but before phase 4**, caught junk just vanishes, because the
  given `Game.move` removes it from the level while `captureJunk` does nothing.
  Once all the junk is gone, "All clear!" shows.
- **Phase 4** makes caught junk ride under the ship until it is delivered.

## Given on purpose

These are beyond the students at this point, or are plumbing:

- `Magpie.beamContains` (uses `screenToWorld`)
- the cargo position sync in `Magpie.move` (uses `worldToScreen`)
- `Game.move`, the pause-on-blur, and the `MAX_DELTA_MS` clamp
- the debug toggle (`~` or backtick) and `Physics.draw`
