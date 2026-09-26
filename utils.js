/**
 * Draws nine copies of the given item in a tic-tac-toe grid, where the
 * visible screen is in the middle. This gives the impression that objects
 * wrap around from one side of the screen to the other.
 *
 * If an object's position truly moves out of the boundaries of the visible
 * screen, other code needs to ensure its actual position wraps around. This
 * drawing function does not do that for you.
 **/
function drawEverywhere({ offset, drawFn }) {
  for (const ox of [-width, 0, width]) {
    for (const oy of [-height, 0, height]) {
      push();
      translate(offset.x + ox, offset.y + oy);
      drawFn();
      pop();
    }
  }
}

/**
 * Returns an object { minutes, seconds } where both items are strings
 * suitable for rendering. E.g. "4:03".
 */
function timeToStringParts(timeMs) {
  const secondsLeft = Math.trunc(timeMs / 1000);
  const minutes = String(Math.trunc(secondsLeft / 60));
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  return { minutes, seconds };
}
