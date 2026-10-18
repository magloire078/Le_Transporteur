# Le Transporteur

Application mobile (Expo / React Native) de gestion de flotte pour les transporteurs :
propriétaires de taxis et de véhicules de transport, et leurs chauffeurs.
Même structure et même design que **Lavage Pro**, adaptés au transport.

## Espaces

| Rôle | Onglets |
|---|---|
| Propriétaire / Admin | Supervision · Flotte (véhicules & chauffeurs) · Recettes · Finances & Paramètres |
| Chauffeur | Tableau · Versements · Véhicule · Profil |

Un admin voit toute la flotte ; un propriétaire voit seulement ses véhicules.

## Données (Firebase `taxifleet-manager`)

| Collection | Contenu |
|---|---|
| `utilisateurs/{uid}` | profil + rôle (`owner`, `driver`, `admin`) |
| `proprietaires/{uid}` | fiche propriétaire |
| `chauffeurs/{id}` | fiche chauffeur (id = uid si le chauffeur a un compte) |
| `vehicules/{id}` | véhicule, papiers (`documents`), entretien, chauffeurs affectés |
| `revenus/{vehicleId}` | tableau `transactions` (recettes et dépenses) du véhicule |

Connexion par e-mail et mot de passe (Firebase Auth).

## Démarrer

```bash
npm install
npm start          # puis « a » (Android), « i » (iOS) ou « w » (web)
npm run typecheck
```

## Règles de sécurité

`firestore.rules` contient la version à jour des règles. Pour la déployer :

```bash
npm run deploy:rules
```
