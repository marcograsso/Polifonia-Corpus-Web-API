---
component-id: Polifonia-Corpus-Web-Api
name: Polifonia Corpus Web App
description: The web interface to explore and interrogate the Polifonia Corpus on the web
type: 
  - User Interface
release-date: 2023-03-15
release-number: latest
work-package: WP1
keywords:
  - textual corpus
  - linked open data
  - kwic
  - linguistic query
licence: CC0
release link: https://github.com/polifonia-project/Polifonia-Corpus-Web-API/releases/latest
demo: https://polifonia.disi.unibo.it/corpus/
running-instance: https://polifonia.disi.unibo.it/corpus/
credits: Marco Grasso (UNIBO)
related-components:
  - Polifonia-Corpus
---

# Polifonia Corpus Web App
This repository contains the scripts and styling of the web interface created for interrogating the Polifonia-Corpus APIs. The designed interactive dashboard has been created to easily access the Polifonia Corpus and carries a user-friendly design based on a music player.


[![DOI](https://zenodo.org/badge/577352811.svg)](https://zenodo.org/badge/latestdoi/577352811)

### Data
This repository is missing db files, whish should be grouped in a folder called "annotations".
The annotations folder contains two other folders, one for the database files (annotations/db) and another one for metadata (annotations/metadata). 

```
Polifonia-Corpus-Web-API
│   README.md
│   app.py
│   requirements.txt
│   .gitignore
│   .gitattributes
└───annotations
│   │   
│   └───db
│   │    Books-EN.db
│   │    Wikipedia-EN.db
│   │    ...
│   └───metadata
│        books_corpus_metadataEN.tsv
│        wikipedia_corpus_metadataEN.tsv
│        ...
└───interrogation
└───static
└───templates

```


Database file for *pilot* modules are named as follows: 
`` Pilots-{Pilot name}-{LANGUAGE}.db  ``

Database file for *other* modules are named as follows: 
`` {Module name}-{LANGUAGE}.db ``



### Files

The db collection includes 3 modules (Books, Wikipedia, Periodicals), which are available in 6 languages each (IT, EN, ES, FR, NL, DE), for a total of 18 files. 

- Books-EN.db
- Wikipedia-EN.db
- Periodicals-EN.db

The db collection also includes 5 pilot db files, which are only available in their specific language as listed below.

- Pilots-Bells-IT.db
- Pilots-Child-EN.db
- Pilots-Meetups-EN.db
- Pilots-Musicbo-EN.db
- Pilots-Organs-NL.db
