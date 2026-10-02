class Magpie {
  static DOME_WIDTH = 20;
  static DOME_HEIGHT = 30;
  static PLATFORM_WIDTH = Magpie.DOME_WIDTH + 6;
  static PLATFORM_HEIGHT = 3;
  static BEAM_WIDTH = 50;
  static BEAM_HEIGHT = 60;
  static WINDOW_WIDTH = Magpie.DOME_WIDTH / 4;
  static WINDOW_HEIGHT = Magpie.DOME_HEIGHT / 4;
  /** Where captured junk sits, in the Magpie's own frame (inside the beam). */
  static CARGO_Y = 40;

  physics;
  beam;

  /** If we've caught space junk, use a direct reference to draw it. */
  capturedJunk;

  constructor() {
    this.physics = new Physics();
    this.beam = false;
    this.capturedJunk = null; // intentionally empty
  }

  draw() {
    push();
    // in order to render objects that overlap an edge, we're going to
    // defer to a pure function to render nine copies, one for each cell of
    // a tic-tac-toe, where the middle is our visible canvas.
    drawEverywhere({
      offset: { x: this.physics.x, y: this.physics.y },
      drawFn: () => {
        // Draw captured junk first so the ship is drawn on top of it. We're
        // already at the Magpie's center, so use Junk's shape-only draw.
        // Calling capturedJunk.draw() here would translate a second time.
        if (this.capturedJunk) {
          push();
          rotate(this.physics.rotation);
          translate(0, Magpie.CARGO_Y);
          Junk.drawJunk();
          pop();
        }
        Magpie.drawMagpie({ physics: this.physics, beam: this.beam });
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  /** Sets the captured junk to the given one, and turns off the beam. */
  captureJunk(junk) {
    this.captured = true;
    this.capturedJunk = junk;
    // switch off the beam. Notice the player might still have the physical key
    // pressed down, so if that is the case, the beam will be turned on
    // immediately again.
    this.beam = false;
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

  move(delta) {
    this.physics.move(delta, { constrain: true });
    if (this.capturedJunk) {
      // Keep the junk's real position in sync with where it's drawn, so game
      // logic (like the mothership pickup) sees it in the right place. Set up
      // the Magpie's frame, then ask where the cargo spot is on the canvas.
      push();
      translate(this.physics.x, this.physics.y);
      rotate(this.physics.rotation);
      const cargo = worldToScreen(0, Magpie.CARGO_Y);
      pop();
      this.capturedJunk.physics.x = cargo.x;
      this.capturedJunk.physics.y = cargo.y;
    }
  }

  /**
   * True when the beam is on and the given canvas point is inside the beam's
   * triangle. Uses drawEverywhere so the wrapped copies of the beam near the
   * canvas edges count too.
   **/
  beamContains({ x, y }) {
    // if the beam is off, bail out.
    if (!this.beam) {
      return false;
    }
    let inside = false;
    // the drawEverywhere function doesn't actually have to draw anything! Here
    // we're reusing it with a different 'draw' function that actually tests
    // if the x/y location is inside the beam triangle, and returns true/false.
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        rotate(this.physics.rotation);
        // Convert the canvas point into the Magpie's own frame: as if the
        // Magpie sat at (0, 0) pointing up, which is how drawMagpie draws the
        // beam. The beam's top point is at (0, 0) and it widens as y grows.
        const p = screenToWorld(x, y);
        const halfWidth = (p.y / Magpie.BEAM_HEIGHT) * (Magpie.BEAM_WIDTH / 2);
        const withinDepth = p.y >= 0 && p.y <= Magpie.BEAM_HEIGHT;
        if (withinDepth && Math.abs(p.x) <= halfWidth) {
          inside = true;
        }
      },
    });
    return inside;
  }

  /**
   * Set the beam state to on (true) or off (false). We can only turn on the
   * beam if we are not carrying junk.
   **/
  enableBeam(v) {
    if (!v) this.beam = v;
    if (!this.capturedJunk) {
      this.beam = v;
    }
  }
}
