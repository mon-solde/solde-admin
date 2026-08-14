# Solde — Admin

Interface web de **Solde**, une application personnelle de gestion financière : budget mensuel, dettes entre proches, épargne et suivi de véhicules en copropriété.

Ce dépôt contient le frontend. Le backend se trouve dans [`solde-api`](https://github.com/Voit-admin/voit-api).

## Fonctionnalités

- **Budget mensuel** : salaire reçu, charges récurrentes (automatiques/manuelles), reste disponible calculé chaque mois
- **Charges récurrentes** : gestion versionnée — modifier une charge ne réécrit jamais les mois déjà générés
- **Dettes** : suivi des prêts/emprunts entre l'utilisateur et ses contacts, avec remboursements
- **Épargne** : suivi des mouvements banque/espèces
- **Véhicules** : achat, dépenses partagées entre copropriétaires, revente avec répartition automatique du bénéfice/déficit
- **Contacts** : annuaire des personnes avec qui les finances sont partagées

## Stack technique

- **UI** : [shadcn/ui](https://ui.shadcn.com) (TailwindCSS + Radix UI)
- **Build** : [Vite](https://vitejs.dev/)
- **Routing** : [TanStack Router](https://tanstack.com/router/latest)
- **Data fetching** : [TanStack Query](https://tanstack.com/query/latest)
- **Auth** : Firebase Authentication
- **Langage** : TypeScript

## Lancer le projet en local

```bash
git clone https://github.com/Voit-admin/voit-admin.git
cd voit-admin
npm install
npm run dev
```

Nécessite le backend [`solde-api`](https://github.com/Voit-admin/voit-api) lancé en parallèle.
