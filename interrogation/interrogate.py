import csv, sys

import numpy as np

sys.path.insert(0, './interrogation')
from nltk.corpus import wordnet as wn
import os
import re
from db_utils import *
import pickle
import sys
import pandas as pd

import nltk 
nltk.data.path.append("./nltk_data")

def annotation2dict(annotation):
    annotation_ = [a.split('\t') for a in annotation]
    annotation_dict = {}
    i=0
    for annotation in annotation_:
        if len(annotation) == 7:
            token_id = 'token_'+str(i)
            annotation_dict.setdefault(token_id, dict())
            annotation_dict[token_id]['form'] = annotation[1]
            annotation_dict[token_id]['lemma'] = annotation[2]
            annotation_dict[token_id]['pos'] = annotation[3]
            annotation_dict[token_id]['offset'] = annotation[4]
            annotation_dict[token_id]['ent_type'] = annotation[5]
            annotation_dict[token_id]['ent_iob'] = annotation[6]
        if len(annotation) == 10:
            token_id = 'token_' + str(i)
            annotation_dict.setdefault(token_id, dict())
            annotation_dict[token_id]['form'] = annotation[1]
            annotation_dict[token_id]['lemma'] = annotation[2]
            annotation_dict[token_id]['pos'] = annotation[3]
            annotation_dict[token_id]['offset'] = annotation[4]
            annotation_dict[token_id]['ent_type'] = annotation[5]
            annotation_dict[token_id]['ent_iob'] = annotation[6]
            annotation_dict[token_id]['entity_mention'] = annotation[7]
            annotation_dict[token_id]['entity_link'] = annotation[8]
            annotation_dict[token_id]['is_musical'] = annotation[9]
        i+=1
    return annotation_dict

#------------------------------------------------ CONCEPT -----------------------------------------------

def print_sents_concepts(results, query, sent_n, count, corpus, lang):
    Results = []
    Stats = [count]
    for result in results:
        try:
            list_idx = 2
            if 'musicbo' in result[0].lower():
                list_idx = 0
            res = [result[0], result[1], result[2].split('\n')[list_idx]]
            annotation = annotation2dict(result[3].split('\n'))
            key_concept = [(k, t) for k, t in annotation.items() if t['offset'] == query]
            try:
                annotation_ = list(annotation.values())
                idx = [i for i, (k, v) in enumerate(annotation.items()) if k == key_concept[0][0]][0]
                left_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx - 14, idx)]).rjust(60)
                right_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx + 1, idx + 15)]).ljust(60)
                full_sent = result[2].split('\n')[list_idx]
                final_res = get_bib(res[0], corpus, lang), left_cont , annotation_[idx]['form'].center(10), right_cont, full_sent
                # final_res = get_bib(res[0], corpus, lang), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx - 14, idx)]).rjust(60), annotation_[idx]['form'].center(10),' '.join([annotation_[idx_]['form'] for idx_ in range(idx + 1, idx + 15)]).ljust(60), result[2].split('\n')[2]
                if len(Results) < int(sent_n):
                    Results.append(final_res)
            except:
                continue
        except:
            continue
    return Results, Stats


def get_concept(query, concept_id):
    lexicon = get_lexicon()
    if concept_id:
        concepts = wn.synsets(query)
        if len(concepts) == 0:
            print('Your query does not have concepts connected with it. Please try with another one or use the "keyword" search.')
        elif len(concepts) > 1:
            index = concept_id
            concept = concepts[int(index)-1]
        else:
            concept = concepts[0]
        offset = str(concept.offset())
        while len(offset) < 8:
            offset = '0' + offset
        return 'wn:' + offset + concept.pos(), concept
    else:
        concepts = wn.synsets(query)
        list_of_concepts = []
        if len(concepts) == 0:
            return  [[ "Concept", "No results found: your query does not have entities connected with it. Please try with another one or change language", "--", "--"]]
        elif len(concepts) >= 1:
            for i, concept in enumerate(concepts):
                offset = get_offset(concept)
                if offset in lexicon:
                    n_concept = '{}. {} - {}'.format(i, concept.pos(), concept.definition())
                    list_of_concepts+= [[ "Concept-Polifonia", n_concept, 'wn:' + str(i) + concept.pos(), "Polifonia Lexicon"]]
                else:
                    n_concept = '{}. {} - {}'.format(i, concept.pos(), concept.definition())
                    list_of_concepts += [["Concept", n_concept, 'wn:' + str(i) + concept.pos(), ""]]
            return list_of_concepts

def get_lexicon():
    with open('interrogation/data/Polifonia_lexicon_v21.tsv') as f:
        reader = csv.reader(f, delimiter='\t')
        lexicon = {row[0] : [row[0]] + row[2:] for row in reader}
    return lexicon

