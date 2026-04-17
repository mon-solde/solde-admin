import { type Expense } from './schema'

export const expenses: Expense[] = [
  // Audi A5 (v-1)
  {
    id: 'e-1',
    vehicleId: 'v-1',
    label: 'Achat du véhicule',
    date: new Date('2024-01-15'),
    totalAmount: 3000,
    payers: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', amount: 2000 },
      { userId: 'partner-2', userName: 'Thomas Martin', amount: 1000 },
    ],
  },
  {
    id: 'e-2',
    vehicleId: 'v-1',
    label: 'Calandre avant',
    date: new Date('2024-02-01'),
    totalAmount: 200,
    payers: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', amount: 200 },
    ],
  },
  {
    id: 'e-3',
    vehicleId: 'v-1',
    label: 'Plein carburant',
    date: new Date('2024-02-14'),
    totalAmount: 80,
    payers: [
      { userId: 'partner-2', userName: 'Thomas Martin', amount: 80 },
    ],
  },

  // BMW 320d (v-2)
  {
    id: 'e-4',
    vehicleId: 'v-2',
    label: 'Achat du véhicule',
    date: new Date('2024-02-10'),
    totalAmount: 8500,
    payers: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', amount: 4000 },
      { userId: 'partner-2', userName: 'Thomas Martin', amount: 2500 },
      { userId: 'partner-3', userName: 'Karim Benzara', amount: 2000 },
    ],
  },
  {
    id: 'e-5',
    vehicleId: 'v-2',
    label: 'Révision + 4 pneus',
    date: new Date('2024-02-25'),
    totalAmount: 650,
    payers: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', amount: 650 },
    ],
  },

  // Golf VII (v-3)
  {
    id: 'e-6',
    vehicleId: 'v-3',
    label: 'Achat du véhicule',
    date: new Date('2024-03-05'),
    totalAmount: 6200,
    payers: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', amount: 3500 },
      { userId: 'partner-4', userName: 'Mehdi Saïdi', amount: 2700 },
    ],
  },
  {
    id: 'e-7',
    vehicleId: 'v-3',
    label: 'Pare-chocs arrière',
    date: new Date('2024-03-18'),
    totalAmount: 320,
    payers: [
      { userId: 'partner-4', userName: 'Mehdi Saïdi', amount: 320 },
    ],
  },

  // Peugeot 308 (v-4)
  {
    id: 'e-8',
    vehicleId: 'v-4',
    label: 'Achat du véhicule',
    date: new Date('2023-11-01'),
    totalAmount: 9500,
    payers: [
      { userId: 'partner-2', userName: 'Thomas Martin', amount: 4750 },
      { userId: 'partner-3', userName: 'Karim Benzara', amount: 4750 },
    ],
  },
  {
    id: 'e-9',
    vehicleId: 'v-4',
    label: 'Courroie de distribution',
    date: new Date('2023-11-20'),
    totalAmount: 480,
    payers: [
      { userId: 'partner-2', userName: 'Thomas Martin', amount: 300 },
      { userId: 'partner-3', userName: 'Karim Benzara', amount: 180 },
    ],
  },
]
