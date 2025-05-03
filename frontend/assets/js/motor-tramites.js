$(function(){

	if(Cookies.get('admintorre_motor_settings')){
		let data = JSON.parse(Cookies.get('admintorre_motor_settings'))
		portal.includeJs(data.filejs)
		portal.llaveTramite = data.key
		portal.processid = data.procedure
		portal.indexTable = 0
		motor.getTabsByProcessId('.tabs-conteiner', portal.processid, data)
		Cookies.remove('admintorre_motor_settings')
	}

	if(portal.processid){
		motor.getTitlesListByProcessId(portal.processid);
		motor.getTableByProcessId('#coredataTables', portal.processid);
		if(portal.filejs){
			portal.includeJs(portal.filejs);
		}
	}

	$('.newProcessor').on('click',function(){
		$('tr.selected').removeClass('selected')
		portal.llaveTramite = null;
		portal.indexTable = null;
		motor.getTabsByProcessId('.tabs-conteiner', portal.processid, null)
	})

	$(this).on('submit', 'form', function(event){
		event.preventDefault();
	})

	$(this).on('change', 'select', function(event){
		$($(this)).parent().addClass('is-filled');
	})

	$(this).on('click', '.btn-save-note', function(event){
		motor.saveNote();
	})

	$(this).on('shown.bs.tab', 'a[data-bs-toggle="tab"]', function(e){
		let tab_id = $(this).data('tabId')
		if(!$(this).hasClass('tabFiltros')){
			if (!$('#tab-' + tab_id).data('open') || $(this).data('refresh') == 1){
				$('#tab-' + tab_id).data('open', 1)
				portal.showMaskLoading('.modal-content', 'Cargando '+$(this).data('title'), true)
				portal.getContentTab($(this).data('tab-dbid'))
			}
		}
	})

	$(this).on("click", ".btn.add-shopping-card", function(){
		portal.showMaskLoading('.modal-content', 'Agregando al carrito...', true)
		Carrito.addToShoppingCard()
	})

	$(this).on('click', '.motor-control', function(){
		motor.control = $(this).data('control');
		motor.titleControl = $(this).data('original-title');
		if($(this).data('confirm')){
			swal({
		        title: '&iquest;Desea continuar?',
		        text: "El tramite seleccionado se va a "+motor.titleControl+".",
		        type: 'warning',
		        showCancelButton: true,
		        confirmButtonClass: 'btn btn-success',
		        cancelButtonClass: 'btn btn-danger',
		        confirmButtonText: 'Aceptar',
		        cancelButtonText: 'Cancelar',
		        buttonsStyling: false
		    }).then(function() {
	      		portal.showMaskLoading('.modal-content', motor.titleControl+' Tramite... ', true);
	      		motor.controlPanel();
		    }).catch(swal.noop);
		}else if($(this).data('pass')){
			$('#myModal').modal('hide');
			swal({
				title: motor.titleControl,
				html: `<p>Para ${motor.titleControl} es necesario agregar una justificaci&oacute;n y tu contrase&ntilde;a</p><div class="form-group">
				<input id="comentUser" type="text" placeholder="Comentario" class="form-control" />
				</div><div class="form-group">
				<input id="passByUser" type="password" placeholder="Contrase&ntilde;a" class="form-control" />
				</div>`,
		        showCancelButton: true,
		        confirmButtonClass: 'btn btn-success',
		        cancelButtonClass: 'btn btn-danger',
		        buttonsStyling: false,
		        confirmButtonText: motor.titleControl,
			    cancelButtonText: 'Cancelar',
			}).then(function(result) {
				portal.showMaskLoading('body', motor.titleControl + ' Tramite... ', true);
				motor.passByUser = $("#passByUser").val();
				motor.comentUser = $("#comentUser").val();
				motor.applyAction();
			}, function(dismiss) {
		        if(dismiss === 'cancel') {
					portal.hideMaskLoading('.modal-content');
		        }
		    });
		}else{
			portal.showMaskLoading('.modal-content', motor.titleControl+' Tramite... ', true);
	      	motor.controlPanel();
		}

	})

	$(this).on('click', '.btn.btn-save', function(event){

		if (portal.llaveTramite){
			let data = {},
				url = portal.serverUrl + 'inCart'

			data.liquidacionid = portal.liquidacionid
			data.llavetramite = portal.llaveTramite
			App.ajax('POST', url, false, data).promise.done(function (response) {
				if (response.success) {

					save()

				} else {
					if (response.error_code == 426) {
						swal({
							title: `Tramite en carrito`,
							html: `Este tramite ya se encuentra en el carrito, si deseas continuar con la modificación de este tramite se eliminara del carrito.`,
							showCancelButton: true,
							confirmButtonClass: 'btn btn-success',
							cancelButtonClass: 'btn btn-danger',
							buttonsStyling: false,
							confirmButtonText: `continuar`,
							cancelButtonText: `cancelar`,
						}).then(function (result) {
							Carrito.deleteElement(response.carrito_det, false)
							save()
						}, function (dismiss) {
							if (dismiss === 'cancel') {
								swal({
									title: 'Cancelado',
									text: 'El tramite no fue eliminado del carrito.',
									type: 'error',
									confirmButtonClass: "btn",
									buttonsStyling: true
								}).catch(swal.noop)
							}
						});
					} else
						portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))
				}

			}).fail(function (jqXHR, textStatus, errorThrown) {
				App.consoleError(jqXHR, textStatus, errorThrown)
			})
		}else
			save()
	})
})

function save(){
	if (portal.funcvalidat) {
		eval("var validation = " + portal.funcvalidat + "()")

		if (!validation.success) {
			if (validation.errors.length)
				portal.showNotification('danger', 'ni ni-bell-55', 'Se produjo un Error.', validation.errors.join('<br />'))
			else
				if (validation.code)
					eval(validation.code)

		} else
			validateForm()

	} else
		validateForm()
}

function validateForm(){
	var forms = $('form');
	var formsData = {};
	var numErrors = 0

	$("input[data-type='currency']").each(function(){
		$(this).val($(this).val().replace("$", "").replace(/\,/g, ""));
	});

	forms.each(function(){
		idForm = $(this).attr('id');
		if(!$('#'+idForm).hasClass('no-save-auto')){
			if(idForm != undefined){
				if($(this).parents('.tab-pane').data('open')=="1"){
					// if($(this).closest('.collapse').hasClass('valid')){
					if($(this).valid()){
						formsData[idForm] = $(this).serializeArray()
						// portal.setFormValidation('#'+idForm);
						$('#'+idForm).submit()
					} else
						numErrors++
				}
			}
		}
	});
	
	if(numErrors == 0){
		if(Object.keys(formsData).length){
			portal.showMaskLoading('.modal-content', 'Guardando Cambios...', true)
			portal.saveTabs(formsData, portal.processid, false)
		}else
			portal.showNotification('warning','fas fa-exclamation-triangle', 'Alerta', 'No se ha hecho algun cambio.');
	}else
		portal.showNotification('danger','ni ni-bell-55', 'Error de validaci&oacute;n', 'Favor de corregir los campos con error.');
}





