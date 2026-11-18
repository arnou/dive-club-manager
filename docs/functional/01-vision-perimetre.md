# Vision, périmètre et glossaire

## Objectif

**Dive Club Manager** est une application web progressive (PWA), open source **AGPL-3.0**, destinée à gérer les activités d'un club de plongée, de l'annonce d'une sortie à sa clôture financière. Elle doit être réutilisable par d'autres associations et déployable indépendamment d'un hébergeur particulier.

## Principaux utilisateurs

- **Adhérent** : consulte les sorties, s'inscrit, annule son inscription, consulte selon droits ses informations et son compte.
- **Organisateur / responsable de sortie** : prépare et publie la sortie, suit les inscriptions et les communications.
- **Directeur de plongée (DP)** : vérifie les aptitudes, prépare et valide les palanquées et la feuille de sécurité, travaille éventuellement hors connexion.
- **Responsable formation** : gère les inscriptions aux formations et leurs crédits.
- **Trésorier / personne habilitée** : contrôle, approuve et comptabilise les feuilles de frais et les mouvements.
- **Administrateur** : paramètre tarifs, modèles, droits et intégrations.

Une même personne peut cumuler des rôles ; chaque opération doit contrôler les permissions correspondantes.

## Cycle de vie

1. Création d'une sortie et application d'un modèle.
2. Génération du formulaire d'inscription, du courriel et de l'événement d'agenda.
3. Publication, inscriptions, confirmations, annulations et liste d'attente.
4. Initialisation contrôlée de la feuille de sécurité à partir des inscrits confirmés.
5. Préparation des palanquées, vérifications et réservation hors ligne du DP.
6. Réalisation des plongées, constat des rôles et activités effectifs.
7. Synchronisation, contrôle de la feuille de sécurité.
8. Production, vérification, approbation puis comptabilisation de la feuille de frais.
9. Consultation des comptes, rapprochements, archivage et audit.

## Périmètre de la V1

**Validé** : adhérents, niveaux et qualifications, CACI, sorties, inscriptions, feuilles de sécurité, mode hors ligne DP, formations/crédits, tarif unique par plongée, frais et comptes adhérents.

**Proposé** : notifications automatiques, modèles versionnés, export iCalendar, tableaux de bord et gestion avancée de plusieurs associations dans une même instance.

## Glossaire

- **CACI** : certificat médical d'absence de contre-indication ; sa validité est à contrôler selon les règles applicables et la situation du plongeur.
- **Niveau en vigueur** : niveau de plongée **détenu/acquis** par l'adhérent, distinct du niveau en cours de préparation.
- **Palanquée** : groupe de plongeurs affectés à une plongée.
- **Crédit de formation** : droit à une plongée de formation lié à une inscription à une formation déterminée.
- **Feuille de sécurité** : document de préparation et de suivi des plongées ; ses mentions obligatoires et son format doivent être validés par rapport à la réglementation applicable.
- **Feuille de frais** : document interne de calcul et de comptabilisation des plongées facturables.
