# Y'a plouf !

[Dépôt GitHub](https://github.com/arnou/ya-plouf)

Application **open source AGPL-3.0** de gestion de clubs de plongée, de l'inscription à la sortie à la feuille de sécurité et à la feuille de frais.

> **État actuel : prototype initial, non prêt pour la production.** Les documents décrivent la cible fonctionnelle ; ils ne signifient pas que ces fonctions sont déjà implémentées.

## Documentation

**[Accéder au cahier des charges et à la documentation](docs/README.md)** : vision, parcours de sortie, inscriptions, Google Agenda partagé, niveau en vigueur, CACI, sécurité hors ligne, formations, crédits, finances, architecture, modèle de données et critères d'acceptation.

## Principes d'architecture

- **Agnostique fournisseur** : règles métier indépendantes de Cloudflare et de Google.
- **PWA** : React + TypeScript, service worker et IndexedDB pour le DP hors connexion.
- **API portable** : architecture ports/adaptateurs ; Node.js et Cloudflare Workers envisagés.
- **PostgreSQL** : base initiale cible ; déploiement Docker Compose de référence à construire.
- **Google Agenda partagé** : premier adaptateur de calendrier, pas une dépendance du domaine.

Voir [architecture cible](docs/architecture/README.md) et [décisions ouvertes](docs/DECISIONS_OUVERTES.md).

## Prototype existant

Le starter antérieur peut encore contenir une API spécifique à Cloudflare et des exemples fictifs. **La refonte agnostique décrite dans la documentation n'est pas encore effectuée.** Ne pas connecter de données réelles avant authentification, sécurité, persistance et sauvegardes.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) et [ROADMAP](docs/ROADMAP.md).

## Licence

AGPL-3.0-only (texte intégral de la licence à intégrer et vérifier avant publication).
