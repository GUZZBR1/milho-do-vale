# Milho do Vale

Landing page estática do Milho do Vale, produção local de milho verde em São José dos Campos — SP.

## Estrutura

- `index.html` — estrutura semântica da página, seguindo o blueprint em `Milho_do_Vale_Landing_Page_Blueprint_V1.docx`.
- `styles.css` — identidade visual (tokens Forest/Corn/Cream/Earth), responsividade e animações.
- `script.js` — menu mobile, rotação 360° por scroll, timeline animada, transição produto → campo e CTA do WhatsApp.
- `assets/corn-360/frame-00.webp` … `frame-23.webp` — sequência de 24 ângulos (15° cada), convertida dos PNGs individuais 1024×1536 da pasta `milho/Amostra_Espiga_360` no Google Drive para WebP 960×1440. O canvas retorna ao primeiro frame ao concluir exatamente uma volta.
- `assets/corn-transition.png` — recorte RGBA com fundo transparente usado no hero e na transição da espiga para o campo.
- `assets/field/origin-field.webp` — fotografia panorâmica otimizada usada no crossfade produto → campo. A foto fica fixa até o fim do bloco de scroll: só o letreiro troca em crossfade, de "É aqui que tudo começa" para o texto da origem, sem repetir a imagem.
- `assets/journey/*.webp` — seis fotografias documentais otimizadas para Preparo, Plantio, Cultivo, Colheita, Seleção e Entrega.
- `assets/logo-source.png` — logo oficial (selo circular) em resolução original, recortada apenas para remover a margem transparente; fonte para reexportar `logo-mark.webp` e os favicons.
- `assets/logo-mark.webp` — versão 200×200 do logo usada na marca do cabeçalho e do rodapé.
- `assets/favicon-32.png`, `assets/favicon-48.png`, `assets/favicon-180.png` — favicon e ícone de tela inicial (Apple touch icon) gerados a partir do logo oficial.
- `tests/blueprint-contract.test.mjs` — verificações estáticas dos requisitos estruturais e de performance do blueprint.

## Executar localmente

Abra `index.html` no navegador. Para configurar o botão de WhatsApp, edite `WHATSAPP_NUMBER` no início de `script.js` usando o formato internacional sem `+`, espaços ou pontuação. Para o Instagram, edite `INSTAGRAM_HANDLE` (sem `@`); se ambos ficarem em branco, o link de WhatsApp mostra um aviso e o link de Instagram é removido do rodapé.

Para executar a checagem automatizada sem instalar dependências:

```bash
node --test tests/blueprint-contract.test.mjs
```

## Pendências do blueprint (fora do escopo desta implementação)

- Os frames individuais disponíveis no Drive ainda são uma amostra gerada de pré-produção, não fotografia real — o blueprint (seção 14) já lista a aprovação do asset definitivo como pendência.
- A sequência aprovada disponível no Drive possui 24 ângulos. Para chegar aos 48–72 frames recomendados sem duplicação visual, ainda é necessário gerar novos ângulos consistentes a partir da mesma espiga.
- As imagens de campo e da jornada são assets de protótipo gerados por IA; devem ser substituídas pelas fotografias reais aprovadas antes da publicação definitiva.
- Domínio próprio continua pendente de confirmação. WhatsApp (`+55 12 98285-4348`) e Instagram (`@milhodovale.sjc`) já estão configurados.

## Origem dos assets visuais adicionados

As imagens `assets/field/origin-field.webp` e `assets/journey/*.webp` foram geradas com a ferramenta nativa de geração de imagens do Codex e convertidas para WebP com FFmpeg. Direção usada: fotografia documental natural de produção local de milho no interior de São Paulo, luz suave de início da manhã, sem texto, logotipos ou marcas d'água.
