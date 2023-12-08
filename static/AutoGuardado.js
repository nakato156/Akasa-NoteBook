function AutoGuardado(editors) {
    fetch(`/save`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({data:parseData(editors)})
    })
}

function updateCelda(celda){
    const id = celda.id
    const contenido = celda.editor.getValue();
    
    fetch(`/celda/update`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id, contenido})
    })
}

function createCelda(id, prevId){
    fetch('/celda/create',{
        method: 'post',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id, prevId})
    })
}

function parseData(editors){
    let data = []
    for(const item of editors){
        const content = item.editor.getValue();
        if(content.trim()) data.push({id:item.id, content})
    }
    return data;
}