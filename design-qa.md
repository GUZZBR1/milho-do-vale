# Design QA — continuidade da espiga por scroll

## Evidências

- Source visual truth:
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-26bb6478-60d8-4691-8432-2a9e8e798b04.png` — hero desktop, 1341 × 835 px.
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-a35157ee-fc7f-4ec4-9991-44f2f669050a.png` — seção “O milho”, 1446 × 921 px.
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-3e7227ac-bf86-457d-9df5-eb8801865d16.png` — continuidade para a transição, 1083 × 895 px.
- Implementation screenshot: capturas renderizadas no Codex in-app Browser, tanto no preview local quanto na publicação temporária da Vercel, cobrindo hero, `#milho` e transição.
- Evidência do bug atual: `C:/Users/gusta/Videos/2026-09-10 16-07-42.mkv`, 17,267 s em 1920 × 1080 e 60 fps; o palco da espiga deixa de ficar fixo e produz um intervalo vazio antes da transição.
- Captura pós-correção: `.omx/state/video-bug/01-fixed-story.png`, com a entrada e três pontos internos da narrativa renderizados no navegador interno.
- Viewports validados: mobile 319 × 912 CSS px e desktop 1265 × 712 CSS px, device pixel ratio 1.
- Estado: movimento normal (`prefers-reduced-motion: false`), menu fechado, scroll no hero, entrada e quadrantes da seção “O milho”, crossfade para o campo e saída para “Produção”.
- Evidência estrutural no navegador: exatamente um `#scroll-corn`, `src="assets/corn-transition-optimized.png"`, com `position: fixed` durante a experiência normal.

## Comparação visual

### Full view

- A composição, paleta creme/verde/amarelo, tipografia editorial, raios e hierarquia permanecem coerentes com as referências.
- A mesma espiga vista no hero continua no centro da narrativa e segue para a transição; não há troca perceptível de espécie, corte ou proporção.
- A escala responde ao espaço disponível no mobile e preserva a proporção 2:3 do PNG.

### Regiões focadas

- Hero: título, badge, CTAs, glow e posição inicial da espiga mantidos; a imagem começa dentro do cartão claro e sai dele conforme o usuário rola.
- “O milho”: a espiga fica centralizada e estável; a dica inicial desaparece antes das mensagens, que entram por quadrante sem sobreposição persistente.
- Transição: a espiga assume uma escala menor, permanece abaixo do cabeçalho e desaparece suavemente durante o crossfade do campo; os letreiros ficam separados da imagem.

## Superfícies obrigatórias

- Fonts and typography: Playfair Display e DM Sans preservadas, com pesos, quebras e hierarquia compatíveis com a referência.
- Spacing and layout rhythm: slots do hero, narrativa e transição medidos pela própria responsividade; sem overflow horizontal ou recortes indevidos no viewport validado.
- Colors and visual tokens: tokens Forest, Deep Forest, Corn, Cream, Warm White, Earth e Ink preservados.
- Image quality and asset fidelity: um único PNG 512 × 768 é reutilizado, sem placeholders, desenho CSS ou troca por frames WebP; proporção e nitidez permanecem consistentes no tamanho exibido.
- Copy and content: copy comercial e mensagens narrativas preservadas; a dica foi atualizada de “role para girar” para “role para acompanhar”.

## Interações e erros

- Menu mobile abriu pelo botão e fechou com Escape; estado `aria-expanded` foi atualizado corretamente.
- Navegação por âncora e scroll foram exercitados no hero, `#milho`, transição e início de Produção.
- Console local e publicado: nenhum erro ou warning registrado.
- Testes estáticos: 10/10 aprovados.

## Histórico de iterações

