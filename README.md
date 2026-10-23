# P5R // Guia do Fantasma

Guia visual e não-oficial de **Persona 5 Royal**: onde treinar cada atributo social, uma rotina semanal otimizada, a agenda completa dos confidentes e dicas para iniciantes. Disponível em **PT-BR e inglês**.

## Funcionalidades

- **Bilíngue (PT-BR / EN):** a bandeira no topo troca todo o conteúdo de idioma, e a escolha fica salva no navegador.
- **Carrossel de confidentes:** cards com gradiente na cor de cada personagem, inclinação 3D que segue o cursor, arrastar com o mouse, setas, navegação pelo teclado (← →) e barra de progresso.
- **Painel de detalhes:** abre ao clicar num card e mostra local, horário, dica, ranks 1–9 e presentes.
- **Filtros por atributo:** Conhecimento, Coragem, Habilidade, Gentileza e Charme.
- **Animações:** entrada do hero, elementos que aparecem ao rolar (IntersectionObserver) e microinterações. Respeita `prefers-reduced-motion`.
- **Responsivo e acessível:** layout para celular, foco visível e rótulos ARIA.
- **Trilha sonora** com controle de volume.

## Estrutura

```
├── index.html          # Marcação da página
├── css/
│   └── style.css       # Tokens de design, layout e animações
├── js/
│   ├── data.js         # Conteúdo base (PT-BR): atributos, confidentes, dicas, ícones
│   ├── i18n.js         # Textos da interface e tradução completa para inglês
│   └── app.js          # Renderização, idioma, carrossel e player de música
└── assets/
    ├── img/            # Retratos dos confidentes e logo
    └── audio/          # Música de fundo
```

Sem frameworks e sem etapa de build: HTML, CSS e JavaScript puros. Os scripts são clássicos (não ES modules) para que a página também funcione abrindo o `index.html` direto do disco.

## Como rodar

Abra o `index.html` no navegador ou sirva a pasta com qualquer servidor estático:

```bash
npx serve .
```

## Aviso

Projeto de fã, sem fins lucrativos. Persona 5 Royal e seus personagens pertencem à ATLUS/SEGA.
