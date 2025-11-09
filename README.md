# SmartBanker

Projet Next.js avec TypeScript, Tailwind CSS et shadcn/ui.

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

- `/app` - Pages et layouts Next.js
- `/components/ui` - Composants UI (shadcn)
- `/app/globals.css` - Styles globaux avec variables Tailwind

## Composant RotatingEarth

Le composant `RotatingEarth` est disponible dans `/components/ui/wireframe-dotted-globe.tsx`.

### Utilisation

```tsx
import RotatingEarth from "@/components/ui/wireframe-dotted-globe"

export default function MyPage() {
  return <RotatingEarth width={1200} height={800} />
}
```

### Props

- `width` (optionnel) : Largeur du canvas (défaut: 800)
- `height` (optionnel) : Hauteur du canvas (défaut: 600)
- `className` (optionnel) : Classes CSS supplémentaires

## Dépendances

- `d3` - Bibliothèque de visualisation de données
- `next` - Framework React
- `react` & `react-dom` - Bibliothèques React
- `tailwindcss` - Framework CSS
- `typescript` - Typage statique

