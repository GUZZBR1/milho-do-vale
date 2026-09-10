import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outputRoot = join(projectRoot, "dist");
const vercelOutputRoot = join(projectRoot, ".vercel", "output");
const excludedAssets = [join("assets", "corn-360"), join("assets", "logo-source.png")];

rmSync(outputRoot, { force: true, recursive: true });
mkdirSync(outputRoot, { recursive: true });

for (const filename of ["index.html", "styles.css", "script.js"]) {
  cpSync(join(projectRoot, filename), join(outputRoot, filename));
}

cpSync(join(projectRoot, "assets"), join(outputRoot, "assets"), {
  filter: (source) => !excludedAssets.some((excluded) => source.includes(excluded)),
  recursive: true,
});

rmSync(vercelOutputRoot, { force: true, recursive: true });
mkdirSync(join(vercelOutputRoot, "static"), { recursive: true });
cpSync(outputRoot, join(vercelOutputRoot, "static"), { recursive: true });
writeFileSync(
  join(vercelOutputRoot, "config.json"),
  `${JSON.stringify({ version: 3 }, null, 2)}\n`,
);
