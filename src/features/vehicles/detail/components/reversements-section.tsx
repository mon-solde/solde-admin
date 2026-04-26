import { useState } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type Reversement } from '../../data/schema'
import { ReversementDrawer } from './reversement-drawer'

type ReversementsSectionProps = {
  reversements: Reversement[]
  vehicleId: string
  vehicleName: string
}

export function ReversementsSection({
  reversements,
  vehicleId,
  vehicleName,
}: ReversementsSectionProps) {
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null)
  const selectedReversement = reversements.find((r) => r.debtId === selectedDebtId) ?? null

  return (
    <>
      <div className='space-y-3'>
        <h3 className='font-semibold'>Reversements</h3>
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead className='text-end'>Dû</TableHead>
                <TableHead className='text-end'>Versé</TableHead>
                <TableHead className='text-end'>Reste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {reversements.map((r) => (
                <TableRow key={r.debtId}>
                  <TableCell className='font-medium'>
                    {r.recipientFirstName} {r.recipientLastName}
                  </TableCell>
                  <TableCell className='text-end'>
                    {r.amountDue.toLocaleString('fr-FR', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    €
                  </TableCell>
                  <TableCell className='text-end text-muted-foreground'>
                    {r.amountPaid.toLocaleString('fr-FR', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    €
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-end font-medium',
                      r.isSettled ? 'text-muted-foreground' : ''
                    )}
                  >
                    {r.isSettled
                      ? '—'
                      : `${r.remaining.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`}
                  </TableCell>
                  <TableCell>
                    {r.isSettled ? (
                      <Badge
                        variant='outline'
                        className='gap-1 border-green-200 bg-green-50 text-green-700'
                      >
                        <CheckCircle2 size={11} />
                        Soldé
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='gap-1 border-amber-200 bg-amber-50 text-amber-700'
                      >
                        <Clock size={11} />
                        En cours
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-end'>
                    {!r.isSettled && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setSelectedDebtId(r.debtId)}
                      >
                        Verser
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedReversement && (
        <ReversementDrawer
          open={!!selectedReversement}
          onOpenChange={(open) => {
            if (!open) setSelectedDebtId(null)
          }}
          reversement={selectedReversement}
          vehicleId={vehicleId}
          vehicleName={vehicleName}
        />
      )}
    </>
  )
}
