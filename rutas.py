from flask import Blueprint, render_template, request

rutas_bp = Blueprint('rutas_bp', __name__)

@rutas_bp.get('/')
def index(): return render_template('index.html')

@rutas_bp.post('/save')
def save():
    data:dict = request.get_json()
    print(data)
    return {}