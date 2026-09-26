/** Organizer class for user input and applying it against the magpie. */
class Inputs {
  magpie;

  constructor(magpie) {
    this.magpie = magpie;
  }

  /** WASD for movement, space for tractor beam */
  handleKeyDown() {
    if (keyIsDown("w")) {
      this.magpie.physics.thrust(0.1);
    }
    if (keyIsDown("s")) {
      this.magpie.physics.thrust(-0.05);
    }
    if (keyIsDown("a")) {
      this.magpie.physics.rotate(-0.04);
    }
    if (keyIsDown("d")) {
      this.magpie.physics.rotate(0.04);
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
