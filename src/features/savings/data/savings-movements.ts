import { type SavingsMovement } from './schema'

export const savingsMovements: SavingsMovement[] = [
  {
    id: 'mov-1',
    kind: 'withdrawal',
    source: 'cash',
    amount: 200,
    label: 'Remboursement Golf 6',
    movementDate: new Date('2026-01-15'),
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'mov-2',
    kind: 'withdrawal',
    source: 'cash',
    amount: 100,
    label: 'Aide aspirateur maman',
    movementDate: new Date('2026-02-10'),
    createdAt: new Date('2026-02-10'),
  },
  {
    id: 'mov-3',
    kind: 'addition',
    source: 'cash',
    amount: 50,
    label: 'Argent trouvé / cadeau',
    movementDate: new Date('2026-03-20'),
    createdAt: new Date('2026-03-20'),
  },
]
