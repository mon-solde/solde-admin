import { useLingui } from '@lingui/react'
import { Check, Languages } from 'lucide-react'
import { loadCatalog } from '@/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitch() {
  const { i18n } = useLingui()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <Languages className='size-[1.2rem]' />
          <span className='sr-only'>Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => loadCatalog('fr')}>
          Français
          <Check
            size={14}
            className={cn('ms-auto', i18n.locale !== 'fr' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => loadCatalog('en')}>
          English
          <Check
            size={14}
            className={cn('ms-auto', i18n.locale !== 'en' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
