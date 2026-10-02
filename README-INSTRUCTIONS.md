# Test Technique Vue.js - Instructions de Démarrage

## 📦 Contenu du Package

Ce package contient :
- `test-technique-vuejs.md` - Le document complet du test technique
- `db.json` - La base de données JSON à utiliser avec JSON Server

## 🚀 Démarrage Rapide

### 1. Lire le Test Technique
Ouvrez et lisez **entièrement** le fichier `test-technique-vuejs.md` avant de commencer.

### 2. Installer JSON Server
```bash
npm install -g json-server
```

### 3. Lancer l'API
```bash
json-server --watch db.json --port 3000
```

### 4. Vérifier que ça fonctionne
Ouvrez votre navigateur à `http://localhost:3000` - vous devriez voir la documentation de l'API.

Testez un endpoint : `http://localhost:3000/candidatures`

## ⚠️ Points Importants

- **JSON Server est OBLIGATOIRE** - Votre application doit consommer les données via l'API REST
- **Pas de données en dur** - Ne copiez pas les données du db.json dans votre code
- **Documentez votre approche** - Expliquez vos choix techniques
- **Gérez les erreurs** - États de chargement et erreurs réseau sont importants

## 📊 Endpoints Principaux

Une fois JSON Server lancé, vous aurez accès à :

```
GET    /candidatures          → Liste toutes les candidatures
GET    /candidatures/:id      → Détail d'une candidature
PATCH  /candidatures/:id      → Modifier une candidature
POST   /candidatures          → Créer une candidature
DELETE /candidatures/:id      → Supprimer une candidature

GET    /statuts               → Liste des statuts
GET    /postes                → Liste des postes
GET    /competences           → Liste des compétences
```

### Filtres et Recherche

```
# Filtrer par statut
GET /candidatures?statut=En attente

# Recherche full-text
GET /candidatures?q=Vue.js

# Tri
GET /candidatures?_sort=dateCandidature&_order=desc

# Pagination
GET /candidatures?_page=1&_limit=10
```

## 📝 Ce qu'on Attend de Vous

### Minimum (Junior)
- ✅ Application Vue.js fonctionnelle
- ✅ Appels API vers JSON Server
- ✅ Liste et détail des candidatures
- ✅ Filtres et recherche basiques
- ✅ Gestion des erreurs de base
- ✅ README avec instructions claires

### Bonus (Mid-Level)
- ✅ Architecture propre et scalable
- ✅ Gestion d'état avancée (Pinia/Vuex)
- ✅ Tests unitaires
- ✅ Optimistic updates
- ✅ Animations et transitions
- ✅ Performance optimisée

## 🎯 Livrables

À la fin du test, vous devez fournir :

1. **Repository Git** avec :
   - Votre code source
   - Le fichier `db.json`
   - Un README détaillé

2. **Document technique** expliquant :
   - Vos choix d'architecture
   - Comment vous gérez l'API
   - Les difficultés rencontrées

3. **Démo** :
   - Vidéo de 2-3 min
   - OU application déployée

## ⏱️ Temps Estimé

- Configuration : 15 min
- Junior : 4-5 heures
- Mid-Level : 5-6 heures

**Indiquez le temps réel passé sur chaque partie !**

## 📚 Ressources

- [JSON Server GitHub](https://github.com/typicode/json-server)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)

## ❓ Questions ?

Si vous avez des questions techniques, n'hésitez pas à :
1. Documenter vos hypothèses dans votre README
2. Expliquer vos choix dans le document technique
3. Mentionner les points d'amélioration possibles

## 🎉 Bonne Chance !

Prenez le temps de bien lire le test technique complet dans `test-technique-vuejs.md`.

N'oubliez pas : la qualité du code et la documentation sont aussi importantes que les fonctionnalités !
