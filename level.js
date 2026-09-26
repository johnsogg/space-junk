/**
 * Holds info and behavior for a level itself including the timer, and any
 * junk it might contain.
 **/
class Level {
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
   * Draws the UI chrome (timer, number of lives, score, and all the game
   * entities other than the magpie)
   * */
  draw() {
    push();
    fill("#ffd342");
    const { minutes, seconds } = timeToStringParts(this.timeLeft());
    text(`${minutes}:${seconds}`, 10, 20);
    text(`${game.score}`, width - 100, 20);
    for (const junk of this.junk) {
      junk.draw();
    }
    pop();
  }

  /** Moves anything owned by the level (junk, comets, etc). */
  move(delta) {
    // the timer counts game time, not wall-clock time, so it stops whenever
    // move() isn't called (e.g. while paused)
    this.time.elapsed += delta;
    for (const junk of this.junk) {
      if (!junk.caught) {
        junk.move(delta);
      }
    }
  }

  removeJunk(junkToRemove) {
    this.junk = this.junk.filter((j) => j !== junkToRemove);
  }
}
