from pathlib import Path

class Celda:
    def __init__(self, id_:str, contenido:str) -> None:
        self.id = id_
        self.contenido: str = contenido
        self.sig: Celda|None = None
    
    def endswith(self, cadena:str) -> bool:
        return self.contenido.endswith(cadena)

    def __str__(self): return self.contenido

class NoteBook():
    def __init__(self, path:Path, filename:str = "sin_titulo.php")->None:
        self.filename:str =  path.name if path.name.endswith('.php') else filename
        self.path:Path = path / filename

        self.head:Celda|None = None
        self.current: Celda|None = None
        self.tabla_hash: dict[Celda] = {}

    def append(self, nueva_celda:Celda):
        if self.head is None:
            self.head = nueva_celda
            self.current = self.head
        else:
            self.current.sig = nueva_celda
            self.current = self.current.sig
        self.tabla_hash[nueva_celda.id] = nueva_celda

    def set(self, data:dict):
        self.head = None
        for data_celda in data:
            self.append(Celda(data_celda['id'], data_celda['contenido']))

    def modify_node(self, new_celda:Celda):
        self.tabla_hash[new_celda.id] = new_celda

    def insert(self, prev:str|None, nueva_celda: Celda):
        if prev == None:
            nueva_celda.sig = self.head
            self.head = nueva_celda
        else:
            current_node = self.head
            while current_node.id != prev and current_node.sig != None:
                current_node = current_node.sig
            if current_node.sig == None: return self.append(nueva_celda)
            nueva_celda.sig = current_node.sig
            current_node.sig = nueva_celda
        self.tabla_hash[nueva_celda.id] = nueva_celda

    def save_file(self):
        with open(self.path) as f:
            ...
