# Tests et adoption de Next.js — 9 octobre 2026

Le comportement existant reste la référence métier : conventions des routes protégées, prix, crédits, ordre des traitements et compatibilité WordPress sont conservés. Les corrections concernent les entrées invalides, les courses concurrentes et les interactions UI défectueuses.

## Vérification

- `pnpm tsc` : configuration TypeScript existante en JavaScript (`allowJs`, sans `checkJs`) et sources TypeScript.
- `pnpm lint` : Biome 2.5.13, configuration demandée, avertissements bloquants.
- `pnpm test:ci` : 731 tests unitaires, 51 fichiers, aucun test ignoré.
- `pnpm test:integration` : 7 tests avec PostgreSQL 18 jetable, migrations appliquées ; aucune connexion à une base existante.
- `pnpm build` : build de production avec Turbopack, React Compiler, Cache Components et préchargement partiel.
- `pnpm test:smoke` : 13 tests sur le serveur compilé : 7 HTTP et 6 Chromium (navigation native, éléments partagés visibles, historique, mouvement réduit, API absente, menu mobile, carte/titre du dashboard public). PostgreSQL jetable et clés Clerk de fixture, sans connexion à un compte réel.

Les quatre tests précédemment ignorés vérifiaient la syntaxe PHP et exécutaient les exemples PHP/cURL. PHP était absent. Ils utilisent maintenant PHP CLI/cURL, ou `php:8.5-cli` dans Docker sur Linux. Les prérequis manquants provoquent un échec explicite. La CI installe PHP, Python Requests et cURL.

Les 39 E2E authentifiés existants sont inventoriés (`pnpm exec playwright test --list`) et conservés dans la CI. Leur exécution locale n'a pas été réalisée : elle nécessite les comptes Clerk de test, un serveur configuré et les services externes, notamment OpenAI. Les tests HTTP anonymes ne remplacent pas cette validation.

## Cas limites examinés et renforcés

| Zone | Contrats vérifiés |
| --- | --- |
| Schéma, contexte, mots-clés, langue | Valeurs absentes, nulles, primitives, tableaux, JSON invalide, coercions historiques, clés réservées, limites exactes et dépassées, Unicode, caractères de contrôle, compatibilité `alt_text`. |
| Création et suppression de clés | Authentification avant traitement ; noms vides, types incorrects, dates invalides, expiration exacte, ISO avec décalage ; propriétaire issu de la session ; clé absente ou étrangère ; révocation effective. |
| JWT et API de compte | Vraies signatures `jose`, altération, mauvaise clé, algorithme autre que HS256, issuer/audience, expiration/not-before, préfixe Bearer, types incorrects de `userId`, absence de cache des réponses privées. |
| Playground et images | Métadonnées JSON malformées, types de formulaire invalides, absence d'image, limites de corps/fichier, formats réels indépendants du MIME, EXIF/redimensionnement avec Sharp, génération interrompue et remboursement. |
| Crédits et historique | Zéro, valeurs signées valides, fractions/NaN/infini/types invalides, réservation concurrente, erreur de travail et de remboursement, chronologie UTC entre années, clés supprimées et noms `__proto__`/`constructor`/`toString`. |
| Offres et fournisseurs | Catalogues vides, filtres, égalités de tri, offres désactivées/inconnues, prix du fournisseur, absence d'attributs, vérification fraîche au paiement, cache public et invalidation uniquement après synchronisation réussie. |
| Webhooks | HMAC, rejouabilité, rollback, ordre des événements, idempotence ; six livraisons PostgreSQL concurrentes du même achat ajoutent les crédits une seule fois. |
| UI | Champs requis, erreurs serveur, conservation des saisies, doubles clics, copie refusée, fallback nettoyé, cinq langages avec Prism réel, changements de prévisualisation, chargement différé et mouvement réduit. |

