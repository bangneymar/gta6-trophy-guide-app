// Leonida Trophy Guide — entrypoint.
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with buildDossier from the kit's vendored library.
//
// Run locally: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`
// The grader runs `node /bot/main.ts` with MAKEFUN_OUTPUT_DIR=/output,
// a read-only /bot and a writable /output owned by someone else.
// That is why this file never deletes the output directory itself:
// removing /output would need write access to its parent (/), which the
// grader does not grant, and /output is a mount point besides. It only
// empties the directory's contents, which the grader does allow.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ? resolve(process.env.MAKEFUN_OUTPUT_DIR) : "/output";
const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");
const dataFile = join(appDir, "data", "trophies.json");

function fail(message: string): never {
  throw new Error(`Leonida Trophy Guide: ${message}`);
}

if (!existsSync(appDir)) fail(`app/ is missing under ${repoRoot}`);
if (!existsSync(shotsDir)) fail(`screenshots/ is missing under ${repoRoot}`);
if (!existsSync(dataFile)) fail(`app/data/trophies.json is missing`);

const trophies = JSON.parse(readFileSync(dataFile, "utf8")).trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  fail(`expected 55 trophies, found ${Array.isArray(trophies) ? trophies.length : "none"}`);
}
const unguided = trophies.filter((t) => !t.guide || !String(t.guide).trim()).map((t) => t.name);
if (unguided.length > 0) fail(`trophies without a guide: ${unguided.join(", ")}`);

const shots = readdirSync(shotsDir).filter((f) => !f.startsWith("."));
if (shots.length < 3 || shots.length > 4) fail(`expected 3 or 4 screenshots, found ${shots.length}`);
for (const shot of shots) {
  const size = statSync(join(shotsDir, shot)).size;
  if (size > 262144) fail(`screenshot ${shot} is ${size} bytes, over the 256 KiB cap`);
}
if (!existsSync(join(appDir, "index.html"))) fail(`app/index.html is missing`);

// Make the output directory, then clear only what is inside it.
// Never remove outDir itself: in the grader its parent is read-only.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

cpSync(appDir, join(outDir, "app"), { recursive: true });
cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
const dossierPath = join(outDir, "dossier.json");
writeFileSync(dossierPath, dossier);

const bytes = statSync(dossierPath).size;
const parsed = JSON.parse(readFileSync(dossierPath, "utf8"));
if (parsed.schema !== "makefun/dossier/v1") fail(`dossier.json has unexpected schema ${String(parsed.schema)}`);
const gradeCounts = trophies.reduce((acc: Record<string, number>, t) => {
  acc[t.grade] = (acc[t.grade] || 0) + 1;
  return acc;
}, {});
console.log(`Leonida Trophy Guide handed in: ${trophies.length} trophies (${gradeCounts.platinum || 0} platinum, ${gradeCounts.gold || 0} gold, ${gradeCounts.silver || 0} silver, ${gradeCounts.bronze || 0} bronze), ${shots.length} screenshots, dossier.json ${bytes} bytes in ${outDir}`);
