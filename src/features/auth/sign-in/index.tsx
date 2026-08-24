import { useSearch } from '@tanstack/react-router'
import { Trans } from '@lingui/react/macro'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            <Trans>Connexion</Trans>
          </CardTitle>
          <CardDescription>
            <Trans>
              Entrez votre email et votre mot de passe pour vous connecter à
              votre compte.
            </Trans>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <p className='px-8 text-center text-sm text-muted-foreground'>
            <Trans>
              En cliquant sur connexion, vous acceptez nos{' '}
              <a
                href='/terms'
                className='underline underline-offset-4 hover:text-primary'
              >
                Conditions d&apos;utilisation
              </a>{' '}
              et notre{' '}
              <a
                href='/privacy'
                className='underline underline-offset-4 hover:text-primary'
              >
                Politique de confidentialité
              </a>
              .
            </Trans>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
