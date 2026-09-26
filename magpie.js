class Magpie {
  static DOME_WIDTH = 20;
  static DOME_HEIGHT = 30;
  static PLATFORM_WIDTH = Magpie.DOME_WIDTH + 6;
  static PLATFORM_HEIGHT = 3;
  static BEAM_WIDTH = 50;
  static BEAM_HEIGHT = 60;
  static WINDOW_WIDTH = Magpie.DOME_WIDTH / 4;
  static WINDOW_HEIGHT = Magpie.DOME_HEIGHT / 4;

  physics;
  beam;

  constructor() {
    this.physics = new Physics();
    this.beam = false;
  }

  draw() {
    push();
    noStroke();
    // in order to render objects that overlap an edge, we're going to
    // defer to a pure function to render nine copies, one for each cell of
    // a tic-tac-toe, where the middle is our visible canvas.
    drawEverywhere({
      offset: { x: this.physics.x, y: this.physics.y },
      drawFn: () => {
        Magpie.drawMagpie({ physics: this.physics, beam: this.beam });
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  // this method is static. That means it doesn't use `this` to gain access to
  // instance members, because there _is_ no instance. This is essentially a
  // function that happens to be placed inside the Magpie namespace.
  static drawMagpie({ physics, beam }) {
    push();
    rotate(physics.rotation);
    if (beam) {
      const bx = Magpie.BEAM_WIDTH / 2;
      const bh = Magpie.BEAM_HEIGHT;
      fill("#f5f37040");
      triangle(0, 0, bx, bh, -bx, bh);
    }
    rectMode(CENTER);
    fill("#525d80");
    rect(0, 0, Magpie.DOME_WIDTH, Magpie.DOME_HEIGHT, 8);
    fill("#959ebb");
    rect(
      0,
      0 + Magpie.DOME_HEIGHT / 2,
      Magpie.PLATFORM_WIDTH,
      Magpie.PLATFORM_HEIGHT,
    );

    Magpie.drawWindow();

    pop();
  }

  static drawWindow() {
    push();
    rectMode(CORNER);
    fill("#70eef5");
    let winX = Magpie.DOME_WIDTH / 2 - Magpie.WINDOW_WIDTH;
    let winY = -Magpie.WINDOW_HEIGHT;
    rect(winX, winY, Magpie.WINDOW_WIDTH, Magpie.WINDOW_HEIGHT, 1.5);
    pop();
  }

  move() {
    this.physics.move({ constrain: true });
  }

  enableBeam(v) {
    this.beam = v;
  }
}
