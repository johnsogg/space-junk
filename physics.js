/**
 * Represents a particle-style physical object with position, velocity, and
 * rotation (in radians). Velocity (dx, dy) is in pixels per second. Methods
 * that change things over time take `delta`, the milliseconds since the last
 * frame, so motion is the same speed at any frame rate.
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
   * showing where it will be in half a second, and a thick line showing its
   * direction of travel. Assumes the transform is translated to (x, y) but
   * not rotated, since dx and dy are in screen coordinates.
   **/
  draw() {
    push();
    noFill();
    stroke("#ffffff");
    strokeWeight(1);
    circle(0, 0, 10);
    const v = createVector(this.dx, this.dy); // pixels per second
    const future = v.copy().mult(0.5); // how far it goes in half a second
    line(0, 0, future.x, future.y);
    strokeWeight(2);
    const dir = v.copy().setMag(10);
    line(0, 0, dir.x, dir.y);
    pop();
  }

  /**
   * Moves the item by its velocity times the elapsed time. `delta` is in ms and
   * velocity is per second, hence the / 1000. If the `constrain` argument is
   * present and truthy, it keeps the item on the visible portion of canvas by
   * wrapping x and y around.
   **/
  move(delta, { constrain = false } = {}) {
    const seconds = delta / 1000;
    this.x += this.dx * seconds;
    this.y += this.dy * seconds;
    if (constrain) {
      // When position is constrained, shift the values back into view
      // by multiples of the width/height: right or left, and up or down.
      while (this.x < 0) this.x += width;
      while (this.y < 0) this.y += height;
      while (this.x >= width) this.x -= width;
      while (this.y >= height) this.y -= height;
    }
  }

  /**
   * Turn at the given rate (radians per second) for `delta` ms. Positive is
   * clockwise.
   **/
  rotate(rate, delta) {
    this.rotation += rate * (delta / 1000);
  }

  /**
   * Speed up in the 'forward' direction at the given rate (pixels per second,
   * per second) for `delta` ms. This depends on the current rotation. It is
   * intended for entities like ships that have a clear 'up' or 'forward'
   * direction.
   */
  thrust(accel, delta) {
    const amt = accel * (delta / 1000);
    this.dx = this.dx + Math.sin(this.rotation) * amt;
    this.dy = this.dy + Math.cos(this.rotation) * -amt;
  }
}
