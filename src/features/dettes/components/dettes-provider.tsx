import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Dette } from '../data/schema'

// 'update' commenté — pas d'endpoint backend pour l'instant
type DettesDialogType = 'create' | /* 'update' | */ 'delete' | 'remboursements'

type DettesContextType = {
  open: DettesDialogType | null
  setOpen: (str: DettesDialogType | null) => void
  currentRow: Dette | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Dette | null>>
}

const DettesContext = React.createContext<DettesContextType | null>(null)

export function DettesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DettesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Dette | null>(null)

  return (
    <DettesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </DettesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDettes = () => {
  const dettesContext = React.useContext(DettesContext)

  if (!dettesContext) {
    throw new Error('useDettes has to be used within <DettesContext>')
  }

  return dettesContext
}
