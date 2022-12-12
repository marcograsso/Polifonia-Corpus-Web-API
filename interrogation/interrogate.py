import argparse
import csv
from nltk.corpus import wordnet as wn
import os
from interrogation.db_utils import *
import wget
import pickle
import sys

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


def print_sents_concepts(results, query):
    #cols = [column[0] for column in results.description]
    #results = pd.DataFrame.from_records(data=results.fetchall(), columns=cols)
    Results = []
    for result in results:
        res = [result[0], result[1], result[2].split('\n')[2]]
        annotation = annotation2dict(result[3].split('\n'))
        key_concept = [(k, t) for k, t in annotation.items() if t['offset'] == query]
        try:
            annotation_ = list(annotation.values())
            #idx = int(key_concept[0][0].split('_')[1])
            idx = [i for i, (k, v) in enumerate(annotation.items()) if k == key_concept[0][0]][0]
            print(res[0].ljust(30), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx-14,idx)]).rjust(60), annotation_[idx]['form'].center(10), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx+1,idx+15)]).ljust(60))
            Results.append(res)
        except:
            continue
    return Results

def print_sents_lemma(results, query):
    #cols = [column[0] for column in results.description]
    #results = pd.DataFrame.from_records(data=results.fetchall(), columns=cols)
    Results = []
    for result in results:
        res = [result[0], result[1], result[2].split('\n')[2]]
        annotation = annotation2dict(result[3].split('\n'))
        key_concept = [(k, t) for k, t in annotation.items() if t['lemma'] == query]
        try:
            annotation_ = list(annotation.values())
            #idx = int(key_concept[0][0].split('_')[1])
            idx = [i for i, (k, v) in enumerate(annotation.items()) if k == key_concept[0][0]][0]
            print(res[0].ljust(30), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx-14,idx)]).rjust(60), annotation_[idx]['form'].center(10), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx+1,idx+15)]).ljust(60))
            Results.append(res)
        except:
            continue
    return Results


def print_sents_entities(results, query):
    #cols = [column[0] for column in results.description]
    #results = pd.DataFrame.from_records(data=results.fetchall(), columns=cols)
    Results = []
    for result in results:
        res = [result[0], result[1], result[2].split('\n')[2]]
        annotation = annotation2dict(result[3].split('\n'))
        if len(list(annotation.values())[0]) == 6:
            continue
        key_concept = [(k, t) for k, t in annotation.items() if query.lower() in t['entity_link'].lower()]
        try:
            annotation_ = list(annotation.values())
            idx = int(key_concept[0][0].split('_')[1])
            print(res[0].ljust(30), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx-8,idx)]).rjust(60), annotation_[idx]['form'].center(10), ' '.join([annotation_[idx_]['form'] for idx_ in range(idx+1,idx+9)]).ljust(60))
            Results.append(res)
        except:
            continue
    return Results


def print_sents(results, query):
    #cols = [column[0] for column in results.description]
    #results = pd.DataFrame.from_records(data=results.fetchall(), columns=cols)
    Results = []
    for result in results:
        try:
            res = [result[0], result[1], result[2].split('\n')[2]]
            idx = res[2].split().index(query)
            print(res[0].ljust(30), ' '.join(res[2].split()[idx-8:idx]).rjust(60), query.center(10), ' '.join(res[2].split()[idx+1:idx+9]).ljust(60))
            Results.append(res)
        except:
            continue
    return Results


def save_results(Results, query, type, db):
    with open(os.path.join('out/', '_'.join([db,type,query]) +'.tsv'), 'w') as f:
        writer = csv.writer(f, delimiter='\t')
        writer.writerows(Results)


def select_sents_with_keyword(conn, query, sent_n):
    c = conn.cursor()
    offset = 0
    more = ''
    Results = []
    count = c.execute(
            """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_text, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
            (' ' + query + ' ', 10000000, offset))
    mycount = count.fetchone()[0]
    print(mycount)
    while more != 'no':
        c = conn.cursor()
        #results = c.execute("""SELECT doc_id, sent_id, sent_text, sent_annotation FROM sents WHERE sent_text LIKE ? LIMIT ? OFFSET ? """, ('% '+query+' %', sent_n, offset))

        results = c.execute(
            """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_text, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
            (' ' + query + ' ', sent_n, offset))
        Results+=print_sents(results, query)
        more = input('Press "enter" for more sentences (type "no" and press "enter" to stop)')
        offset+=sent_n
    print(len(Results))
    return [count, Results]

