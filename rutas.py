from flask import Blueprint, render_template, request
from clases.Notebook import NoteBook, Celda
from clases.tree import Directorio

rutas_bp = Blueprint('rutas_bp', __name__)
directorio = Directorio()
notebook:NoteBook = NoteBook(path=directorio.path)

@rutas_bp.get('/')
def index(): 
    return render_template('index.html', notebook=notebook)

@rutas_bp.post('/save')
def save():
    data:dict = request.get_json()
    notebook.save()
    return {}

@rutas_bp.post('/celda/update')
def modify(): 
    data:dict = request.json
    id_celda, val_celda = data.get('id'), data.get('contenido')
    notebook[id_celda] = val_celda
    return {'status': True}

@rutas_bp.post('/celda/create')
def create():
    data:dict = request.json
    notebook.insert(data.get('prevId'), data.get('id'))
    return {'status': True}

@rutas_bp.delete('/celda/delete')
def delete():
    data:dict = request.json
    del notebook[data.get('id')]
    return {'status': True}

@rutas_bp.post('/celda/ejecutar')
def ejecutar():
    if notebook.php_process == None: notebook.init_proceso_php()
    
    data:dict = request.get_json()
    id_celda, val_celda = data.get('id'), data.get('contenido')

    notebook[id_celda] = val_celda
    salida:str = notebook.ejecutarCelda(id_celda)
    return {'res': salida}

@rutas_bp.post("/editor/iniciar")
def iniciar():
    try:
        if not notebook.php_process is None: notebook.php_process.kill()
        notebook.init_proceso_php()
        return {"status": True}
    except:
        return {"status": False}

@rutas_bp.post("/editor/sync")
def sync():
    celdas:list = request.json
    for celda in celdas:
        notebook.append(Celda(celda["id"], celda["valor"]))
    
    return {"status": True}