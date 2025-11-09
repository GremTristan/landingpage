# Correction de l'erreur Tailwind CSS 4

## Problème résolu

L'erreur était due à Tailwind CSS 4 qui a changé la façon dont il fonctionne avec PostCSS. Le plugin PostCSS a été déplacé vers un package séparé.

## Corrections apportées

1. **Ajout de `@tailwindcss/postcss`** dans `package.json`
2. **Mise à jour de `postcss.config.js`** pour utiliser `@tailwindcss/postcss` au lieu de `tailwindcss`
3. **Ajout des variables CSS manquantes** dans `globals.css` (`--background`, `--popover`, `--destructive`)

## Installation

Exécutez cette commande pour installer la nouvelle dépendance :

```bash
npm install
```

Cela installera `@tailwindcss/postcss` qui est maintenant requis pour Tailwind CSS 4.

## Après l'installation

Relancez le serveur de développement :

```bash
npm run dev
```

L'erreur devrait maintenant être résolue et le projet devrait fonctionner correctement.

