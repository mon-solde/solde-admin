import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDeclareSale } from '../../api/vehicles-api'
import { type VehicleDetail } from '../../data/schema'

type DeclareSoldDialogProps = {
  vehicle: VehicleDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeclareSoldDialog({
  vehicle,
  open,
  onOpenChange,
}: DeclareSoldDialogProps) {
  const [salePrice, setSalePrice] = useState('')
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split('T')[0])
  const [cashierId, setCashierId] = useState('')
  const [source, setSource] = useState<'BANK' | 'CASH'>('BANK')
  const { mutate: declareSale, isPending } = useDeclareSale(vehicle.id)

  const { financialSummary } = vehicle
  const salePriceNum = parseFloat(salePrice) || 0
  const profit =
    salePriceNum > 0
      ? salePriceNum - financialSummary.totalExpenses
      : null

  const breakdown = vehicle.participants.map((p) => {
    const invested = financialSummary.participants.find(
      (s) => s.userId === p.userId
    )?.totalInvested ?? 0
    const profitAmount = profit !== null && profit > 0
      ? (profit * p.profitShare) / 100
      : 0
    return {
      ...p,
      invested,
      profitAmount,
      total: invested + profitAmount,
    }
  })

  const reset = () => {
    setSalePrice('')
    setSoldAt(new Date().toISOString().split('T')[0])
    setCashierId('')
    setSource('BANK')
  }

  const handleConfirm = () => {
    if (!cashierId) {
      toast.error('Sélectionnez qui a encaissé la vente.')
      return
    }
    declareSale(
      { salePrice: salePriceNum, soldAt, cashierId, source },
      {
        onSuccess: () => {
          toast.success('Vente déclarée.')
          reset()
          onOpenChange(false)
        },
        onError: (error: any) =>
          toast.error(
            error?.response?.data?.message ?? 'Une erreur est survenue.'
          ),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(s) => {
        if (!s) reset()
        onOpenChange(s)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Déclarer la vente</DialogTitle>
          <DialogDescription>
            {vehicle.name} — Total investi :{' '}
            <span className='font-medium text-foreground'>
              {financialSummary.totalExpenses.toLocaleString('fr-FR')} €
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

          <div className='space-y-2'>
            <Label htmlFor='sold-at'>Date de vente</Label>
            <Input
              id='sold-at'
              type='date'
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label>Où est allé l&apos;argent ?</Label>
            <Select value={source} onValueChange={(v) => setSource(v as 'BANK' | 'CASH')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='BANK'>Banque</SelectItem>
                <SelectItem value='CASH'>Espèces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label>Qui a encaissé ?</Label>
            <Select value={cashierId} onValueChange={setCashierId}>
              <SelectTrigger>
                <SelectValue placeholder='Sélectionner un participant' />
              </SelectTrigger>
              <SelectContent>
                {vehicle.participants.map((p) => (
                  <SelectItem key={p.userId} value={p.userId}>
                    {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {salePriceNum > 0 && (
            <>
              <Separator />

              <div className='flex items-center gap-2'>
                <TrendingUp
                  size={14}
                  className={profit !== null && profit >= 0 ? 'text-green-600' : 'text-red-500'}
                />
                <span className='text-sm font-medium'>
                  Bénéfice net :{' '}
                  <span
                    className={
                      profit !== null && profit >= 0
                        ? 'text-green-600'
                        : 'text-red-500'
                    }
                  >
                    {profit !== null
                      ? `${profit >= 0 ? '+' : ''}${profit.toLocaleString('fr-FR')} €`
                      : '—'}
                  </span>
                </span>
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
                      <p className='text-sm font-medium'>
                        {p.firstName} {p.lastName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Mise : {p.invested.toLocaleString('fr-FR')} € · Bénéf :{' '}
                        {p.profitAmount.toLocaleString('fr-FR', {
                          maximumFractionDigits: 2,
                        })}{' '}
                        €
                      </p>
                    </div>
                    <span className='text-base font-bold'>
                      {p.total.toLocaleString('fr-FR', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      €
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
          <Button
            onClick={handleConfirm}
            disabled={!salePrice || salePriceNum <= 0 || isPending}
          >
            {isPending ? 'Enregistrement…' : 'Confirmer la vente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
