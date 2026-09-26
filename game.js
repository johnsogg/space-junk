/**
 * This ties the entire game together. From its references, everything that
 * matters for game rendering, logic, and control is accessible.
 */
class Game {
  /** All map data */
  levels;
  /** Index reference which map we're on, or intend to be on. */
  levelIdx;
  /** Direct reference to the map we actually have loaded. */
  level;
  /** Player ship. */
  magpie;
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

    this.magpie = new Magpie();
    const padW = width / 4;
    const padH = height / 4;
    this.magpie.physics.x = random(padW, padW * 3);
    this.magpie.physics.y = random(padH, padH * 3);
    this.magpie.physics.rotation = random(0, 2 * Math.PI);
    this.inputs = new Inputs(this.magpie);
    this.debug = false;
  }

  static async load() {
    const levels = await loadJSON("./levels.json");
    return new Game({ levels });
  }

  /** Applies input, then moves everything that is movable. */
  move() {
    this.inputs.handleKeyDown();
    this.magpie.move();
    this.level.move();
  }

  draw() {
    this.level.draw();
    this.magpie.draw();
  }
}
