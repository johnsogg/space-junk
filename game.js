/**
 * This ties the entire game together. From its references, everything that
 * matters for game rendering, logic, and control is accessible.
 */
class Game {
  static JUNK_CATCH_TIME_MS = 500;
  static JUNK_DROPOFF_TIME_MS = 1000;
  static SCORE_DROPOFF = 100;

  /** All map data */
  levels;

  /** Index reference which map we're on, or intend to be on. */
  levelIdx;

  /** Direct reference to the map we actually have loaded. */
  level;

  /** Player ship. */
  magpie;

  /** Cargo ship to take junk to. */
  mothership;

  /** Input controller for keyboard/mouse */
  inputs;

  /** When true, draw Physics debug graphics. Toggled with ~ or backtick. */
  debug;

  /** Total game score */
  score;

  /** When true, nothing moves and the timer stops. Set by sketch.js. */
  paused;

  /**
   * Create a Game instance. Importantly, constructors can't be async, so we
   * will not use this directly, but instead defer to Game.load(), which will
   * create a Game instance along the way.
   **/
  constructor({ levels }) {
    this.levels = levels;
    this.levelIdx = 0;
    this.level = new Level(this.levels[this.levelIdx]);

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

  static async load() {
    const levels = await loadJSON("./levels.json");
    return new Game({ levels });
  }

  /**
   * Applies input, moves everything that is movable, then resolves
   * interactions between things at their new positions.
   **/
  move(delta) {
    this.inputs.handleKeyDown(delta);
    this.magpie.move(delta);
    this.mothership.move(delta);
    this.level.move(delta);
    const junk = this.resolveBeam(delta);
    if (junk) {
      junk.caught = true;
      junk.beamTime = 0;
      this.magpie.capturedJunk = junk;
      this.level.removeJunk(junk);
    }

    this.mothership.resolveDropoff(delta);
  }

  /**
   * Checks which junk, if any, is inside the Magpie's beam. The delta param
   * is the elapsed time in ms since the previous render, so it should be
   * roughly 16ms if the frame rate remains 60 hz.
   **/
  resolveBeam(delta) {
    const caught = [];
    for (const junk of this.level.junk) {
      // either increase or decrease 'beam time' for each junk
      if (this.magpie.beamContains(junk.physics)) {
        junk.beamTime += delta;
        caught.push(junk);
      } else {
        junk.beamTime = Math.max(0, junk.beamTime - delta);
      }
    }
    if (caught.length > 0) {
      // pick the junk with largest beam time and compare it to limit
      const best = caught.reduce((a, b) => (b.beamTime > a.beamTime ? b : a));
      if (best.beamTime > Game.JUNK_CATCH_TIME_MS) {
        return best;
      }
    }
  }

  draw() {
    this.level.draw();
    this.mothership.draw();
    this.magpie.draw();
    if (this.paused) {
      Game.drawPaused();
    }
  }

  /** Dims the whole canvas and writes "Paused" in the middle. */
  static drawPaused() {
    push();
    noStroke();
    fill("#000000a0");
    rect(0, 0, width, height);
    fill("#ffffff");
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Paused", width / 2, height / 2);
    pop();
  }

  updateScore(reason) {
    if (reason === "dropoff") {
      this.score += Game.SCORE_DROPOFF;
    }
  }

  isLevelComplete() {
    // level is complete when there is no more junk to salvage and the magpie
    // isn't hauling anything.
    return this.level.junk.length === 0 && this.magpie.capturedJunk == null;
  }
}
