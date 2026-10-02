# Test Technique - Développeur Vue.js (Junior/Mid-Level)

---

> **⚠️ IMPORTANT - UTILISATION OBLIGATOIRE DE JSON SERVER**
> 
> Ce test technique nécessite l'utilisation de **JSON Server** pour fournir une API REST. 
> Le fichier `db.json` contenant toutes les données vous sera fourni.
> 
> **Votre application Vue.js DOIT :**
> - ✅ Consommer les données via l'API REST JSON Server
> - ✅ Effectuer des appels HTTP (GET, POST, PATCH, DELETE)
> - ❌ NE PAS utiliser de données mockées en dur dans le code
> - ✅ Gérer les états de chargement et les erreurs réseau
>
> **Lisez d'abord la section "Configuration JSON Server" avant de commencer !**

---

## Contexte
Vous êtes développeur Vue.js dans une entreprise qui développe des solutions de gestion de recrutement. Votre mission est d'améliorer l'interface de gestion des candidatures.

## Scénario
L'équipe produit a identifié que le flux actuel de tri et de filtrage des candidatures est peu performant et offre une mauvaise expérience utilisateur. Vous devez créer une interface moderne et performante pour résoudre ces problèmes.

---

## Mission

### Partie 0 : Configuration de l'environnement (15 min)

**Avant de commencer le développement :**

1. **Installer JSON Server** :
   ```bash
   npm install -g json-server
   # ou localement dans votre projet
   npm install --save-dev json-server
   ```

2. **Lancer l'API REST** :
   ```bash
   json-server --watch db.json --port 3000
   ```

3. **Vérifier que l'API fonctionne** :
   - Accéder à `http://localhost:3000`
   - Tester un endpoint : `http://localhost:3000/candidatures`

⚠️ **Important** : Votre application doit consommer UNIQUEMENT les données via cette API. Aucune donnée ne doit être codée en dur dans votre application Vue.js.

---

### Partie 1 : Analyse et Diagnostic (30-45 min)
Analysez les problèmes typiques que peuvent rencontrer les recruteurs :
- Volume important de candidatures à traiter
- Besoin de filtrer rapidement par compétences, expérience, statut
- Collaboration entre plusieurs recruteurs
- Suivi du parcours de chaque candidat

**Livrable :** Document listant les problématiques UX identifiées et votre approche technique pour les résoudre.

---

### Partie 2 : Développement de l'Interface (2-3 heures)

Créez une application Vue.js qui communique avec JSON Server pour :

#### Fonctionnalités obligatoires :

1. **Récupération et affichage des données via API** :
   - Charger les candidatures depuis `GET /candidatures`
   - Charger les statuts depuis `GET /statuts`
   - Charger les postes depuis `GET /postes`
   - Afficher un état de chargement pendant les requêtes
   - Gérer les erreurs réseau

2. **Liste de candidatures** avec :
   - Affichage des informations : nom, poste, statut, date de candidature
   - Système de filtres multiples (statut, compétences, date) utilisant les query params de JSON Server
   - Barre de recherche en temps réel (utilisant `?q=` de JSON Server)
   - Pagination (utilisant `_page` et `_limit` de JSON Server)

3. **Détail d'une candidature** :
   - Vue modale ou page dédiée
   - Chargement via `GET /candidatures/:id`
   - Affichage des informations complètes du candidat
   - Actions possibles : 
     - Changer le statut (PATCH `/candidatures/:id`)
     - Ajouter un commentaire (PATCH `/candidatures/:id`)

4. **Gestion d'état** :
   - Utiliser Pinia ou Vuex pour la gestion d'état
   - Stocker les données récupérées de l'API
   - Synchroniser l'état local avec l'API
   - Persister certaines préférences utilisateur (filtres actifs, vue préférée)

#### Fonctionnalités bonus (pour Mid-Level) :
- Drag & drop pour changer le statut des candidatures
- Système de notifications/alertes
- Mode sombre
- Tests unitaires (Vitest/Jest)
- Animations fluides (transitions Vue ou librairie)
- Optimistic UI updates
- Gestion du cache et refresh des données

---

### Partie 3 : Qualité du Code (1 heure)

Votre code doit démontrer :
- Structure de composants réutilisables
- Gestion propre des props et events
- Utilisation de Composition API (ou Options API avec justification)
- Responsive design (mobile-first)
- Accessibilité de base (ARIA, navigation clavier)
- Conventions de nommage claires
- Gestion d'erreurs robuste pour les appels API

---

## Stack Technique Attendue

