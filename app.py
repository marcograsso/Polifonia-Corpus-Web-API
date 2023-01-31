from flask import Flask, jsonify, render_template, request
app = Flask(__name__)
from interrogation.interrogate import *


@app.route('/corpus/search')
def search():
    query = request.args.get('a', 0, type=str)
    corpus = request.args.get('b', 0, type=str)
    lang = request.args.get('c', 0, type=str)
    interrogation_type = request.args.get('d', 0, type=str)
    sent_n = request.args.get('n', 0, type=str)
    concept_id = request.args.get('k', 0, type=str)
    entity_id = request.args.get('e', 0, type=str)
    path = 'annotations/db/'
    results, stats = interrogate(path, corpus, lang, interrogation_type, query, sent_n, concept_id, entity_id)
    return jsonify(result=results, stat= stats)

@app.route('/corpus/report')
def report():
    message = request.args.get('err', 0, type=str)
    results = write_issue(message)
    return jsonify(result=results)

@app.route('/corpus')
def index():
    return render_template('index.html')
    
@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == "__main__":
    app.run(debug=True)
