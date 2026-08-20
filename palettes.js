export const PALETTES = [
  { name: "Uva",       shell: "#7F77DD", frame: "#D4537E", button: "#EF9F27" },
  { name: "Tangerina", shell: "#F2833E", frame: "#3E4C99", button: "#F5D24C" },
  { name: "Menta",     shell: "#4FC1A6", frame: "#E4557A", button: "#F7D65D" },
  { name: "Chiclete",  shell: "#F291C4", frame: "#6C5CE0", button: "#FFE066" },
  { name: "Grafite",   shell: "#3A3A44", frame: "#E0803F", button: "#C9CF3A" }
];

export function getPaletteByShell(shellColor) {
  return PALETTES.find((p) => p.shell === shellColor) || PALETTES[0];
}