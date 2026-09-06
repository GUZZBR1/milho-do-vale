# Milho do Vale

Landing page estática do Milho do Vale, produção local de milho verde em São José dos Campos — SP.

## Estrutura

- `index.html` — estrutura semântica da página, seguindo o blueprint em `Milho_do_Vale_Landing_Page_Blueprint_V1.docx`.
- `styles.css` — identidade visual (tokens Forest/Corn/Cream/Earth), responsividade e animações.
- `script.js` — menu mobile, rotação 360° por scroll, timeline animada, transição produto → campo e CTA do WhatsApp.
- `assets/corn-360/frame-00.webp` … `frame-23.webp` — sequência de 24 ângulos (15° cada) da espiga, extraída do contact sheet `Milho_do_Vale_Espiga_360_Angulos_24.png`.

## Executar localmente

Abra `index.html` no navegador. Para configurar o botão de WhatsApp, edite `WHATSAPP_NUMBER` no início de `script.js` usando o formato internacional sem `+`, espaços ou pontuação. Para o Instagram, edite `INSTAGRAM_HANDLE` (sem `@`); se ambos ficarem em branco, o link de WhatsApp mostra um aviso e o link de Instagram é removido do rodapé.

## Pendências do blueprint (fora do escopo desta implementação)

- Os frames do milho 360° vieram de um contact sheet gerado como referência, não de fotografia real — o blueprint (seção 14) já lista isso como pendência de pré-produção.
- Imagens reais de campo/plantação e das etapas da jornada (Preparo, Plantio, Cultivo, Colheita, Seleção, Entrega) ainda não existem; as seções usam composições gráficas nos tokens de marca como placeholder.
- Número de WhatsApp definitivo, handle do Instagram, favicon e domínio próprio continuam pendentes de confirmação.
