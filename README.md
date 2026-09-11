# 📖 Gincana Bíblica - Epístola aos Gálatas (IPBNB)

Aplicação web completa, gamificada e responsiva para gincanas bíblicas intersocietárias da **Igreja Presbiteriana do Brasil em Nova Brasília (IPBNB)** sobre a carta aos Gálatas.

Desenvolvido com **React 18**, **Vite**, **TypeScript**, estilizado com **Tailwind CSS (Dark Mode e-Sports)** e sincronização bidirecional em tempo real via **BroadcastChannel API** com persistência e fallback no **LocalStorage**.

---

## 🚀 Funcionalidades Principais

### 1. Duas Telas Sincronizadas em Tempo Real
- **Tela do Telão (`/telao`):** Interface limpa, imersiva, em tela cheia (Dark Game Show), sem menus ou botões operacionais expostos, com fontes de alta visibilidade para projeção em auditório.
- **Painel do Administrador (`/admin`):** Mesa de controle com visualização do gabarito oficial, texto bíblico ARA, controles de tempo (60s, pausar, +15s, zerar), disparador de roleta, seletor de etapas e modal de pontuação.
- **Hub Inicial (`/`):** Portal de lançamento para abrir o Telão e o Painel Admin com um clique.

### 2. Regras de Negócio e Pontuação Oficial
- **5 Equipes Participantes:** UCP, UPA, UMP, Sociedade de Casais e Sociedade de Adultos (SAF/UPH).
- **Valores das Rodadas:**
  - **Rodada 1 (Aquecimento):** 10 pontos (Papel: 5 pontos)
  - **Rodada 2 (Fácil):** 20 pontos (Papel: 10 pontos)
  - **Rodada 3 (Médio):** 30 pontos (Papel: 15 pontos)
  - **Rodada 4 (Quase Difícil):** 40 pontos (Papel: 20 pontos)
  - **Rodada 5 (Difícil):** 50 pontos (Papel: 25 pontos)
  - **Rodada 6 (Especialista):** 60 pontos (Papel: 30 pontos)
  - **Morte Súbita (Desempate):** 0 pontos (define a equipe vencedora).
- **Mesa Julgadora:**
  - A equipe sorteada na roleta responde no microfone valendo os pontos cheios da rodada.
  - As outras 4 equipes respondem simultaneamente em papel e caneta, concorrendo à metade dos pontos.
  - Se a equipe sorteada errar, recebe 0 pontos; as equipes do papel que acertaram recebem os pontos normais de papel.

### 3. Dinâmica Visual e Interativa
- **Roleta Interativa SVG:** Divisão matemática proporcional entre as equipes restantes na rodada, física de desaceleração com curva cúbica (`cubic-bezier`), som sintetizado de giro e destaque luminoso na equipe vencedora.
- **Cronômetro Circular 60s:** Animação suave com contorno SVG. Nos últimos 10 segundos, o anel fica vermelho pulsante com beeps sonoros urgentes de alerta.
- **Gabarito e Texto Bíblico ARA:** Destaque verde esmeralda para a resposta correta e citação bíblica da versão Almeida Revista e Atualizada.
- **Pódio e Chuva de Confetes:** Celebração da equipe campeã com pódio 3D e chuva de confetes via `canvas-confetti`.
- **Efeitos Sonoros Web Audio API:** Síntese procedural de áudio integrada (giro de roleta, ticks de timer, alarme de 10s, campainha de encerramento, acordes de resposta correta e fanfarra de vitória).
- **Ajustes Rápidos de Emergência:** Botões `+5` e `-5` ao lado de cada equipe no Admin para correções instantâneas.

---

## 📦 Banco de Dados (43 Questões)
O arquivo `src/data/questions.json` contém 43 perguntas estruturadas:
- Rodada 1 (Aquecimento): Perguntas 1 a 7
- Rodada 2 (Fácil): Perguntas 8 a 14
- Rodada 3 (Médio): Perguntas 15 a 21
- Rodada 4 (Quase Difícil): Perguntas 22 a 28
- Rodada 5 (Difícil): Perguntas 29 a 35
- Rodada 6 (Especialista): Perguntas 36 a 42
- Rodada 7 (Morte Súbita): Pergunta 43

---

## 💻 Como Rodar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

Acesse no navegador:
- Hub Inicial: [http://localhost:5173/](http://localhost:5173/)
- Painel do Administrador: [http://localhost:5173/admin](http://localhost:5173/admin)
- Telão do Auditório: [http://localhost:5173/telao](http://localhost:5173/telao)

---

## ☁️ Como Publicar no Cloudflare Pages

O projeto já inclui o arquivo `public/_redirects` com a regra `/* /index.html 200` necessária para Single Page Applications (SPA).

1. Acesse o [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecione o repositório no GitHub.
3. Configure o build com os seguintes parâmetros:
   - **Framework preset:** `Vite` (ou `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version (opcional):** `20` ou superior
4. Clique em **Save and Deploy**. O Cloudflare Pages disponibilizará o site em um domínio `.pages.dev` seguro com SSL e CDN global instantânea!

---

## 🐙 Sincronização com o GitHub

Para enviar este projeto para o seu repositório no GitHub:

1. Crie um novo repositório vazio no seu GitHub: [https://github.com/new](https://github.com/new) (ex: `gincana-galatas` ou `gincana-ipbnb`).
2. No terminal deste projeto, conecte o repositório remoto e envie os commits:
```bash
# Adicionar o repositório remoto (substitua pelo nome do seu repo)
git remote add origin https://github.com/Gutvalim/gincana-galatas.git

# Enviar os arquivos para a branch principal
git branch -M main
git push -u origin main
```
