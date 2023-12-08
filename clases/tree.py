from os import getcwd
from pathlib import Path
from typing import Generator

class Directorio:
    def __init__(self) -> None:
        self.path:Path = Path(getcwd())
        self.initial_path:Path = self.path
        self.files:Generator[Path, None, None] = self.path.iterdir()

    def __str__(self) -> str:
        return self.path.name
    
    def actualizar_directorio(self) -> None:
        self.files = self.path.iterdir()
    
    def listar_directorio(self) -> str:
        self.actualizar_directorio()
        return "\n".join(self.files)
    
    def cd(self, path: Path|str) -> None:
        self.path /= path
    

