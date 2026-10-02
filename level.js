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
    return Math.max(0, this.time.initial - this.time.elapsed);
  }

  /**
   * Draws the UI chrome (timer, score, and lives) and the level's junk. The
   * Magpie and Mothership are drawn by Game, which also passes in the score
   * and lives.
   **/
  draw(score, lives) {
    push();
    // timer and score share a text style: large, at the top corners
    noStroke();
    fill("#ffd342");
    textSize(Level.HUD_TEXT_SIZE);
    textAlign(LEFT, TOP);
    const { minutes, seconds } = timeToStringParts(this.timeLeft());
    text(`${minutes}:${seconds}`, Level.HUD_PAD, Level.HUD_PAD);

    // score is right-aligned, so it grows leftward as digits are added
    textAlign(RIGHT, TOP);
    text(`${score}`, width - Level.HUD_PAD, Level.HUD_PAD);

    // lives - the Magpie in play counts as one, so show the spares: one
    // fewer icon than lives. On the last life, no icons are shown at all.
    // Note the push/pop inside the loop, not outside. This allows each life
    // render to start from the same conditions.
    for (let i = 0; i < lives - 1; i++) {
      push();
      translate(
        // X offset is padded in from the left edge, plus a gap for each life
        Level.LIVES_PAD_LEFT + i * Level.LIVES_GAP,
        // Y offset is relative to the bottom, so subtract from height
        height - Level.LIVES_PAD_BOTTOM,
      );
      // Render an itty bitty Magpie, rotated a little to make it fun
      scale(Level.LIVES_SCALE);
      Magpie.drawMagpie({ rotation: 0.2, beam: false });
      pop();
    }

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
