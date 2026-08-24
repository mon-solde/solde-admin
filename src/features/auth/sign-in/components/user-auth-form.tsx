import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Trans, useLingui } from '@lingui/react/macro'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { firebaseAuth } from '@/lib/firebase'
import { cn } from '@/lib/utils'
// import { IconFacebook, IconGithub } from '@/assets/brand-icons'
// import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

// `redirectTo` comes straight from the URL, so it must never be trusted as
// a navigation target as-is — a crafted link like
// /sign-in?redirect=https://phishing-site.com would otherwise send a user
// who just entered their password straight to an attacker's page. Only a
// same-app relative path is allowed, and never back to /sign-in itself
// (which would just bounce the user right back).
function isSafeRedirect(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.startsWith('/sign-in')
  )
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { t } = useLingui()

  // Rebuilt whenever the active language changes (`t` changes identity on
  // every locale switch) — otherwise these messages would stay frozen in
  // whichever language was active when the component first rendered, since
  // this object is normally only ever built once.
  const formSchema = useMemo(
    () =>
      z.object({
        email: z.email({
          error: (iss) =>
            iss.input === '' ? t`Veuillez saisir votre email` : undefined,
        }),
        password: z
          .string()
          .min(1, t`Veuillez saisir votre mot de passe`)
          .min(7, t`Le mot de passe doit contenir au moins 7 caractères`),
      }),
    [t]
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        data.email,
        data.password
      )
      const idToken = await credential.user.getIdToken()

      auth.setUser({
        accountNo: credential.user.uid,
        email: credential.user.email!,
        role: ['user'],
        exp: Date.now() + 60 * 60 * 1000,
      })
      auth.setAccessToken(idToken)

      const target = redirectTo && isSafeRedirect(redirectTo) ? redirectTo : '/'
      navigate({ to: target, replace: true })
      toast.success(t`Bienvenue !`)
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/network-request-failed') {
          toast.error(t`Erreur réseau. Vérifiez votre connexion.`)
        } else if (error.code === 'auth/too-many-requests') {
          toast.error(t`Trop de tentatives. Réessayez plus tard.`)
        } else if (
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found'
        ) {
          toast.error(t`Email ou mot de passe incorrect.`)
        } else {
          toast.error(t`Erreur: ${error.code}`)
        }
      } else {
        toast.error(t`Une erreur inattendue est survenue.`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder='name@example.com'
                  autoCapitalize='none'
                  autoCorrect='off'
                  autoComplete='email'
                  inputMode='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Mot de passe</Trans>
              </FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          <Trans>Se connecter</Trans>
        </Button>

        {/* Or continue with (GitHub/Facebook) — commented out, not needed
        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={isLoading}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
        */}
      </form>
    </Form>
  )
}
