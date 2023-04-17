from flask import Flask
from rutas import rutas_bp
from helpers.funciones import *

app = Flask(__name__)
app.register_blueprint(rutas_bp)

if __name__ == '__main__':
    app.run(debug=True)