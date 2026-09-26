/** Organizer class for user input and applying it against the magpie. */
class Inputs {
  magpie;

  constructor(magpie) {
    this.magpie = magpie;
  }

  /**
   * WASD for movement, space for tractor beam. `delta` is the ms since the last
   * frame, so holding a key has the same effect at any frame rate.
   **/
  handleKeyDown(delta) {
    // thrust is in pixels per second, per second
    if (keyIsDown("w")) {
      this.magpie.physics.thrust(360, delta);
    }
    if (keyIsDown("s")) {
      this.magpie.physics.thrust(-180, delta);
    }
    // turning is in radians per second
    if (keyIsDown("a")) {
      this.magpie.physics.rotate(-2.4, delta);
    }
    if (keyIsDown("d")) {
      this.magpie.physics.rotate(2.4, delta);
    }
    if (keyIsDown("Space")) {
      this.magpie.enableBeam(true);
    } else {
      this.magpie.enableBeam(false);
    }
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
  // game is undefined until Game.load() finishes in setup()
  if (game && (key === "~" || key === "`")) {
    game.debug = !game.debug;
  }
  if (SCROLL_KEYS.includes(key)) {
    return false;
  }
}
