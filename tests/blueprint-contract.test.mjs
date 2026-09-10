import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [html, css, script, buildScript] = await Promise.all([
  readFile(path.join(projectRoot, "index.html"), "utf8"),
  readFile(path.join(projectRoot, "styles.css"), "utf8"),
  readFile(path.join(projectRoot, "script.js"), "utf8"),
  readFile(path.join(projectRoot, "scripts", "build-static.mjs"), "utf8"),
]);

test("preserva a copy de conversão e a mensagem do WhatsApp do blueprint", () => {
  assert.match(html, /Milho de verdade[\s\S]*Do campo para você/i);
  assert.match(html, /Quero reservar o meu/i);
  assert.match(html, /Reservar pelo WhatsApp/i);
  assert.match(html, /Primeira colheita em <strong>fevereiro de 2027<\/strong>/i);
  assert.match(script, /Olá! Vim pelo site do Milho do Vale e gostaria de reservar milho da primeira colheita, em fevereiro de 2027\./);
  assert.match(html, /<link rel="preload" as="image" href="assets\/corn-transition-optimized\.png"/);
  assert.match(html, /id="scroll-corn"[\s\S]*?src="assets\/corn-transition-optimized\.png"/);
});

test("usa uma única espiga PNG que percorre os três momentos da página", () => {
  assert.equal((html.match(/src="assets\/corn-transition-optimized\.png"/g) ?? []).length, 1);
  assert.equal((html.match(/data-corn-slot=/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<canvas/);
  assert.doesNotMatch(html, /class="transition-corn"/);
  assert.match(script, /document\.body\.append\(scrollCorn\)/);
  assert.match(script, /getBoundingClientRect\(\)/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /prefersReducedMotion/);
  assert.match(script, /const storyDeparture = smoothstep/);
  assert.match(script, /Math\.max\(storyDeparture, viewportTransitionArrival\)/);
  assert.match(script, /function stateFromTransitionSlot/);
  assert.match(script, /header\?\.getBoundingClientRect\(\)\.bottom/);
  assert.doesNotMatch(script, /const growth =/);
  assert.match(css, /\.scroll-corn\s*\{[^}]*position:\s*fixed;/);
  assert.match(css, /\.scroll-corn\s*\{[^}]*will-change:\s*opacity, transform;/);
  assert.match(css, /\.corn-slot-hero\s*\{[^}]*height:\s*min\(420px, 72vh\)/);
  assert.match(css, /\.corn-slot-transition\s*\{[^}]*width:\s*min\(55vw, 220px\)/);
  assert.equal((html.match(/data-quadrant=/g) ?? []).length, 4);
});

test("implementa crossfade para o campo e seis etapas fotografadas", () => {
  assert.match(html, /class="transition-field"/);
  assert.match(html, /assets\/field\/origin-field\.webp/);
  assert.match(script, /fieldProgress/);
  assert.equal((html.match(/class="timeline-item(?: timeline-item-right)? reveal"/g) ?? []).length, 6);
  assert.equal((html.match(/assets\/journey\/[^"]+\.webp/g) ?? []).length, 6);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 6);
});

test("encurta a espiga isolada e prolonga as cenas fotografadas", () => {
  assert.match(css, /\.transition-section\s*\{[^}]*height:\s*440vh/);
  assert.match(script, /fieldStart:\s*0\.1/);
  assert.match(script, /fieldEnd:\s*0\.18/);
  assert.match(script, /originLineFadeInStart:\s*0\.3/);
  assert.match(script, /originLineFadeOutEnd:\s*0\.68/);
  assert.match(script, /originCopyFadeInStart:\s*0\.68/);
  assert.match(script, /originCopyFadeInEnd:\s*0\.76/);
  assert.doesNotMatch(script, /progress\s*<\s*0\.97/);
});

test("mantém os tokens visuais e fallbacks de acessibilidade", () => {
  for (const token of ["#123d27", "#092a1a", "#e9b832", "#f5f0e4", "#fcfaf5", "#765538", "#172019"]) {
    assert.ok(css.includes(token), `token ausente: ${token}`);
  }
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(html, /class="skip-link"/);
  assert.match(script, /"IntersectionObserver" in window/);
});

test("mantém os assets WebP leves e completos", async () => {
  const frameFiles = (await readdir(path.join(projectRoot, "assets", "corn-360"))).filter((name) => name.endsWith(".webp"));
  const journeyFiles = (await readdir(path.join(projectRoot, "assets", "journey"))).filter((name) => name.endsWith(".webp"));
  assert.equal(frameFiles.length, 24);
  assert.equal(journeyFiles.length, 6);

  for (const file of journeyFiles) {
    const info = await stat(path.join(projectRoot, "assets", "journey", file));
    assert.ok(info.size < 200_000, `${file} excede 200 KB`);
  }

  const fieldInfo = await stat(path.join(projectRoot, "assets", "field", "origin-field.webp"));
  assert.ok(fieldInfo.size < 150_000, "origin-field.webp excede 150 KB");

  const transitionCorn = await readFile(path.join(projectRoot, "assets", "corn-transition-optimized.png"));
  assert.equal(transitionCorn[25], 6, "corn-transition-optimized.png deve usar PNG RGBA com canal alfa");
});

test("mantém o carregamento inicial leve em computadores modestos", async () => {
  const transitionCorn = await readFile(path.join(projectRoot, "assets", "corn-transition-optimized.png"));
  assert.ok(transitionCorn.length < 600_000, "corn-transition-optimized.png deve ficar abaixo de 600 KB");
  assert.equal(transitionCorn.readUInt32BE(16), 512, "largura otimizada inesperada");
  assert.equal(transitionCorn.readUInt32BE(20), 768, "altura otimizada inesperada");
  assert.match(html, /id="scroll-corn"[^>]*fetchpriority="high"/);
  assert.match(html, /class="transition-field"[^>]*loading="eager"[^>]*fetchpriority="low"/);
  assert.doesNotMatch(css, /\.scroll-corn\s*\{[^}]*filter:/);
  assert.doesNotMatch(css, /backdrop-filter:/);
  assert.match(css, /\.timeline-item\s*\{[^}]*content-visibility:\s*auto/);
  assert.match(buildScript, /logo-source\.png/);
});
