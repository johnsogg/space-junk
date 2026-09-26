let game;

/** Establish all the game elements and loads the first level. */
async function setup() {
  createCanvas(windowWidth, windowHeight);
  game = await Game.load();
}

function draw() {
  background(0);
  // move all game elements first
  game.move(deltaTime);
  // then draw all game elements
  game.draw();
}
