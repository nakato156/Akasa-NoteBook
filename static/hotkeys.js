Mousetrap.reset()
Mousetrap.bindGlobal('alt+d', function(event) {
    event.preventDefault(); // Prevenir la acción por defecto de la combinación de teclas
    notebook.deleteCelda()
});

Mousetrap.bindGlobal('alt+b', function(event) {
    event.preventDefault();
    notebook.addCelda()
});

Mousetrap.bindGlobal('ctrl+s', function(event) {
    event.preventDefault();
    notebook.guardar()
})

Mousetrap.bindGlobal('ctrl+m+k', function(event) {
    event.preventDefault();
    console.log("up")
    // notebook.moveUp()
})
Mousetrap.bindGlobal('ctrl+m+j', function(event) {
    event.preventDefault();
    console.log("down")
    // notebook.moveDown()
})