# Sorties, formulaires, invitations et calendrier

## Création et publication

**Validé** : le responsable saisit date, horaires, lieu, point de rendez-vous, capacité, responsable et consignes ; il génère à partir de modèles cohérents :

1. un **formulaire d'inscription** accessible depuis un lien, sur smartphone sans installation de la PWA ;
2. un **courriel** avec le lien et les informations de la sortie ;
3. un **événement dans le Google Agenda partagé de l'association**.

Les trois supports réutilisent une source de données unique et des variables de modèles (`sortie.date`, `sortie.lieu`, `sortie.url_inscription`, etc.). Le responsable prévisualise et confirme la publication et l'envoi. Les envois sont tracés et réessayables sans doublons.

## Formulaire d'inscription

- Identifier l'adhérent et associer sa réponse à la fiche existante ; empêcher les inscriptions en double.
- Recueillir les réponses configurées pour le type de sortie (ex. matériel, préférences, disponibilité, souhait d'encadrer).
- Gérer capacité, clôture des inscriptions, confirmations, désistements et liste d'attente.
- Ne pas assimiler inscription à présence réelle, ni rôle souhaité à rôle exercé.
- Ne pas publier de données nominatives ou médicales dans l'événement d'agenda public/partagé.
- **À préciser** : accès au formulaire par authentification, lien individuel sécurisé ou autre mécanisme ; modalités d'inscription d'invités/non-adhérents.

## Intégration Google Agenda

**Validé** : premier connecteur = **Google Agenda partagé**. L'application reste la source de référence des sorties ; synchronisation initiale **application → agenda**.

**Proposé** : adaptateur `CalendarProvider` (Google Calendar API et OAuth 2.0), stockage du couple `(calendarId, eventId)` pour mise à jour/annulation idempotente ; export `.ics` comme alternative. Ne pas créer de nouvelle entrée à chaque modification. Les permissions Google doivent être limitées à l'agenda choisi et aux besoins effectifs.

## Courriels

**Proposé** : interface `EmailSender` et adaptateur fournisseur ; modèles d'objet et de corps, aperçu, historique, état d'envoi, reprise sur erreur et protection contre les doubles envois. Les changements significatifs de sortie peuvent proposer une notification, mais ne doivent pas déclencher un renvoi massif non confirmé.

## Passage vers la sécurité

**Validé** : les inscriptions confirmées constituent la liste initiale de participants **prévisionnels**. Le DP lance explicitement « Initialiser la feuille de sécurité ». Une réimportation ultérieure affiche les différences et n'écrase jamais les corrections du DP.

## États suggérés

Sortie : `brouillon → publiée → inscriptions_closes → préparation → en_cours → terminée → archivée` ; `annulée` possible sous contrôle.

Inscription : `demandée → confirmée | attente → annulée` ; les transitions exactes restent à préciser.
