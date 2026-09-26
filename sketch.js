let game;

/** Establish all the game elements and loads the first level. */
async function setup() {
  createCanvas(windowWidth, windowHeight);
  game = await Game.load();
  // Pause when the window loses focus (switching tabs or apps), and resume
  // when it comes back. p5 has no built-in for this, so use the browser's
  // own window events.
  window.addEventListener("blur", () => (game.paused = true));
  window.addEventListener("focus", () => (game.paused = false));
}

function draw() {
  background(0);
  // move all game elements first, unless paused. Skipping move() freezes
  // everything, including the level timer, since it all runs on delta.
  if (!game.paused) {
    game.move(deltaTime);
  }
  // then draw all game elements
  game.draw();
  // see if the level is done
  if (game.isLevelComplete()) {
    console.log(
      "You win the level! Do some congrats ceremony and load the next",
    );
  }
}
