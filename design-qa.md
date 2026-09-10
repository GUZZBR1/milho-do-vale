# Design QA — continuidade da espiga por scroll

## Evidências

- Source visual truth:
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-26bb6478-60d8-4691-8432-2a9e8e798b04.png` — hero desktop, 1341 × 835 px.
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-a35157ee-fc7f-4ec4-9991-44f2f669050a.png` — seção “O milho”, 1446 × 921 px.
  - `C:/Users/gusta/AppData/Local/Temp/codex-clipboard-3e7227ac-bf86-457d-9df5-eb8801865d16.png` — continuidade para a transição, 1083 × 895 px.
- Implementation screenshot: capturas renderizadas no Codex in-app Browser, tanto no preview local quanto na publicação temporária da Vercel, cobrindo hero, `#milho` e transição.
- Viewports validados: mobile 319 × 912 CSS px e desktop 1265 × 712 CSS px, device pixel ratio 1.
- Estado: movimento normal (`prefers-reduced-motion: false`), menu fechado, scroll no hero, entrada e quadrantes da seção “O milho”, crossfade para o campo e saída para “Produção”.
- Evidência estrutural no navegador: exatamente um `#scroll-corn`, `src="assets/corn-transition.png"`, com `position: fixed` durante a experiência.

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
- Image quality and asset fidelity: um único PNG 1024 × 1536 é reutilizado, sem placeholders, desenho CSS ou troca por frames WebP; sombra e proporção permanecem consistentes.
- Copy and content: copy comercial e mensagens narrativas preservadas; a dica foi atualizada de “role para girar” para “role para acompanhar”.

## Interações e erros

- Menu mobile abriu pelo botão e fechou com Escape; estado `aria-expanded` foi atualizado corretamente.
- Navegação por âncora e scroll foram exercitados no hero, `#milho`, transição e início de Produção.
- Console local e publicado: nenhum erro ou warning registrado.
- Testes estáticos: 5/5 aprovados.

## Histórico de iterações

1. A primeira comparação encontrou a dica encoberta e crossfades concorrentes. A dica ganhou camada própria e as mensagens receberam fade mais curto.
2. A transição final ainda misturava dois letreiros após scroll rápido. Opacidade e deslocamento passaram a ser calculados diretamente pelo progresso da seção.
3. Dica e primeira mensagem ainda dividiam a faixa inferior no mobile. O limiar foi sincronizado e a dica foi movida para a faixa livre acima da espiga.
4. A captura pós-fix confirmou separação visual, continuidade do PNG e transição limpa.
5. A segunda rodada encontrou a espiga cortada no fim do sticky e sobreposta ao primeiro título da transição. A saída passou a começar antes do fim da narrativa, e o crescimento foi ancorado pela base no slot real; a captura pós-fix confirmou a espiga centralizada no intervalo e posicionada acima do título.
6. A publicação revelou que a altura percentual do slot do hero colapsava no desktop. O slot passou a usar uma medida baseada na viewport e ganhou regressão automatizada.
7. A validação desktop mostrou que o crescimento na transição ainda podia invadir o cabeçalho. A espiga passou a preservar escala constante nessa etapa, com folga explícita abaixo do header; o crossfade mantém a saída suave sem competir com a copy.

## Findings

- Nenhum P0, P1 ou P2 restante.
- P3: em telas extremamente baixas, vale validar futuramente se a duração da seção narrativa parece longa; não afeta o viewport atual nem a continuidade solicitada.

final result: passed