**Obligatoire :**
- Vue 3
- **JSON Server** (fourni avec db.json) - OBLIGATOIRE pour les données
- TypeScript (fortement recommandé) ou JavaScript
- CSS (SCSS/Tailwind/styled-components au choix)
- Gestion d'état (Pinia/Vuex)
- Axios ou Fetch API pour les requêtes HTTP
- Gestion des erreurs réseau et états de chargement

**Optionnel :**
- Vue Router
- Vite
- ESLint + Prettier
- Composables personnalisés

---

## 🚀 Configuration JSON Server (À LIRE EN PREMIER)

### Étape 1 : Installation
```bash
# Installation globale (recommandée)
npm install -g json-server

# OU installation locale dans votre projet
npm install --save-dev json-server
```

### Étape 2 : Fichier de données
Le fichier `db.json` vous est fourni. Placez-le à la racine de votre projet.

### Étape 3 : Lancement du serveur
```bash
# Depuis le dossier contenant db.json
json-server --watch db.json --port 3000
```

Votre API REST sera accessible sur `http://localhost:3000`

### Étape 4 : Vérification
Ouvrez votre navigateur et testez :
- `http://localhost:3000` → Documentation auto-générée
- `http://localhost:3000/candidatures` → Liste des candidatures
- `http://localhost:3000/statuts` → Liste des statuts

✅ Si vous voyez les données en JSON, vous êtes prêt à commencer !

---

## 📡 Endpoints disponibles

Le fichier `db.json` fourni expose les endpoints suivants :

**Candidatures :**
- `GET /candidatures` - Liste toutes les candidatures
- `GET /candidatures/:id` - Détail d'une candidature
- `POST /candidatures` - Créer une candidature
- `PUT /candidatures/:id` - Modifier une candidature
- `PATCH /candidatures/:id` - Modifier partiellement
- `DELETE /candidatures/:id` - Supprimer une candidature

**Filtres et recherche :**
- `GET /candidatures?statut=En attente` - Filtrer par statut
- `GET /candidatures?poste=Développeur Vue.js` - Filtrer par poste
- `GET /candidatures?q=Vue.js` - Recherche full-text
- `GET /candidatures?_sort=dateCandidature&_order=desc` - Tri
- `GET /candidatures?_page=1&_limit=10` - Pagination

**Autres ressources :**
- `GET /statuts` - Liste des statuts possibles
- `GET /postes` - Liste des postes
- `GET /competences` - Liste des compétences

### Relations et expand
```bash
# Inclure les relations
GET /candidatures?_embed=commentaires
```

### Documentation complète
Une fois le serveur lancé, accédez à `http://localhost:3000` pour voir toutes les routes disponibles.

### 💡 Exemples d'utilisation dans votre code Vue.js

**Avec Axios :**
```javascript
// Récupérer toutes les candidatures
const response = await axios.get('http://localhost:3000/candidatures');

// Filtrer par statut
const response = await axios.get('http://localhost:3000/candidatures?statut=En attente');

// Recherche
const response = await axios.get('http://localhost:3000/candidatures?q=Vue.js');

// Modifier une candidature
await axios.patch('http://localhost:3000/candidatures/1', {
  statut: 'Entretien RH'
});

// Pagination
const response = await axios.get('http://localhost:3000/candidatures?_page=1&_limit=10');
```

**Avec Fetch API :**
```javascript
// Récupérer toutes les candidatures
const response = await fetch('http://localhost:3000/candidatures');
const candidatures = await response.json();

// Modifier une candidature
await fetch('http://localhost:3000/candidatures/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ statut: 'Entretien RH' })
});
```

---

## Structure de Données

### Candidature
```typescript
interface Candidature {
  id: number;
  nom: string;
  poste: string;
  statut: string;
  competences: string[];
  experience: string;
  dateCandidature: string; // ISO 8601
  email: string;
  telephone: string;
  cv: string; // URL
  lettreMotivation: string;
  salaireSouhaite: number;
  disponibilite: string;
  localisation: string;
  commentaires: Commentaire[];
}

interface Commentaire {
  id: number;
  auteur: string;
  date: string; // ISO 8601
  contenu: string;
}
```

---

## Livrables

1. **Repository GitHub** contenant :
   - Code source propre et commenté
   - **Fichier `db.json` fourni (OBLIGATOIRE)**
   - README.md avec :
     - ⚠️ **Instructions claires pour lancer JSON Server**
     - Instructions d'installation de l'application Vue.js
     - Commandes pour lancer l'API et l'application simultanément
     - Temps passé sur chaque partie
     - Choix techniques et justifications
     - Captures d'écran de l'interface
     - Liste des améliorations possibles si plus de temps
   - Package.json avec scripts pour faciliter le lancement (voir section ci-dessous)

