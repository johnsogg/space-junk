/**
 * This ties the entire game together. From its references, everything that
 * matters for game rendering, logic, and control is accessible.
 */
class Game {
  static DEFAULT_NUM_LIVES = 3;
  /** How long (ms) junk must stay in the beam to be caught. */
  static JUNK_CATCH_TIME_MS = 500;
  /** How long (ms) carried junk must stay in the pickup circle. */
  static JUNK_DROPOFF_TIME_MS = 1000;
  /** Points for each piece of junk delivered to the Mothership. */
  static SCORE_DROPOFF = 100;
  /** The one level in this version of the game. Time is in ms. */
  static LEVEL = { name: "Training", junk: 5, time: 120000 };

  /** Number of lives remaining */
  lives;

  /** The level being played. */
  level;

  /** Player ship. */
  magpie;

  /** Cargo ship to take junk to. */
  mothership;

  /** Input controller for the keyboard */
  inputs;

  /** When true, draw Physics debug graphics. Toggled with ~ or backtick. */
  debug;

  /** Total game score */
  score;

  /** When true, nothing moves and the timer stops. Set by sketch.js. */
  paused;

  constructor() {
    this.lives = Game.DEFAULT_NUM_LIVES;
    this.level = new Level(Game.LEVEL);

    // we want to place magpie and mothership near the center, so use these
    const padW = width / 4;
    const padH = height / 4;

    // establish Magpie
    this.magpie = new Magpie();
    this.magpie.physics.x = random(padW, padW * 3);
    this.magpie.physics.y = random(padH, padH * 3);
    this.magpie.physics.rotation = random(0, 2 * Math.PI);

    // establish Mothership
    this.mothership = new Mothership();
    this.mothership.physics.x = random(padW, padW * 3);
    this.mothership.physics.y = random(padH, padH * 3);
    this.mothership.physics.rotation = random(0, 2 * Math.PI);
    this.mothership.physics.dx = random(-12, 12); // pixels per second
    this.mothership.physics.dy = random(-12, 12);

    this.inputs = new Inputs(this.magpie);
    this.debug = false;

    this.score = 0;
    this.paused = false;
  }

  /**
   * Applies input, moves everything that is movable, then resolves
   * interactions between things at their new positions.
   **/
  move(delta) {
    this.inputs.handleKeyDown(delta);
    this.magpie.move(delta);
    this.mothership.move(delta);
    // the level timer stops once the level is complete
    this.level.move(delta, { countTime: !this.isLevelComplete() });
    const junk = this.resolveBeam(delta);
    if (junk) {
      this.magpie.captureJunk(junk);
      this.level.removeJunk(junk);
    }

    if (this.resolveDropoff(delta)) {
      this.magpie.capturedJunk = null; // delivered, so it disappears
      this.updateScore("dropoff");
    }
  }

  /**
   * Checks which junk, if any, is inside the Magpie's beam. The delta param
   * is the elapsed time in ms since the previous render, so it should be
   * roughly 16ms if the frame rate remains 60 hz. Returns the junk that has
   * been in the beam long enough to catch, or null if there isn't one.
   **/
  resolveBeam(delta) {
    // TODO (Phase 3): For every junk in this.level.junk, add delta to its
    // beamTime if this.magpie.beamContains(junk.physics) is true. Otherwise,
    // drain its beamTime by delta, but not below zero. Of the junk in the
    // beam, return the one with the most beamTime, but only if that is more
    // than Game.JUNK_CATCH_TIME_MS. Otherwise return null.
    return null;
  }

  /**
   * Checks whether the junk the Magpie is carrying is inside the Mothership's
   * pickup circle, and adds or drains its dropoff time to match. Returns true
   * once it has been there longer than JUNK_DROPOFF_TIME_MS, meaning the junk
   * is delivered.
   **/
  resolveDropoff(delta) {
    // TODO (Phase 4): If the Magpie isn't carrying junk, return false. If
    // the carried junk is within Mothership.PICKUP_DIAMETER / 2 of the
    // Mothership, add delta to its dropoffTime. Otherwise, drain its
    // dropoffTime by delta, but not below zero. Return true when dropoffTime
    // is more than Game.JUNK_DROPOFF_TIME_MS.
    return false;
  }

  draw() {
    this.level.draw(this.score, this.lives);
    this.mothership.draw();
    this.magpie.draw();
    // We can show messages, but keep it to one at a time.
    if (this.paused) {
      Game.drawMessage("Paused");
    } else if (this.isLevelComplete()) {
      Game.drawMessage("All clear!");
    }
  }

  /** Dims the whole canvas and writes a message in the middle. */
  static drawMessage(message) {
    push();
    noStroke();
    fill("#000000a0");
    rect(0, 0, width, height);
    fill("#ffffff");
    textAlign(CENTER, CENTER);
    textSize(64);
    text(message, width / 2, height / 2);
    pop();
  }

  updateScore(reason) {
    // TODO (Phase 4): When the reason is "dropoff", add Game.SCORE_DROPOFF
    // to the score.
  }

  isLevelComplete() {
    // level is complete when there is no more junk to salvage and the magpie
    // isn't hauling anything.
    return this.level.junk.length === 0 && this.magpie.capturedJunk === null;
  }
}
