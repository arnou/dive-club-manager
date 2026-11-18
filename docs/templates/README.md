# Modèles de publication (exemples)

Les modèles sont des **exemples de contenu**, non des gabarits exécutables. Leur syntaxe de variables sera spécifiée lors du développement.

## Invitation par courriel

**Objet** : Inscription à la sortie du `{{sortie.date}}`

Bonjour,

Une sortie plongée est prévue le **{{sortie.date}}** à **{{sortie.lieu}}**.

- Rendez-vous : {{sortie.heure_rdv}}
- Places : {{sortie.capacite}}
- Fin des inscriptions : {{sortie.date_limite}}

Inscription : {{sortie.url_inscription}}

À bientôt sous l'eau !

## Événement agenda

**Titre** : Plongée — {{sortie.lieu}} — {{sortie.date}}

**Description** : Rendez-vous {{sortie.heure_rdv}}. Consignes : {{sortie.consignes}}. Inscription : {{sortie.url_inscription}}.

**Attention** : ne pas intégrer de liste nominative, de niveau individuel, ni de CACI dans la description de l'événement partagé.

## Formulaire

Champs de base proposés : identité adhérent authentifiée, confirmation de participation, disponibilité, besoin de matériel, remarques logistiques. Les données de qualification et de CACI sont lues **depuis le référentiel adhérents**, et non demandées comme source d'autorité dans le formulaire.
