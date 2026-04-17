# Codebase Context — voit-admin

> Renvoyer ce fichier en début de conversation remplace une analyse complète du projet.

---

## Stack technique

| Outil | Rôle |
|-------|------|
| Vite + React + TypeScript | Base |
| TailwindCSS v4 | Styles (plugin Vite, pas de config tailwind.config) |
| ShadcnUI (Radix) | Composants UI |
| TanStack Router | Routing file-based (auto-génère `routeTree.gen.ts` via plugin Vite) |
| TanStack Table v8 | Tables de données |
| TanStack React Query | Présent, pas encore utilisé activement |
| react-hook-form + zod | Formulaires + validation |
| Lucide Icons | Icônes UI |
| Sonner | Toasts |
| faker.js | Données mock |
| pnpm | Package manager |

---

## Structure des dossiers

```
src/
├── components/
│   ├── ui/              ← Composants ShadcnUI (⚠️ ne pas réinstaller via CLI, certains sont modifiés pour RTL)
│   ├── data-table/      ← Composants réutilisables : toolbar, pagination, filters, bulk-actions
│   ├── layout/
│   │   ├── data/
│   │   │   └── sidebar-data.ts   ← ✅ CONFIG NAV SIDEBAR (ajouter les items ici)
│   │   ├── header.tsx, main.tsx, app-sidebar.tsx, ...
│   └── ...              ← Composants partagés (confirm-dialog, long-text, select-dropdown...)
├── context/             ← Providers globaux (theme, layout, font, search, direction)
├── features/            ← ✅ UNE FEATURE = UN DOSSIER (voir section suivante)
├── hooks/
│   ├── use-dialog-state.tsx    ← Gère l'état ouvert/fermé des dialogs
│   └── use-table-url-state.ts  ← Synchro pagination/filtres ↔ URL
├── lib/
│   └── utils.ts         ← cn() helper
├── routes/              ← Fichiers de routes TanStack (file-based)
└── stores/
    └── auth-store.ts
```

---

## Architecture d'une feature

### Structure de dossiers (pattern à respecter)

```
src/features/[feature]/
├── index.tsx                           ← Page principale (Header + Main + Provider)
├── data/
│   ├── schema.ts                       ← Zod schemas + types exportés
│   ├── data.ts                         ← Constantes : statuts, options, enums
│   └── [entities].ts                   ← Données mock (faker ou fixe)
└── components/
    ├── [feature]-provider.tsx          ← Context React (quel dialog est ouvert + row sélectionnée)
    ├── [feature]-dialogs.tsx           ← Orchestre tous les dialogs (les monte/démonte)
    ├── [feature]-action-dialog.tsx     ← Dialog create/edit
    ├── [feature]-delete-dialog.tsx     ← Dialog confirmation suppression
    ├── [feature]-primary-buttons.tsx   ← Boutons d'action en haut à droite de la page
    ├── [feature]-table.tsx             ← Tableau avec pagination + filtres
    ├── [feature]-columns.tsx           ← Définition des colonnes (ColumnDef[])
    ├── data-table-row-actions.tsx      ← Dropdown d'actions par ligne (edit, delete...)
    └── data-table-bulk-actions.tsx     ← Barre d'actions multi-sélection (mobile bottom)
```

Pour une feature avec une **page de détail** (ex: fiche véhicule) :
```
src/features/[feature]/
├── index.tsx                           ← Page liste
└── detail/
    ├── index.tsx                       ← Page détail
    └── components/
        ├── [feature]-detail-provider.tsx
        ├── [feature]-detail-dialogs.tsx
        ├── [sub-entity]-mutate-drawer.tsx  ← Sheet (drawer latéral) pour add/edit sous-entité
        └── declare-sold-dialog.tsx         ← Dialog action spécifique
```

### Routing correspondant

```
src/routes/_authenticated/
├── [feature]/
│   ├── index.tsx          ← Route "/feature"       → composant features/[feature]/index.tsx
│   └── $id.tsx            ← Route "/feature/:id"   → composant features/[feature]/detail/index.tsx
```

---

## Données mock — travailler sans API

### Principe
Toutes les données sont dans `src/features/[feature]/data/[entities].ts`. Les composants importent directement ces données. Quand le backend sera prêt, on remplacera ces imports par des appels React Query.

### Avec faker (grands volumes)
```ts
// faker.seed() = données reproductibles à chaque reload
import { faker } from '@faker-js/faker'
faker.seed(12345)
export const items = Array.from({ length: 50 }, () => ({ id: faker.string.uuid(), ... }))
```

