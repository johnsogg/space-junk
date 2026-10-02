class Junk {
  static DIAMETER = 20;

  physics;

  /** How long (ms) this junk has been in the Magpie's beam. */
  beamTime;

  /** How long (ms) this junk has been in the Mothership's drop zone. */
  dropoffTime;

  constructor() {
    this.physics = new Physics();
    this.physics.x = random(0, width);
    this.physics.y = random(0, height);
    this.physics.dx = random(-12, 12); // pixels per second
    this.physics.dy = random(-12, 12);
    this.beamTime = 0;
    this.dropoffTime = 0;
  }

  draw() {
    push();
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        Junk.drawJunk();
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  /**
   * Draws the junk's shape around (0, 0). Assumes the caller has already
   * moved the transform to wherever the junk should appear.
   **/
  static drawJunk() {
    push();
    noStroke();
    fill("#a0936a");
    circle(0, 0, Junk.DIAMETER);
    pop();
  }

  move(delta) {
    this.physics.move(delta, { constrain: true });
  }
}
