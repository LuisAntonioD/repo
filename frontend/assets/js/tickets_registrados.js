$(function(){

	
    $(this).on('click', '#prioridad', function(){
		let id_ticket = $(this).data('id-ticket'); 
		$('#myModalPrioridad').modal('show');
        $('#myModalPrioridad .modal-header .modal-title').html(`<strong>Asigna una Prioridad al Ticket <strong id="id_ticket">${id_ticket}</strong></strong>`);
		Tickets.prioridadTicket(id_ticket)
        

     
    })
    $(this).on('click', '#cambiarPrioridad', function(){
		
        let id_prioridad = $('#prioridades').val();
        let id_ticket = $("#id_ticket").text(); 
        Tickets.updatePrioridad(id_ticket, id_prioridad)

     
    })


	//BOTON FILTRAR
    $("#btn_aplicar_filtros").on('click',function(e){
        Tickets.llenaTabla()
        $('.selectpicker').selectpicker('refresh');
    });


    //BOTON LIMPIAR FILTROS
    $("#btn_limpiar_filtros").on('click',function(e){
        portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n Recibida ', 'Los filtros se han restablecido');
        $('#prioridades').empty();
        portal.getOptionsCombo("#prioridades", "prioridad");
        $('#prioridades').selectpicker('refresh');
        $('#status').empty();
        portal.getOptionsCombo("#status", "status");
        $('#status').selectpicker('refresh');
        $('#portales').empty();
        portal.getOptionsCombo("#portales", "status");
        $('#portales').selectpicker('refresh');
        Tickets.getTicketsRegistrados();

        
    });

    
    
            
    



	Tickets.tablaTicketsRegistrados = $("#tablaTicketsRegistrados").DataTable({
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
                className: "text-center",
                render: function(data, type, row) {
                    if (data == "FACTURANOT") {
                        return '<strong><span class="badge bg-gradient-success">' + data + '</span></strong>';
                    } else if (data == "AVALUOS MGP") {
                        return '<strong><span class="badge bg-gradient-danger">' + data + '</span></strong>';
                    } else if (data == "CORREGIDORA") {
                        return '<strong><span class="badge bg-gradient-secondary">' + data + '</span></strong>';
                    } else if (data == "EL MARQUES") {
                        return '<strong><span class="badge bg-gradient-warning">' + data + '</span></strong>';
                    } else if (data == "EZEQUIEL MONTES") {
                        return '<strong><span class="badge bg-gradient-primary">' + data + '</span></strong>';
                    } else if (data == "SAN JOAQUIN") {
                        return '<strong><span class="badge bg-gradient-info">' + data + '</span></strong>';
                    } else if (data == null) {
                        return '';
                    }
                    else{
                        return '<strong><span class="badge bg-gradient-dark">' + data + '</span></strong>';
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
                        if (data == "Ticket Registrado") {
                            return '<strong><span class="badge bg-gradient-info">' + data + '</span></strong>';
                        } else if (data == "Ticket Resuelto") {
                            return '<strong><span class="badge bg-gradient-success">' + data + '</span></strong>';
                        } else if (data == "Ticket en Proceso") {
                            return '<strong><span class="badge bg-gradient-info">' + data + '</span></strong>';
                        } else if (data == "Ticket Cancelado") {
                            return '<strong><span class="badge bg-gradient-danger">' + data + '</span></strong>';
                        } else if (data == null) {
                            return '';
                        }
                        else{
                            return '<strong><span class="badge bg-gradient-dark">' + data + '</span></strong>';
                        }
                        
                    }
            },
            {data: "fecha", className: "text-center"},
            {
                data: null,
                className: "text-center",
                render: function(data, type, row) {
                    return `<div class="action-buttons btn-group">
                                <span id="prioridad" data-id-ticket="${row.id_ticket}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-danger" data-bs-original-title="Asignar Prioridad" aria-label="Asignar Prioridad"><i class="fa-solid fa-tags"></i></span>
                            </div>`;
                }
            }
			
		],
		order: [[0, 'desc']] 
	});


    Tickets.getTicketsRegistrados();
    portal.getOptionsCombo("#prioridades", "prioridad");
    portal.getOptionsCombo("#status", "status");
    portal.getOptionsCombo("#portales", "portales");
	

});

