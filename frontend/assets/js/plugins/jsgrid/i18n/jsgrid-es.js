(function(jsGrid) {

    jsGrid.locales.es = {
        grid: {
            noDataContent: "No encontrado",
            deleteConfirm: "�Est� seguro?",
            pagerFormat: "Paginas: {first} {prev} {pages} {next} {last} &nbsp;&nbsp; {pageIndex} de {pageCount}",
            pagePrevText: "Anterior",
            pageNextText: "Siguiente",
            pageFirstText: "Primero",
            pageLastText: "�ltimo",
            loadMessage: "Por favor espere...",
            invalidMessage: "Favor de verificar los datos en rojo"
        },

        loadIndicator: {
            message: "Cargando..."
        },

        fields: {
            control: {
                searchModeButtonTooltip: "Cambiar a b�squeda",
                insertModeButtonTooltip: "Cambiar a inserci�n",
                editButtonTooltip: "Editar",
                deleteButtonTooltip: "Suprimir",
                searchButtonTooltip: "Buscar",
                clearFilterButtonTooltip: "Borrar filtro",
                insertButtonTooltip: "Insertar",
                updateButtonTooltip: "Actualizar",
                cancelEditButtonTooltip: "Cancelar edici�n"
            }
        },

        validators: {
            required: { message: "Campo requerido" },
            rangeLength: { message: "La longitud del valor est� fuera del intervalo definido" },
            minLength: { message: "La longitud del valor es demasiado corta" },
            maxLength: { message: "La longitud del valor es demasiado larga" },
            pattern: { message: "El valor no se ajusta al patr�n definido" },
            range: { message: "Valor fuera del rango definido" },
            min: { message: "Valor demasiado bajo" },
            max: { message: "Valor demasiado alto" }
        }
    };

}(jsGrid, jQuery));
