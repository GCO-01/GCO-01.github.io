# VAGGO Web

Monorepo del sitio de VAGGO (shakes de proteína de clara de huevo, Lima, Perú).

```
vaggo-web/
├── frontend/          # SPA React 18 + Vite + CSS Modules (la web actual)
├── backend/           # API FastAPI (scaffold) + infra de deploy
│   ├── app/           # scaffold Clean Architecture (sin lógica todavía)
│   └── deploy/        # Docker + nginx que sirven el frontend estático
├── docs/              # documentación, prompts y prototipos
└── .github/workflows/ # CI: deploy del frontend a GitHub Pages
```

## Frontend

```bash
cd frontend
npm install
npm run dev        # dev server con HMR
npm run build      # build de producción en frontend/dist
npm test           # vitest
```

Detalle en [frontend/README.md](frontend/README.md) y [frontend/CONTENIDO.md](frontend/CONTENIDO.md).

## Backend

Scaffold FastAPI sin lógica de negocio aún. Ver [backend/README.md](backend/README.md).

## Deploy

- **Producción (GitHub Pages):** `.github/workflows/deploy.yml` compila `frontend/`
  y publica `frontend/dist` en `gco-01.github.io`. Source de Pages = **GitHub Actions**.
- **Docker + nginx (alternativa):** desde la raíz del repo,
  `docker build -f backend/deploy/Dockerfile.frontend -t vaggo-front .`
  y `docker run -p 8080:80 vaggo-front`.
