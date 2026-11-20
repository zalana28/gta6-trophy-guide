// Hand-in program for the GTA 6 trophy guide (Node 22, standard library only).
// The guide itself is plain static files in app/ (index.html, CSS, ES modules and the
// trophy data in app/data/trophies.json) with no build step and no network use at run time.
// This program copies app/ and screenshots/ from beside itself into the output directory
// (or $MAKEFUN_OUTPUT_DIR when set, which stands in for /output outside the grader) and
// writes /output/dossier.json with buildDossier from the vendored make.fun library.
// vendor/makefun-frontend.ts must stay exactly as the kit shipped it: the scorer rebuilds
// the dossier with its own copy and compares the two byte for byte.
//
// Run it locally with:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps matching the gate: at most 4 screenshots of 256 KiB each, app/ at most 993 files
// and directories and 48 MiB, and the dossier text capped at 160 KiB. Anything past a cap
// is refused here exactly as the scorer would refuse it.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`gta6-trophy-guide written to ${outputDir} (${dossier.length} bytes of dossier)`);
