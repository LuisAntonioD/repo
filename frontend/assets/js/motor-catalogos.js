$(function () {

    portal.processid = false
    portal.llaveTramite = false
    portal.catalogid = Cookies.get('admintorre_sess_catagid')

    if (portal.catalogid) {
        portal.showMaskLoading('body', 'Cargando...', true)
        MotorCatalogos.getTitlesListByCatalogoId(portal.catalogid)
        MotorCatalogos.createTableByCatalogoId('#coredataTables', portal.catalogid)
        if (portal.filejs) {
            portal.includeJs(portal.filejs)
        }
    }

    $('.newCatalog').on('click', function () {
        $(".detail-cat").addClass('hidden')
        $('tr.selected').removeClass('selected')
        $('.row.row-detail-cat').hide()
        $('.row.detail-cat').hide()
        portal.llaveCatalog = false
        portal.indexTable = false
        MotorCatalogos.getDetailByCatalogId('.tabs-conteiner', portal.catalogid, false)
    })



    $(this).on('click', '.btn.btn-save', function () {
        var forms = $('form')
        var formsData = {}
        forms.each(function () {
            idForm = $(this).attr('id')
            if (!$('#' + idForm).hasClass('no-save-auto')) {
                if (idForm != undefined) {
                    formsData[idForm] = $(this).serializeArray()
                    portal.setFormValidation('#' + idForm)
                    $('#' + idForm).submit()
                }
            }
        })
        var numErrors = $(".has-danger").toArray().length
        if (!numErrors) {
            if (Object.keys(formsData).length) {
                portal.showMaskLoading('.modal-content', 'Guardando Cambios...', true)
                portal.saveCatalog(formsData, portal.catalogid)
            } else
                md.showNotification('bottom', 'center', 'No se ha hecho algun cambio.', 'danger')
        } else
            md.showNotification('bottom', 'center', 'Favor de completar campos Obligatorios ' + numErrors, 'danger')
    })

    $(this).on('submit', 'form', function (event) {
        event.preventDefault()
    })

    $(this).on('submit', 'form.form-detalle', (e) => {
        e.preventDefault()
        MotorCatalogos.guardarDetalle()
    })

    $(this).on('click', '.btn.btn-sm.btn-secondary.btn-cancel', function(){
        $('.row.row-detail-cat').slideUp(400)
        setTimeout(() => {
            $('.row.detail-cat').slideDown(400)
        }, 500)
    })
    
    $(this).on('click', '.action.btn-danger.btn-delete-det', function(){
        MotorCatalogos.index_table_det = MotorCatalogos.tabledet.row($(this).closest('tr')).index()
        MotorCatalogos.deleteRowDet(MotorCatalogos.tabledet.row($(this).closest('tr')).id())
    })

})

