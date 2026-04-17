import { type Vehicle } from './schema'

export const vehicles: Vehicle[] = [
  {
    id: 'v-1',
    make: 'Audi',
    model: 'A5',
    year: 2018,
    purchaseDate: new Date('2024-01-15'),
    status: 'sold',
    salePrice: 5000,
    soldAt: new Date('2024-03-20'),
    participants: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', profitShare: 70 },
      { userId: 'partner-2', userName: 'Thomas Martin', profitShare: 30 },
    ],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'v-2',
    make: 'BMW',
    model: '320d',
    year: 2019,
    purchaseDate: new Date('2024-02-10'),
    status: 'active',
    participants: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', profitShare: 50 },
      { userId: 'partner-2', userName: 'Thomas Martin', profitShare: 30 },
      { userId: 'partner-3', userName: 'Karim Benzara', profitShare: 20 },
    ],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'v-3',
    make: 'Volkswagen',
    model: 'Golf VII',
    year: 2017,
    purchaseDate: new Date('2024-03-05'),
    status: 'active',
    participants: [
      { userId: 'partner-1', userName: 'Alexandre Dupont', profitShare: 60 },
      { userId: 'partner-4', userName: 'Mehdi Saïdi', profitShare: 40 },
    ],
    createdAt: new Date('2024-03-05'),
  },
  {
    id: 'v-4',
    make: 'Peugeot',
    model: '308',
    year: 2020,
    purchaseDate: new Date('2023-11-01'),
    status: 'sold',
    salePrice: 12000,
    soldAt: new Date('2024-01-08'),
    participants: [
      { userId: 'partner-2', userName: 'Thomas Martin', profitShare: 50 },
      { userId: 'partner-3', userName: 'Karim Benzara', profitShare: 50 },
    ],
    createdAt: new Date('2023-11-01'),
  },
]
