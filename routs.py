import os
from flask import Flask, render_template, request, url_for

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/random_variables.html')
def random_variables():
    return render_template('random_variables.html')

@app.route('/probability_distributions.html')
def probability_distributions():
    return render_template('probability_distributions.html')

@app.route('/卡方分布.html')
def chi_square():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)