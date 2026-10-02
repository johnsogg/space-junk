class Mothership {
  static WIDTH = 50;
  static HEIGHT = 20;
  static PICKUP_DIAMETER = Mothership.WIDTH * 1.2;

  physics;

  constructor() {
    this.physics = new Physics();
  }

  draw() {
    push();
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        push();
        rotate(this.physics.rotation);
        fill("#741160");
        rectMode(CENTER);
        rect(0, 0, Mothership.WIDTH, Mothership.HEIGHT);
        pop();
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

  move(delta) {
    this.physics.move(delta, { constrain: true });
  }
}
