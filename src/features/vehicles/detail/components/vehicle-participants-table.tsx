import { Trans, useLingui } from '@lingui/react/macro'
import { Pencil } from 'lucide-react'
import { centsToEuros, formatEuros } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
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
import { type VehicleDetail } from '../../data/schema'

type VehicleParticipantsTableProps = {
  vehicle: VehicleDetail
  isSold: boolean
  onEditParticipants: () => void
}

export function VehicleParticipantsTable({
  vehicle,
  isSold,
  onEditParticipants,
}: VehicleParticipantsTableProps) {
  const { i18n, t } = useLingui()
  const { financialSummary } = vehicle

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold'>
          {isSold ? (
            <Trans>Répartition de la vente</Trans>
          ) : (
            <Trans>Participants</Trans>
          )}
        </h3>
        {!isSold && (
          <Button
            variant='outline'
            size='sm'
            className='gap-1'
            onClick={onEditParticipants}
          >
            <Pencil size={14} />
            <Trans>Modifier</Trans>
          </Button>
        )}
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Trans>Nom</Trans>
              </TableHead>
              <TableHead className='text-end'>
                <Trans>% bénéf.</Trans>
              </TableHead>
              <TableHead className='text-end'>
                <Trans>Investi</Trans>
              </TableHead>
              {isSold && (
                <TableHead className='text-end'>
                  <Trans>À recevoir</Trans>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className='font-medium'>{t`Vous`}</TableCell>
              <TableCell className='text-end'>
                <Badge variant='outline'>
                  {financialSummary.owner.profitShare}%
                </Badge>
              </TableCell>
              <TableCell className='text-end'>
                {formatEuros(
                  centsToEuros(financialSummary.owner.totalInvested),
                  i18n.locale
                )}
              </TableCell>
              {isSold && (
                <TableCell className='text-end font-medium text-green-600'>
                  {financialSummary.owner.amountToReceive !== null
                    ? formatEuros(
                        centsToEuros(financialSummary.owner.amountToReceive),
                        i18n.locale,
                        { maximumFractionDigits: 2 }
                      )
                    : '—'}
                </TableCell>
              )}
            </TableRow>
            {financialSummary.participants.map((p) => (
              <TableRow key={p.contactId}>
                <TableCell className='font-medium'>
                  {formatPersonName(p.firstName, p.lastName)}
                </TableCell>
                <TableCell className='text-end'>
                  <Badge variant='outline'>{p.profitShare}%</Badge>
                </TableCell>
                <TableCell className='text-end'>
                  {formatEuros(centsToEuros(p.totalInvested), i18n.locale)}
                </TableCell>
                {isSold && (
                  <TableCell className='text-end font-medium text-green-600'>
                    {p.amountToReceive !== null
                      ? formatEuros(
                          centsToEuros(p.amountToReceive),
                          i18n.locale,
                          {
                            maximumFractionDigits: 2,
                          }
                        )
                      : '—'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
