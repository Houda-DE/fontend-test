import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CandidateFilters from '../src/components/CandidateFilters.vue'
import CandidateList from '../src/components/CandidateList.vue'
import CandidateModal from '../src/components/CandidateModal.vue'
import StatusColumn from '../src/components/StatusColumn.vue'
import { defaultFilters } from '../src/stores/candidates'
import { autreCandidature, candidature, statuts } from './fixtures'

function dragEvent(type: string, id?: number) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as Event & {
    dataTransfer: { getData: (key: string) => string; dropEffect: string; effectAllowed: string }
  }
  Object.defineProperty(event, 'dataTransfer', {
    value: { getData: () => (id === undefined ? '' : String(id)), dropEffect: '', effectAllowed: '' }
  })
  return event
}

describe('CandidateList', () => {
  it('affiche les informations essentiales de chaque profil', () => {
    const wrapper = mount(CandidateList, { props: { candidates: [candidature, autreCandidature] } })

    expect(wrapper.text()).toContain('Sophie Martin')
    expect(wrapper.text()).toContain('Développeur Vue.js')
    expect(wrapper.text()).toContain('Entretien RH')
    expect(wrapper.text()).toContain('Vue.js · TypeScript')
  })

  it('émet l’identifiant du profil au clic', async () => {
    const wrapper = mount(CandidateList, { props: { candidates: [candidature] } })

    await wrapper.get('button.candidate').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[1]])
  })
})

describe('CandidateFilters', () => {
  const factory = () =>
    mount(CandidateFilters, {
      props: {
        filters: { ...defaultFilters },
        statuses: statuts,
        positions: [{ id: 1, titre: 'Développeur Vue.js', description: '', competencesRequises: [] }],
        skills: [{ id: 1, nom: 'Vue.js', categorie: 'Frontend' }]
      }
    })

  it('remonte la saisie de recherche sans muter les props', async () => {
    const wrapper = factory()

    await wrapper.get('#filter-search').setValue('Vue')

    expect(wrapper.emitted('search')).toEqual([['Vue']])
    expect(wrapper.props('filters').query).toBe('')
  })

  it('remonte chaque changement de filtre', async () => {
    const wrapper = factory()

    await wrapper.get('#filter-statut').setValue('Refusé')
    await wrapper.get('#filter-poste').setValue('Développeur Vue.js')
    await wrapper.get('#filter-competence').setValue('Vue.js')
    await wrapper.get('#filter-date').setValue('2024-01-20')
    await wrapper.get('.clear').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[{ statut: 'Refusé' }], [{ poste: 'Développeur Vue.js' }], [{ competence: 'Vue.js' }], [{ dateFrom: '2024-01-20' }]])
    expect(wrapper.emitted('reset')).toHaveLength(1)
  })
})

describe('CandidateModal', () => {
  const factory = () =>
    mount(CandidateModal, { props: { candidate: candidature, statuses: statuts, saving: false }, attachTo: document.body })

  it('se ferme avec la touche Échap', async () => {
    const wrapper = factory()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)
    wrapper.unmount()
  })

  it('n’émet le statut que s’il a changé', async () => {
    const wrapper = factory()
    const button = wrapper.get('.status-edit .button')
    expect(button.attributes('disabled')).toBeDefined()

    await wrapper.get('#modal-status').setValue('Refusé')
    await button.trigger('click')

    expect(wrapper.emitted('update-status')).toEqual([['Refusé']])
    wrapper.unmount()
  })

  it('ignore un commentaire vide et transmet le texte nettoyé', async () => {
    const wrapper = factory()

    await wrapper.get('.comment-form').trigger('submit')
    expect(wrapper.emitted('add-comment')).toBeUndefined()

    await wrapper.get('#comment').setValue('  À convoquer pour un entretien  ')
    await wrapper.get('.comment-form').trigger('submit')

    expect(wrapper.emitted('add-comment')).toEqual([['À convoquer pour un entretien']])
    wrapper.unmount()
  })
})

describe('StatusColumn', () => {
  const factory = () =>
    mount(StatusColumn, {
      props: { column: statuts[1], cards: [candidature], statuses: statuts, movingId: null }
    })

  it('dépose une carte déplacée dans la bonne colonne', async () => {
    const wrapper = factory()
    const column = wrapper.element

    column.dispatchEvent(dragEvent('dragover'))
    await wrapper.vm.$nextTick()
    expect(wrapper.classes()).toContain('drag-over')

    column.dispatchEvent(dragEvent('drop', 1))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('move')).toEqual([[1, statuts[1].nom]])
  })

  it('propose un clavier de déplacement accessible', async () => {
    const wrapper = factory()

    await wrapper.get('.board-card-move select').setValue('Refusé')

    expect(wrapper.emitted('move')).toEqual([[1, 'Refusé']])
  })

  it('ouvre le profil au clic sur la carte', async () => {
    const wrapper = factory()

    await wrapper.get('.board-card-open').trigger('click')

    expect(wrapper.emitted('select')).toEqual([[1]])
  })
})