def get_offset(concept):
    s = str(concept.offset())
    while len(s) < 8:
        s = '0' + s
    return 'wn:' + s + concept.pos()


def get_concept(query, concepts):
    lexicon = get_lexicon()
    if len(concepts) == 0:
        print('Your query does not have concepts connected with it. Please try with another one or use the "keyword" search.')
    elif len(concepts) > 1:
        print('The word {} is associated with {} concepts'.format(query, len(concepts)))
        print('Please select one concept from the list below indicating its number:')
        for i, concept in enumerate(concepts):
            offset = get_offset(concept)
            if offset in lexicon:
                print('{}*. {} - {}'.format(i, concept.pos(), concept.definition()))
            else:
                print('{}. {} - {}'.format(i, concept.pos(), concept.definition()))
        index = input()
        concept = concepts[int(index)]
    else:
        concept = concepts[0]
    print('The research is based on the concept defined as:\n{}:\t{}'.format(query, concept.definition()))
    offset = str(concept.offset())
    while len(offset) < 8:
        offset = '0' + offset
    return 'wn:' + offset + concept.pos(), concept

def select_sents_with_concept(conn, query, sent_n):
    concepts = wn.synsets(query)
    wn_key, concept = get_concept(query, concepts)
    c = conn.cursor()
    offset = 0
    more = ''
    Results = []
    count = c.execute("""SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """, (wn_key, 10000000, offset))
    count = count.fetchone()[0]
    c = conn.cursor()
    while more != 'no':
        results = c.execute("""SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """, (wn_key, sent_n, offset))
        Results+=print_sents_concepts(results, wn_key)
        more = input('Press "enter" for more sentences (type "no" and press "enter" to stop)')
        offset+=sent_n
    return [count, Results]

def select_sents_with_lemma(conn, query, sent_n):
    c = conn.cursor()
    offset = 0
    more = ''
    Results = []
    count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (query, 10000000, offset))
    count = count.fetchone()[0]
    c = conn.cursor()
    while more != 'no':
        results = c.execute(
        """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (query, sent_n, offset))
        Results+=print_sents_lemma(results, query)

        more = input('Press "enter" for more sentences (type "no" and press "enter" to stop)')
        offset+=sent_n
    return [count, Results]

def get_lexicon():
    with open('data/Polifonia_lexicon_v21.tsv') as f:
        reader = csv.reader(f, delimiter='\t')
        lexicon = {row[0] : [row[0]] + row[2:] for row in reader}
    return lexicon

def get_entities(query, lang):
    with open('data/lex_ent_map.pkl', 'rb') as f:
        ent_map = pickle.load(f)
    return ent_map[lang.upper()].get(query, [])

def get_entity(query, entities, lang):
    if len(entities) == 0:
        print(
            'Your query does not have entities connected with it. Please try with another one or use the "keyword" search.')
        sys.exit()
    with open('data/pages.pkl', 'rb') as f:
        pages = pickle.load(f)
    if len(entities) > 1:
        print('The word {} is associated with {} entity'.format(query, len(entities)))
        print('Please select one entity from the list below indicating its number:')
        for i, concept in enumerate(entities):
            print('{}. {} - {}'.format(i, concept, pages[lang.upper()][concept.replace(' ', '_')]))
        index = input()
        concept = entities[int(index)]
    else:
        concept = entities[0]
    print('The research is based on the concept defined as:\n{}:\t{}'.format(query, pages[lang.upper()][concept.replace(' ', '_')]))
    return concept


def select_sents_with_entity(conn, query, sent_n, lang):

    # TO BE IMPLMEMENTED:
    # use the Polifonia KB to retrieve all the entities related to a query
    entities = get_entities(query, lang)
    wkp_title = get_entity(query, entities, lang)

    c = conn.cursor()
    offset = 0
    more = ''
    Results = []
    count = c.execute(
        """SELECT count(doc_id), sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wkp_title, 10000000, offset))
    count = count.fetchone()[0]
    while more != 'no':
        results = c.execute(
        """SELECT doc_id, sent_id, sent_text, sent_annotation, INSTR(sent_annotation, ?) instr_ FROM sents WHERE instr_ > 0 LIMIT ? OFFSET ? """,
        (wkp_title, sent_n, offset))
        Results+=print_sents_entities(results, wkp_title)
        more = input('Press "enter" for more sentences (type "no" and press "enter" to stop)')
        offset+=sent_n
    return count, Results