### Avec données fixes (petits volumes ou données liées)
```ts
export const vehicles = [
  { id: 'v-1', make: 'Audi', model: 'A5', year: 2019, status: 'sold', participants: [...], ... },
  { id: 'v-2', make: 'BMW', model: '320d', year: 2020, status: 'active', participants: [...], ... },
]
export const expenses = [
  { id: 'e-1', vehicleId: 'v-1', label: 'Calandre', totalAmount: 200, payers: [...], ... },
]
```

### Partners (partenaires de l'app)
Les partenaires sont des entités `User` (la page `/users` existe déjà). Pour les mock, utiliser une liste fixe dans `data.ts` :
```ts
export const partners = [
  { id: 'p-1', firstName: 'Alexandre', lastName: 'Dupont' },
  { id: 'p-2', firstName: 'Thomas', lastName: 'Martin' },
]
```

---

## Composants UI disponibles

Tous dans `src/components/ui/` :
`alert-dialog` `avatar` `badge` `button` `calendar` `card` `checkbox` `dialog` `dropdown-menu` `form` `input` `label` `popover` `radio-group` `scroll-area` `select` `separator` `sheet` `skeleton` `sonner` `switch` `table` `tabs` `textarea` `tooltip`

**Composants partagés** (hors ui/) utiles :
- `confirm-dialog` — dialog de confirmation générique
- `long-text` — tronque le texte avec tooltip
- `select-dropdown` — Select pré-stylé pour les formulaires
- `date-picker` — Date picker prêt à l'emploi

**Composants de table** (`src/components/data-table/`) :
- `DataTableToolbar` — barre de recherche + filtres
- `DataTablePagination` — pagination
- `DataTableColumnHeader` — header de colonne triable
- `DataTableBulkActions` — barre d'actions en bas (mobile)

**Layout** (wrappent le contenu des pages) :
- `<Header fixed>` — header fixe en haut
- `<Main>` — zone de contenu principale (gère le padding)

---

## Composants UI → Usage

| Besoin | Composant |
|--------|-----------|
| Formulaire create/edit | `Dialog` + `Form` (react-hook-form) |
| Formulaire complexe/long | `Sheet` (drawer latéral) + `Form` |
| Confirmation suppression | `AlertDialog` (ou `confirm-dialog`) |
| Champ select dans un form | `SelectDropdown` |
| Badge statut | `Badge` avec variant `outline` + classes couleur |
| Résumé chiffres | `Card` + `CardHeader` + `CardContent` |
| Notification | `toast()` de Sonner |
| Listes dynamiques dans un form | `useFieldArray` de react-hook-form |

---

## Conventions

- Imports alias : `@/` → `src/`
- Fichiers : `kebab-case`
- Composants : `PascalCase`
- Hooks : `camelCase` avec préfixe `use`
- Classes Tailwind conditionnelles : `cn()` de `@/lib/utils`
- Icônes : Lucide uniquement pour l'UI
- Ajouter un item dans la sidebar : modifier `src/components/layout/data/sidebar-data.ts`

---

## Contexte métier — AutoInvest (Achat-Revente Auto)

### Problème
Gestion de co-investissements automobile entre plusieurs partenaires. Chaque voiture a ses propres participants avec des % de bénéfices définis à la création.

### Logique de calcul (appartient au backend)
```
bénéfice_net = prix_vente - somme(toutes les dépenses)
sortie_participant_X = montant_investi_X + (bénéfice_net × profitShare_X / 100)
```

### Entités

```
Vehicle
  id, make, model, year, purchaseDate
  status: 'active' | 'sold'
  salePrice?, soldAt?
  participants: VehicleParticipant[]

VehicleParticipant
  userId, userName
  profitShare: number (%)

Expense
  id, vehicleId, label, date, totalAmount
  payers: ExpensePayer[]

ExpensePayer
  userId, userName, amount
```

### Pages à construire

**`/vehicles`** — liste des véhicules
- Table : Make/Model, Statut (badge), Participants, Total investi, Actions
- Bouton "Nouveau véhicule" → Dialog create avec section participants dynamique (useFieldArray) + validation somme % = 100

**`/vehicles/$vehicleId`** — fiche véhicule
- Header : nom véhicule + badge statut + bouton retour
- Cards résumé : total investi, prix de vente (si vendu), bénéfice net (si vendu)
- Tableau participants : nom, % bénéf, montant investi
- Tableau dépenses : label, date, montant total, payeurs compacts ("Moi 600€ · Thomas 400€"), actions
- Bouton "Ajouter une dépense" → Sheet (drawer) avec payeurs dynamiques (useFieldArray)
- Bouton "Déclarer vendu" (si status=active) → Dialog avec input prix de vente + affichage répartition calculée
