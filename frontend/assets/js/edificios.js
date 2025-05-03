$(function(){


    

	$(this).on('click', '[id^="btntab"]', function(e) {
        const $tab = $(this);
        const id_edificio = $tab.data('edificio');
        
        if(id_edificio) {
            Edificios.table(id_edificio);
        }
        
       
    });

	


	


    //BOTON LIMPIAR FILTROS
    $("#btn_limpiar_filtros").on('click',function(e){
        portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n Recibida ', 'Los filtros se han restablecido');
        $('#prioridades').empty();
        portal.getOptionsCombo("#prioridades", "prioridad");
        $('#prioridades').selectpicker('refresh');

        
    });
	

	Edificios.getEdificios();

});

var Edificios = {
	
	tablaCreate: false,


	getEdificios: function() {
		let url = portal.serverUrl + 'getEdificios';
		App.ajax('GET', url, false, null).promise.done(function(response) {
			if (response.success) {
				let tabs = $(response.data).map(function(index, item) {
					const isActive = index == 0 ? 'active' : '';
					return `
					<li class="nav-item pl-5 ${isActive}" id="${item.id_tab}" data-edificio="${item.id_edificio}" onMouseOver="this.style.cursor='pointer'">
						<a class="nav-link mb-0 px-0 py-1 ${isActive}" data-bs-target="#tabPane_${item.id_edificio}" data-bs-toggle="tab" role="tab"
						aria-selected="${index === 0 ? 'true' : 'false'}">
							<span class="text-${item.color_tab}">
                                <i class="${item.icono_tab} opacity-10" aria-hidden="true"></i>
							</span>
							${item.edificio_nombre}
						</a>
					</li>`;
				}).get().join('');
	
				$('#registrotabs').append(tabs);
	
				if (response.data.length > 0) {
					const firstEdificio = response.data[0];
					Edificios.table(firstEdificio.id_edificio); 
					
					$(`#${firstEdificio.id_tab} .nav-link`).addClass('active');
				}
	
			} else {
				portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'));
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown);
		});
	},

	
	table: function(id_edificio) {
		const obj = { id_edificio: id_edificio };
		const url = portal.serverUrl + 'table';
	  
		App.ajax('POST', url, false, obj).promise.done(function(response) {
			if(response.success) {
				const portalData = response.data[0] || {};
				const targetId = `tablaCreate_${id_edificio}`;
				const tabPaneId = `tabPane_${id_edificio}`;
	  
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
										<h5 class="font-weight-bolder mb-0">${portalData.edificio}</h5>
									</div>
									<div class="card-body">
										<div class="table-responsive">
											<table id="${targetId}" class="table table-flush" style="width:100%">
												<thead>
													<tr>
														<th>ID</th>
														<!--<th>Asunto</th>-->
														<!--<th>Descripción</th>-->
														<th>Edificio</th>
														<!--<th>Prioridad</th>-->
														<!--<th>Status</th>-->
														<th>Fecha Creaci&oacute;n</th>
														<!--<th>Acciones</th>-->
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
								{ data: "id_edificio", className: "text-center" },
								{
									data: "edificio",
									render: function(data, type, row) {
										return data ? `<span class="badge bg-gradient-${row.color_tab}">${data}</span>` : '';
									}
								},
								{ data: "fecha", className: "text-center" },
								{
									data: null,
									className: "text-center",
									render: function(data, type, row) {
										return `<div class="action-buttons btn-group">
													<span id="consultar" data-id-ticket="${row.id_edificio}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-${portalData.color_tab}" data-bs-original-title="Consultar Ticket" aria-label="Consultar Ticket"><i class="fa-solid fa-ticket"></i></span>
													<span id="resolver" data-id-ticket="${row.id_edificio}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-success" data-bs-original-title="Marcar Ticket Resuelto" aria-label="Marcar Ticket Resuelto"><i class="fa-solid fa-circle-check"></i></span>
													<span id="cancelar" data-id-ticket="${row.id_edificio}" data-toggle="tooltip" title="" class="btn btn-icon-only fs-5 p-1 me-1 btn bg-gradient-danger" data-bs-original-title="Cancelar Ticket" aria-label="Cancelar Ticket"><i class="fa-solid fa-xmark"></i></span>
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
	
	

	

	

}