def get_offset(concept):
    s = str(concept.offset())
    while len(s) < 8:
        s = '0' + s
    return 'wn:' + s + concept.pos()


def select_sents_with_concept(conn, query, sent_n, concept_id, corpus, lang):
    wn_key, concept = get_concept(query, concept_id)
    c = conn.cursor()
    offset = 0
    more = 'no'
    Results = []
    if corpus == "Wikipedia":
        mycount = "more than 100.000"
    else:
        count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wn_key, 10000000, offset))
        mycount = count.fetchone()[0]
    double_sent_n = str(int(sent_n)*2)
    while more != '':
        results = c.execute(
        """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wn_key, double_sent_n, offset))
        Results+=print_sents_concepts(results, wn_key, sent_n, mycount, corpus, lang)
        more = ''
        offset += int(sent_n)
    if not Results:
        return [["Concept",
                 "No results found!!!: your query does not have entities connected with it. Please try with another one or change language",
                 "--", "--"]]
    else:
        return Results
    # ------------------------------------------------ LEMMA -----------------------------------------------

def print_sents_lemma(results, query, count, corpus, lang):
    Results = []
    Stats = [count]
    if not results:
        return Results, Stats
    else:
        for result in results:
            try:
                list_idx = 2
                if 'musicbo' in result[0].lower():
                    list_idx = 0
                res = [result[0], result[1], result[2].split('\n')[list_idx]]
                annotation = annotation2dict(result[3].split('\n'))
                key_concept = [(k, t) for k, t in annotation.items() if t['lemma'] == query]
                annotation_ = list(annotation.values())
                #idx = int(key_concept[0][0].split('_')[1])
                idx = [i for i, (k, v) in enumerate(annotation.items()) if k == key_concept[0][0]][0]
                left_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx-14,idx)]).rjust(60)
                right_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx+1,idx+15)]).ljust(60)
                full_sent = result[2].split('\n')[list_idx]
                final_res = get_bib(res[0], corpus, lang), left_cont, annotation_[idx]['form'].center(10), right_cont, full_sent
                Results.append(final_res)
            except:
                ## do something
                continue
        return Results, Stats

def select_sents_with_lemma(conn, query, sent_n, corpus, lang):
    c = conn.cursor()
    offset = 0
    more = 'no'
    Results = []
    if corpus == "Wikipedia":
        mycount = "more than 100.000"
    else:
        count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (query, 10000000, offset))
        mycount = count.fetchone()[0]
    c = conn.cursor()
    while more != '':
        results = c.execute(
        """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (query, sent_n, offset))
        Results+=print_sents_lemma(results, query, mycount, corpus, lang)
        more = ''
        offset += int(sent_n)
    if not Results:
        return [["Concept",
                 "No results found: your query does not have entities connected with it. Please try with another one or change language",
                 "--", "--"]]
    else:
        return Results

def consecutive(data, stepsize=1):
    data = np.array(data)
    return np.split(data, np.where(np.diff(data) != stepsize)[0]+1)

def get_idx(res_list, query):
    words = query.split(' ')
    if all(x in res_list for x in words):
        idxs = [res_list.index(word) for word in words]
        idxs = consecutive(idxs)[0]
    return idxs


#------------------------------------------------ KEYWORD -----------------------------------------------

def print_sents(results, query, count, corpus, lang):
    Results = []
    Stats = [count]
    if not results:
        return Results, Stats
    else:
        for result in results:
            try:
                list_idx = 2
                if 'musicbo' in result[0].lower():
                    list_idx = 0
                res = [result[0], result[1], result[2].split('\n')[list_idx]]
                res_list = res[2].split()
                for i in [""] * 14:
                    res_list.insert(0, i)
                    res_list.append(i)
                idx = get_idx(res_list, query)
                left_cont = ' '.join(res_list[idx[0] - 14:idx[0]]).rjust(60)
                right_cont = ' '.join(res_list[idx[-1] + 1:idx[-1] + 15]).ljust(60)
                full_sent = result[2].split('\n')[list_idx]
                final_res =  get_bib(res[0], corpus, lang), left_cont, query.center(10), right_cont, full_sent
                Results.append(final_res)
            except:
                continue
        return Results, Stats

