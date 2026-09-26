/**
 * This ties the entire game together. From its references, everything that
 * matters for game rendering, logic, and control is accessible.
 */
class Game {
  static JUNK_CATCH_TIME_MS = 500;

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
    this.mothership.physics.dx = random(-0.2, 0.2);
    this.mothership.physics.dy = random(-0.2, 0.2);

    this.inputs = new Inputs(this.magpie);
    this.debug = false;
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
    this.inputs.handleKeyDown();
    this.magpie.move(); // TODO: incorporate delta
    this.mothership.move(); // TODO: incorporate delta
    this.level.move(); // TODO: incorporate delta
    const junk = this.resolveBeam(delta);
    if (junk) {
      junk.caught = true;
      this.magpie.capturedJunk = junk;
      this.level.removeJunk(junk);
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
  }
}
