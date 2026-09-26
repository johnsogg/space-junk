/**
 * Represents a particle-style physical object with position, velocity, and
 * rotation (in radians)
 **/
class Physics {
  x;
  y;
  dx;
  dy;
  rotation;

  /** Initialize position/velocity/rotation all to zero. */
  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.rotation = 0;
  }

  /**
   * Draws the particle's debugging info: a circle at its position, a thin line
   * showing where it will be in 30 frames, and a thick line showing its
   * direction of travel. Assumes the transform is translated to (x, y) but
   * not rotated, since dx and dy are in screen coordinates.
   **/
  draw() {
    push();
    noFill();
    stroke("#ffffff");
    strokeWeight(1);
    circle(0, 0, 10);
    const v = createVector(this.dx, this.dy); // current velocity per tick
    const future = v.copy().mult(30); // velocity in 30 ticks
    line(0, 0, future.x, future.y);
    strokeWeight(2);
    const dir = v.copy().setMag(10);
    line(0, 0, dir.x, dir.y);
    pop();
  }

  /**
   * Moves the item by adding its current velocity to its position. If the
   * `constrain` argument is present and truthy, it keeps the item on the
   * visible portion of canvas by wrapping x and y around.
   **/
  move({ constrain = false } = {}) {
    this.y += this.dy;
    this.x += this.dx;
    if (constrain) {
      // When position is constrained, shift the values back into view
      // by multiples of the width/height, either right or left.
      while (this.x < 0) this.x += width;
      while (this.y < 0) this.y += height;
      while (this.x >= width) this.x -= width;
      while (this.y >= height) this.y -= height;
    }
  }

  /** Add the given amount to the current rotation, in radians. */
  rotate(amt) {
    this.rotation += amt;
  }

  /**
   * Add the given amount to the current velocity in the 'forward' direction.
   * This depends on the current rotation. It is intended for entities like
   * ships that have a clear 'up' or 'forward' direction.
   */
  thrust(amt) {
    this.dx = this.dx + sin(this.rotation) * amt;
    this.dy = this.dy + cos(this.rotation) * -amt;
  }
}
