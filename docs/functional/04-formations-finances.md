# Formations, crédits, feuilles de frais et comptes

## Tarif

**Validé** : **un seul tarif unitaire par plongée effectivement réalisée**, commun à toutes les sorties, administré centralement. Le prix n'est ni propre à une sortie ni proratisé. Un participant effectuant N plongées facturables doit N × tarif unitaire.

**Proposé** : tarif versionné avec date d'effet et **instantané du prix** sur chaque ligne de frais. Tous les montants sont stockés en **centimes entiers**, jamais en nombres flottants.

## Règles de facturation par participant et par plongée

| Situation réelle | Débit financier | Crédit formation |
|---|---:|---:|
| Plongée non réalisée / annulée | 0 | 0 |
| **Encadrant exerçant réellement cette fonction** | **0** | **0** |
| Élève, plongée de formation liée à son inscription, crédit éligible disponible | 0 | 1 |
| Élève, plongée de formation sans crédit éligible | tarif unitaire | 0 |
| Plongée loisir (même si l'adhérent possède des crédits) | tarif unitaire | 0 |

**Règle impérative** : dès qu'un participant est déclaré **encadrant pour cette plongée**, l'interface désactive/décoche la consommation de crédit. Le calcul métier l'interdit et l'API rejette tout état contradictoire. Si un crédit déjà consommé doit être corrigé après constat du rôle d'encadrant, enregistrer une **contre-écriture auditée** ; ne pas supprimer l'historique.

La qualification d'encadrant ne donne aucune gratuité automatique pour une plongée de loisir.

## Crédits de formation

- Chaque crédit est rattaché à une **inscription précise à une formation**, pas à un solde générique de l'adhérent.
- Tenir un **journal immuable** : allocation, consommation, annulation/contre-écriture, transfert explicite si autorisé.
- Une plongée de formation ne consomme **exactement un crédit** que si la plongée est réalisée, liée à la bonne inscription et que le crédit est disponible.
- La disponibilité doit être revérifiée **atomiquement** au moment de la comptabilisation ; pas de consommation financière définitive hors ligne.

## Feuille de frais

Cycle validé : `brouillon → contrôlée → approuvée → comptabilisée → archivée`.

- Générer les lignes depuis les plongées **effectivement réalisées** et les rôles/activités réellement constatés.
- Distinguer prévisualisation et comptabilisation ; permettre revue et approbation selon habilitations.
- Comptabiliser débits des comptes et mouvements de crédits dans **une transaction serveur atomique et idempotente**.
- Interdire une seconde comptabilisation des mêmes faits ; utiliser clés d'idempotence et contraintes d'unicité.
- Après comptabilisation, corriger par **écritures de contrepassation** et nouvelles écritures, jamais par effacement silencieux.
- Archiver avec l'identité de l'approbateur, dates et détail de calcul.

## Compte financier adhérent

- Un compte individuel retrace versements, débits, éventuels ajustements/contrepassations et solde.
- Historique consultable selon permissions, traçable et rapprochable des feuilles de frais.
- **À préciser** : modes d'encaissement, justificatifs, export comptable et politique de remboursement.

## Exemple illustratif (non contractuel)

Tarif = 15 € ; 2 plongées loisirs réalisées = 30 € ; 1 plongée encadrée en tant qu'encadrant = 0 € et 0 crédit ; 1 plongée de formation couverte = 0 € et 1 crédit.
