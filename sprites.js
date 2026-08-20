const INK = "#3C4A34";

const BODIES = {
  gato: {
    rows: [".#....#.", ".##..##.", "########", "E", "########", "M", ".######.", "..#..#.."],
    eyeBase: "########",
    mouthBase: "########"
  },
  cachorro: {
    rows: ["..####..", "########", "########", "E", "########", "M", ".######.", "#.#..#.#"],
    eyeBase: "########",
    mouthBase: "########"
  },
  dino: {
    rows: ["..#.#...", ".#####..", "#######.", "E", "########", "M", ".#####..", ".#...##."],
    eyeBase: "#######.",
    mouthBase: "########"
  },
  coelho: {
    rows: ["..#..#..", "..#..#..", ".######.", "E", "########", "M", ".######.", "..#..#.."],
    eyeBase: ".######.",
    mouthBase: "########"
  }
};

const MOODS = {
  happy:  { eyes: [2, 5], mouth: [2, 3, 4, 5] },
  tired:  { eyes: [1, 2, 5, 6], mouth: [3, 4] },
  sad:    { eyes: [2, 5], mouth: [3, 4], tears: true },
  hungry: { eyes: [2, 5], mouth: [2, 3, 4, 5] }
};

function punch(base, cols) {
  return base
    .split("")
    .map((ch, i) => (cols.indexOf(i) >= 0 ? "." : ch))
    .join("");
}

export function getSprite(species, moodId) {
  const body = BODIES[species] || BODIES.gato;
  const mood = MOODS[moodId] || MOODS.happy;

  const rows = body.rows.map((r) => {
    if (r === "E") return punch(body.eyeBase, mood.eyes);
    if (r === "M") return punch(body.mouthBase, mood.mouth);
    return r;
  });

  if (mood.tears) rows[4] = punch(rows[4], [1, 6]);

  return rows;
}

export function getSpriteCells(species, moodId) {
  return getSprite(species, moodId)
    .join("")
    .split("")
    .map((ch) => (ch === "#" ? INK : "transparent"));
}