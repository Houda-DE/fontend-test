import { api } from '../services/api'
import { ACCOUNTS } from '../accounts'

/** Envoie une notification à tous les comptes sauf l'auteur courant. */
export async function notifyAccounts(
  type: 'nouvelle-candidature' | 'nouveau-poste' | 'statut-mis-a-jour',
  message: string
): Promise<void> {
  let current = 'marie'
  try {
    current = localStorage.getItem('talentflow-account') ?? 'marie'
  } catch { /* stockage indisponible */ }
  const date = new Date().toISOString()
  await Promise.allSettled(
    ACCOUNTS.filter((a) => a.id !== current).map((a) =>
      api.createNotification({ utilisateur: a.id, type, message, date, lue: false })
    )
  )
}
