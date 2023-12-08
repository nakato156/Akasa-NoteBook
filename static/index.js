window.onload = init
let notebook;

function init(){
    const editores = document.querySelectorAll('.editor')
    celdasNB = document.getElementById('celdas')
    notebook = new NoteBook(__Filename__, editores, celdasNB);
    notebook.init()
}

function saveName(){
    fetch('/saveName', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({nombre: document.getElementById('nombreFile').value})
    })
    .then(res => res.json())
    .then(data => {console.log(data)})
    .catch(err => console.log(err))
}
    
