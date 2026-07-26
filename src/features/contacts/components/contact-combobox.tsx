import { useMemo, useState } from 'react'
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
import { useGetContacts } from '../api/contacts-api'
import { type Contact } from '../data/schema'

type ContactComboboxProps = {
  value: string
  onChange: (id: string) => void
}

export function ContactCombobox({ value, onChange }: ContactComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { data: contacts = [], isFetching } = useGetContacts()

  const selectedContact = contacts.find((c) => c.id === value) ?? null

  const filtered = useMemo(() => {
    const query = inputValue.trim().toLowerCase()
    if (!query) return contacts
    return contacts.filter((c) =>
      `${c.firstName} ${c.lastName ?? ''}`.toLowerCase().includes(query)
    )
  }, [contacts, inputValue])

  const handleSelect = (contact: Contact) => {
    onChange(contact.id)
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
          {selectedContact
            ? `${selectedContact.firstName} ${selectedContact.lastName ?? ''}`
            : 'Rechercher un contact...'}
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
            {!isFetching && filtered.length === 0 && (
              <CommandEmpty>Aucun contact trouvé.</CommandEmpty>
            )}
            <CommandGroup>
              {filtered.map((contact) => (
                <CommandItem
                  key={contact.id}
                  onSelect={() => handleSelect(contact)}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4',
                      value === contact.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <p className='text-sm font-medium'>
                    {contact.firstName} {contact.lastName ?? ''}
                  </p>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
