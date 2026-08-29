import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  ignore: ['src/components/ui/**', 'src/tanstack-table.d.ts', 'lingui.config.ts'],
  // Only imported from src/components/ui/**, which is excluded above, so
  // knip can't see them being used — they're not actually dead.
  ignoreDependencies: [
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    'input-otp',
    'react-day-picker',
  ],
}

export default config