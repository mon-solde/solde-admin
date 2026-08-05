import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DecimalInput } from '@/components/ui/decimal-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useDeclareSale } from '../../api/vehicles-api'
import { type VehicleDetail } from '../../data/schema'

type SourceType = 'BANK' | 'CASH' | 'BOTH'

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
  const [salePrice, setSalePrice] = useState<number>(NaN)
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split('T')[0])
  const [cashierId, setCashierId] = useState('')
  const [sourceType, setSourceType] = useState<SourceType | null>(null)
  const [bankSplit, setBankSplit] = useState<number>(NaN)
  const { mutate: declareSale, isPending } = useDeclareSale(vehicle.id)
  const { auth } = useAuthStore()
  const ownerId = auth.user?.accountNo ?? ''
  const cashierOptions = [
    { contactId: ownerId, firstName: 'Vous', lastName: null as string | null },
    ...vehicle.participants,
  ]
  const cashierIsOwner = cashierId === ownerId

  const { financialSummary } = vehicle
  const salePriceNum = Number.isNaN(salePrice) ? 0 : salePrice
  const bankSplitNum = Number.isNaN(bankSplit) ? 0 : bankSplit
  const cashComputed = Math.max(0, salePriceNum - bankSplitNum)
  const profit =
    salePriceNum > 0 ? salePriceNum - financialSummary.totalExpenses : null

  const breakdown = vehicle.participants.map((p) => {
    const invested =
      financialSummary.participants.find((s) => s.contactId === p.contactId)
        ?.totalInvested ?? 0
    const profitAmount =
      profit !== null && profit > 0 ? (profit * p.profitShare) / 100 : 0
    return {
      ...p,
      invested,
      profitAmount,
      total: invested + profitAmount,
    }
  })

  const ownerProfitAmount =
    profit !== null && profit > 0
      ? (profit * financialSummary.owner.profitShare) / 100
      : 0
  const ownerBreakdown = {
    invested: financialSummary.owner.totalInvested,
    profitAmount: ownerProfitAmount,
    total: financialSummary.owner.totalInvested + ownerProfitAmount,
  }

  const reset = () => {
    setSalePrice(NaN)
    setSoldAt(new Date().toISOString().split('T')[0])
    setCashierId('')
    setSourceType(null)
    setBankSplit(NaN)
  }

  const handleConfirm = () => {
    if (!cashierId) {
      toast.error('Sélectionnez qui a encaissé la vente.')
      return
    }

    if (!cashierIsOwner) {
      declareSale(
        { salePrice: salePriceNum, soldAt, cashierId },
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
      return
    }

    if (!sourceType) {
      toast.error("Veuillez indiquer où est allé l'argent.")
      return
    }

    if (
      sourceType === 'BOTH' &&
      (bankSplitNum <= 0 || bankSplitNum >= salePriceNum)
    ) {
      toast.error(
        'Le montant Banque doit être compris entre 0 et le prix de vente.'
      )
      return
    }

    const bankAmount =
      sourceType === 'BANK'
        ? salePriceNum
        : sourceType === 'CASH'
          ? 0
          : bankSplitNum
    const cashAmount =
      sourceType === 'CASH'
        ? salePriceNum
        : sourceType === 'BANK'
          ? 0
          : cashComputed

    declareSale(
      { salePrice: salePriceNum, soldAt, cashierId, bankAmount, cashAmount },
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
              <DecimalInput
                id='sale-price'
                placeholder='0'
                className='pe-6'
                value={salePrice}
                onChange={setSalePrice}
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
            <Label>Qui a encaissé ?</Label>
            <Select
              value={cashierId}
              onValueChange={(v) => {
                setCashierId(v)
                setSourceType(null)
                setBankSplit(NaN)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Sélectionner un participant' />
              </SelectTrigger>
              <SelectContent>
                {cashierOptions.map((p) => (
                  <SelectItem key={p.contactId} value={p.contactId}>
                    {formatPersonName(p.firstName, p.lastName)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {cashierIsOwner && (
            <div className='space-y-2'>
              <Label>Où est allé l&apos;argent ?</Label>
              <Select
                value={sourceType ?? ''}
                onValueChange={(v) => setSourceType(v as SourceType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sélectionner' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='BANK'>Banque</SelectItem>
                  <SelectItem value='CASH'>Espèces</SelectItem>
                  <SelectItem value='BOTH'>Les deux</SelectItem>
                </SelectContent>
              </Select>

              {sourceType === 'BOTH' && (
                <div className='space-y-2 rounded-md border p-3'>
                  <Label htmlFor='bank-split'>Montant reçu en banque</Label>
                  <div className='relative'>
                    <DecimalInput
                      id='bank-split'
                      placeholder='0'
                      className='pe-6'
                      value={bankSplit}
                      onChange={setBankSplit}
                    />
                    <span className='pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                      €
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm text-muted-foreground'>
                    <span>Espèces</span>
                    <span className='font-medium text-foreground'>
                      {cashComputed.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {salePriceNum > 0 && (
            <>
              <Separator />

              <div className='flex items-center gap-2'>
                <TrendingUp
                  size={14}
                  className={
                    profit !== null && profit >= 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  }
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
                <div className='flex items-center justify-between rounded-md border bg-muted/40 p-3'>
                  <div>
                    <p className='text-sm font-medium'>Vous</p>
                    <p className='text-xs text-muted-foreground'>
                      Mise : {ownerBreakdown.invested.toLocaleString('fr-FR')} €
                      · Bénéf :{' '}
                      {ownerBreakdown.profitAmount.toLocaleString('fr-FR', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      €
                    </p>
                  </div>
                  <span className='text-base font-bold'>
                    {ownerBreakdown.total.toLocaleString('fr-FR', {
                      maximumFractionDigits: 2,
                    })}{' '}
                    €
                  </span>
                </div>
                {breakdown.map((p) => (
                  <div
                    key={p.contactId}
                    className='flex items-center justify-between rounded-md border p-3'
                  >
                    <div>
                      <p className='text-sm font-medium'>
                        {formatPersonName(p.firstName, p.lastName)}
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
