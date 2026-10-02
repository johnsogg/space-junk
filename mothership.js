class Mothership {
  static WIDTH = 50;
  static HEIGHT = 20;
  static PICKUP_DIAMETER = Mothership.WIDTH * 1.2;
  static CORNER_RADIUS = 8;
  static NUM_PORTHOLES = 4;
  static PORTHOLE_DIAMETER = 6;

  physics;

  constructor() {
    this.physics = new Physics();
  }

  draw() {
    push();
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        Mothership.drawMothership({ rotation: this.physics.rotation });
        if (game.debug) {
          this.physics.draw();
          noFill();
          stroke("#fff");
          circle(0, 0, Mothership.PICKUP_DIAMETER);
        }
      },
    });
    pop();
  }

  /**
   * Draws the Mothership's shape around (0, 0): a rounded rectangle with a
   * row of porthole windows. Assumes the caller has already moved the
   * transform to wherever the Mothership should appear.
   **/
  static drawMothership({ rotation }) {
    push();
    rotate(rotation);
    noStroke();
    fill("#741160");
    rectMode(CENTER);
    rect(0, 0, Mothership.WIDTH, Mothership.HEIGHT, Mothership.CORNER_RADIUS);
    // portholes are evenly spaced along the middle. With n portholes there
    // are n + 1 gaps, so each one sits at (i + 1) gaps from the left edge.
    fill("#70eef5");
    const gap = Mothership.WIDTH / (Mothership.NUM_PORTHOLES + 1);
    for (let i = 0; i < Mothership.NUM_PORTHOLES; i++) {
      const x = -Mothership.WIDTH / 2 + (i + 1) * gap;
      circle(x, 0, Mothership.PORTHOLE_DIAMETER);
    }
    pop();
  }

  move(delta) {
    this.physics.move(delta, { constrain: true });
  }
}
