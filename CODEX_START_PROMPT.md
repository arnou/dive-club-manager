# Prompt de démarrage Codex

Je reprends le développement du projet `arnou/ya-plouf` après une phase de cadrage dans ChatGPT.

1. Lis intégralement `AGENTS.md` et `docs/PROJECT_CONTEXT.md`.
2. Inspecte l'état réel du dépôt (code, migrations, tests, documentation et GitHub issues). Ne présume pas que les fonctionnalités décrites sont déjà codées.
3. Concentre-toi sur l'issue GitHub #13, « Initialiser la feuille de sécurité depuis les inscriptions ».
4. Distingue clairement les décisions métier validées des questions encore ouvertes ; demande-moi de trancher ces dernières avant d'implémenter une règle sensible.
5. Propose un plan de réalisation incrémental : modèle de données, API, service applicatif, validations, réconciliation, audit, tests et interface DP.
6. Ne modifie pas le code avant de m'avoir présenté ton diagnostic et ton plan.

Contraintes majeures : architecture hexagonale portable, AGPL-3.0, données personnelles protégées, exclusivité du DP hors ligne, synchronisation idempotente, aucune écriture financière hors ligne.
