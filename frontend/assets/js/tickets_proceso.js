$(function(){


    $(this).on('click', '#consultar', function(){
		let id_ticket = $(this).data('id-ticket'); 
		$('#myModalTicket').modal('show');
        $('#myModalTicket .modal-header .modal-title').html(`<strong>Detalle del Ticket <strong id="id_ticket">${id_ticket}</strong></strong>`);
		TicketsProceso.detalleTicket(id_ticket)
    })
	$(this).on('click', '#adjuntarArchivos', function(){
		$('.archivos').slideDown();
		$('#adjuntarArchivos').attr('disabled', true);
    })
	$(this).on('click', '#enviar', function(e){
        e.preventDefault()

		let quill = $('#editor .ql-editor').html();
		let text = $('<div>').html(quill).text();

		if (text == "") {
			portal.showNotification('danger','ni ni-bell-55', 'Error ', 'Debes escribir algo en tu mensaje');
		} else {
			TicketsProceso.validNotification()
		}
		
    })

	$(this).on('click', '[id^="btntab"]', function(e) {
        const $tab = $(this);
        const id_portal = $tab.data('portal');
        
        if(id_portal) {
            TicketsProceso.table(id_portal);
        }
        
       
    });

	$(this).on('click', '#resolver', function(e) {
		let id_ticket = $(this).data('id-ticket'); 
		TicketsProceso.enviarTicketResuelto(id_ticket); 
	});
	$(this).on('click', '#cancelar', function(e) {
		let id_ticket = $(this).data('id-ticket'); 
		TicketsProceso.enviarTicketCancelado(id_ticket); 
	});


	


    //BOTON LIMPIAR FILTROS
    $("#btn_limpiar_filtros").on('click',function(e){
        portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n Recibida ', 'Los filtros se han restablecido');
        $('#prioridades').empty();
        portal.getOptionsCombo("#prioridades", "prioridad");
        $('#prioridades').selectpicker('refresh');

        
    });
	

	TicketsProceso.getPortales();	
	portal.getOptionsCombo("#prioridades", "prioridad");
	

});