var Tickets = {
	
	tablaTicketsRegistrados: false,


    
	getTicketsRegistrados: function(){

		let url = portal.serverUrl+'getTicketsRegistrados' 
		App.ajax('GET', url, false, null).promise.done(function(response){

			if(response.success)
			{
				Tickets.tablaTicketsRegistrados.clear().rows.add(response.data).draw()
				
			}
			else
				portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},


    prioridadTicket: function(id){
		let obj = {id_ticket: id}
		portal.showMaskLoading('body', 'Cargando Opciones...')
        var url = portal.serverUrl + 'prioridadTicket'
        App.ajax('POST', url, false, obj).promise.done(function (response) {
            if (response.success) {
                let data = response.data[0]
                console.log("data: ", data)
                let badges = {
                    "FACTURANOT": "success",
                    "AVALUOS MGP": "danger",
                    "CORREGIDORA": "secondary",
                    "EL MARQUES": "warning",
                    "EZEQUIEL MONTES": "primary",
                    "SAN JOAQUIN": "info"
                };
                

                

                let cardinfo = 
                `<div class="card">
                    <div class="card-header p-0 mx-3 mt-3 position-relative z-index-1">
                        <div class="d-flex justify-content-between">
                            <span><strong>Asunto: </strong>${data.titulo}</span>
                            <span><strong>Portal: </strong><span class="badge bg-gradient-${badges[data.portal] || 'dark'}">${data.portal}</span></span>
                        </div>
                        <hr class="my-2"/>
                    </div>
                    <div class="card-body">
                        <p class="card-text mb-4">
                        ${data.descripcion}
                        </p>
                    </div>
                    <div class="d-flex justify-content-center mt-2">
                        <div class="col-lg-6">
                            <div class="form-group">
                                <label class="bmd-label-static" for="tipo_error">Tipo de Prioridad:</label>
                                    <select class="selectpicker col-md-12 obligatorio" data-style="select-with-transition"
                                    title="Prioridad" data-style="select-osx select-with-transition" name="prioridad"
                                    id="prioridades" data-live-search="true" required="true">
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    
                </div>`
                $('.cardinfo').html(cardinfo);
                portal.getOptionsCombo("#prioridades", "prioridad");

                setTimeout(function() { //tiempo de espera para refrescar el select de las prioriedades
                    $('#prioridades').val(data.id_prioridad).change();
                    $('.selectpicker').selectpicker('refresh');
                    console.info("")
                }, 300); 
                
                
                portal.hideMaskLoading('body')
            }else
            portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

        }).fail(function(jqXHR, textStatus, errorThrown) {
            portal.hideMaskLoading('body')
            App.consoleError(jqXHR, textStatus, errorThrown)
        })
    },


    updatePrioridad: function(id_ticket, id_prioridad){
        let obj =
        {
            id_ticket: id_ticket,
            id_prioridad: id_prioridad
        }

        let url = portal.serverUrl+'updatePrioridad' 
		App.ajax('PUT', url, false, obj).promise.done(function(response){

			if(response.success)
			{
				portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n Recibida', 'La prioridad del ticket ha cambiado y se notificara a los usuarios.');
				Tickets.getTicketsRegistrados();
                $('#myModalPrioridad').modal('hide');
                
			}
			else
				portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})

    },


    llenaTabla: function(){

        let prioridades = $('#prioridades').val() || [];
        let status = $('#status').val() || [];
        let portales = $('#portales').val() || [];
        let obj =
        {
            prioridades: prioridades,
            status: status,
            portales: portales
        }
        if (prioridades.length === 0 && status.length === 0 && portales.length === 0) {
            portal.showNotification('danger', 'ni ni-bell-55', 'Error', 'Debes seleccionar al menos un filtro');
            return; 
        }

        
        
        
            let url = portal.serverUrl+'TicketsFiltrados' 
            App.ajax('POST', url, false, obj).promise.done(function(response){

                if(response.success)
                {
                    
                    portal.showNotification( 'success', 'ni ni-bell-55', 'Datos cargados', `Se encontraron ${response.data.length} tickets.`);
                    $('#mod_filtros').modal('hide');
                    Tickets.tablaTicketsRegistrados.clear().rows.add(response.data).draw()
                    
                }
                else
                    portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

            }).fail(function(jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown)
            })
        
		
	},
	


}