def select_sents_with_keyword(conn, query, sent_n, corpus, lang):
    c = conn.cursor()
    offset = 0
    more = 'no'
    Results = []
    if corpus == "Wikipedia":
        mycount = "more than 100.000"
    else:
        count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_text, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (' ' + query + ' ', 10000000, offset))
        mycount = count.fetchone()[0]
    while more != '':
        c = conn.cursor()
        results = c.execute(
            """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_text, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
            (' ' + query + ' ', sent_n, offset))
        Results +=print_sents(results, query, mycount, corpus,lang)
        more = ''
        offset += int(sent_n)
    if not Results:
        return [["Concept",
                 "No results found: your query does not have entities connected with it. Please try with another one or change language",
                 "--", "--"]]
    else:
        return Results


#------------------------------------------------ ENTITY -----------------------------------------------

def print_sents_entities(results, query, sent_n, count, corpus, lang):
    Results = []
    Stats = [count]
    for result in results:
        try:
            list_idx = 2
            if 'musicbo' in result[0].lower():
                list_idx = 0
            res = [result[0], result[1], result[2].split('\n')[list_idx]]
            annotation = annotation2dict(result[3].split('\n'))
            if len(list(annotation.values())[0]) == 6:
                continue
            key_concept = [(k, t) for k, t in annotation.items() if query.lower() in t['entity_link'].lower()]
            try:
                annotation_ = list(annotation.values())
                idx = int(key_concept[0][0].split('_')[1])
                left_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx - 10, idx)]).rjust(60)
                right_cont = ' '.join([annotation_[idx_]['form'] for idx_ in range(idx + 1, idx + 10)]).ljust(60)
                full_sent = result[2].split('\n')[list_idx]
                final_res = get_bib(res[0], corpus, lang), left_cont, annotation_[idx]['form'].center(10), right_cont, full_sent
                #  final_res = get_bib(res[0], corpus, lang), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx - 10, idx)]).rjust(60), annotation_[idx]['form'].center(10), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx + 1, idx + 10)]).ljust(60), result[2].split('\n')[2]
                if len(Results) < int(sent_n):
                    Results.append(final_res)
            except:
                continue
        except:
            continue
    return Results, Stats

def get_entities(query, lang):
    with open('interrogation/data/lex_ent_map.pkl', 'rb') as f:
        ent_map = pickle.load(f)
    return ent_map[lang.upper()].get(query, [])

def get_entity(query, lang, entity_id):
    if entity_id:
        entities = get_entities(query, lang)
        if len(entities) == 0:
            return [["Entity","No results found: your query does not have entities connected with it. Please try with another one or change language","--", "--"]]
            sys.exit()
        with open('interrogation/data/pages.pkl', 'rb') as f:
            pages = pickle.load(f)
        if len(entities) >= 1:
            index = entity_id
            entity = entities[int(index)-1]
        return entity
    else:
        entities = get_entities(query,lang)
        list_of_entities = []
        if len(entities) == 0:
            return [["Entity","No results found: your query does not have entities connected with it. Please try with another one or change language","--", "--"]]
            sys.exit()
        with open('interrogation/data/pages.pkl', 'rb') as f:
            pages = pickle.load(f)
        if len(entities) >= 1:
            for i, concept in enumerate(entities):
                n_entity = '{}. {} - {}'.format(i, concept, pages[lang.upper()][concept.replace(' ', '_')])
                list_of_entities += [["Entity", n_entity, "--", "--"]]
        return list_of_entities

def select_sents_with_entity(conn, query, sent_n, lang, entity_id, corpus):
    wkp_title = get_entity(query, lang, entity_id)
    c = conn.cursor()
    offset = 0
    more = 'no'
    Results = []
    if corpus == "Wikipedia":
        mycount = "more than 100.000"
    else:
        count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wkp_title, 10000000, offset))
        mycount = count.fetchone()[0]
    double_sent_n = str(int(sent_n) * 2)
    while more != '':
        results = c.execute(
        """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wkp_title, double_sent_n, offset))
        Results+=print_sents_entities(results, wkp_title, sent_n, mycount, corpus, lang)
        more = ''
        offset+=int(sent_n)
    if not Results:
        return [["Entity",
                 "No results found!!!: your query does not have entities connected with it. Please try with another one or change language",
                 "--", "--"]]
    else:
        return Results

#------------------------------------------------ BIBLIOGRAPHIC RECORD-----------------------------------------------

