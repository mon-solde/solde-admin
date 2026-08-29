import { AxiosError } from 'axios'
import { t } from '@lingui/core/macro'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  let errMsg = t`Une erreur est survenue !`

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = t`Contenu introuvable.`
  }

  if (error instanceof AxiosError) {
    errMsg = error.response?.data?.message ?? errMsg
  }

  toast.error(errMsg)
}
