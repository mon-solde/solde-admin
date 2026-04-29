import { ArrowRight } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import type { ExpensePayer } from '../../data/schema'

type PayersCellProps = {
  payers: ExpensePayer[]
}

export function PayersCell({ payers }: PayersCellProps) {
  const delegations = payers.filter((p) => p.imputedToId)
  const summary =
    payers.length === 1 && delegations.length === 0
      ? `${payers[0].firstName} ${payers[0].amount.toLocaleString('fr-FR')} €`
      : delegations.length > 0
        ? `${payers.length} payeur${payers.length > 1 ? 's' : ''} (${delegations.length} délégation${delegations.length > 1 ? 's' : ''})`
        : `${payers.length} payeurs`

  if (payers.length === 1 && delegations.length === 0) {
    return (
      <span className='text-sm text-muted-foreground'>{summary}</span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='h-auto px-2 py-0.5 text-sm text-muted-foreground hover:text-foreground'
        >
          {summary}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto min-w-64 p-3'>
        <div className='space-y-2'>
          {payers.map((p, i) => (
            <div key={i} className='flex items-center gap-3 text-sm'>
              <span className='w-20 font-medium'>{p.firstName}</span>
              <span className='w-20 text-end tabular-nums'>
                {p.amount.toLocaleString('fr-FR')} €
              </span>
              {p.imputedToId && (
                <span className='flex items-center gap-1 text-muted-foreground'>
                  <ArrowRight size={12} />
                  pour {p.imputedToFirstName}
                </span>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
