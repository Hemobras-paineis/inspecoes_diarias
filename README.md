# Inspeções Diárias Pro - Telemetria & Gestão Industrial

Sistema completo para inspeções diárias industriais, captura fotográfica com OCR assistido por IA, telemetria em tempo real, painel de controle gerencial (Modo TV), cards de alerta fora da média, e relatórios executivos em PDF e Excel (.xlsx).

---

## 🚀 Como Integrar com o GitHub

### Opção 1: Inicializar um Novo Repositório no GitHub
Se você baixou o arquivo zip deste projeto (`inspecoes-diarias-github.zip`), siga estes passos no seu terminal:

```bash
# 1. Extraia o arquivo zip em sua máquina e acesse a pasta:
unzip inspecoes-diarias-github.zip -d inspecoes-diarias
cd inspecoes-diarias

# 2. Inicialize o repositório git local:
git init

# 3. Adicione todos os arquivos do projeto:
git add .

# 4. Faça o primeiro commit:
git commit -m "feat: versão inicial do aplicativo de inspeções e painel gerencial"

# 5. Conecte ao seu repositório remoto no GitHub:
# (Substitua SEU-USUARIO e SEU-REPOSITORIO pela sua URL do GitHub)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 6. Envie o código para a branch principal (main):
git branch -M main
git push -u origin main
```

---

### Opção 2: Utilizar os Arquivos Compilados (`dist/`) no GitHub Pages
Se você deseja publicar apenas a versão estática compilada (HTML, CSS e JavaScript) no **GitHub Pages**:

1. Baixe o pacote `inspecoes-diarias-dist-html-css-js.zip`.
2. Extraia os arquivos (`index.html`, pasta `assets/` com os arquivos `.js` e `.css`).
3. Crie um repositório no GitHub (ex.: `inspecoes-frontend`) e envie o conteúdo para a branch `gh-pages` ou ative o GitHub Pages nas configurações do repositório apontando para a raiz (`/`).

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend / API**: Node.js, Express, Google GenAI SDK (Gemini Vision OCR)
- **Exportação & Relatórios**: jsPDF, jsPDF-AutoTable, XLSX (SheetJS)
- **Build Tool**: Vite 6, esbuild

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ ou 20+ instalado
- npm ou yarn

### Instalação

```bash
# 1. Instalar as dependências do projeto:
npm install

# 2. Configurar variáveis de ambiente (opcional):
cp .env.example .env
# Adicione sua GEMINI_API_KEY no arquivo .env se desejar ativar a extração por IA

# 3. Iniciar o servidor de desenvolvimento:
npm run dev
```

O aplicativo estará disponível em: `http://localhost:3000`.

### Build de Produção

```bash
# Gera a pasta dist/ com HTML, CSS e JavaScript otimizados:
npm run build

# Inicia o servidor em modo de produção:
npm start
```

---

## 📂 Estrutura de Arquivos Principais

```text
├── index.html                  # Ponto de entrada HTML da aplicação
├── src/
│   ├── App.tsx                 # Componente raiz e navegação principal
│   ├── components/
│   │   ├── OperatorAppView.tsx      # App do Operador (Foto, Medição, Câmera, IA)
│   │   ├── ManagerDashboardView.tsx # Painel Gerencial (Modo TV, Alertas, Gráficos)
│   │   ├── InspectionDetailModal.tsx# Detalhes da inspeção e auditoria
│   │   └── IntegrationGuideModal.tsx# Guia de integração e APIs
│   ├── utils/
│   │   ├── pdfGenerator.ts     # Gerador de relatórios executivos em PDF
│   │   └── excelExporter.ts    # Exportador de planilhas Excel (.xlsx)
│   ├── types.ts                # Definições de tipos TypeScript
│   ├── main.tsx                # Entrada React
│   └── index.css               # Estilização global e Tailwind CSS
├── server.ts                   # Servidor Express & proxy de API
├── vite.config.ts              # Configuração Vite
├── package.json                # Dependências e scripts npm
└── dist/                       # Arquivos compilados (HTML, CSS, JS) prontos para deploy
```

---

## 📄 Licença
Propriedade interna confidencial - Uso operacional industrial.
