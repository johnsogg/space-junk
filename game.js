/**
 * This ties the entire game together. From its references, everything that
 * matters for game rendering, logic, and control is accessible.
 */
class Game {
  static DEFAULT_NUM_LIVES = 3;
  static JUNK_CATCH_TIME_MS = 500;
  static JUNK_DROPOFF_TIME_MS = 1000;
  static SCORE_DROPOFF = 100;
  static LOAD_WAIT_TIME = 1000;

  /** All level data */
  levels;

  /** Index reference which level we're on, or intend to be on. */
  levelIdx;

  /** Direct reference to the level we actually have loaded. */
  level;

  /**
   * Tells us if we're playing or loading. There could be other states added
   * in the future, so instead of modeling this as a boolean, I'll use strings.
   * Possible values are 'playing' and 'loading'. Typescript would enforce this.
   */
  playState;

  /**
   * Milliseconds of game time spent in the current playState. It only grows
   * in move(), so like the level timer, it stops while the game is paused.
   */
  playStateElapsed;

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
    this.level = new Level(this.levels[this.levelIdx], Game.DEFAULT_NUM_LIVES);

    this.playState = "playing";
    this.playStateElapsed = 0;

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
      this.magpie.captureJunk(junk);
      this.level.removeJunk(junk);
    }

    this.mothership.resolveDropoff(delta);

    if (this.playState === "loading") {
      // and check if we're done with the requisite loading text time
      this.playStateElapsed += delta;
      if (this.playStateElapsed >= Game.LOAD_WAIT_TIME) {
        console.log("loading next level for reals");
        // Note: there is a bug in the following lines of code, and I'll leave
        // it here for you to diagnose/fix. The problem is that after you've
        // finished the last level, it crashes. Do you see why? How would you
        // fix this? It is a very small change.
        this.levelIdx++;
        this.level = new Level(this.levels[this.levelIdx], this.level.lives);
        this.playState = "playing";
      }
    }
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
    // We can show messages, but keep it to one at a time. Priority order is
    // paused, then loading (because you can technically pause during loading).
    if (this.paused) {
      Game.drawPaused();
    } else if (this.playState === "loading") {
      Game.drawLoading();
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

  static drawLoading() {
    push();
    noStroke();
    // add a wee scrim
    fill("#000000a0");
    rect(0, 0, width, height);
    fill("#fff");
    textAlign(CENTER, CENTER);
    textSize(64);
    text("Loading next level...", width / 2, height / 2);
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

  completeLevel() {
    // ensure we only act on completing a level one time. Defensive programming.
    if (this.playState === "loading") return;

    // transition to showing the next level. It would feel very abrupt to just
    // do it immediately, so show some brief message then load the level.
    //
    // Doing this means the game has to retain what state it is in: playing, or
    // loading?
    //
    // Also, note that the game keeps moving in the background even as we load.
    // This is a nod to the arcade games of the 80s that always showed gameplay
    // to intice you to drop a quarter in the slot.
    this.playState = "loading";
    this.playStateElapsed = 0;
  }
}
