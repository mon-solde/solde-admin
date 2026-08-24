import type { LinguiConfig } from '@lingui/conf'

const config: LinguiConfig = {
  locales: ['fr', 'en'],
  sourceLocale: 'fr',
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['src'],
    },
  ],
}

export default config
