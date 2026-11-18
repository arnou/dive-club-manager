# Modèle de données conceptuel

Ce document décrit des **entités candidates**, pas un schéma SQL définitif.

## Référentiel adhérents

- `adherents` : identité, statut, coordonnées utiles.
- `qualifications` / `adherent_qualifications` : niveau **acquis en vigueur**, autres qualifications, dates et justificatifs éventuels.
- `caci` ou métadonnées CACI : date du dernier certificat, informations strictement nécessaires au contrôle de validité ; limiter la collecte de données de santé.
- `utilisateurs`, `roles`, `permissions` : comptes et habilitations.

## Sorties et sécurité

- `sorties` : dates, lieu, capacité, état, responsable, paramètres.
- `inscriptions_sorties` : adhérent, statut, réponses, origine.
- `formulaires_sorties`, `reponses_inscriptions` : modèle publié, réponses versionnées.
- `feuilles_securite`, `participants_feuille_securite` : préparation, présence, **instantané du niveau en vigueur et du CACI**.
- `palanquees`, `plongees`, `participants_plongees` : composition, rôle et activité réels, statut de réalisation, formation liée, temps/profondeur.
- `reservations_hors_ligne`, `evenements_synchronisation` : appareil DP exclusif, séquences, acquittements et reprise.

## Publications et intégrations

- `modeles_sorties`, `modeles_formulaires`, `modeles_messages`, `modeles_evenements` : modèles versionnés.
- `publications_sorties`, `notifications` : publication, envois, statut et historique.
- `integrations_calendriers`, `evenements_externes` : fournisseur, agenda et identifiant d'événement ; secrets dans un stockage sécurisé, non dans les exports.

## Formations et finances

- `formations`, `inscriptions_formations` : parcours et rattachement des élèves.
- `mouvements_credits` : journal immuable des allocations, consommations et contrepassations.
- `tarifs_plongee` : tarif unique, dates d'effet.
- `feuilles_frais`, `lignes_frais` : état, calcul et instantané du prix.
- `comptes_adherents`, `mouvements_financiers`, `reglements` : comptes, écritures, encaissements.
- `journal_audit` : auteur, opération, date, contexte et traçabilité.

## Contraintes impératives

- IDs stables et clés d'idempotence uniques pour sync, crédits et comptabilisation.
- Contrainte empêchant double inscription à une même sortie (selon règles d'annulation/réinscription).
- Un seul appareil DP titulaire d'une réservation opérationnelle active par sortie.
- Aucun crédit consommé pour un participant encadrant ou une plongée non réalisée.
- Un crédit ne peut être consommé que pour l'inscription à la formation correspondante.
- Transactions atomiques et verrous/concurrence pour le débit et les crédits.
- Montants en centimes entiers, références d'écritures et contrepassations sans suppression.
- Historisation des instantanés de niveau, CACI et prix, avec provenance.
