window.onload = init

let editors = []
let celdasNB;
let focusUltimaCelda;
let temporizadorAutoGuardado;

function init(){
    const editores = document.querySelectorAll('.editor')
    celdasNB = document.getElementById('celdas')
    editores.forEach((celda, i) => {    
        if(i === 0) focusUltimaCelda = celda
        const editor = configEditor(celda.id)
        const nuevaCelda = {i, id: celda.id , editor};
        editor.session.on("change", function() {
            clearInterval(temporizadorAutoGuardado)
            temporizadorAutoGuardado = setTimeout(()=>updateCelda(nuevaCelda), 3000)
            if( i + 1< editors.length) updateFirstNumbersLines()
		});
        editors.push(nuevaCelda)
        updateFirstNumbersLines()
        changeFocus(celda)
    })
}

function updateFirstNumbersLines(){
    let sumaLongitudesAnteriores = 0;
    editors.forEach(function(objeto, _) {
        objeto.editor.setOption("firstLineNumber", sumaLongitudesAnteriores + 1)
        sumaLongitudesAnteriores += objeto.editor.session.getLength();
    });
}

function addCelda(){
    const div = document.createElement('div')
    div.classList.add('w-full', 'mb-2')

    const divEditor = document.createElement('div')
    divEditor.classList.add('editor')
    const id = generarHash()
    divEditor.id = id
    
    div.appendChild(divEditor)
    try {
        focusUltimaCelda.parentElement.insertAdjacentElement("afterend", div)
    } catch (error) {
        celdasNB.appendChild(div)
        focusUltimaCelda = divEditor
    }

    const editor = configEditor(id)
    const i = editors.length
    const indexCelda = getInddexCeldaById(focusUltimaCelda.id)
    editors.splice(indexCelda + 1, 0, {i, id , editor})
    updateFirstNumbersLines()
    changeFocus(divEditor)
}

function deleteCelda(){
    const indexEditor = getInddexCeldaById(focusUltimaCelda.id)
    editors.splice(indexEditor, 1)
    focusUltimaCelda.parentElement.remove()
    if(indexEditor == editors.length - 1 || indexEditor === -1) focusUltimaCelda = celdasNB.lastElementChild.firstElementChild
    if(editors.length === 0) focusUltimaCelda = null
    updateFirstNumbersLines()
}

function getInddexCeldaById(id){
    return editors.findIndex(objeto => objeto.id === id);
}

function configEditor(idEditor){
    const editor = ace.edit(idEditor);
    editor.setOptions({
        theme: 'ace/theme/monokai',
        mode: 'ace/mode/php',
        maxLines: 30,
        mergeUndoDeltas: true,
        mode: "ace/mode/php",
        showGutter: true,
        tabSize: 4,
        theme: "ace/theme/monokai",
        tooltipFollowsMouse: true,
        useSoftTabs: true,
        vScrollBarAlwaysVisible: false,
        wrapBehavioursEnabled: true
    });
    editor.commands.removeCommand("gotoline")
    editor.setValue('<?php\n\n?>')
    editor.gotoLine(2)
    editor.commands.addCommand({
        name:'executeCelda',
        bindKey: { win: 'Ctrl-enter', mac:'Command-enter'},
        exec: function(editor){
            ejecutarCelda(editor)
        }
    })
    return editor
}

function changeFocus(element){
    element.addEventListener('click', (e)=>{
        focusUltimaCelda = element
    })
}

function ejecutarCelda(editor){
    let value = editor.getValue()
    if(value.startsWith('<?php'))
        value = value.slice(5)
    if(value.endsWith('?>'))
        value = value.slice(0, -2)
    value = value.trim()
    console.log(value)
}

function generarHash(){
    // Generar un array de bytes aleatorios
    let array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // Convertir el array en una cadena hexadecimal
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}