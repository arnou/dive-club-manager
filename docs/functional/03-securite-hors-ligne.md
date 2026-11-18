# Feuille de sécurité, palanquées et mode hors ligne

## Initialisation

**Validé** : le DP initie la feuille de sécurité à partir des inscriptions confirmées, sans création automatique à la première inscription. Pour chaque adhérent, la préparation reprend **depuis la base des adhérents** :

- identité et niveau de plongée **en vigueur (détenu)**, information prioritaire pour les sorties loisirs ;
- qualifications et aptitudes complémentaires, dont encadrement ;
- **date du dernier CACI**, avec contrôle de validité à la **date de la sortie** ;
- formation en cours uniquement comme donnée secondaire utile aux plongées de formation.

Un N2 préparant le N3 reste N2 tant que le N3 n'est pas acquis et enregistré. La qualification d'encadrant ne signifie pas que l'adhérent encadre effectivement une plongée.

## Vérifications et corrections

- Présenter les informations absentes, incohérentes ou nécessitant vérification (CACI, niveau, aptitude).
- Le DP valide les aptitudes et peut ajouter un participant non inscrit, retirer un absent, confirmer les présents et modifier les palanquées.
- Conserver un **instantané daté** des données reprises et leur provenance.
- Lors d'une actualisation des adhérents/inscriptions, présenter un **diff** ; aucune correction déjà validée par le DP n'est écrasée silencieusement.
- Conserver l'origine d'un participant (inscription en ligne ou ajout manuel) et les modifications/auteurs.
- Les champs obligatoires, contrôles réglementaires et formats imprimables/exportables devront être validés avec les responsables compétents ; ne pas présumer qu'un niveau seul autorise une profondeur ou une composition de palanquée.

## Enregistrement de la plongée

Pour chaque plongée : palanquées, participants, statut réalisée/annulée, rôle **réel** (notamment encadrant), activité **réelle** (loisir/formation), formation liée si applicable, horaires et profondeurs utiles à la feuille de sécurité. Le DP peut modifier les informations prévisionnelles selon la réalité constatée.

## Réservation exclusive hors ligne

**Validé** : pour une sortie donnée, **un seul appareil**, celui du DP désigné, peut modifier les données opérationnelles hors ligne.

1. **Avant départ, en ligne** : authentification, préparation du paquet local (participants, qualifications, CACI, palanquées, données nécessaires), réservation exclusive de la sortie au bénéfice d'un appareil.
2. **À bord, hors ligne** : service worker pour les ressources de l'application, IndexedDB pour les données et événements locaux persistants ; modifications du DP mises en file.
3. **Pendant la réservation** : les autres appareils/utilisateurs ne peuvent pas modifier les données opérationnelles verrouillées de cette sortie, même s'ils sont en ligne.
4. **Au retour en ligne** : envoi ordonné des événements avec identifiants uniques et numéros de séquence, validation/idempotence serveur, gestion explicite des conflits, acquittement ; conservation des événements locaux jusqu'à confirmation.
5. **Après synchronisation complète** : libération de la réservation selon procédure contrôlée ; seulement ensuite validation et opérations financières serveur.

La réservation ne doit **pas expirer automatiquement** au seul motif que le bateau est hors réseau. Une reprise sur appareil perdu/défaillant requiert une procédure explicite et auditée. L'application doit afficher clairement l'état de préparation hors ligne et de synchronisation.

## Interdictions

- Aucune écriture financière définitive ni consommation de crédit de formation hors ligne.
- Aucun second appareil modifiant la même sortie durant la réservation exclusive.
- Aucun effacement des événements non acquittés.

## Critères de robustesse

Redémarrage de l'appareil, perte/reprise réseau, doublons de requêtes, interruption en cours de synchronisation, changement de version et espace disque insuffisant doivent faire l'objet de tests.
