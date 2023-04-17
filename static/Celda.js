function AutoGuardado(editors, tipo) {
    fetch(`/save`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({tipo, data:parseData(editors)})
    })
}

function updateCelda(celda){
    const id = celda.id
    const content = celda.editor.getValue();
    
    fetch(`/celda/update?id=${id}`,{
        method: 'POST',
        body: JSON.stringify({content})
    })
}

function createCelda(celda, prevId){
    const id = celda.id
    const content = celda.editor.getValue()

    fetch('/celda/create',{
        method: 'post',
        body: JSON.stringify({id, content, prevId})
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