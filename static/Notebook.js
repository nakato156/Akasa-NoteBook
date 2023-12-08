class NoteBook {
    constructor(filename_, editores, celdasNB) {
        this.editores = editores
        this.filename = filename_;
        this.editors = []
        this.celdasNB = celdasNB;
        this.focusUltimaCelda;
        this.temporizadorGuardadoCelda;
        this.temporizadorAutoGuardado;
    }
    init = () => {
        this.editores.forEach((celda, i) => {    
            if(i === 0) this.focusUltimaCelda = celda
            const editor = this.#configEditor(celda.id)
            const nuevaCelda = {i, id: celda.id , editor};             
            editor.session.on("change", () => {
                if( i + 1 < this.editors.length) this.#updateFirstNumbersLines()
            });
            this.editors.push(nuevaCelda)
            this.#updateFirstNumbersLines()
            this.#changeFocus(celda)
        })
    }

    #createElementFromString(string){
        const parser = new DOMParser()
        const doc = parser.parseFromString(string, "text/html")
        return doc.body.firstChild
    }

    addCelda = () => {
        const div = document.createElement('div')
        div.classList.add('w-full', 'mb-2')
    
        const divEditor = document.createElement('div')
        divEditor.classList.add('editor')
        const id = generarHash()
        divEditor.id = id
        
        let temp_loading = `<div class="div_result flex w-full h-10 hidden border border-gray-200">
            <div class="w-[5%] h-auto">
                <div class="loader_icon flex-col gap-4 w-full flex items-center justify-start">
                    <div class="w-8 h-8 border-8 text-blue-400 text-4xl animate-spin border-gray-300 flex items-center justify-start border-t-blue-400 rounded-full">
                    </div>
                </div>
            </div>
            <div class="block w-[95%] h-auto result">
            </div>
        </div>`

        const element = this.#createElementFromString(temp_loading)

        div.appendChild(divEditor)
        div.appendChild(element)

        try {
            this.focusUltimaCelda.parentElement.insertAdjacentElement("afterend", div)
        } catch (error) {
            this.celdasNB.appendChild(div)
            this.focusUltimaCelda = divEditor
        }
        
        const editor = this.#configEditor(id)
        const i = this.editors.length
        const indexCelda = this.#getInddexCeldaById(this.focusUltimaCelda.id)
        this.editors.splice(indexCelda + 1, 0, {i, id , editor})
        this.#updateFirstNumbersLines()
        this.#changeFocus(divEditor)
        createCelda(id, this.focusUltimaCelda.id)
    }

    deleteCelda(){
        const indexEditor = this.#getInddexCeldaById(this.focusUltimaCelda.id)
        this.editors.splice(indexEditor, 1)
        this.focusUltimaCelda.parentElement.remove()
        if(indexEditor == this.editors.length - 1 || indexEditor === -1) this.focusUltimaCelda = this.celdasNB.lastElementChild.firstElementChild
        if(this.editors.length === 0) this.focusUltimaCelda = null
        this.#updateFirstNumbersLines()
    }
    
    conectarEntorno(){
        fetch('/editor/iniciar', {
            method: "POST",
        })
        .then(req => req.json())
        .then(res => {
            if(!res.status) return alert("Fallo al iniciar el entorno")
            this.sync()
        })
    }

    sync(){
        const data = this.editors.map((editor) => ({id:editor.id, valor:editor.editor.getValue()}))
        console.log(data)
        fetch('/editor/sync', {
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    }

    guardar = async () => {
        if(!__PATH__) {
            __PATH__ = await this.#getDirectory();
            if(!__PATH__) return;
        }
        fetch(`/save`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({tipo:'manual'})
        })
    }

    #getInddexCeldaById = (id) => {
        return this.editors.findIndex(objeto => objeto.id === id);
    }

    #updateFirstNumbersLines = () => {
        let sumaLongitudesAnteriores = 0;
        this.editors.forEach(function(objeto, _) {
            objeto.editor.setOption("firstLineNumber", sumaLongitudesAnteriores + 1)
            sumaLongitudesAnteriores += objeto.editor.session.getLength();
        });
    }

    #changeFocus = (element) => {
        element.addEventListener('click', (e) => this.focusUltimaCelda = element )
    }

    #ejecutarCelda = (idEditor, editor) => {
        const div_editor = editor.container.parentElement
        const div_result = div_editor.lastElementChild

        div_result.classList.remove("hidden")

        let value = editor.getValue()
        // if(value.startsWith('<?php'))
        //     value = value.slice(5)
        // if(value.endsWith('?>'))
        //     value = value.slice(0, -2)
        value = value.trim()

        const loader_icon = div_result.getElementsByClassName("loader_icon")[0]
        const resultado_celda = div_result.getElementsByClassName("result")[0]

        loader_icon.classList.remove("hidden")
        resultado_celda.innerHTML = ""
        fetch('/celda/ejecutar', {
            method: "POST",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: idEditor, contenido: value})
        })
        .then(req =>req.json())
        .then(res => {
            loader_icon.classList.add("hidden")
            resultado_celda.innerHTML = res.res.replace("\n", "<br>")
        })
    }
    
    #configEditor = (idEditor) => {
        const editor = ace.edit(idEditor);
        editor.setOptions({
            theme: 'ace/theme/monokai',
            mode: 'ace/mode/php',
            maxLines: 30,
            mergeUndoDeltas: true,
            showGutter: true,
            tabSize: 4,
            tooltipFollowsMouse: true,
            useSoftTabs: true,
            vScrollBarAlwaysVisible: false,
            wrapBehavioursEnabled: true
        });
        editor.commands.removeCommand("gotoline")
        editor.commands.removeCommand("findnext")
        editor.setValue('<?php\n\n?>')
        editor.gotoLine(2)
        const execCelda = (editor) => { this.#ejecutarCelda(idEditor, editor) }
        editor.commands.addCommand({
            name:'executeCelda',
            bindKey: { win: 'Ctrl-enter', mac:'Command-enter'},
            exec: (editor) => execCelda(editor)
        })
        editor.session.on('change', function() {
            clearInterval(this.temporizadorGuardadoCelda)
            this.temporizadorGuardadoCelda = setTimeout(()=>updateCelda({id: idEditor, editor}), 100)
        })
        return editor
    }
    #getDirectory = async () =>{    
        return window.showDirectoryPicker()
            .then( directoryHandle => directoryHandle.name + '/' )
            .catch( err => console.error('Error al seleccionar el directorio:', err) );
    }
}