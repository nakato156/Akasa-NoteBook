from pathlib import Path
from subprocess import Popen, PIPE
from queue import Queue, Empty as QueueEmpty
from time import time
from threading import Thread
from secrets import token_hex

class Celda:
    def __init__(self, id_:str, contenido:str) -> None:
        self.id = id_
        self.contenido: str = contenido
        self.sig: Celda|None = None
        
        self.buf_size = 1000
        self._outup_data = Queue(self.buf_size)
        self.terminate_line = f"{token_hex(10)}\n"
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'contenido': self.contenido
        }

    def endswith(self, cadena:str) -> bool:
        return self.contenido.endswith(cadena)
    
    def startswith(self, cadena:str) -> bool:
        return self.contenido.startswith(cadena)

    def _leer_salida(self, proceso, output_queue:Queue):
        for line in  proceso.stdout:
            output_queue.put(line)
            if self.terminate_line in line:
                break
    
    def ejecutar(self, proceso:Popen) -> str:
        command = self.contenido.strip() + "\n" + f'echo("{self.terminate_line}");'
        proceso.stdin.write(command)
        proceso.stdin.flush()
        
        timeout = 7
        output = ""
        start_time = time()

        thread = Thread(target=self._leer_salida, args=(proceso, self._outup_data))
        thread.start()

        while thread.is_alive():
            thread.join(timeout=1)

            try:
                line = self._outup_data.get_nowait()
                if self.terminate_line in line: break
                output += line
                start_time = time()
            except QueueEmpty: pass

            # Verifica si ha pasado el tiempo de espera
            if time() - start_time > timeout:
                break
        self._outup_data = Queue(self.buf_size)
        return output
  
    def __str__(self) -> str:
        return self.contenido
    
class NoteBook():
    def __init__(self, path:Path = None, filename:str = "sin_titulo.php")->None:
        self.path = path
        self.filename:str = filename
        if path != None:
            self.filename:str =  path.name if path.name.endswith('.php') else filename
            self.path:Path = path / filename
        
        self.head:Celda|None = None
        self.current: Celda|None = None
        self.tabla_hash: dict[str, Celda] = {}
        self.php_process: None | Popen = None
    
    def init_proceso_php(self):
        self.php_process = Popen(['php', '-a'], stdin=PIPE, stdout=PIPE, stderr=PIPE, text=True)
        self.php_process.stdin.write("echo '\n';")
        self.php_process.stdin.flush()
        self.php_process.stdout.readlines(4)

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

    def ejecutarCelda(self, idCelda:str) -> str:
        return self.tabla_hash[idCelda].ejecutar(self.php_process,)

    def modify_node(self, new_celda:Celda):
        if new_celda.id in self.tabla_hash:
            self.tabla_hash[new_celda.id].contenido = new_celda.contenido
        else: self.append(new_celda)
        
    def insert(self, prevId:str|None, id_celda:str, val_celda:str = ''):
        nueva_celda = Celda(id_celda, val_celda)
        if prevId and self.head == None:
            self.head = Celda(prevId, '')
            self.head.sig = nueva_celda
            self.tabla_hash[prevId] = self.head
        if prevId == None:
            nueva_celda.sig = self.head
            self.head = nueva_celda
        else:
            current_node = self.head
            while current_node.id != prevId and current_node.sig != None:
                current_node = current_node.sig
            if current_node.sig == None: return self.append(nueva_celda)
            nueva_celda.sig = current_node.sig
            current_node.sig = nueva_celda
        self.tabla_hash[nueva_celda.id] = nueva_celda
    
    def intercambiar(self, id_obj1, id_obj2):
        if id_obj1 == id_obj2: return
        
        prev1: Celda = None
        curr1: Celda = self.head
        while curr1 and curr1.id != id_obj1:
            prev1 = curr1
            curr1 = curr1.sig

        prev2: Celda = None
        curr2: Celda = self.head
        while curr2 and curr2.id != id_obj2:
            prev2 = curr2
            curr2 = curr2.sig

        if not curr1 or not curr2: return

        if prev1:
            prev1.sig = curr2
        else:
            self.head = curr2

        if prev2:
            prev2.sig = curr1
        else:
            self.head = curr1

        curr1.sig, curr2.sig = curr2.sig, curr1.sig

    def save(self):
        with open(self.path, 'w') as f:
            current_node = self.head
            end_php = False
            for celda in self:
                contenido:str = celda.contenido.strip()
                id_celda:str = celda.id
                if end_php and contenido.startswith('<?php'): 
                    contenido = f"#{id_celda}\n{contenido[5:].strip()}"
                elif not contenido.startswith('<?php'): 
                    contenido = f'?>\n<!--{id_celda}-->\n{contenido}\n<!--end-->\n'
                    end_php = False
                else:
                    contenido =  f"{contenido[:5]}\n#{id_celda}\n{contenido[5:].strip()}"

                if contenido.endswith('?>'):
                    contenido = contenido[:-2].strip() + '\n#end\n'
                    end_php = True
                else: end_php = False

                f.write(contenido)
                end_php = current_node.contenido.strip().endswith('?>')
                current_node = current_node.sig

    def __setitem__(self, key:str, value:str):
        self.modify_node(Celda(key, value))

    def __getitem__(self, key:str) -> Celda:
        return self.tabla_hash[key]

    def __delitem__(self, key:str):
        current_node = self.head
        if current_node.id == key:
            self.head = current_node.sig
        else:
            while current_node.sig.id != key:
                current_node = current_node.sig
            current_node.sig = current_node.sig.sig
        del self.tabla_hash[key]

    def __iter__(self):
        self.current_iter = self.head
        return self
    
    def __next__(self):
        if self.current_iter != None: 
            current_node = self.current_iter
            self.current_iter = self.current_iter.sig
            return current_node
        else:
            del self.current_iter
            raise StopIteration

    def open(self):
        if not self.path.exists(): return
        self.head = None
        with open(self.path, 'r') as f:
            current_id = None
            current_code = ""
            for line in f:
                if line.startswith(("#end", '<!--end')):
                    self.append( Celda(current_id, f"{current_code.strip()}\n?>\n") )
                    current_id, current_code = None, ""
                elif line.startswith(("#", "<!--")):
                    current_id = line[1:].strip() if line.startswith("#") else line[4:-4].strip()
                    current_code = "<?php\n" if line.startswith("#") else ""
                elif current_id: current_code += line

            if current_id:
                self.append(Celda(current_id, current_code.strip()))
