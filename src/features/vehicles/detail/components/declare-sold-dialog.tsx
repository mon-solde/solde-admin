import { useState } from 'react'
import { Info, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { centsToEuros, eurosToCents } from '@/lib/money'
import { formatPersonName } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { DecimalInput } from '@/components/ui/decimal-input'
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

type ProfitShareBeneficiary = { contactId: string; profitShare: number }

// A sale in profit is split proportionally to ownership (profitShare) — the
// more of the car someone owns, the more of the gain they get. A deficit is
// split equally instead: an unexpected loss isn't scaled by ownership,
// everyone bears the same amount regardless of profitShare or what they
// personally invested. Either way, rounding each share to the nearest cent
// independently can leave the shares a cent or two short of (or over) the
// total — the last beneficiary absorbs that remainder so shares always sum
// back to the exact amount (mirrors profit-sharing.ts on the backend, which
// computes the real settlement this only previews).
function computeProfitShares(
  profit: number,
  beneficiaries: ProfitShareBeneficiary[]
): Map<string, number> {
  if (beneficiaries.length === 0) return new Map()

  const amount = Math.abs(profit)
  const sign = profit >= 0 ? 1 : -1
  const rawShares =
    profit >= 0
      ? beneficiaries.map((b) => Math.round((amount * b.profitShare) / 100))
      : beneficiaries.map(() => Math.round(amount / beneficiaries.length))
  const remainder = amount - rawShares.reduce((sum, cents) => sum + cents, 0)

  return new Map(
    beneficiaries.map((b, index) => [
      b.contactId,
      sign *
        (rawShares[index] +
          (index === beneficiaries.length - 1 ? remainder : 0)),
    ])
  )
}

function formatSettlementAmount(total: number): string {
  const amount = Math.abs(total).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })
  return total < 0 ? `− ${amount} €` : `${amount} €`
}

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
  // financialSummary is in cents (from the API) — the user types euros, so
  // every computation below (profit, shares, breakdowns) works in cents,
  // only converted back to euros at display time.
  const salePriceNum = Number.isNaN(salePrice) ? 0 : salePrice
  const bankSplitNum = Number.isNaN(bankSplit) ? 0 : bankSplit
  const salePriceCents = eurosToCents(salePriceNum)
  const bankSplitCents = eurosToCents(bankSplitNum)
  const cashComputedCents = Math.max(0, salePriceCents - bankSplitCents)
  const profit =
    salePriceCents > 0 ? salePriceCents - financialSummary.totalExpenses : null
  const isDeficit = profit !== null && profit < 0

  const profitShareBeneficiaries: ProfitShareBeneficiary[] = [
    ...vehicle.participants.map((p) => ({
      contactId: p.contactId,
      profitShare: p.profitShare,
    })),
    ...(financialSummary.owner.profitShare > 0.001
      ? [
          {
            contactId: ownerId,
            profitShare: financialSummary.owner.profitShare,
          },
        ]
      : []),
  ]
  const profitShareById =
    profit !== null
      ? computeProfitShares(profit, profitShareBeneficiaries)
      : new Map<string, number>()

  // invested/profitAmount/total are converted to euros here, once, since
  // everything below this point is display-only.
  const breakdown = vehicle.participants.map((p) => {
    const invested =
      financialSummary.participants.find((s) => s.contactId === p.contactId)
        ?.totalInvested ?? 0
    const profitAmount = profitShareById.get(p.contactId) ?? 0
    return {
      ...p,
      invested: centsToEuros(invested),
      profitAmount: centsToEuros(profitAmount),
      total: centsToEuros(invested + profitAmount),
    }
  })

  const ownerProfitAmount = profitShareById.get(ownerId) ?? 0
  const ownerBreakdown = {
    invested: centsToEuros(financialSummary.owner.totalInvested),
    profitAmount: centsToEuros(ownerProfitAmount),
    total: centsToEuros(
      financialSummary.owner.totalInvested + ownerProfitAmount
    ),
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
        { salePrice: salePriceCents, soldAt, cashierId },
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
        ? salePriceCents
        : sourceType === 'CASH'
          ? 0
          : bankSplitCents
    const cashAmount =
      sourceType === 'CASH'
        ? salePriceCents
        : sourceType === 'BANK'
          ? 0
          : cashComputedCents

    declareSale(
      { salePrice: salePriceCents, soldAt, cashierId, bankAmount, cashAmount },
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
              {centsToEuros(financialSummary.totalExpenses).toLocaleString('fr-FR')} €
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
                      {centsToEuros(cashComputedCents).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  {vehicle.participants.length > 0 && (
                    <div className='flex items-start gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground'>
                      <Info size={14} className='mt-0.5 shrink-0' />
                      <span>
                        Comme l&apos;argent est réparti entre banque et espèces,
                        votre épargne comptera votre part entièrement en banque
                        par défaut. Une fois la répartition réelle connue avec
                        les autres participants, corrigez si besoin avec un
                        mouvement manuel dans l&apos;épargne.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {salePriceNum > 0 && (
            <>
              <Separator />

              <div className='flex items-center gap-2'>
                {isDeficit ? (
                  <TrendingDown size={14} className='text-red-500' />
                ) : (
                  <TrendingUp size={14} className='text-green-600' />
                )}
                <span className='text-sm font-medium'>
                  {isDeficit ? 'Déficit : ' : 'Bénéfice net : '}
                  <span
                    className={isDeficit ? 'text-red-500' : 'text-green-600'}
                  >
                    {profit !== null
                      ? isDeficit
                        ? `${centsToEuros(Math.abs(profit)).toLocaleString('fr-FR')} €`
                        : `+${centsToEuros(profit).toLocaleString('fr-FR')} €`
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
                  <span
                    className={`text-base font-bold ${ownerBreakdown.total < 0 ? 'text-red-500' : ''}`}
                  >
                    {formatSettlementAmount(ownerBreakdown.total)}
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
                    <span
                      className={`text-base font-bold ${p.total < 0 ? 'text-red-500' : ''}`}
                    >
                      {formatSettlementAmount(p.total)}
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
