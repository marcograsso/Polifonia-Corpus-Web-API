# Polifonia Corpus Web App

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
