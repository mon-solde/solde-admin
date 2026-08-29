import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { type MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetDir } = useDirection()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()
  const { t } = useLingui()

  const handleReset = () => {
    setOpen(true)
    resetDir()
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label={t`Ouvrir les paramètres d'apparence`}
          aria-describedby='config-drawer-description'
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>
            <Trans>Paramètres d'apparence</Trans>
          </SheetTitle>
          <SheetDescription id='config-drawer-description'>
            <Trans>
              Ajustez l'apparence et la mise en page selon vos préférences.
            </Trans>
          </SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4'>
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label={t`Réinitialiser tous les paramètres par défaut`}
          >
            <Trans>Réinitialiser</Trans>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  const { t } = useLingui()
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={t`Sélectionner ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={t`Aperçu de l'option ${item.label}`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

const THEME_ITEMS: {
  value: string
  label: MessageDescriptor
  icon: typeof IconThemeSystem
}[] = [
  {
    value: 'system',
    label: msg`Système`,
    icon: IconThemeSystem,
  },
  {
    value: 'light',
    label: msg`Clair`,
    icon: IconThemeLight,
  },
  {
    value: 'dark',
    label: msg`Sombre`,
    icon: IconThemeDark,
  },
]

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  const { i18n, t } = useLingui()
  return (
    <div>
      <SectionTitle
        title={t`Thème`}
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t`Sélectionner le thème`}
        aria-describedby='theme-description'
      >
        {THEME_ITEMS.map((item) => (
          <RadioGroupItem
            key={item.value}
            item={{ ...item, label: i18n._(item.label) }}
            isTheme
          />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        <Trans>Choisissez entre système, clair, ou sombre</Trans>
      </div>
    </div>
  )
}

const SIDEBAR_ITEMS: {
  value: string
  label: MessageDescriptor
  icon: typeof IconSidebarInset
}[] = [
  {
    value: 'inset',
    label: msg`Encastrée`,
    icon: IconSidebarInset,
  },
  {
    value: 'floating',
    label: msg`Flottante`,
    icon: IconSidebarFloating,
  },
  {
    value: 'sidebar',
    label: msg`Standard`,
    icon: IconSidebarSidebar,
  },
]

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  const { i18n, t } = useLingui()
  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={t`Barre latérale`}
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t`Sélectionner le style de la barre latérale`}
        aria-describedby='sidebar-description'
      >
        {SIDEBAR_ITEMS.map((item) => (
          <RadioGroupItem
            key={item.value}
            item={{ ...item, label: i18n._(item.label) }}
          />
        ))}
      </Radio>
      <div id='sidebar-description' className='sr-only'>
        <Trans>
          Choisissez entre encastrée, flottante, ou barre latérale standard
        </Trans>
      </div>
    </div>
  )
}

const LAYOUT_ITEMS: {
  value: string
  label: MessageDescriptor
  icon: typeof IconLayoutDefault
}[] = [
  {
    value: 'default',
    label: msg`Par défaut`,
    icon: IconLayoutDefault,
  },
  {
    value: 'icon',
    label: msg`Compacte`,
    icon: IconLayoutCompact,
  },
  {
    value: 'offcanvas',
    label: msg`Complète`,
    icon: IconLayoutFull,
  },
]

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()
  const { i18n, t } = useLingui()

  const radioState = open ? 'default' : collapsible

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title={t`Mise en page`}
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t`Sélectionner le style de mise en page`}
        aria-describedby='layout-description'
      >
        {LAYOUT_ITEMS.map((item) => (
          <RadioGroupItem
            key={item.value}
            item={{ ...item, label: i18n._(item.label) }}
          />
        ))}
      </Radio>
      <div id='layout-description' className='sr-only'>
        <Trans>
          Choisissez entre étendue par défaut, icônes compactes, ou mise en page
          complète
        </Trans>
      </div>
    </div>
  )
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  const { i18n, t } = useLingui()

  const items: {
    value: string
    label: MessageDescriptor
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }[] = [
    {
      value: 'ltr',
      label: msg`Gauche à droite`,
      icon: (props: SVGProps<SVGSVGElement>) => (
        <IconDir dir='ltr' {...props} />
      ),
    },
    {
      value: 'rtl',
      label: msg`Droite à gauche`,
      icon: (props: SVGProps<SVGSVGElement>) => (
        <IconDir dir='rtl' {...props} />
      ),
    },
  ]

  return (
    <div>
      <SectionTitle
        title={t`Direction`}
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label={t`Sélectionner le sens de lecture du site`}
        aria-describedby='direction-description'
      >
        {items.map((item) => (
          <RadioGroupItem
            key={item.value}
            item={{ ...item, label: i18n._(item.label) }}
          />
        ))}
      </Radio>
      <div id='direction-description' className='sr-only'>
        <Trans>
          Choisissez entre le sens de lecture gauche-à-droite ou droite-à-gauche
        </Trans>
      </div>
    </div>
  )
}
