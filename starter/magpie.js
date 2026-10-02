class Magpie {
  static DOME_WIDTH = 20;
  static DOME_HEIGHT = 30;
  static PLATFORM_WIDTH = Magpie.DOME_WIDTH + 6;
  static PLATFORM_HEIGHT = 3;
  static BEAM_WIDTH = 50;
  static BEAM_HEIGHT = 60;
  static WINDOW_WIDTH = Magpie.DOME_WIDTH / 4;
  static WINDOW_HEIGHT = Magpie.DOME_HEIGHT / 4;
  /** Where captured junk sits, in the Magpie's own frame (below the ship). */
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
    drawEverywhere({
      offset: this.physics,
      drawFn: () => {
        // TODO (Phase 4): If this.capturedJunk isn't null, draw it here, so
        // the ship is drawn on top of it. Rotate by the Magpie's rotation,
        // translate to (0, Magpie.CARGO_Y), and call Junk.drawJunk(). Use
        // push() and pop() so the ship below isn't moved too.
        Magpie.drawMagpie({ rotation: this.physics.rotation, beam: this.beam });
        if (game.debug) {
          this.physics.draw();
        }
      },
    });
    pop();
  }

  /** Sets the captured junk to the given one, and turns off the beam. */
  captureJunk(junk) {
    // TODO (Phase 4): Remember the junk in this.capturedJunk, and switch the
    // beam off.
  }

  // this method is static. That means it doesn't use `this` to gain access to
  // instance members, because there _is_ no instance. This is essentially a
  // function that happens to be placed inside the Magpie namespace.
  static drawMagpie({ rotation, beam }) {
    // TODO (Phase 1): Replace the placeholder with the Magpie: a rounded
    // rectangle dome, a platform across the bottom of the dome, and a window
    // on the right side. Draw it around (0, 0), rotated by `rotation`, using
    // the size constants at the top of this class.
    //
    // TODO (Phase 3): When `beam` is true, draw the tractor beam first, so
    // the ship is on top: a see-through triangle with its point at (0, 0),
    // Magpie.BEAM_HEIGHT long and Magpie.BEAM_WIDTH wide at the far end.
    drawPlaceholder({
      rotation,
      w: Magpie.DOME_WIDTH,
      h: Magpie.DOME_HEIGHT,
    });
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
   * triangle.
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
    // TODO (Phase 3): Set this.beam to v. Turning it off always works, but
    // only turn it on when this.capturedJunk is null.
  }
}
