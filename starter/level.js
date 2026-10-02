/**
 * Holds info and behavior for a level itself including the timer, and any
 * junk it might contain.
 **/
class Level {
  static LIVES_PAD_BOTTOM = 40;
  static LIVES_PAD_LEFT = 40;
  static LIVES_GAP = 18;
  static LIVES_SCALE = 0.6;
  static HUD_TEXT_SIZE = 48;
  static HUD_PAD = 20;

  name;
  junk;
  time;

  constructor(levelConfig) {
    this.name = levelConfig.name;
    this.junk = [];
    for (let i = 0; i < levelConfig.junk; i++) {
      this.junk.push(new Junk());
    }
    this.time = {
      initial: levelConfig.time,
      elapsed: 0,
    };
  }

  /** Give the remaining time for this level in milliseconds. */
  timeLeft() {
    // TODO (Phase 5): Return the initial time minus the elapsed time, but
    // never less than zero.
    return 0;
  }

  /**
   * Draws the UI chrome (timer, score, and lives) and the level's junk. The
   * Magpie and Mothership are drawn by Game, which also passes in the score
   * and lives.
   **/
  draw(score, lives) {
    push();
    // TODO (Phase 5): Draw the timer, score, and lives here, before the
    // junk, so they're underneath everything else.
    //  - Timer: top left, as minutes:seconds. Use this.timeLeft() and
    //    timeToStringParts().
    //  - Score: top right, in the same text style as the timer.
    //  - Lives: bottom left, one small Magpie for each spare life (lives - 1
    //    of them). Magpie.drawMagpie() draws around (0, 0), so translate and
    //    scale first.

    // junk
    for (const junk of this.junk) {
      junk.draw();
    }
    pop();
  }

  /**
   * Moves anything owned by the level (junk, comets, etc). If the `countTime`
   * argument is present and false, the timer doesn't advance, but everything
   * still moves.
   **/
  move(delta, { countTime = true } = {}) {
    // the timer counts game time, not wall-clock time, so it stops whenever
    // move() isn't called (e.g. while paused), or when countTime is false.
    if (countTime) {
      this.time.elapsed += delta;
    }
    for (const junk of this.junk) {
      junk.move(delta);
    }
  }

  removeJunk(junkToRemove) {
    this.junk = this.junk.filter((j) => j !== junkToRemove);
  }
}
