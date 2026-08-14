import {
  PiggyBank,
  Repeat,
  Wallet,
  Users,
  Car,
  Handshake,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Budget mensuel',
          url: '/budget',
          icon: Wallet,
        },
        {
          title: 'Charges récurrentes',
          url: '/subscriptions',
          icon: Repeat,
        },
        {
          title: 'Dettes',
          url: '/dettes',
          icon: Handshake,
        },
        {
          title: 'Épargne',
          url: '/savings',
          icon: PiggyBank,
        },
        {
          title: 'Véhicules',
          url: '/vehicles',
          icon: Car,
        },
        {
          title: 'Mes contacts',
          url: '/contacts',
          icon: Users,
        },
      ],
    },
  ],
}
