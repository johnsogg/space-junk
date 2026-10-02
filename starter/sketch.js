let game;

/**
 * The longest frame the game will simulate, in ms. After a tab has been
 * hidden, the first deltaTime can cover the whole time away (many seconds),
 * which would jump everything along its path and finish every timer at once.
 * 50ms is a 20 fps frame; below that, the game runs in slow motion instead.
 **/
const MAX_DELTA_MS = 50;

/** Establish all the game elements. */
function setup() {
  createCanvas(windowWidth, windowHeight);
  game = new Game();
  // Pause when the window loses focus (switching tabs or apps), and resume
  // when it comes back. p5 has no built-in for this, so use the browser's
  // own window events.
  window.addEventListener("blur", () => {
    game.paused = true;
  });
  window.addEventListener("focus", () => {
    game.paused = false;
  });
}

function draw() {
  background(0);
  // move all game elements first, unless paused. Skipping move() freezes
  // everything, including the level timer, since it all runs on delta.
  if (!game.paused) {
    game.move(Math.min(deltaTime, MAX_DELTA_MS));
  }
  // then draw all game elements
  game.draw();
}
