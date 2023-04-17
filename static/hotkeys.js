Mousetrap.reset()
Mousetrap.bindGlobal('alt+d', function(event) {
    event.preventDefault(); // Prevenir la acción por defecto de la combinación de teclas
    deleteCelda()
});

Mousetrap.bindGlobal('alt+b', function(event) {
    event.preventDefault(); // Prevenir la acción por defecto de la combinación de teclas
    addCelda()
});