def interrogate(annotations_path, corpus, lang, interrogation_type, query, sent_n, save_to_file):
    if len(lang) != 2:
        lang.capitalize()
    db_path = os.path.join(annotations_path, corpus.capitalize() + '-' + lang + '.db')
    if os.path.exists(db_path) == False:
        download_annotations(annotations_path, corpus.capitalize(), lang.upper())
    conn = create_connection(db_path)
    if interrogation_type == 'keyword':
        count, Results = select_sents_with_keyword(conn, query, sent_n)
    elif interrogation_type == 'concept':
        count, Results = select_sents_with_concept(conn, query, sent_n)
    elif interrogation_type == 'lemma':
        count, Results = select_sents_with_lemma(conn, query, sent_n)
    elif interrogation_type == 'entity':
        count, Results = select_sents_with_entity(conn, query, sent_n, lang)
    if save_to_file == 'Yes':
        save_results(Results, query, 'keyword', corpus)
        print('{} sentences stored'.format(len(Results)))


def bar_progress(current, total, width=80):
  progress_message = "Downloading: %d%% [%d / %d] bytes" % (current / total * 100, current, total)
  # Don't use print() as it will print in new line every time.
  sys.stdout.write("\r" + progress_message)
  sys.stdout.flush()

def download_annotations(annotations_path, module, lang):
    db_names = dict()
    with open(os.path.join(annotations_path, 'urls.csv')) as f:
        for i, line in enumerate(f.readlines()):
            if i == 0:
                continue
            name, lang_, url = line.split(',')
            url=url.strip()
            db_names['_'.join([name, lang_])] = url
    url = db_names.get('_'.join([module, lang]), '')
    if url == '-':
        raise Exception('The access to the database you are trying to download is restricted. Please contact the developers to see if it is possible to obtain it.')
    elif url == '':
        raise Exception('The database that you are trying to download do not exist. Please try with different parameters.')
    else:
        wget.download(url, out='../annotations/db/', bar=bar_progress)

    #gdown.download(db_names[db_name], os.path.join(annotations_path, db_name + '.db'), quiet=False)
            #response = requests.get(url, stream=True)
            #total_size_in_bytes = int(response.headers.get('content-lenght', 0))
            #block_size = 1024
            #progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True)
            #with open(os.path.join(annotations_path, '_'.join([name, lang]) + '.db'), 'wb') as f:
            #    for data in response.iter_content(block_size):
            #        progress_bar.update(len(data))
            #        f.write(data)
            #    progress_bar.close()
            #    if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
            #        print('ERROR: something went wrong!')

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--annotations_path', type=str, default='../annotations/db/')
    parser.add_argument('--corpus', type=str, default='Wikipedia',
                        help="It can be Wikipedia, Books, Periodicals or Pilots")
    parser.add_argument('--lang', type=str, default='EN', help="It can be DE, EN, ES, FR, IT or NL")
    parser.add_argument('--interrogation_type', type=str, default='keyword',
                        help="It can be keyword, concept or entity")
    parser.add_argument('--query', type=str, default='organ')
    parser.add_argument('--sent_n', type=int, default=50)
    parser.add_argument('--save_to_file', type=str, default='No')
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    interrogate(args.annotations_path, args.corpus, args.lang, args.interrogation_type, args.query, args.sent_n, args.save_to_file)


