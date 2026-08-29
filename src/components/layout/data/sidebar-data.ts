import { msg } from '@lingui/core/macro'
import { PiggyBank, Repeat, Wallet, Users, Car, Handshake } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: msg`Général`,
      items: [
        {
          title: msg`Budget mensuel`,
          url: '/budget',
          icon: Wallet,
        },
        {
          title: msg`Charges récurrentes`,
          url: '/subscriptions',
          icon: Repeat,
        },
        {
          title: msg`Dettes`,
          url: '/dettes',
          icon: Handshake,
        },
        {
          title: msg`Épargne`,
          url: '/savings',
          icon: PiggyBank,
        },
        {
          title: msg`Véhicules`,
          url: '/vehicles',
          icon: Car,
        },
        {
          title: msg`Mes contacts`,
          url: '/contacts',
          icon: Users,
        },
      ],
    },
  ],
}
