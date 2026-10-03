export interface Account {
  id: string
  name: string
  role: string
  initials: string
}

/** Comptes prédéfinis pour la démo des notifications. */
export const ACCOUNTS: Account[] = [
  { id: 'marie', name: 'Marie Recruteuse', role: 'Recrutement', initials: 'MR' },
  { id: 'paul', name: 'Paul Recruteur', role: 'Recrutement', initials: 'PR' },
  { id: 'lea', name: 'Léa Recruteuse', role: 'Recrutement', initials: 'LR' }
]

export function getAccount(id: string): Account {
  return ACCOUNTS.find((a) => a.id === id) ?? ACCOUNTS[0]
}
