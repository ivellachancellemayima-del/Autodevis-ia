# AutoDevis IA — prototype PWA gratuit

## Démarrage local
Depuis le dossier du projet :

```bash
python3 -m http.server 8000
```

Ouvrir http://localhost:8000. Pour l'installation PWA et le service worker, utiliser localhost ou HTTPS.

## Publication gratuite
1. Créer un dépôt GitHub public ou privé et y placer les fichiers du dossier à sa racine.
2. Activer GitHub Pages dans Settings > Pages (branche main, dossier /root).
3. Ouvrir l'URL HTTPS générée sur Android ou iPhone.
4. Sur Android, choisir « Installer l'application » dans le navigateur compatible ; sur iPhone, Safari > Partager > Ajouter à l'écran d'accueil.

## Limites et précautions
- Prototype de devis uniquement, pas de factures ni de véritable IA.
- Impression PDF via le navigateur (bouton Imprimer / PDF).
- Les données sont stockées dans localStorage, sans compte ni synchronisation. Exporter régulièrement une sauvegarde JSON.
- Ne pas utiliser en production avec des données personnelles de clients avant d'avoir prévu les protections, la confidentialité et les mentions légales adaptées.
- Vérifier les obligations françaises applicables aux devis, à la TVA, aux mentions légales et à votre activité avant toute utilisation professionnelle.
- L'installation iOS dépend du navigateur et de la version d'iOS.
