# Extraction des métadonnées de la base Sirene à partir des descriptions PDF
La base Sirene est la principale source exhaustive sur l'ensemble des entreprises et des établissements actifs de France. Elle est
maintenant disponible en open data à [cette adresse.](https://www.data.gouv.fr/fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret/).

La description des champs est disponible au format CSV, mais il y a moins d'informations que dans les notices PDF. Malgré la difficulté de faire des traitements avec ce format de données, les pages sont heureusement bien structurées et on peut en extraire toute les informations avec un parsing assez simple.

Un traitement déjà effectué fournit les métadonnées au format JSON dans le dossier `metadata` de ce projet.

## Générer les métadonnées
Si vous voulez regénérer les métadonnées, il vous faut NodeJS >= 6 et exécuter ces commandes :

```
npm install
node pdf2json.js
```

## Intégrer dans un projet

```
npm install sirene-metadata
```
