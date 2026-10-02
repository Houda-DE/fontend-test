export interface Commentaire {
  id: number
  auteur: string
  date: string
  contenu: string
}

export interface Candidature {
  id: number
  nom: string
  poste: string
  statut: string
  competences: string[]
  experience: string
  dateCandidature: string
  email: string
  telephone: string
  cv: string
  lettreMotivation: string
  salaireSouhaite: number
  disponibilite: string
  localisation: string
  commentaires: Commentaire[]
}

export type CandidatureInput = Omit<Candidature, 'id'>

export interface Statut {
  id: number
  nom: string
  couleur?: string
  ordre?: number
}

export interface Poste {
  id: number
  titre: string
  description: string
  competencesRequises: string[]
}

export interface Competence {
  id: number
  nom: string
  categorie: string
}

export interface Filters {
  query: string
  statut: string
  poste: string
  competence: string
  dateFrom: string
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

/** Query params acceptés par JSON Server sur `/candidatures`. */
export interface CandidatureQuery {
  q?: string
  statut?: string
  poste?: string
  competences_like?: string
  dateCandidature_gte?: string
  _page?: number
  _limit?: number
  _sort?: string
  _order?: 'asc' | 'desc'
}