def get_bib(id, corpus, lang):
    if corpus == "Books":
        # df = pd.read_csv("annotations/metadata/books_corpus_metadataEN.tsv", sep='\t') # make false if no headers
        # match = id
        # data = df[df['url']==match] # gets all rows with this 
        # year = data['year'].values
        # print(year)
        return id
    elif corpus == "Periodicals":
        x = id.split("__")
        title = re.sub(r'(?<![A-Z\W])(?=[A-Z])', ' ', x[0]).strip()
        year = x[1].split("-")[0]
        number = "N. " + x[1].split("-")[1].replace(".txt", "")
        bib_record = title + " " + number +" (" + year + ") "
        return bib_record
    elif corpus == "Wikipedia":
        page_id = id.split("_bn")[0]
        if lang == "EN":
            page_link = "https://en.wikipedia.org/?curid=" + page_id
        elif lang == "IT":
            page_link = "https://it.wikipedia.org/?curid=" + page_id
        elif lang == "FR":
            page_link = "https://fr.wikipedia.org/?curid=" + page_id
        elif lang == "DE":
            page_link = "https://de.wikipedia.org/?curid=" + page_id
        elif lang == "NL":
            page_link = "https://nl.wikipedia.org/?curid=" + page_id
        elif lang == "ES":
            page_link = "https://es.wikipedia.org/?curid=" + page_id
        return page_link
    elif corpus == "Pilots-Child":
        #df = pd.read_csv("annotations/metadata/pilots_corpus_child_metadata.tsv", sep='\t') # make false if no headers
        #match = id.replace("Child__","")
        #data = df[df['file']==match]          # gets all rows with this 
        #title = data['title'].values[0]
        #author = data['author_name'].values[0]
        #year = data['time'].values[0] # gets value in relevant column
        #bib_record = str(title) + ", " + str(author) + " (" + str(year).replace('-uu-uu','') + ")"
        #print(bib_record)
        return id
    elif corpus == "Organs":
        df = pd.read_csv("annotations/metadata/pilots_corpus_organs_metadata.tsv", sep='\t') # make false if no headers
        match = id
        data = df[df['organid']==match]          # gets all rows with this 
        title = data['name'].values[0]
        year = data['year'].values[0] # gets value in relevant column
        bib_record = str(title) + " (" + str(year).replace('-uu-uu','') + ")"
        return bib_record
    elif corpus == "Bells":
        df = pd.read_csv("annotations/metadata/pilots_corpus_bells_metadata.tsv", sep='\t', encoding = "ISO-8859-1") # make false if no headers
        r_match = id.replace("BELLS__","")
        match = r_match.replace(".txt","")
        data = df[df['ID']==match]          # gets all rows with this 
        title = data['TITOLO'].values[0]
        author = data['AUTORE'].values[0]
        bib_record = str(title) + ", " + str(author)
        return bib_record
    elif corpus == "Musicbo":
        if lang == "EN":
            df = pd.read_csv("annotations/metadata/pilots_corpus_musicbo_metadata_EN.tsv", sep='\t', encoding = "ISO-8859-1") # make false if no headers
            r_match = id.replace("Musicbo__EN__", "")
            match = r_match.replace(".pdf.txt", "")
            data = df[df['id']==match]          # gets all rows with this 
            title = data['title'].values[0]
            author = data['author'].values[0]
            year = data['published'].values[0]  # gets value in relevant column
            bib_record = str(title) + ", " + str(author) + " (" + str(year).replace('-uu-uu', '') + ")"
            return bib_record
        else:
            return id 
    elif corpus == "Meetups":
        page_id = id.split("_bn")[0]
        page_link = "https://en.wikipedia.org/?curid=" + page_id
        return page_link
    else:
        return id


#------------------------------------------------ INTERROGATION -----------------------------------------------

def interrogate(annotations_path, corpus, lang, interrogation_type, query, sent_n, concept_id, entity_id):
    Results = [["No results found","There is no such database available at the moment", "--", "--"]]
    Stats = "The word is associated with 0 sentences."
    try:
        db_path = os.path.join(annotations_path, corpus + '-' + lang + '.db')
        conn = create_connection(db_path)
        if query == "":
            Results = [["No results found","Please digit a lemma to start the search", "--", "--"]]
            Stats = "The word is associated with 0 sentences."
        elif interrogation_type == 'keyword':
            Results, Stats = select_sents_with_keyword(conn, query, sent_n, corpus, lang)
        elif interrogation_type == 'lemma':
            Results, Stats = select_sents_with_lemma(conn, query, sent_n, corpus, lang)
        elif interrogation_type == 'concept':
            if concept_id:
                Results, Stats = select_sents_with_concept(conn, query, sent_n, concept_id,corpus, lang)
            else:
                Results = get_concept(query, concept_id)
                Stats = ""
        elif interrogation_type == 'entity':
            if entity_id:
                Results, Stats = select_sents_with_entity(conn, query.lower(), sent_n, lang, entity_id, corpus)
            else:
                lower_query = query.lower()
                Results = get_entity(lower_query, lang, entity_id)
                Stats = ""
    except Exception as e:
        print(e, "there is no such database")

    return Results, Stats


#------------------------------------------------   Write issues to file-----------------------------------------------

def write_issue(message):
    with open("static/issues.txt", "a") as file_object:
        file_object.write(message + "\n\n\n\n")
    return "Report sent"