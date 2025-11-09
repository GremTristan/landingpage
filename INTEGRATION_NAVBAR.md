# Intégration du composant NavBar Tubelight

## Composant ajouté

Le composant `NavBar` avec effet tubelight a été intégré dans `/components/ui/tubelight-navbar.tsx`.

## Dépendances installées

Les dépendances suivantes ont été ajoutées au `package.json` :
- `framer-motion` - Pour les animations
- `lucide-react` - Pour les icônes
- `clsx` - Pour la gestion des classes CSS
- `tailwind-merge` - Pour fusionner les classes Tailwind

## Fichiers créés

1. **`/lib/utils.ts`** - Fonction utilitaire `cn()` pour gérer les classes CSS (requis par shadcn/ui)
2. **`/components/ui/tubelight-navbar.tsx`** - Composant NavBar principal
3. **`/components/ui/navbar-demo.tsx`** - Exemple d'utilisation

## Installation

Exécutez cette commande pour installer les nouvelles dépendances :

```bash
npm install
```

## Utilisation

### Exemple basique

```tsx
import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export default function MyPage() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'About', url: '/about', icon: User },
    { name: 'Projects', url: '/projects', icon: Briefcase },
    { name: 'Resume', url: '/resume', icon: FileText }
  ]

  return <NavBar items={navItems} />
}
```

### Propriétés du composant

- **`items`** (requis) : Tableau d'objets `NavItem` avec :
  - `name` : Nom de l'élément de navigation
  - `url` : URL de destination
  - `icon` : Composant d'icône Lucide React
- **`className`** (optionnel) : Classes CSS supplémentaires

### Comportement responsive

- **Desktop** : Affiche le texte et les icônes, positionné en haut
- **Mobile** : Affiche uniquement les icônes, positionné en bas
- L'effet tubelight s'anime automatiquement sur l'élément actif

### Effet tubelight

L'effet tubelight crée une animation lumineuse au-dessus de l'élément actif avec :
- Un halo lumineux animé
- Une transition fluide entre les éléments
- Un effet de blur pour un rendu moderne

## Intégration dans l'application

Pour utiliser la navbar dans votre application, ajoutez-la dans votre layout principal (`app/layout.tsx`) ou dans une page spécifique.

