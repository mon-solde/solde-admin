import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSearchUsers, type UserSearchResult } from '../api/users-api'

type UserComboboxProps = {
  value: string
  onChange: (id: string) => void
}

export function UserCombobox({ value, onChange }: UserComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [debouncedName, setDebouncedName] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  )

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(inputValue), 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data: users = [], isFetching } = useSearchUsers(debouncedName)

  const handleSelect = (user: UserSearchResult) => {
    setSelectedUser(user)
    onChange(user.id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between font-normal'
        >
          {selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : 'Rechercher un utilisateur...'}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Prénom ou nom...'
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            {isFetching && (
              <div className='flex items-center justify-center py-4'>
                <Loader2 className='size-4 animate-spin text-muted-foreground' />
              </div>
            )}
            {!isFetching && debouncedName.length < 2 && (
              <CommandEmpty>Tapez au moins 2 caractères.</CommandEmpty>
            )}
            {!isFetching && debouncedName.length >= 2 && users.length === 0 && (
              <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
            )}
            <CommandGroup>
              {users.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelect(user)}>
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div>
                    <p className='text-sm font-medium'>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
