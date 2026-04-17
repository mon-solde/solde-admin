import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { type Vehicle } from '../../data/schema'
import { type Expense } from '../../data/schema'

type DeclareSoldDialogProps = {
  vehicle: Vehicle
  expenses: Expense[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeclareSoldDialog({
  vehicle,
  expenses,
  open,
  onOpenChange,
}: DeclareSoldDialogProps) {
  const [salePrice, setSalePrice] = useState('')

  const totalInvested = expenses.reduce((sum, e) => sum + e.totalAmount, 0)
  const salePriceNum = parseFloat(salePrice) || 0
  const netProfit = salePriceNum - totalInvested

  const breakdown = vehicle.participants.map((p) => {
    const invested = expenses.reduce((sum, e) => {
      const payer = e.payers.find((pay) => pay.userId === p.userId)
      return sum + (payer?.amount ?? 0)
    }, 0)
    const profitShare = netProfit > 0 ? (netProfit * p.profitShare) / 100 : 0
    return {
      ...p,
      invested,
      profitShare: profitShare,
      total: invested + profitShare,
    }
  })

  const handleConfirm = () => {
    onOpenChange(false)
    setSalePrice('')
    // appel API ici plus tard
    console.log({ vehicleId: vehicle.id, salePrice: salePriceNum })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        if (!s) setSalePrice('')
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Déclarer la vente</DialogTitle>
          <DialogDescription>
            {vehicle.make} {vehicle.model} ({vehicle.year}) — Total investi :{' '}
            <span className='font-medium text-foreground'>
              {totalInvested.toLocaleString('fr-FR')} €
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='sale-price'>Prix de vente</Label>
            <div className='relative'>
              <Input
                id='sale-price'
                type='number'
                placeholder='0'
                step='0.01'
                className='pe-6'
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
              <span className='pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                €
              </span>
            </div>
          </div>

          {salePriceNum > 0 && (
            <>
              <Separator />

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <TrendingUp size={14} className={netProfit >= 0 ? 'text-green-600' : 'text-red-500'} />
                  <span className='text-sm font-medium'>
                    Bénéfice net :{' '}
                    <span className={netProfit >= 0 ? 'text-green-600' : 'text-red-500'}>
                      {netProfit >= 0 ? '+' : ''}
                      {netProfit.toLocaleString('fr-FR')} €
                    </span>
                  </span>
                </div>
              </div>

              <Separator />

              <div className='space-y-3'>
                <p className='text-sm font-medium'>Répartition</p>
                {breakdown.map((p) => (
                  <div
                    key={p.userId}
                    className='flex items-center justify-between rounded-md border p-3'
                  >
                    <div>
                      <p className='text-sm font-medium'>{p.userName}</p>
                      <p className='text-xs text-muted-foreground'>
                        Mise : {p.invested.toLocaleString('fr-FR')} € · Bénéf {p.profitShare}% :{' '}
                        {p.profitShare.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €
                      </p>
                    </div>
                    <span className='text-base font-bold'>
                      {p.total.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={!salePrice || salePriceNum <= 0}>
            Confirmer la vente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