La couverture inclut désormais tous les composants, helpers, services, actions et handlers API, et exclut le client Prisma généré et les mocks. Elle atteint **80,63 % des instructions et 82,66 % des branches** sur ce périmètre élargi. Les services atteignent 98,21 % / 90,98 %, les actions 99,05 % / 98,25 %, les API 96,77 % / 95,79 % et les helpers 98,05 % / 96,87 %. Les composants visuels et certaines branches défensives restent partiellement couverts ; ces chiffres ne garantissent pas toutes les combinaisons d'entrées possibles. L'ancien calcul limité aux fichiers importés n'est pas directement comparable.

## Framework, performance et authentification

- Adoption du [modèle recommandé dans Next 16.4](https://nextjs.org/blog/next-16-4) : Cache Components, préchargement partiel, `Suspense` autour des pages Clerk et `ensureStatic = 'navigation'` pour les pages marketing.
- Activation de [React Compiler](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler), avec son plugin Babel stable.
- Catalogue public : `use cache`, revalidation après 60 secondes, expiration après une heure, tag `plans`. `/api/sync` expire ce tag après succès. Crédits, clés, abonnements et contrôle du paiement restent hors de ce cache partagé.
- Texte des fonctionnalités rendu sur le serveur ; Rive chargé à l'approche de l'écran. Prism chargé uniquement lorsqu'une prévisualisation est montée. Aucun gain chiffré de latence n'est revendiqué sans benchmark comparatif.
- Index PostgreSQL adaptés aux requêtes existantes de clés, historique, usage et abonnements. La migration `20261009140000_dashboard_query_indexes` est appliquée automatiquement par `pnpm start` et par le démarrage Docker (`pnpm launch`), avant Next.js. Le build seul ne modifie pas la base.
- Création d'utilisateur sûre en concurrence, également pour les webhooks ; validation serveur des clés ; suppression contrainte par le propriétaire ; vérification JWT limitée à HS256.
- Suppression d'ESLint/Prettier, du chargement dotenv remplacé par l'[API native Node](https://nodejs.org/api/process.html#processloadenvfilepath), et des anciens composants non référencés `TokenCreate`, `JwtModal`, `TopLevelNavItemApp`.

`pnpm outdated` confirme que les dépendances applicatives sont aux versions stables disponibles. Biome reste volontairement à la version 2.5.13 demandée, les types Node suivent la cible 24, et Prisma 8 en release candidate n'est pas adopté. Les options expérimentales Rust/Turbopack supplémentaires et les nouvelles API sans besoin dans les routes actuelles ne sont pas activées artificiellement.

## View Transitions et démarrage de production

React 19.3 expose `ViewTransition` et Next 16.4 coordonne les navigations `Link` sans ancien flag expérimental. Les frontières ne rajoutent pas de wrapper DOM : fondu court des pages, logo partagé, titres et descriptions du marketing, introduction/détail WordPress, titres des cartes et destinations du dashboard. Les frontières imbriquées isolent les éléments du fondu de page. L'image du plugin entre séparément ; aucune identité artificielle ne lie des images différentes. Les préférences de mouvement réduit désactivent les animations. Les animations Motion d'entrée du hero WordPress ont été retirées pour éviter de capturer du contenu encore transparent.

Les tests Chromium instrumentent l'API native sans la remplacer et attendent son `ready`, qui rejette notamment les conflits de noms. Le morphing WordPress est vérifié lorsque les deux titres sont visibles : React ne forme pas de paire hors du viewport. L'historique conserve une navigation fonctionnelle ; il n'est pas supposé produire systématiquement une animation native. Les parcours authentifiés restent à vérifier avec les comptes E2E.

`pnpm start` exécute désormais `prisma migrate deploy && next start` ; Docker utilise `pnpm launch`, qui génère le client puis appelle ce démarrage. Le test smoke utilise ce vrai chemin sur une base jetable déjà migrée, vérifiant aussi le redémarrage après application des migrations. Deux tests de contrat vérifient l'ordre et l'arrêt du démarrage en cas d'échec. Un test PostgreSQL confirme les quatre index.

Références : [Next.js View Transitions](https://nextjs.org/docs/app/guides/view-transitions), [React ViewTransition](https://react.dev/reference/react/ViewTransition).
