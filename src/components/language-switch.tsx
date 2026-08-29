import { loadCatalog } from '@/i18n'
import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type LanguageOption = {
  code: string
  flag: string
  label: string
}

// Swap this default (or pass `languages` as a prop) to reuse this component
// in another project — nothing below depends on these specific codes.
const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
]

type LanguageSwitchProps = {
  languages?: LanguageOption[]
  // Defaults to this project's Lingui catalog loader — override to plug
  // this component into a different i18n setup without touching its internals.
  onSelectLanguage?: (code: string) => void
}

export function LanguageSwitch({
  languages = DEFAULT_LANGUAGES,
  onSelectLanguage = loadCatalog,
}: LanguageSwitchProps) {
  const { i18n } = useLingui()
  const current =
    languages.find((lang) => lang.code === i18n.locale) ?? languages[0]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='gap-1.5 rounded-full px-2'>
          <span className='text-base leading-none'>{current.flag}</span>
          <span className='text-xs font-medium'>
            {current.code.toUpperCase()}
          </span>
          <span className='sr-only'>{t`Changer de langue`}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onSelectLanguage(lang.code)}
          >
            <span className='text-base leading-none'>{lang.flag}</span>
            {lang.label}
            <Check
              size={14}
              className={cn('ms-auto', i18n.locale !== lang.code && 'hidden')}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
