$(function () {

    portal.processid = false
    portal.llaveTramite = false


    ListCatalogos.createTable('#coredataTables')

});


var ListCatalogos = {

    listaid: false,
    table: false,

    createTable: function (container) {
        portal.showMaskLoading('body', 'Cargando...', true)
        let buttons = `<button type="button" class="btn btn-icon-only bg-gradient-info btn-abre-caja" title="Editar"><span class="btn-inner--icon"><i class="far fa-edit"></i></span></button>`

        var url = portal.serverUrl + 'listaMotorCat';
        App.ajax('GET', url, false, false).promise.done(function (response) {
            if (response.success) {
                ListCatalogos.table = $(container).DataTable({
                    "pagingType": "full_numbers",
                    "lengthMenu": [
                        [10, 25, 50, 100, -1],
                        [10, 25, 50, 100, "All"]
                    ],
                    "order": [[0, "desc"]],
                    responsive: true,
                    language: {
                        search: "_INPUT_",
                        searchPlaceholder: "Buscar",
                    },
                    /* "columnDefs": [{
                        "targets": -1,
                        "data": null,
                        "className": 'text-right',
                        "defaultContent": buttons
                    }], */
                    rowId: "id_motor_catalogo_lista",
                    columns: [
                        { data: "folio"},
                        { data: "titulo"},
                        { data: "agregadopor"},
                        { data: "fechaagregado"},
                        { data: "status"},
                        // { data: "acciones"}
                    ],
                    data: response.data
                });
                portal.hideMaskLoading('body')
            } else
                md.showNotification('bottom', 'center', response.errors[0], 'danger')

            $(container + ' tbody').on('click', 'td', function () {
                if (!$(this).hasClass('text-right')) {

                    portal.showMaskLoading('body', 'Obteniendo Datos...', true)
                    var rowid = ListCatalogos.table.row($(this).parent()).id()
                    Cookies.set('admintorre_sess_catagid', parseInt(rowid), { expires: 365 })
                    window.location.href = "motor-catalogos.html"

                }
            });

        }).fail(function (jqXHR, textStatus, errorThrown) {
            App.consoleError(jqXHR, textStatus, errorThrown)
        })
    }

}