/**
 * Moves the transform to the given offset (any object with x and y, like a
 * Physics), then calls drawFn. The drawFn should draw around (0, 0).
 *
 * In this version it draws one copy. Wrapping objects around the edges of
 * the screen would mean drawing more copies, offset by the canvas width and
 * height. That's a stretch goal.
 **/
function drawEverywhere({ offset, drawFn }) {
  push();
  translate(offset.x, offset.y);
  drawFn();
  pop();
}

/**
 * A stand-in shape for things you haven't drawn yet: an outlined rectangle
 * with a line pointing 'forward', so you can see which way it is rotated.
 * Draws around (0, 0).
 **/
function drawPlaceholder({ rotation, width, height }) {
  push();
  rotate(rotation);
  noFill();
  stroke("#ffffff");
  rectMode(CENTER);
  rect(0, 0, width, height);
  line(0, 0, 0, -height);
  pop();
}

/**
 * Returns an object { minutes, seconds } where both items are strings
 * suitable for rendering. E.g. "4" minutes, "03" seconds.
 */
function timeToStringParts(timeMs) {
  // TODO (Phase 5): Round up to whole seconds, then split them into minutes
  // and leftover seconds. Seconds always have two digits.
  return { minutes: "0", seconds: "00" };
}
