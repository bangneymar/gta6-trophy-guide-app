// Leonida Trophy Guide — entrypoint: copies app/ and screenshots/ to the
// output directory and writes dossier.json with buildDossier from the kit's
// vendored library. Run: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ? resolve(process.env.MAKEFUN_OUTPUT_DIR) : "/output";
const appDir = join(root, "app");
const shotsDir = join(root, "screenshots");
const trophiesFile = join(appDir, "data", "trophies.json");

if (!existsSync(appDir)) throw new Error(`missing app/ in ${root}`);
if (!existsSync(shotsDir)) throw new Error(`missing screenshots/ in ${root}`);
if (!existsSync(trophiesFile)) throw new Error(`missing ${trophiesFile}`);

const trophies = JSON.parse(readFileSync(trophiesFile, "utf8")).trophies;
if (!Array.isArray(trophies) || trophies.length !== 55) {
  throw new Error(`expected 55 trophies in trophies.json, found ${Array.isArray(trophies) ? trophies.length : "none"}`);
}
const emptyGuides = trophies.filter((t) => !t.guide || !t.guide.trim()).map((t) => t.name);
if (emptyGuides.length > 0) throw new Error(`trophies without a guide: ${emptyGuides.join(", ")}`);
const shotFiles = readdirSync(shotsDir).filter((f) => !f.startsWith("."));
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotFiles.length}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(root, "app"), join(outDir, "app"), { recursive: true });
cpSync(join(root, "screenshots"), join(outDir, "screenshots"), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
const dossierPath = join(outDir, "dossier.json");
writeFileSync(dossierPath, dossier);

const dossierBytes = statSync(dossierPath).size;
console.log(`Leonida Trophy Guide handed in: ${trophies.length} trophies, ${shotFiles.length} screenshots (${shotFiles.join(", ")}), app/ copied, dossier.json ${dossierBytes} bytes written to ${outDir}`);
