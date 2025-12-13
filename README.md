# Yoga App !

Frontend de l'application **Yoga App**.

* Ce projet fournit l’interface Angular (Angular Material) permettant de :

- se créer un compte et se connecter,
- consulter la liste des sessions,
- consulter le détail d’une session,
- créer / modifier / supprimer une session (admin),
- participer / se désinscrire d’une session (non-admin),
- consulter la page “Account / Me”,
- gérer les routes protégées (guards) et la navigation.

L’application consomme l’API via le chemin `/api` (proxy vers le back).

---

## Configuration du front

- **Nom du service** : `front` (projet Angular : `yoga`)
- **Port HTTP** : `4200`

* L’application sera accessible sur :

```text
http://localhost:4200
Proxy API
Le front utilise un proxy Angular (fichier proxy.conf.json) :

/api -> http://localhost:8080

Pré-requis pour le bon fonctionnement du front
-> Node.js (LTS recommandé)
-> npm
-> Git

Aucun besoin d’installer Angular CLI globalement : les commandes passent via les scripts npm (binaires locaux).

Installation & lancement de l’application
Récupérer le projet
bash
Copier le code
git clone https://github.com/MakhloufiAdnan/Testez-et-ameliorez-une-application-front.git
cd Testez-et-ameliorez-une-application-front
Installer les dépendances
bash
Copier le code
npm install
Démarrage du front
Si vous souhaitez utiliser l’API réelle : démarrez le back sur http://localhost:8080 (le front proxyfie /api).

Lancer le front :

bash
Copier le code
npm start
Puis ouvrir :

text
Copier le code
http://localhost:4200
Lancer les tests
Les tests du front sont composés :

de tests unitaires et d’intégration avec Jest

de tests end-to-end (E2E) avec Cypress

de la génération de rapports de couverture (Jest + NYC/Cypress)

1) Tests unitaires & intégration (Jest)
Lancer tous les tests :

bash
Copier le code
npm test
Lancer les tests avec watch :

bash
Copier le code
npm run test:watch
Lancer les tests avec couverture :

bash
Copier le code
npm run test:coverage
Rapports de couverture Jest
Après npm run test:coverage :

Rapport HTML :

coverage/jest/index.html

(ou) coverage/jest/lcov-report/index.html

Résumé console : text-summary

Seuil minimal de couverture (Jest)
Le seuil est forcé à 80% sur :

statements

branches

functions

lines

et est configuré dans jest.config.js via coverageThreshold.
Si les seuils ne sont pas atteints, Jest échoue.

2) Tests End-to-End (Cypress)
Lancer Cypress (mode interactif)
bash
Copier le code
npm run e2e
Lancer Cypress en headless (CI)
bash
Copier le code
npm run e2e:ci
3) E2E + Couverture de code (NYC)
Pour exécuter tous les tests Cypress, générer les rapports NYC, puis vérifier les seuils 80% :

bash
Copier le code
npm run cy:all:coverage
Ce script :

nettoie .nyc_output et coverage/cypress si nécessaire,

lance l’app instrumentée pour la couverture (ng run yoga:serve-coverage),

exécute cypress run,

génère les rapports NYC (lcov, html, text-summary),

exécute nyc check-coverage --lines 80 --branches 80 --functions 80 --statements 80

Rapports de couverture E2E (NYC)
Après npm run cy:all:coverage :

Rapport HTML :

coverage/index.html

coverage/lcov-report/index.html

Résumé :

coverage/coverage-summary.json

Structure du projet (front)
text
Copier le code
src/
└── app/
    ├── components/                # composants (ex: Me/Account)
    ├── core/
    │   ├── models/
    │   └── service/               # services API, auth, etc.
    ├── guards/                    # AuthGuard / UnauthGuard
    ├── interceptors/              # interceptor JWT
    ├── pages/                     # écrans (login/register/sessions/not-found)
    └── shared/                    # modules partagés

Tests Jest :
- src/app/**/*.spec.ts

Tests Cypress :
- cypress/e2e/*.cy.ts
Règles de couverture (seuil minimal 80%)
Jest (unit + intégration)
Seuil global ≥ 80% sur :

statements

branches

functions

lines

Cypress (E2E) + NYC
Seuil ≥ 80% sur :

statements

branches

functions

lines

Si les seuils ne sont pas atteints, la commande npm run cy:all:coverage échoue.
```
