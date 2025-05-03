$(function(){


    $(this).on('click', '#consultar', function(){
        
       let id_ticket = $(this).data('id-ticket'); 
		$('#myModalTicketResuelto').modal('show');
        $('#myModalTicketResuelto .modal-header .modal-title').html(`<strong>Historial del Ticket <strong id="id_ticket">${id_ticket}</strong></strong>`);
        $('#myModalTicketResuelto .modal-footer').html(`<button type="button" class="btn btn-default" data-bs-dismiss="modal">Cerrar</button>`);
        TicketsResueltos.historialTicket(id_ticket)
    });


    //BOTON FILTRAR
    $("#btn_aplicar_filtros").on('click',function(e){
        TicketsResueltos.llenaTabla()
        $('.selectpicker').selectpicker('refresh');
    });


    //BOTON LIMPIAR FILTROS
    $("#btn_limpiar_filtros").on('click',function(e){
        portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n Recibida ', 'Los filtros se han restablecido');
        $('#prioridades').empty();
        portal.getOptionsCombo("#prioridades", "prioridad");
        $('#prioridades').selectpicker('refresh');
        $('#portales').empty();
        portal.getOptionsCombo("#portales", "status");
        $('#portales').selectpicker('refresh');
        Tickets.getTicketsRegistrados();

        
    });

	TicketsResueltos.tablaTicketsResueltos = $("#tablaTicketsResueltos").DataTable({
		responsive: true,
		paging: true,
		searching: true,
		ordering: true,
		info: true,
		autoWidth: true,
		language: {
            search: "_INPUT_",
            searchPlaceholder: "Buscar",
        },
        "lengthMenu": [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, "All"]
        ],
        buttons: [
            {
              extend: 'excel', 
              text: '<i class="fas fa-file-excel fa-2x text-success" title="Exportar a Excel" data-toggle="tooltip"></i>',
              className: 'pt-1 pb-1 pl-2 pr-2' 
            },
            {
              extend: 'pdf', 
              text: '<i class="fas fa-file-pdf fa-2x text-success" title="Exportar a PDF" data-toggle="tooltip"></i>',
              className: 'pt-1 pb-1 pl-2 pr-2'
            },
            {
              extend: 'print', 
              text: '<i class="fas fa-print fa-2x text-success" title="Imprimir" data-toggle="tooltip"></i>',
              className: 'pt-1 pb-1 pl-2 pr-2'
            },
            {
                text: '<i class="fas fa-search fa-2x text-success" title="Filtros" data-toggle="tooltip"></i>',
                    className: 'pt-1 pb-1 pl-2 pr-2',
                action: function ( e, dt, node, config ) {
                    $('#mod_filtros').modal('show');
                }
            }
        ],
		columns: [
			{data: "id_ticket", className: "text-center"},
			{data: "titulo", className: "text-start"},
			{data: "descripcion", className: "text-start"},
			{
                data: "portal",
                className: "text-start",
                render: function(data, type, row) {
                    if (data == "FACTURANOT") {
                        return '<strong><span class="badge bg-gradient-info">' + data + '</span></strong>';
                    } else if (data == "AVALUOS MGP") {
                        return '<strong><span class="badge bg-gradient-secondary">' + data + '</span></strong>';
                    } else if (data == "CORREGIDORA") {
                        return '<strong><span class="badge bg-gradient-success">' + data + '</span></strong>';
                    } else if (data == "EL MARQUES") {
                        return '<strong><span class="badge bg-gradient-warning">' + data + '</span></strong>';
                    } else if (data == "EZEQUIEL MONTES") {
                        return '<strong><span class="badge bg-gradient-danger">' + data + '</span></strong>';
                    } else if (data == "SAN JOAQUIN") {
                        return '<strong><span class="badge bg-gradient-primary">' + data + '</span></strong>';
                    } else if (data == null) {
                        return '';
                    }
                }
            },
            {
                data: "nombre_prioridad",
                className: "text-center",
                render: function(data, type, row) {
                    if (data == "Critica") {
                        return '<strong><span class="badge bg-gradient-danger">' + data + '</span></strong>';
                    } else if (data == "Alta") {
                        return '<strong><span class="badge bg-gradient-warning">' + data + '</span></strong>';
                    } else if (data == "Media") {
                        return '<strong><span class="badge bg-gradient-info">' + data + '</span></strong>';
                    } else if (data == "Baja") {
                        return '<strong><span class="badge bg-gradient-success">' + data + '</span></strong>';
                    } else if (data == null) {
                        return '';
                    }
                    else{
                        return '<strong><span class="badge bg-gradient-dark">' + data + '</span></strong>';
                    }
                }
            },
            {
                data: "ticket_status",
                className: "text-center",
                render: function(data, type, row) {
                    
                    return '<strong><span class="badge bg-gradient-success">' + data + '</span></strong>';
                }
            },
            {data: "fecha", className: "text-center"},
            {
                data: null,
                className: "text-center",
                render: function(data, type, row) {
                    return `<div class="action-buttons btn-group">
                                <span id="consultar" data-id-ticket="${row.id_ticket}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-success" data-bs-original-title="Consultar Ticket" aria-label="Consultar Ticket"><i class="fa-solid fa-clock-rotate-left"></i></span>
                            </div>`;
                }
            }
			
		],
		order: [[0, 'desc']] 
	});


    TicketsResueltos.getTicketsResueltos();	
    portal.getOptionsCombo("#prioridades", "prioridad");
    portal.getOptionsCombo("#portales", "portales");

});

