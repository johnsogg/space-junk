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

  move() {
    this.physics.move({ constrain: true });
  }

  resolveDropoff(delta) {
    const junk = game.magpie.capturedJunk;
    if (junk) {
      if (
        wrappedDist(this.physics, junk.physics) <=
        Mothership.PICKUP_DIAMETER / 2
      ) {
        junk.beamTime += delta;
        if (junk.beamTime > Game.JUNK_DROPOFF_TIME_MS) {
          game.magpie.capturedJunk = null; // make it disappear
          game.updateScore("dropoff");
        }
      } else {
        // we have junk but not inside the drop zone. reduce elapsed time,
        // floor is at zero like always.
        junk.beamTime = Math.max(0, junk.beamTime - delta);
      }
    }
  }
}
