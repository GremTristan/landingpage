# Instructions d'installation

## Étapes pour configurer le projet

### 1. Installer les dépendances

```bash
npm install
```

Cela installera :
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS 4
- D3.js (pour le composant RotatingEarth)
- Toutes les dépendances de développement nécessaires

### 2. Structure des dossiers créée

```
.
├── app/
│   ├── globals.css          # Styles globaux avec variables Tailwind
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page d'accueil avec le composant
├── components/
│   └── ui/
│       └── wireframe-dotted-globe.tsx  # Composant RotatingEarth
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

### 3. Pourquoi `/components/ui` ?

Le dossier `/components/ui` est la convention standard pour shadcn/ui. C'est là que tous les composants UI réutilisables sont stockés. Cette structure permet de :
- Organiser clairement les composants UI
- Suivre les conventions de shadcn/ui
- Faciliter l'ajout de nouveaux composants via la CLI shadcn

### 4. Configuration Tailwind

Le projet utilise **Tailwind CSS 4** avec la nouvelle syntaxe `@import "tailwindcss"`.

Les variables CSS sont définies dans `app/globals.css` et utilisent le format `oklch` pour une meilleure gestion des couleurs.

### 5. Lancer le projet

```bash
npm run dev
```

Le projet sera accessible sur [http://localhost:3000](http://localhost:3000)

## Utilisation du composant RotatingEarth

Le composant est déjà intégré dans `app/page.tsx`. Vous pouvez l'utiliser dans n'importe quelle page :

```tsx
import RotatingEarth from "@/components/ui/wireframe-dotted-globe"

export default function MyPage() {
  return (
    <div>
      <RotatingEarth width={1200} height={800} className="my-custom-class" />
    </div>
  )
}
```

## Notes importantes

- Le composant charge les données géographiques depuis une URL externe (GitHub)
- Il nécessite une connexion internet pour fonctionner
- Le mode sombre est activé par défaut dans le layout
- Le composant est responsive et s'adapte automatiquement à la taille de l'écran

## Prochaines étapes (optionnel)

Si vous voulez utiliser la CLI shadcn pour ajouter d'autres composants :

```bash
npx shadcn@latest init
npx shadcn@latest add button
```

Mais ce n'est pas nécessaire pour le composant RotatingEarth qui fonctionne déjà.

