import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [html, css, script] = await Promise.all([
  readFile(path.join(projectRoot, "index.html"), "utf8"),
  readFile(path.join(projectRoot, "styles.css"), "utf8"),
  readFile(path.join(projectRoot, "script.js"), "utf8"),
]);

test("preserva a copy de conversão e a mensagem do WhatsApp do blueprint", () => {
  assert.match(html, /Milho de verdade[\s\S]*Do campo para você/i);
  assert.match(html, /Quero milho fresco/i);
  assert.match(html, /Pedir pelo WhatsApp/i);
  assert.match(script, /Olá! Vim pelo site do Milho do Vale e gostaria de saber sobre disponibilidade e valores\./);
  assert.match(html, /<link rel="preload" as="image" href="assets\/corn-transition\.png"/);
  assert.match(html, /class="hero-visual[^"]*"[\s\S]*?<img src="assets\/corn-transition\.png"/);
});

test("implementa uma volta completa com mensagens por quadrante", () => {
  assert.match(script, /const FRAME_COUNT = 24/);
  assert.match(script, /Math\.round\(progress \* FRAME_COUNT\) % FRAME_COUNT/);
  assert.equal((html.match(/data-quadrant=/g) ?? []).length, 4);
  assert.match(script, /requestIdleCallback/);
});

test("implementa crossfade para o campo e seis etapas fotografadas", () => {
  assert.match(html, /class="transition-field"/);
  assert.match(html, /class="transition-corn" src="assets\/corn-transition\.png"/);
  assert.match(html, /assets\/field\/origin-field\.webp/);
  assert.match(css, /\.transition-corn\s*\{[^}]*height:\s*auto;/, "a espiga da transição deve preservar sua proporção");
  assert.equal((html.match(/class="timeline-item(?: timeline-item-right)? reveal"/g) ?? []).length, 6);
  assert.equal((html.match(/assets\/journey\/[^"]+\.webp/g) ?? []).length, 6);
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, 7);
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

  const transitionCorn = await readFile(path.join(projectRoot, "assets", "corn-transition.png"));
  assert.equal(transitionCorn[25], 6, "corn-transition.png deve usar PNG RGBA com canal alfa");
});