var TicketsProceso = {
	
	tablaCreate: false,
	socket: false,

    
	


	validNotification: () => {
        
        portal.showMaskLoading('body', 'Enviando Notificacion...')
		let data = [
			{name: "type_send", value: "2"},
			{name: "tipo_usuario", value: "2"},
			{name: "usuarios", value: "3"},
			{name: "type_noti", value: "1"},
			{name: "tipo_notificacion", value: "info"},
			{name: "icono", value: "ni ni-email-83"},
			{name: "posicion_vertical", value: "top"},
			{name: "posicion_horizontal", value: "center"},
			{name: "tamanio", value: "80"},
			{name: "duracion", value: "1"},
			{name: "portal", value: portal.portalid},
			{name: "title_mensaje", value: "Nuevo Mensaje"},
			{name: "text_mensaje", value: "Tienes nuevos mensajes en tu bandeja de entrada."}
			
		];
        data.push({'name': 'hash', 'value': portal.hash})
        
        portal.socket.emit("new-notificacion", data)
		
		var contenidoHTML = $('#editor .ql-editor').html();
		TicketsProceso.refreshnotification(contenidoHTML);
    },

	refreshnotification: function(mensaje){
		let obj = {
			mensaje: mensaje
		}
		console.log(obj)
		let url = portal.serverUrl+'refreshnotification' 
		App.ajax('POST', url, false, obj).promise.done(function(response){

			if(response.success)
			{
				
				
			}
			else
				portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));

		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},


	getPortales: function() {
		let url = portal.serverUrl + 'getPortales';
		App.ajax('GET', url, false, null).promise.done(function(response) {
			if (response.success) {
				let tabs = $(response.data).map(function(index, item) {
					const isActive = index == 0 ? 'active' : '';
					return `
					<li class="nav-item pl-5 ${isActive}" id="${item.llavetab}" data-portal="${item.id_portal}" onMouseOver="this.style.cursor='pointer'">
						<a class="nav-link mb-0 px-0 py-1 ${isActive}" data-bs-target="#tabPane_${item.id_portal}" data-bs-toggle="tab" role="tab"
						aria-selected="${index === 0 ? 'true' : 'false'}">
							<span class="text-${item.coloricono}">
								<i class="fa-solid fa-ticket ext-lg opacity-10" aria-hidden="true"></i>
							</span>
							${item.name}
						</a>
					</li>`;
				}).get().join('');
	
				$('#registrotabs').append(tabs);
	
				if (response.data.length > 0) {
					const firstPortal = response.data[0];
					TicketsProceso.table(firstPortal.id_portal); 
					
					$(`#${firstPortal.llavetab} .nav-link`).addClass('active');
				}
	
			} else {
				portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'));
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown);
		});
	},

	
	table: function(id_portal) {
		const obj = { id_portal: id_portal };
		const url = portal.serverUrl + 'table';
	  
		App.ajax('POST', url, false, obj).promise.done(function(response) {
			if(response.success) {
				const portalData = response.data[0] || {};
				const targetId = `tablaCreate_${id_portal}`;
				const tabPaneId = `tabPane_${id_portal}`;
	  
				let tickets = portalData.count_tickets;

				
				// Limpiar el tab anterior 
				$('#tabPorRecibir').removeClass('show active');
	
				if (!$(`#${tabPaneId}`).length) {
					const tablaHTML = `
					<div class="tab-pane fade" id="${tabPaneId}" role="tabpanel">
						<div class="row">
							<div class="col-xl-12">
								<div class="card">
									<div class="card-header p-3 pb-0">
										<h5 class="font-weight-bolder mb-0">TICKETS ${portalData.portal}</h5>
									</div>
									<div class="card-body">
										<div class="table-responsive">
											<table id="${targetId}" class="table table-flush" style="width:100%">
												<thead>
													<tr>
														<th>ID</th>
														<th>Asunto</th>
														<th>Descripción</th>
														<th>Portal</th>
														<th>Prioridad</th>
														<th>Status</th>
														<th>Fecha Creaci&oacute;n</th>
														<th>Acciones</th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>`;
	  
					$('#pills-tabContent').html(tablaHTML);
				}
				
				$(`#${tabPaneId}`).addClass("show active");
				$(`a[data-bs-target="#${tabPaneId}"]`).addClass("active");
				
				if (tickets > 0) {
					
					//  si hay tickets
					if (!$.fn.DataTable.isDataTable(`#${targetId}`)) {
						$(`#${targetId}`).DataTable({
							responsive: true,
							data: response.data,
							columns: [
								{ data: "id_ticket", className: "text-center" },
								{ data: "titulo", className: "text-start" },
								{ data: "descripcion", className: "text-start" },
								{
									data: "portal",
									render: function(data, type, row) {
										return data ? `<span class="badge bg-gradient-${row.colorportal}">${data}</span>` : '';
									}
								},
								{
									data: "prioridad",
									className: "text-center",
									render: function(data, type, row) {
										return data ? `<span class="badge bg-gradient-${row.colorprioridad}">${data}</span>` : '';
									}
								},
								{
									data: "nombre_status", className: "text-center",
									render: function(data) {
										
										return data ? `<span class="badge bg-gradient-secondary">${data}</span>` : '';
									}
								},
								{ data: "fecha", className: "text-center" },
								{
									data: null,
									className: "text-center",
									render: function(data, type, row) {
										return `<div class="action-buttons btn-group">
													<span id="consultar" data-id-ticket="${row.id_ticket}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-${portalData.colorportal}" data-bs-original-title="Consultar Ticket" aria-label="Consultar Ticket"><i class="fa-solid fa-ticket"></i></span>
													<span id="resolver" data-id-ticket="${row.id_ticket}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-success" data-bs-original-title="Marcar Ticket Resuelto" aria-label="Marcar Ticket Resuelto"><i class="fa-solid fa-circle-check"></i></span>
													<span id="cancelar" data-id-ticket="${row.id_ticket}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-danger" data-bs-original-title="Cancelar Ticket" aria-label="Cancelar Ticket"><i class="fa-solid fa-xmark"></i></span>
												</div>`;
									}
								}
							],
							order: [[0, 'desc']],
							language: {
								search: "_INPUT_",
								searchPlaceholder: "Buscar"
							},
							lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Todos"]],
							
						});
					} else {
						$(`#${targetId}`).DataTable().clear().rows.add(response.data).draw();
					}
				} else {
					portal.showNotification('danger', 'ni ni-bell-55', 'Error', 'No se encontrar&oacute;n Tickes disponibles para este Portal');
					// Limpiar la tabla si existe
					if ($.fn.DataTable.isDataTable(`#${targetId}`)) {
						$(`#${targetId}`).DataTable().clear().draw();
					}
				}
	  
			} else {
				portal.showNotification('danger', 'ni ni-bell-55', 'Error');
			}
		}).fail(App.consoleError);
	},
	
	

	enviarTicketResuelto: function(id) {
		swal({
			title: 'Resolver Ticket',
			text: `El Ticket ${id} se va a Avanzar de proceso, ¿estás seguro que deseas continuar?`,
			type: 'info',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Avanzar',
			buttonsStyling: false
		}).then((result) => {
			
				let obj = {
					id_ticket: id 
				};
				console.log(obj);
				let url = portal.serverUrl + 'enviarTicketResuelto';
				
				App.ajax('POST', url, false, obj).promise.done(function(response) {
					if (response.success) {
						let id_portal = response.data[0].id_portal
						swal({
							title: `Ticket Resuelto! `,
							text: `El Ticket ${id} se ha resuelto y notificaremos al portal.`,
							type: 'success',
							confirmButtonClass: 'btn btn-success',
							confirmButtonText: 'Cerrar',
							buttonsStyling: false
						}).catch(swal.noop)
						TicketsProceso.table(id_portal)
					} else {
						portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'));
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					App.consoleError(jqXHR, textStatus, errorThrown);
					swal('Error', 'Ocurrió un error al intentar avanzar el ticket', 'error');
				});
			
		}).catch(swal.noop);
	},

	enviarTicketCancelado: function(id){
		swal({
			title: 'Cancelar Ticket ',
			text: `El Ticket ${id} se va a Cancelar y no podras mandar mensajes en este ticket, estas seguro que desea continuar?`,
			type: 'info',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			cancelButtonText: 'Omitir',
			confirmButtonText: 'Cancelar',
			buttonsStyling: false
		}).then((result) => {
			
			let obj = {
				id_ticket: id 
			};
			console.log(obj);
			let url = portal.serverUrl + 'enviarTicketCancelado';
			
			App.ajax('POST', url, false, obj).promise.done(function(response) {
				if (response.success) {
					let id_portal = response.data[0].id_portal
					swal({
						title: `Ticket Cancelado`,
						text: `El Ticket ${id} se ha cancelado y notificaremos al portal.`,
						type: 'success',
						confirmButtonClass: 'btn btn-success',
						confirmButtonText: 'Cerrar',
						buttonsStyling: false
					}).catch(swal.noop)
					TicketsProceso.table(id_portal)
				} else {
					portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'));
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				App.consoleError(jqXHR, textStatus, errorThrown);
				swal('Error', 'Ocurrió un error al intentar avanzar el ticket', 'error');
			});
		
	}).catch(swal.noop);


	},
	detalleTicket: function(id){
		let obj = {id_ticket: id}
		portal.showMaskLoading('body', 'Cargando Detalle...')
        var url = portal.serverUrl + 'detalleTicket'
        App.ajax('POST', url, false, obj).promise.done(function (response) {
            if (response.success) {

				let mensajes = ''
				if (response.msg.length == 0) {
					mensajes = `<div class="text-center mt-5">
									<p><strong>No a iniciado la conversaci&oacute;n todavia :)</strong></p>
								</div>`
				} else {
					mensajes = response.msg.map(msg => {
						return msg.usertype > 1 
							? `
							<div class="row justify-content-start mb-4">
								<div class="col-auto">
									<div class="card">
										<div class="card-body py-2 px-3">
											<p class="mb-1">${msg.message}</p>
											<div class="d-flex align-items-center text-sm opacity-6">
												<i class="ni ni-check-bold text-sm me-1"></i>
												<small>${msg.fecha}</small>
											</div>
										</div>
									</div>
								</div>
							</div>`
							: `
							<div class="row justify-content-end mb-4">
								<div class="col-auto">
									<div class="card bg-gray-200">
										<div class="card-body py-2 px-3">
											<p class="mb-1">${msg.message}</p>
											<div class="d-flex align-items-center justify-content-end text-sm opacity-6">
												<i class="ni ni-check-bold text-sm me-1"></i>
												<small>${msg.fecha}</small>
											</div>
										</div>
									</div>
								</div>
							</div>`;
					}).join('');
				}

				


				let chat = `
				<div class="card col-md-6">
					<div class="card-body">
						<span><strong>Asunto</strong>: ${response.data[0].titulo}</span><br />
						<span><strong>Descripci&oacute;n</strong>: ${response.data[0].descripcion}</span><br />
						<span><strong>Portal</strong>: <span class="badge bg-gradient-${response.data[0].color}">${response.data[0].portal}</span></span>
					</div>
				</div>
				<div class="card blur shadow-blur mt-3" style="max-height: 650px;">
                    <div class="card-header shadow-lg">
                      <div class="row">
                        <div class="col-md-10">
                          <div class="d-flex align-items-center">
                            <img alt="Image" src="../frontend/assets/img/user-profile/default-avatar.png" class="avatar">
                            <div class="ms-3">
                              <h6 class="mb-0 d-block">Nombre del usuario ${response.data[0].usuario}</h6>
                              <!--<span class="text-sm text-dark opacity-8">&Uacute;ltima vez  ${response.data[0].fecha}</span>-->
                            </div>
                          </div>
                        </div> 
                      </div>
                    </div>
                    <div class="card-body" style="max-height: 1000px; overflow-y: auto;">
						${mensajes}
                    </div>
                    <div class="card-footer d-block">
                      <div id="editor-container">
                        <div id="editor" style="max-height: 100px; overflow-y: auto;">
                        </div>
                      </div>
                      
                      <div class="editor-toolbar d-flex align-items-center mt-2">
                        
                      </div>
                      
                    </div>
                </div>
				`
				$('.chat').html(chat)
				
				// Iniciar el editr Quill
				var quill = new Quill('#editor', {
					theme: 'snow',
					modules: {
						toolbar: [
							['bold', 'italic', 'underline', 'strike'],
							['blockquote', 'code-block'],
							[{ 'list': 'ordered'}, { 'list': 'bullet' }],
							[{ 'direction': 'rtl' }],
							//[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
							[{ 'color': [] }, { 'background': [] }],
							[{ 'font': [] }],
							['clean'],
						]
					},
					placeholder: 'Escribe tu mensaje aquí...'
				});
					
					
				
                portal.hideMaskLoading('body')
            } 
        }).fail(function (jqXHR, textStatus, errorThrown) {
            portal.hideMaskLoading('body');
            App.consoleError(jqXHR, textStatus, errorThrown)
        })


	},

	

}