2. **Document technique** (PDF ou Markdown) :
   - Architecture des composants (schéma simple)
   - **Stratégie de communication avec l'API REST**
   - Gestion de l'état et synchronisation avec JSON Server
   - Décisions techniques prises et pourquoi
   - Problèmes rencontrés et solutions trouvées
   - Points d'amélioration identifiés

3. **Démo fonctionnelle** :
   - Vidéo de démonstration (2-3 min) montrant :
     - Le lancement de JSON Server
     - Le fonctionnement de l'application
     - Les appels API (visible dans DevTools Network)
   - OU Application déployée (avec API hébergée)

---

## Scripts recommandés (package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "api": "json-server --watch db.json --port 3000",
    "start": "concurrently \"npm run api\" \"npm run dev\"",
    "build": "vite build",
    "test": "vitest"
  }
}
```

---

## Critères d'Évaluation

### Junior (40% technique / 60% compréhension)
- ✅ **JSON Server correctement configuré et utilisé**
- ✅ Code fonctionnel et lisible
- ✅ Composants bien structurés
- ✅ **Appels API fonctionnels (GET, PATCH au minimum)**
- ✅ Interface utilisable et cohérente
- ✅ **Gestion basique des états de chargement**
- ✅ **Gestion basique des erreurs réseau**
- ✅ Documentation claire du README

### Mid-Level (60% technique / 40% architecture)
- ✅ Tout ce qui précède +
- ✅ Architecture scalable et modulaire
- ✅ **Service/API layer bien structuré**
- ✅ **Utilisation avancée des query params JSON Server** (filtres, tri, pagination)
- ✅ Performance optimisée (debounce, lazy loading, cache)
- ✅ **Gestion sophistiquée des états de chargement et erreurs**
- ✅ **Optimistic UI updates**
- ✅ Tests unitaires (y compris mocking des appels API)
- ✅ Bonnes pratiques Vue.js avancées
- ✅ Code DRY et réutilisable

---

## Points d'Attention API

### Gestion des erreurs
Pensez à gérer :
- Erreurs réseau (serveur indisponible)
- Erreurs 404 (ressource non trouvée)
- Erreurs 500 (erreur serveur)
- Timeout de requêtes

### Performance
- Implémenter un système de debounce pour la recherche
- Utiliser la pagination pour limiter les données chargées
- Mettre en cache les données rarement modifiées (statuts, postes)

### UX
- Afficher un loader pendant les requêtes
- Afficher des messages d'erreur clairs
- Permettre un retry en cas d'échec
- Feedback visuel après les actions (succès/erreur)

---

## 🔧 Dépannage JSON Server

### Problème : "json-server: command not found"
**Solution :**
```bash
# Installer globalement
npm install -g json-server

# OU utiliser npx
npx json-server --watch db.json --port 3000
```

### Problème : Port 3000 déjà utilisé
**Solution :**
```bash
# Utiliser un autre port
json-server --watch db.json --port 3001

# Dans votre code, adapter l'URL
const API_URL = 'http://localhost:3001'
```

### Problème : CORS lors des requêtes
**Solution :** JSON Server gère automatiquement CORS. Si vous avez des problèmes :
```bash
json-server --watch db.json --port 3000 --middlewares ./middleware.js
```

### Problème : Modifications non persistées après redémarrage
**C'est normal !** JSON Server modifie le fichier db.json en temps réel. Si vous voulez garder les données originales :
```bash
# Faire une copie de sauvegarde
cp db.json db.backup.json
```

---

## Temps Estimé Total
- **Configuration JSON Server :** 15 minutes
- **Junior :** 4-5 heures (après configuration)
- **Mid-Level :** 5-6 heures avec bonus (après configuration)

**Note :** Le candidat doit indiquer le temps réel passé sur chaque partie, y compris la configuration de JSON Server.

---

## Questions Bonus (Entretien Technique)

Préparez-vous à discuter de :
1. Comment gérer 10 000 candidatures côté front-end ?
2. Quelle stratégie pour les mises à jour temps réel ?
3. Comment optimiser les appels API (cache, invalidation) ?
4. Comment tester les composants qui font des appels API ?
5. Accessibilité : quelles sont vos priorités ?
6. Comment gérer les états de chargement complexes ?

---

## Ressources

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Axios Documentation](https://axios-http.com/)

---

**Bonne chance ! 🚀**