var TicketsResueltos = {
	
	tablaTicketsResueltos: false,


    
	getTicketsResueltos: function(){
		let url = portal.serverUrl+'getTicketsResueltos' 
		App.ajax('GET', url, false, null).promise.done(function(response){

			if(response.success)
			{
				TicketsResueltos.tablaTicketsResueltos.clear().rows.add(response.data).draw()
				
			}
			else
				portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},


    historialTicket: function(id){
		let obj = {id_ticket: id}
		portal.showMaskLoading('body', 'Cargando Detalle...')
        var url = portal.serverUrl + 'historialTicket'
        App.ajax('POST', url, false, obj).promise.done(function (response) {
            if (response.success) {
                if (response.data.length > 0) {
                    
                    let timeline = response.data.map(item => {
                        let colorUsuario = item.usertype === 1 ? 'success' : 'danger';
                        let icono = item.usertype === 1 ? 'ni ni-single-02' : 'ni ni-single-02';
        
                        console.log(item)
                        let fecha = new Date(item.fecha);
                        let fechaFormateada = fecha.toLocaleDateString('es-MX', { 
                            day: 'numeric', 
                            month: 'short', 
                            hour: 'numeric', 
                            minute: 'numeric' 
                        }).toUpperCase();
                        console.log(fecha)
                        
        
        
                        if ([1, 5, 6].includes(item.id_categoria)) {
                            return `
                            <div class="row d-flex justify-content-center">
                                <div class="col-6">
                                    <div class="card bg-gradient-success text-center">  <!-- text-center añadido aquí -->
                                        <div class="card-body p-3">
                                            <div class="d-flex flex-column align-items-center">  <!-- Cambiado a flexbox column -->
                                                <div class="numbers">
                                                    <p class="text-white font-weight-bolder mb-0 text-capitalize font-weight-bold">
                                                        ${item.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                        }
        
                        return `
                        <div class="timeline-block mb-3">
                            <span class="timeline-step">
                                <i class="${icono} text-${colorUsuario} text-gradient"></i>
                            </span>
                            <div class="timeline-content">
                                <h6 class="text-dark text-sm font-weight-bold mb-0">${item.message}</h6>
                                <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">${fechaFormateada}</p>
                                <p class="text-sm mt-3 mb-2">
                                    ${item.message}
                                </p>
                                <span class="badge badge-sm bg-gradient-${colorUsuario}">${item.portal}</span>
                            </div>
                        </div>`;
                    }).join('');
                    let html = `
                        <div class="timeline timeline-one-side" data-timeline-axis-style="dotted">
                            ${timeline}
                        </div>`;
                    
                    $('.historial').html(html);
        
                        portal.hideMaskLoading('body')
                } else {
                    let html = 
                    `<div class="text-center">
                            No hay historial para este ticket
                    </div>`;
                    $('.historial').html(html);
                    portal.hideMaskLoading('body')
                }
            
			} 
        }).fail(function (jqXHR, textStatus, errorThrown) {
            portal.hideMaskLoading('body');
            App.consoleError(jqXHR, textStatus, errorThrown)
        })


	},


    llenaTabla: function(){

        let prioridades = $('#prioridades').val() || [];
        let portales = $('#portales').val() || [];
        let obj =
        {
            prioridades: prioridades,
            portales: portales
        }
        if (prioridades.length === 0 && portales.length === 0) {
            portal.showNotification('danger', 'ni ni-bell-55', 'Error', 'Debes seleccionar al menos un filtro');
            return; 
        }

        
        
        
            let url = portal.serverUrl+'TicketsFiltradosResueltos' 
            App.ajax('POST', url, false, obj).promise.done(function(response){

                if(response.success)
                {
                    
                    portal.showNotification( 'success', 'ni ni-bell-55', 'Datos cargados', `Se encontraron ${response.data.length} tickets.`);
                    $('#mod_filtros').modal('hide');
                    TicketsResueltos.tablaTicketsResueltos.clear().rows.add(response.data).draw()
                    
                }
                else
                    portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

            }).fail(function(jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })
        
		
	},

	


}