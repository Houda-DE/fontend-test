import type { Candidature, CandidatureInput, Statut } from '../src/types'

export const candidature: Candidature = {
  id: 1,
  nom: 'Sophie Martin',
  poste: 'Développeur Vue.js',
  statut: 'En attente',
  competences: ['Vue.js', 'TypeScript'],
  experience: '3 ans',
  dateCandidature: '2024-01-15T10:30:00Z',
  email: 'sophie.martin@email.com',
  telephone: '+33 6 12 34 56 78',
  cv: 'https://example.com/cv/sophie-martin.pdf',
  lettreMotivation: 'Passionnée par le développement web moderne.',
  salaireSouhaite: 45000,
  disponibilite: 'Immédiate',
  localisation: 'Paris, France',
  commentaires: []
}

export const autreCandidature: Candidature = {
  ...candidature,
  id: 2,
  nom: 'Thomas Dubois',
  poste: 'Développeur Frontend',
  statut: 'Entretien RH'
}

export const nouveauProfil: CandidatureInput = {
  nom: 'Emma Leroy',
  poste: 'Développeur Vue.js',
  statut: 'En attente',
  competences: ['Vue.js'],
  experience: '4 ans',
  dateCandidature: '2024-01-10T08:45:00Z',
  email: 'emma.leroy@email.com',
  telephone: '+33 6 34 56 78 90',
  cv: 'https://example.com/cv/emma-leroy.pdf',
  lettreMotivation: 'Prête à relever de nouveaux défis.',
  salaireSouhaite: 50000,
  disponibilite: '2 semaines',
  localisation: 'Bordeaux, France',
  commentaires: []
}

export const statuts: Statut[] = [
  { id: 2, nom: 'Entretien RH', couleur: '#3b82f6', ordre: 2 },
  { id: 1, nom: 'En attente', couleur: '#94a3b8', ordre: 1 },
  { id: 5, nom: 'Refusé', couleur: '#ef4444', ordre: 5 }
]

export function jsonResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  const { status = 200, headers = {} } = init
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  })
}