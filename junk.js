class Junk {
  static DIAMETER = 20;

  physics;

  constructor() {
    this.physics = new Physics();
    this.physics.x = random(0, width);
    this.physics.y = random(0, height);
    this.physics.dx = random(-0.2, 0.2);
    this.physics.dy = random(-0.2, 0.2);
  }

  draw() {
    push();
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        push();
        noStroke();
        fill("#a0936a");
        circle(0, 0, Junk.DIAMETER);
        pop();
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  move() {
    this.physics.move({ constrain: true });
  }
}
