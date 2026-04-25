import { faker } from '@faker-js/faker'

faker.seed(54321)

export const dettes = Array.from({ length: 30 }, () => {
  const types = ['prêté', 'emprunté'] as const
  const statuses = ['en cours', 'remboursé'] as const

  const amount = parseFloat(
    faker.finance.amount({ min: 50, max: 2000, dec: 2 })
  )

  const nbRemboursements = faker.number.int({ min: 0, max: 4 })
  const remboursements = Array.from({ length: nbRemboursements }, () => ({
    id: `RMB-${faker.number.int({ min: 1000, max: 9999 })}`,
    amount: parseFloat(
      faker.finance.amount({ min: 10, max: amount / 2, dec: 2 })
    ),
    date: faker.date.past({ years: 1 }),
    note: faker.helpers.maybe(() => faker.lorem.sentence({ min: 2, max: 6 }), {
      probability: 0.4,
    }),
  }))

  return {
    id: `DETTE-${faker.number.int({ min: 1000, max: 9999 })}`,
    person: faker.person.fullName(),
    amount,
    type: faker.helpers.arrayElement(types),
    status: faker.helpers.arrayElement(statuses),
    date: faker.date.past({ years: 2 }),
    description: faker.helpers.maybe(
      () => faker.lorem.sentence({ min: 3, max: 10 }),
      { probability: 0.6 }
    ),
    remboursements,
  }
})
