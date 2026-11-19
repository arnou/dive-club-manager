# Décisions ouvertes et validations nécessaires

## Fonctionnel

- [ ] Règles exactes de validité du CACI selon public, pratique et cadre réglementaire ; qui peut attester une vérification manuelle ?
- [ ] Champs obligatoires et présentation réglementaire de la feuille de sécurité, formats d'export et durée d'archivage.
- [ ] Authentification du formulaire d'inscription (compte, lien individuel, invités), anti-abus et consentements.
- [ ] Processus de confirmation, capacité, liste d'attente et désistements.
- [ ] Modèles de sortie, champs conditionnels et droits de personnalisation.
- [ ] Processus de validation de la feuille de frais et répartition des rôles de trésorerie.
- [ ] Modalités des règlements, remboursements et exports comptables.
- [ ] Date d'effet du tarif lors d'une plongée et politique de correction d'une ligne comptabilisée.

## Technique

- [ ] Choix définitif du framework HTTP portable (Hono proposé).
- [ ] Authentification/gestion des comptes et des sessions.
- [ ] PostgreSQL : hébergement, migrations et sauvegardes.
- [ ] Choix de l'adaptateur de courriel (SMTP ou API).
- [ ] OAuth Google : compte propriétaire de l'intégration, consentement, permissions et rotation des jetons.
- [ ] Protocole de synchronisation : conflits, récupération de terminal perdu et versions de schéma.
- [ ] Démarrage local Docker Compose et pipelines de déploiement.
- [ ] Politique de données personnelles, données CACI et RGPD.
- [ ] Vérifier et intégrer le texte intégral AGPL-3.0 dans `LICENSE` avant publication officielle.

## Décisions déjà prises

- [x] Dépôt public `ya-plouf`, licence AGPL-3.0.
- [x] Architecture indépendante de Cloudflare ; Cloudflare première cible possible.
- [x] PWA React/TypeScript avec IndexedDB et mode hors ligne réservé à un appareil DP par sortie.
- [x] Premier calendrier : **Google Agenda partagé** de l'association.
- [x] Formulaire intégré à l'application, pas de dépendance obligatoire à Google Forms.
- [x] Niveau **détenu en vigueur**, non niveau en préparation, repris de la base adhérents.
- [x] Dernier CACI repris de la base adhérents lors de la préparation.
- [x] Tarif unique par plongée réalisée et règles strictes encadrant/crédit.