const MotorCatalogos = {

    tabledet: false,
    columns: false,
    rowid: false,
    index_table: false,
    index_table_det: false,

    deleteRowDet: function (id) {
        swal({
            title: 'Realmente desea Eliminar esta fila?',
            text: "Esta acci&oacute;n eliminara este registro efinitivamente.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'btn btn-success',
            cancelButtonClass: 'btn btn-danger',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            buttonsStyling: false
        }).then(function () {

            var url = portal.serverUrl + 'delteRowCatalogDet/' + id
            App.ajax('DELETE', url, false, false).promise.done(function (response) {

                if (response.success) {
                    MotorCatalogos.tabledet.row(MotorCatalogos.index_table_det).remove().draw()
                    portal.showNotification('success', 'ni ni-bell-55', 'Petici&oacute;n procesada con &eacute;xito', "Cambios guardados correctamente.")
                }
                else
                    portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

            }).fail(function (jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })

        }, function (dismiss) {
            if (dismiss === 'cancel') {
                swal({
                    title: 'Cancelado',
                    text: 'No se elimino el registro.',
                    type: 'error',
                    confirmButtonClass: "btn btn-osx",
                    buttonsStyling: false
                }).catch(swal.noop)
            }
        })
    },

    guardarDetalle: () => {
        let obj = $(".form-detalle").serializeArray()
        if (MotorCatalogos.rowid)
            obj.push({ 'name': 'det_key', 'value': MotorCatalogos.rowid})

        portal.showMaskLoading('body', 'Guardando datos...', true)

        let url = portal.serverUrl + 'detailCatalog'
        App.ajax((MotorCatalogos.rowid ? 'PUT' : 'POST'), url, false, obj).promise.done(function (response) {

            if (response.success) {

                $('.row.row-detail-cat').slideUp(400)
                setTimeout(() => {
                    $('.row.detail-cat').slideDown(400)
                    MotorCatalogos.getDetailByCatalogId('.tabs-conteiner', portal.catalogid)
                },500)

                MotorCatalogos.rowid = false
                MotorCatalogos.index_table = false
                portal.hideMaskLoading('body')

            } else
                portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

        }).fail(function (jqXHR, textStatus, errorThrown) {
            App.consoleError(jqXHR, textStatus, errorThrown)
        })

    },

    showRowTableDet: (data) => {
        $('.row.detail-cat').slideUp(400)
        setTimeout(() => {
            $('.row.row-detail-cat').slideDown(400)
        }, 500)
        

        let html = ''

        for (let i in MotorCatalogos.columns) {
            let obj = MotorCatalogos.columns[i]

            if (obj.modificable){
                if (data)
                    if (obj.data in data)
                        obj.value = data[obj.data]
                    else
                        obj.value = false
                else
                    obj.value = false

                html += `<div class="col-md-4">
                            <div class="form-group">
                            <label class="bmd-label-floating "> ${obj.title} </label>
                                ${portal.getObjetHmtl(obj)}
                            </div>
                        </div>`
            }
        }

        $(".row.row-detail-cat .bg-gradient-light .form-detalle .row.content").html(html)
        $('.selectpicker').selectpicker('refresh')
    },

    llenarTabla: (data_det) => {
        MotorCatalogos.tabledet.clear().rows.add(data_det).draw()
    },

    createTableDetail: (data_det) => {
        let button_delete = `<button type="button" class="btn btn-icon-only action btn-danger btn-delete-det" data-toggle="tooltip" title="Eliminar"><span class="btn-inner--icon"><i class="far fa-trash-alt"></i></span></button>`
        MotorCatalogos.columns.push({ alignment: "left", title: "Acciones", width: "50", class: 'action'})
        
        MotorCatalogos.tabledet = $("#tabledet").DataTable({
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
            columnDefs: [{
                "targets": -1,
                "data": null,
                "className": 'text-right',
                "defaultContent": button_delete
            }],
            rowId: "_id",
            buttons: [
                {
                    text: 'Nuevo',
                    className: 'btn btn-sm btn-success pt-1 pb-1 pl-2 pr-2 btn-new-det',
                    action: function (e, dt, node, config) {
                        MotorCatalogos.rowid = false
                        MotorCatalogos.index_table = false
                        MotorCatalogos.showRowTableDet(false)
                    }
                }
            ],
            columns: MotorCatalogos.columns
        })

        MotorCatalogos.llenarTabla(data_det)

        $('#tabledet tbody').on('click', 'td', function () {
            if (!$(this).hasClass('action')) {
                MotorCatalogos.rowid = MotorCatalogos.tabledet.row($(this).parent()).id()
                if (MotorCatalogos.rowid)
                    MotorCatalogos.index_table = MotorCatalogos.tabledet.row($(this).closest('tr')).index()
                let data = MotorCatalogos.tabledet.row($(this).parent()).data()
                MotorCatalogos.showRowTableDet(data)
            }
        })
    },

    getDetailByCatalogId: function (conteiner, catalogid) {
        if (conteiner && catalogid) {

            var url = portal.serverUrl + 'getDetailCat/' + catalogid
            App.ajax('GET', url, false, false).promise.done(function (response) {

                if (response.success) {
                    var data = response.data
                    var html = ``
                    var colors = {
                    
                        'success' : 'Verde',
                        'info' : 'Azul',
                        'primary' : 'Morado',
                        'secondary' : 'Gris',
                        'warning' : 'Amarillo',
                        'danger' : 'Rojo',
                        'dark' : 'Negro',
                        'white' : 'Blanco',
                        'light': 'Blanco - Gris',
                        'transparent': 'transparente'
                    }
                    for (var cont in data) {
                        if (data[cont].typeobj == 'select')
                            classStatic = "mdc-select bmd-label-static"
                        else
                            classStatic = ''
                    
                        const value = data[cont].value !== undefined && data[cont].value !== null 
                            ? String(data[cont].value).toLowerCase() 
                            : '';
                        
                        const colorName = colors[value] || '';
                    
                        html += `<div class="col-md-4">
                            <div class="form-group">
                                <label class="bmd-label-floating ${classStatic}">${data[cont].label}</label>
                                ${data[cont].name === 'color_tab' 
                                    ? `<div class="d-flex align-items-center">
                                        ${portal.getObjetHmtl(data[cont])}
                                        <div class="ms-2 bg-${value} rounded manita" 
                                             data-toggle="tooltip" 
                                             data-bs-original-title="Color ${colorName}" 
                                             aria-label="Color ${value}" 
                                             style="width: 40px; height: 40px; display: inline-block;"></div>
                                       </div>`
                                    : portal.getObjetHmtl(data[cont])}
                            </div>
                        </div>`;
                    }

                    $(".motor-catalogo .fields-catalog ").html(html)

                    if ("data_det" in response){
                        $('.row.detail-cat').show()
                        $('.row.row-detail-cat').hide()
                        MotorCatalogos.columns = response.columns
                        if (!MotorCatalogos.tabledet)
                            MotorCatalogos.createTableDetail(response.data_det)
                        else
                            MotorCatalogos.llenarTabla(response.data_det)
                    }

                    $('#myModal').modal('show')
                    portal.refreshTooltip()
                    $('.selectpicker').selectpicker('refresh')

                } else
                    portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

            }).fail(function (jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })

        }

    },

    getTitlesListByCatalogoId: function (catalogoid) {

        if (catalogoid) {

            var url = portal.serverUrl + 'getTitlesListCat/' + catalogoid
            App.ajax('GET', url, false, false).promise.done(function (response) {

                if (response.success) {
                    // $('.title-page').text(response.data.title)
                    $('.title-list').text(response.data.titleList)
                    $('.title-button').text(response.data.titleBtnNew)
                }else
                    portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

            }).fail(function (jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })

        }

    },

    createTableByCatalogoId: function (tableid, catalogid) {

        if (tableid, catalogid) {

            var url = portal.serverUrl + 'motorListaCat/' + catalogid
            App.ajax('GET', url, false, false).promise.done(function (response) {
                if (response.success) {

                    if (response.data.actions != undefined) {
                        var actions = response.data.actions
                        var buttons = "";
                        for (var cont in actions) {
                            buttons += `<button type="button" data-function="${actions[cont].function}" class="btn btn-icon-only action ${actions[cont].classColor}" data-toggle="tooltip" title="${actions[cont].title}"><span class="btn-inner--icon"><i class="far ${actions[cont].class}"></i></span></button>`
                        }

                        portal.table = $(tableid).DataTable({
                            data: response.data.data,
                            columns: response.data.columns,
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
                            "columnDefs": [{
                                "targets": -1,
                                "data": null,
                                "className": 'text-right',
                                "defaultContent": buttons
                            }]
                        })
                    } else {

                        portal.table = $(tableid).DataTable({
                            data: response.data.data,
                            columns: response.data.columns,
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
                            }
                        })

                    }

                    portal.table.on('click', '.btn.btn-icon-only.action', function (event) {
                        var data, functionBtn

                        data = portal.table.row($(this).closest('tr')).data()
                        portal.indexTable = portal.table.row($(this).closest('tr')).index()
                        functionBtn = $(this).data('function')

                        eval(functionBtn + "(data)")
                    });

                    $(tableid + ' tbody').on('click', 'td', function () {
                        if (!$(this).hasClass('text-right')) {
                            
                            $('tr.selected').removeClass('selected')
                            $(this).parent('tr').addClass('selected')

                            var data = portal.table.row($(this).parent()).data()
                            portal.llaveCatalog = parseInt(data[0])
                            portal.indexTable = portal.table.row($(this).parent()).index()
                            MotorCatalogos.getDetailByCatalogId('.tabs-conteiner', portal.catalogid)
                        }
                    });

                } else
                    portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

                portal.hideMaskLoading('body');

            }).fail(function (jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })

        }

    },

}