/** Organizer class for user input and applying it against the magpie. */
class Inputs {
  /** Forward thrust, in pixels per second, per second. */
  static THRUST = 360;
  /** Reverse thrust is weaker than forward thrust. */
  static REVERSE_THRUST = 180;
  /** Turning speed, in radians per second. */
  static TURN_RATE = 2.4;

  magpie;

  constructor(magpie) {
    this.magpie = magpie;
  }

  /**
   * WASD for movement, space for tractor beam. `delta` is the ms since the last
   * frame, so holding a key has the same effect at any frame rate.
   **/
  handleKeyDown(delta) {
    // TODO (Phase 2): Use keyIsDown() to check w, a, s, and d, and call
    // this.magpie.physics.thrust() or this.magpie.physics.rotate() with
    // Inputs.THRUST, Inputs.REVERSE_THRUST, or Inputs.TURN_RATE.
    //
    // TODO (Phase 3): Turn the beam on with this.magpie.enableBeam(true)
    // while Space is held, and off with enableBeam(false) when it isn't.
  }
}

/**
 * Keys whose browser default is to scroll the page (or a parent page) in
 * case this is inside an iframe.
 **/
const SCROLL_KEYS = [" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

/**
 * Handles one-shot key presses (not held keys). Toggles debug mode with ~ or
 * backtick. Returning false for scroll keys keeps them from scrolling the
 * page; other keys (like Cmd-R) keep their normal browser behavior.
 */
function keyPressed() {
  // game is undefined until setup() runs
  if (game && (key === "~" || key === "`")) {
    game.debug = !game.debug;
  }
  if (SCROLL_KEYS.includes(key)) {
    return false;
  }
}
