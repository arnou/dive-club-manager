# Critères d'acceptation — scénarios de référence

Les scénarios sont destinés aux tests fonctionnels et automatisés ; ils ne signifient pas que la fonctionnalité existe déjà.

| ID | Scénario | Résultat attendu |
|---|---|---|
| PUB-01 | Le responsable publie une sortie | Formulaire, courriel et événement Google Agenda partagé cohérents |
| PUB-02 | Publication répétée après timeout | Aucun événement ni courriel dupliqué |
| INS-01 | Un adhérent s'inscrit deux fois | Une seule inscription active |
| INS-02 | Capacité atteinte | Liste d'attente selon configuration |
| SEC-01 | DP initialise la sécurité | Inscrits confirmés repris comme participants prévisionnels |
| SEC-02 | Adhérent N2 préparant N3 | Niveau en vigueur affiché : **N2** |
| SEC-03 | CACI ancien ou absent | Alerte à vérifier à la date de la sortie |
| SEC-04 | Actualisation après correction DP | Diff présenté, correction non écrasée |
| SEC-05 | Inscrit absent le jour J | Présence non confirmée ; aucune plongée facturée si non réalisée |
| OFF-01 | DP réserve la sortie sur appareil A | Appareil B et utilisateurs en ligne bloqués pour les modifications opérationnelles |
| OFF-02 | Réseau coupé au large | Saisie conservée localement ; aucune opération financière définitive |
| OFF-03 | Même événement de sync transmis deux fois | Traitement unique et acquittement stable |
| OFF-04 | DP hors réseau longtemps | Réservation non libérée par simple expiration automatique |
| FIN-01 | Encadrant effectif, crédit disponible | 0 € et **0 crédit** ; conflit rejeté par API |
| FIN-02 | Encadrant qualifié plonge en loisir | Tarif unitaire facturé |
| FIN-03 | Élève, bonne formation, crédit disponible | 0 € et exactement 1 crédit |
| FIN-04 | Élève sans crédit éligible | Tarif unitaire facturé, 0 crédit |
| FIN-05 | Élève en loisir malgré crédits disponibles | Tarif unitaire facturé, 0 crédit |
| FIN-06 | Plongée annulée/non réalisée | 0 € et 0 crédit |
| FIN-07 | Deux plongées loisirs réalisées | 2 × tarif unitaire |
| FIN-08 | Deux comptabilisations concurrentes | Une seule écriture financière/crédit par fait générateur |
| FIN-09 | Rôle corrigé en encadrant après comptabilisation | Contrepassation du crédit et débit éventuel, historique conservé |
| FIN-10 | Tarif modifié après sortie | Prix historisé de la ligne non altéré silencieusement |

## Priorités de test

1. Invariants financiers et crédit (tests unitaires et transactions concurrentes).
2. Exclusivité et reprise de synchronisation hors ligne.
3. Initialisation/actualisation de la sécurité, niveau en vigueur et CACI.
4. Publications et intégrations avec reprises idempotentes.
5. Permissions, confidentialité et export/archivage.
