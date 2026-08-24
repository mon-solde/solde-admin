import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { t } from '@lingui/core/macro'

export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

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
    errMsg = error.response?.data.title
  }

  toast.error(errMsg)
}
