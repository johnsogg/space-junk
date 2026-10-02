/**
 * Builds phase-builds/phase-1 ... phase-5: the starter code with the
 * reference implementation filled in for every phase up to and including N.
 * These show what the game should look like at the end of each phase (for
 * screenshots in the homework description).
 *
 * It copies method bodies out of the reference files by name, so it also
 * works as a sync check: if a stub in starter/ no longer has a matching
 * method in the reference (or the other way around), it stops with an error.
 *
 * Run from the repo root:  node scripts/make-phase-builds.js
 **/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const STARTER = path.join(ROOT, "starter");
const OUT = path.join(ROOT, "phase-builds");

/**
 * Finds a class method (two-space indent, optionally static) or a top-level
 * function by name, and returns { start, end } covering its whole text,
 * including any doc comment right above it.
 **/
function findBlock(src, name, file) {
  const re = new RegExp(
    `^(  (static )?${name}\\(|function ${name}\\()`,
    "m",
  );
  const m = re.exec(src);
  if (!m) {
    throw new Error(`${file}: can't find ${name}`);
  }
  let start = m.index;
  // pull in a doc comment that ends on the line just above
  const before = src.slice(0, start);
  const commentEnd = before.trimEnd();
  if (commentEnd.endsWith("*/")) {
    const commentStart = before.lastIndexOf("/**");
    const lineStart = before.lastIndexOf("\n", commentStart) + 1;
    if (before.slice(commentEnd.length).trim() === "") {
      start = lineStart;
    }
  }
  // skip the parameter list, which can have braces of its own, like
  // move(delta, { constrain = false } = {})
  let i = m.index + m[0].length - 1; // the opening (
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "(") depth++;
    if (src[i] === ")") depth--;
    if (depth === 0) break;
  }
  // then match braces from the { that starts the body
  i = src.indexOf("{", i);
  depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    if (src[i] === "}") depth--;
    if (depth === 0) break;
  }
  if (depth !== 0) {
    throw new Error(`${file}: unbalanced braces in ${name}`);
  }
  return { start, end: i + 1 };
}

function getBlock(src, name, file) {
  const { start, end } = findBlock(src, name, file);
  return src.slice(start, end);
}

/** Replaces the named block in `src` with `text`. */
function setBlock(src, name, text, file) {
  const { start, end } = findBlock(src, name, file);
  return src.slice(0, start) + text + src.slice(end);
}

/** Removes the first `if (cond) { ... }` (and any `else { ... }`) block. */
function removeIf(text, cond, what) {
  const at = text.indexOf(`if (${cond})`);
  if (at < 0) {
    throw new Error(`can't find if (${cond}) in ${what}`);
  }
  const lineStart = text.lastIndexOf("\n", at) + 1;
  let i = text.indexOf("{", at);
  let depth = 0;
  for (; ; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) {
      const rest = text.slice(i + 1);
      const elseMatch = /^\s*else\s*\{/.exec(rest);
      if (!elseMatch) break;
      i += elseMatch[0].length;
      depth = 1;
    }
  }
  const lineEnd = text.indexOf("\n", i) + 1;
  return text.slice(0, lineStart) + text.slice(lineEnd);
}

/**
 * Each phase lists the blocks to copy from the reference into the starter.
 * `tweak` adjusts the reference text where the starter is simpler.
 **/
const PHASES = [
  // Phase 1: shapes. drawWindow is a helper the starter doesn't have, so it
  // is inserted right after drawMagpie. No beam until phase 3.
  [
    {
      file: "magpie.js",
      name: "drawMagpie",
      tweak: (t) => removeIf(t, "beam", "drawMagpie"),
      thenInsert: "drawWindow",
    },
    { file: "junk.js", name: "drawJunk" },
    { file: "mothership.js", name: "drawMothership" },
  ],
  // Phase 2: flying. No Space key until phase 3.
  [
    { file: "physics.js", name: "move" },
    { file: "physics.js", name: "rotate" },
    { file: "physics.js", name: "thrust" },
    {
      file: "inputs.js",
      name: "handleKeyDown",
      tweak: (t) => removeIf(t, 'keyIsDown("Space")', "handleKeyDown"),
    },
  ],
  // Phase 3: beam.
  [
    { file: "magpie.js", name: "drawMagpie" },
    { file: "magpie.js", name: "enableBeam" },
    { file: "inputs.js", name: "handleKeyDown" },
    { file: "game.js", name: "resolveBeam" },
  ],
  // Phase 4: carry and deliver. The starter has no wrappedDist.
  [
    { file: "magpie.js", name: "captureJunk" },
    { file: "magpie.js", name: "draw" },
    {
      file: "game.js",
      name: "resolveDropoff",
      tweak: (t) =>
        t.replace(
          "wrappedDist(this.mothership.physics, junk.physics)",
          "dist(\n        this.mothership.physics.x,\n        this.mothership.physics.y,\n        junk.physics.x,\n        junk.physics.y,\n      )",
        ),
    },
    { file: "game.js", name: "updateScore" },
  ],
  // Phase 5: HUD.
  [
    { file: "level.js", name: "timeLeft" },
    { file: "level.js", name: "draw" },
    { file: "utils.js", name: "timeToStringParts" },
  ],
];

const files = {};
for (const f of fs.readdirSync(STARTER)) {
  if (f.endsWith(".js")) {
    files[f] = fs.readFileSync(path.join(STARTER, f), "utf8");
  }
}

fs.rmSync(OUT, { recursive: true, force: true });

PHASES.forEach((steps, idx) => {
  const phase = idx + 1;
  for (const step of steps) {
    const ref = fs.readFileSync(path.join(ROOT, step.file), "utf8");
    let text = getBlock(ref, step.name, step.file);
    if (step.tweak) {
      text = step.tweak(text);
    }
    let src = setBlock(files[step.file], step.name, text, step.file);
    if (step.thenInsert && !src.includes(` ${step.thenInsert}(`)) {
      const helper = getBlock(ref, step.thenInsert, step.file);
      const { end } = findBlock(src, step.name, step.file);
      src = src.slice(0, end) + "\n\n" + helper + src.slice(end);
    }
    files[step.file] = src;
  }

  const dir = path.join(OUT, `phase-${phase}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(STARTER)) {
    if (f.endsWith(".html") || f.endsWith(".css")) {
      fs.copyFileSync(path.join(STARTER, f), path.join(dir, f));
    }
  }
  for (const [f, src] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, f), src);
  }

  // report any TODOs left from this phase or earlier (there shouldn't be any)
  for (const [f, src] of Object.entries(files)) {
    for (let p = 1; p <= phase; p++) {
      if (src.includes(`TODO (Phase ${p})`)) {
        console.warn(`phase-${phase}/${f}: still has TODO (Phase ${p})`);
      }
    }
  }
  console.log(`wrote phase-builds/phase-${phase}`);
});
