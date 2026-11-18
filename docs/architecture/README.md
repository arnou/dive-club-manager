# Architecture technique — agnostique fournisseur

## Principes

1. **Cœur métier pur** : aucune dépendance à Cloudflare, Google, AWS, PostgreSQL ou à un framework HTTP dans les règles métier.
2. **Ports et adaptateurs** : interfaces pour stockage, courriels, agenda, authentification, horloge et identifiants ; implémentations interchangeables.
3. **API HTTP portable** : backend TypeScript avec adaptateurs Node.js et Cloudflare Workers (Hono proposé, à confirmer).
4. **PWA autonome** : React + TypeScript + Vite, Service Worker, IndexedDB et protocole de synchronisation indépendant de l'hébergement.
5. **PostgreSQL initial** : stockage de référence, avec migrations, contraintes et transactions ; un autre SGBD nécessitera son propre adaptateur et des tests d'équivalence.

## Structure cible (non entièrement implémentée)

```text
apps/
  web/                       # React PWA
  api/                       # API HTTP portable
packages/
  domain/                    # Entités et invariants métier
  application/               # Cas d'usage, ports
  contracts/                 # Schémas et DTO versionnés
  persistence-postgres/      # Adaptateur SQL transactionnel
  integrations-google/       # Adaptateur Google Agenda
  integrations-email/        # Adaptateur d'envoi
infrastructure/
  docker/                    # Développement local / VPS
  cloudflare/                # Worker, routes, bindings
  # autres cibles à la demande
```

**Règle d'import** : `domain` ne dépend de rien ; `application` dépend de `domain` et de contrats abstraits ; les adaptateurs dépendent des ports, jamais l'inverse.

## Déploiements

- **Référence locale** : Docker Compose, API Node.js, PostgreSQL, frontend Vite/serveur statique.
- **Production envisagée pour le club** : frontend/API Cloudflare + PostgreSQL managé, sans importer les APIs Cloudflare dans le domaine.
- **Alternative** : VPS Docker Compose (frontend, API, PostgreSQL), avec sauvegardes externes.
- **Google Agenda** : premier adaptateur de calendrier, mais contrat `CalendarProvider` neutre.

## API indicative (à spécifier)

- `POST /sorties`, `POST /sorties/{id}/publier`, `GET /sorties/{id}/inscriptions`
- `POST /sorties/{id}/inscriptions`, `POST /sorties/{id}/feuille-securite/initialiser`
- `POST /sorties/{id}/offline/reserver`, `POST /sorties/{id}/sync`, `POST /sorties/{id}/offline/liberer`
- `POST /sorties/{id}/feuille-frais/valider`, `POST /sorties/{id}/feuille-frais/comptabiliser`

Les routes ne sont **pas des API implémentées** ; préciser authentification, schémas, versions, idempotence, erreurs et contrôle d'accès avant codage.

## Hors ligne

Les commandes locales portent `eventId`, `outingId`, `deviceId`, `sequence`, `baseVersion`, `occurredAt` et données métier. Le serveur conserve un registre d'événements traités et acquitte explicitement. La résolution de conflits est contrôlée, jamais silencieuse. Aucun mouvement financier n'est exécuté depuis le client hors ligne.