1. A primeira comparação encontrou a dica encoberta e crossfades concorrentes. A dica ganhou camada própria e as mensagens receberam fade mais curto.
2. A transição final ainda misturava dois letreiros após scroll rápido. Opacidade e deslocamento passaram a ser calculados diretamente pelo progresso da seção.
3. Dica e primeira mensagem ainda dividiam a faixa inferior no mobile. O limiar foi sincronizado e a dica foi movida para a faixa livre acima da espiga.
4. A captura pós-fix confirmou separação visual, continuidade do PNG e transição limpa.
5. A segunda rodada encontrou a espiga cortada no fim do sticky e sobreposta ao primeiro título da transição. A saída passou a começar antes do fim da narrativa, e o crescimento foi ancorado pela base no slot real; a captura pós-fix confirmou a espiga centralizada no intervalo e posicionada acima do título.
6. A publicação revelou que a altura percentual do slot do hero colapsava no desktop. O slot passou a usar uma medida baseada na viewport e ganhou regressão automatizada.
7. A validação desktop mostrou que o crescimento na transição ainda podia invadir o cabeçalho. A espiga passou a preservar escala constante nessa etapa, com folga explícita abaixo do header; o crossfade mantém a saída suave sem competir com a copy.
8. O ritmo final foi redistribuído conforme as novas referências: a última mensagem permanece com a espiga até a transição, o campo começa seu fade após 10% do trecho e a seção passou de 340vh para 440vh. No viewport mobile de 912 px, “É aqui que tudo começa” ocupa 1.178 px de scroll (682 px em opacidade plena) e “Direto do Vale do Paraíba” permanece pleno por 744 px.
9. A reprodução com `prefers-reduced-motion: reduce` confirmou a causa da sobreposição vista em outro computador: o fallback exibia os três textos da transição ao mesmo tempo enquanto o JavaScript ainda movia a espiga. Nesse modo, a espiga agora permanece no hero, os quatro benefícios formam uma grade estática e a transição mostra apenas a composição final “Direto do Vale do Paraíba”.
10. A nova comparação usou `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-15b5ef8f-c858-4786-968a-04f89a1d0c5b.png` e `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-c7dc6ee5-6b9a-42e2-b019-f7229dd1844d.png` como verdade visual. A implementação foi renderizada no navegador interno pelo quadro `/.omx/state/corn-motion/comparison.html`, com iframes de 1341 × 835 e 1680 × 829 CSS px, densidade 1, e comparada no mesmo quadro.
11. A primeira rodada encontrou um cartão sem proporção explícita, centro baseado no canvas transparente e overflow horizontal. O cartão passou a ser quadrado, a posição usa o centro alfa medido do PNG e a imagem-base ficou limitada ao viewport.
12. A segunda rodada identificou um desvio vertical de 18 px causado pelo `reveal` do próprio cartão. A posição agora é recalculada após fontes, carregamento e fim da transição; a medição pós-fix registrou delta de 0,00002 px no eixo X e 0,413 px no eixo Y.
13. A narrativa ganhou oscilação lateral alinhada aos quatro blocos de mensagem, inclinação de até 5,5°, pulso de escala de 3%, leve flutuação vertical e uma saída mais orgânica para o campo. Todas as mudanças usam apenas `transform` e `opacity`, são agrupadas por `requestAnimationFrame` e não criam novos assets.
14. O vídeo de 10 de setembro mostrou que `overflow-x: hidden` no documento fazia os palcos `sticky` perderem a fixação em outro Chromium: a espiga grande saía pelo topo, a tela ficava vazia e a versão pequena reaparecia depois. O recorte horizontal passou para `overflow-x: clip`, que não cria um ancestral rolável; a comparação pós-fix manteve a mesma espiga visível em 30%, 55% e 80% da narrativa. CSS e JavaScript receberam a chave de cache `corn-motion-2` para impedir a reutilização da versão defeituosa.

## Findings

- Nenhum P0, P1 ou P2 restante.
- P3: falta somente repetir a rolagem em uma máquina física diferente; a regressão foi validada no navegador interno com viewport equivalente e protegida por teste automatizado.

## Performance QA

- Diagnóstico da publicação anterior: `corn-transition.png` tinha 2.040.673 bytes e o build incluía `logo-source.png`, com aproximadamente 2,02 MB, apesar de esse arquivo não aparecer na página.
- Build otimizado: 1.375.291 bytes no total, contra aproximadamente 4,79 MB antes — redução próxima de 71%.
- PNG animado: passou de 1024 × 1536 para 512 × 768 px e 582.097 bytes, reduzindo transferência, decodificação e memória de textura sem alterar a composição visível.
- Renderização: removidos `drop-shadow` do elemento em movimento e `backdrop-filter` do cabeçalho; consultas da transição foram cacheadas e atualizações do cabeçalho passaram a ser agrupadas por frame.
- Conteúdo fora da tela: etapas da jornada usam `content-visibility: auto`; suas seis fotos continuam lazy. A imagem de campo, com cerca de 86 KB, é carregada antecipadamente em baixa prioridade para estar pronta na transição.
- Cache: o PNG ganhou um novo nome para impedir que computadores que acessaram a versão antiga reutilizem o arquivo de 2 MB por até 24 horas.
- Validação local: PNG 512 × 768 carregado, campo carregado antes da transição, animação preservada e nenhum erro ou warning no console.
- Validação de acessibilidade: navegador automatizado com movimento reduzido confirmou `#scroll-corn` dentro do slot do hero, letreiro intermediário oculto e somente a composição final da origem visível.
- Peso após a rodada de movimento: aproximadamente 1,38 MB no build; o PNG permanece com 582.097 bytes. O acréscimo é apenas código textual e não adiciona requests de mídia, bibliotecas ou sequências de frames.

final result: passed
