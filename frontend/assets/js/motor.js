$(function(){
	$(this).on("click", ".documento-traslado", function(){
		$('.documento-delete').hide()
		$('.documento-download').hide()
		$(this).find('.documento-delete').toggle('slide')
		$(this).find('.documento-download').toggle('slide')
	});
	
    $(this).on('click', 'ul.nav.nav-pills.documents li.documento-traslado',function() {
		portal.showMaskLoading(".modal-content");
		motor.documentid = $(this).data("id-documento");
		motor.getDocument();
	});
	
	$(this).on("click", ".bton-new-file", function(){
		$("ul.documents a.nav-link").removeClass("active");
		$(".upload-file-content").slideDown();
		$(".preview-file").slideUp();
		$(".preview-dwg").slideUp()
		portal.cleanForm("#trasladoDocumentos");
		$(".file-custom").html("");
		$(".upload-file .file-custom").removeClass('no-after');
		$('.documento-delete').hide()
		$('.documento-download').hide()
	});

	$(this).on("change", "input:file", async  function(){
		var file = this.files[0];
		$(".upload-file .file-custom").html(file.name);
		$(".upload-file .file-custom").addClass('no-after');
		motor.getBase64(file);
		/*modificaciones para subir a dropbox documento*/
		/*
		console.log(file)
		const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(portal.serverUrl+'upload/', { 
				method: "POST",
				headers: {
					'Authentication': portal.hash,
					'processid': portal.processid,
					'catalogid': portal.catalogid,
					'procedureKey': portal.llaveTramite,
					'catalogKey': portal.llaveCatalog,
					'userid': portal.userid(),
					'objName': false
				},
				body: formData
			});

            const result = await response.json();

                if (response.ok) {

					//Mandar esta respuesta a la base por que es el link donde esta el archivo para despues usar el frame
					console.log(result.sharedLink) 
					console.log("cntrltramite: ", portal.llaveTramite)
					portal.showNotification('success','ni ni-bell-55', '&Eacute;xito', `El archivo est aen la siguiente url: ${result.sharedLink}`)
				} else {
                    console.log(result);
                }

            } catch (error) {
                console.log("Error:", error);
            }
			*/

			
	});

	$(this).on('click', '.btn-save-document', function(){
		motor.saveDocument();
	});

	$(this).on("click", ".documento-delete", function(){
		var object = $(this);
		swal({
			title: 'Realmente desea Eliminar el Documento?',
			text: "Los documentos ser&aacute;n eliminados de forma definitiva.",
			type: 'warning',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			confirmButtonText: 'Eliminar',
			cancelButtonText: 'Cancelar',
			buttonsStyling: false
		}).then(function() {
			portal.showMaskLoading('.modal-content', 'Eliminando...', true);
			motor.deleteDocument(object.data('id-documento'));
		}, function(dismiss) {
	        // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
	        if (dismiss === 'cancel') {
	          swal({
	            title: 'Cancelado',
	            text: 'El documento NO fue eliminado.',
	            type: 'error',
	            confirmButtonClass: "btn",
	            buttonsStyling: true
	          }).catch(swal.noop)
	        }
	    });
	});

	$(this).on("click", ".documento-download", function(){
		var object = $(this);
		motor.documentid = object.data('id-documento');
		motor.getDocument();
		swal({
			title: '<b>Descargar Documento</b>',
			text: "Realmente desea <b>Descargar</b> el Documento?",
			type: 'question',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			confirmButtonText: 'Descargar',
			cancelButtonText: 'Cancelar',
			buttonsStyling: false
		}).then(function() {
			//portal.showMaskLoading('.modal-content', 'Descargando...', true);
			
			var file =$(window.parent.document).find("#previewFile").attr("src")
			var a = document.createElement('a');
			a.href = file;
			a.download = 'archivo_traslanet.pdf';
			a.click();
		}, function(dismiss) {
	        // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
	        if (dismiss === 'cancel') {
	          swal({
	            title: 'Cancelado',
	            text: 'El documento NO se descargo.',
	            type: 'error',
	            confirmButtonClass: "btn",
	            buttonsStyling: true
	          }).catch(swal.noop)
	        }
	    });
	});

	$('#tabPagos a').on('click', function (e) {
		var periodo = $(this).data('periodo');

		switch (periodo) {
			case 'todo':
				swal({
					title: 'Alerta de tiempo de ejecuci&oacute;n',
					text: "Dependiendo de su perfil, la cantidad de tramites por mostrar puede ser muy grande, ocasionando que esta consulta llegue a tardar varios minutos en ejecutarse. <br />Realmente desea continuar?.",
					type: 'warning',
					showCancelButton: true,
					confirmButtonClass: 'btn btn-success',
					cancelButtonClass: 'btn btn-danger',
					confirmButtonText: 'Consultar',
					cancelButtonText: 'Cancelar',
					buttonsStyling: false
				}).then(function () {
					motor.filterTable('#coredataTables', portal.processid, periodo)
				}).catch(swal.noop)
				break
			default:
				motor.filterTable('#coredataTables', portal.processid, periodo)
				break
		}
	})

	$(this).on('click', '.btn-dowload-dwg', function(){
		var a = document.createElement('a')
		a.href = motor.no_prev_file
		a.download = motor.no_prev_file_name
		a.click()
	})

});


var motor = {

	control: false,
	titleControl: false,
	passByUser: false,
	comentUser: false,
	documentid: false,
	dataFiles: {},
	idUltStatus: 0,
	no_prev_file: false,
	no_prev_file_name: false,
	colors: ['info', 'success', 'danger', 'warning', 'dark'],

	controlPanel: function(){
		switch(motor.control){
			case "back":
				this.backProcess();
				break;
			case "reject":
				this.rejectProcess();
				break;
			case "adva":
				this.advanceProcess();
				break;
			case "refr":
				this.refreshProcess();
				break;
			case "record":
				this.recordProcess();
				break;
			case "notes":
				this.notesProcess();
			case "return":
				this.returnProcess();
				break;
			case "new-note":
				this.newNote();
				break;
			case "pay-clave":
				this.recordProcess();
				break;
			case "pay-tarjeta":
				this.recordProcess();
				break;
		}
	},

	recordProcess: function(){
		let url = portal.serverUrl+'motorRecord/'+portal.processid+'_'+portal.llaveTramite

		App.ajax('GET', url, false, false).promise.done(function(response){
			if(response.success){
				let html = '<div class="content"><div class="container-fluid"><div class="header text-center"><div class="row"><div class="col-md-6 text-left"><h3 class="m-0 text-gray content-controls"><i title="Regresar" data-pass="false" data-confirm="false" data-control="return" data-toggle="tooltip" class="manita motor-control fas fa-arrow-left"></i></h3></div></div><h2 class="title m-0">Ruta Cr&iacute;tica</h2></div><div class="row"><div class="col-md-12 record"><ul class="timelineRecord" id="timelineRecord">';

	          	let criticalRoute = response.data.criticalRoute;
	          	for(cont in criticalRoute){
	          		html += '<li class="li '+(criticalRoute[cont].complete ? "complete" : "")+'"><div class="timestampRecord"><span class="author">'+(criticalRoute[cont].author ? criticalRoute[cont].author : "-")+'</span><span class="date">'+(criticalRoute[cont].date ? criticalRoute[cont].date : "-")+'<span></div><div class="status"><h4>'+criticalRoute[cont].status+'</h4></div></li>';
	          	}

				html += '</ul></div></div></div></div>';

				if(![6, 12].includes(portal.usertype()*1)){
					html += `<div class="row gx-4 justify-content-center">
								<div class="col-lg-8 col-auto">
									<div class="card">
										<div class="card-header pb-0">
											<h6>Historial</h6>
										</div>
									<div class="card-body p-3">
										<div class="timeline timeline-one-side" data-timeline-axis-style="dotted">`
					
					let record = response.data.record;
					for(contR in record){
						let color = motor.colors[Math.floor(Math.random() * 5)]
						html += `<div class="timeline-block mb-3">
						<span class="timeline-step">
							<i class="${record[contR].classIcon ? record[contR].classIcon : 'ni ni-bell-55'} text-${color} text-gradient"></i>
						</span>
						<div class="timeline-content">
							<h6 class="text-dark text-sm font-weight-bold mb-0">${record[contR].status}</h6>
							<p class="text-secondary font-weight-bold text-xs mt-1 mb-0">${record[contR].date}</p>
							<p class="text-sm mt-3 mb-2">
							${record[contR].coment}
							</p>
							<span class="badge badge-sm bg-gradient-${color}">${record[contR].author}</span>
						</div>
						</div>`
					}

					html += `</div></div></div></div></div>`
				}

				$(".notes").html(html);
				$(".tabs").slideUp();
	     		$(".notes").slideDown();
				portal.refreshTooltip();
			}else
				portal.showNotification('danger','ni ni-bell-55', 'Error al crear historial.', response.errors.join('<br />'))

			portal.hideMaskLoading(".modal-content");

      	}).fail(function(jqXHR, textStatus, errorThrown) {
		    App.consoleError(jqXHR, textStatus, errorThrown);
		});

	},

	backProcess: function(){
		this.applyAction();
	},

	rejectProcess: function(){
		this.applyAction();
	},

	advanceProcess: function(){
		this.applyAction();
	},

	refreshProcess: function(){
		$(".tabs-conteiner").html("");
		var data = portal.table.row(portal.indexTable).data();
        motor.getTabsByProcessId('.tabs-conteiner', portal.processid, data);
        portal.hideMaskLoading(".modal-content");
	},

	notesProcess: function(){
		let url = portal.serverUrl+'motorNotes/'+portal.processid+'_'+portal.llaveTramite
		App.ajax('GET', url, false, false).promise.done(function(response){
			if(response.success){
				motor.showNotesProcess(response)
			}else
				portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

      	}).fail(function(jqXHR, textStatus, errorThrown) {
		    App.consoleError(jqXHR, textStatus, errorThrown);
		});
	},

	returnProcess: function(){
		$(".notes").slideUp();
		$(".tabs").slideDown();
		portal.hideMaskLoading(".modal-content");
	},

	saveNote: function(){
		errors = "";
		errors += $("#note").val().trim() ? "" : "No se ha escrito una nota.";

		if(!errors){
			objet = {}
			objet['note'] = $("#note").val().trim();
			objet['procedureKey'] = portal.llaveTramite;
			objet['processid'] = portal.processid;
			$(".motor-control.fa-plus").removeClass("close-note");
			$(".motor-control.fa-plus").attr('data-original-title', "Nueva Nota").tooltip('show').tooltip('hide');
			$(".new-note").slideUp();
			let url = portal.serverUrl+'motorNotes'
			App.ajax('POST', url, false, objet).promise.done(function(response){
				if(response.success){
					motor.showNotesProcess(response)
				}else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

	      	}).fail(function(jqXHR, textStatus, errorThrown) {
			    App.consoleError(jqXHR, textStatus, errorThrown);
			});
		}else
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', errors)

	},

	newNote: function(){
		
		if($(".motor-control.fa-plus").hasClass("close-note")){
			$(".motor-control.fa-plus").removeClass("close-note");
			$(".motor-control.fa-plus").attr('data-original-title', "Nueva Nota").tooltip('show');
			$(".new-note").slideUp();
		}else{
			$(".motor-control.fa-plus").addClass("close-note");
			$(".new-note").slideDown();
			$(".motor-control.fa-plus").attr('data-original-title', "Cerrar Nueva Nota").tooltip('show');
		}

		portal.refreshTooltip();
		portal.hideMaskLoading(".modal-content");
	},

	showNotesProcess: function(response){

		let html = '<div class="content"><div class="container-fluid"><div class="header text-center"><div class="row"><div class="col-md-6 text-left"><h3 class="m-0 text-gray content-controls"><i title="Regresar" data-pass="false" data-confirm="false" data-control="return" data-toggle="tooltip" class="manita motor-control fas fa-arrow-left"></i></h3></div><div class="col-md-6 text-right"><h3 class="m-0 text-gray content-controls"><i title="Nueva Nota" data-pass="false" data-confirm="false" data-control="new-note" data-toggle="tooltip" class="manita motor-control fa fa-plus"></i></h3></div><div class="col-md-12 pl-5 pr-5 hidden new-note"><form id="new-note"><div><h3 class="card-title">Nueva nota</h3></div><div class="row"><div class="col-md-12 m-0"><div class="form-group"><label class="bmd-label-floating">Nota</label><textarea class="form-control osx" name="note" id="note"></textarea></div></div></div><div class="row"><div class="col-md-12 m-0 text-right"><button type="submit" class="btn btn-fill btn-info btn-save-note  btn-sm">Guardar Nota</button></div></div></form></div></div></div>';

		html += `<div class="row gx-4 justify-content-center">
		        <div class="col-lg-8 col-auto">
		          <div class="card">
		            <div class="card-header pb-0">
		              <h6>Notas</h6>
		            </div>
		            <div class="card-body p-3">
		              <div class="timeline timeline-one-side" data-timeline-axis-style="dotted">`

		if(response.data.length){
			for (let cont in response.data) {
				let color = motor.colors[Math.floor(Math.random() * 5)]
	            //html += '<a href="#" class="timelineN"><div class="timeline-iconN"><i class="material-icons">message</i></div><div class="timeline-contentN"><h3 class="titleN">El '+response.data[cont].date+' '+response.data[cont].author+' dijo:</h3><p class="descriptionN">'+response.data[cont].note+'</p></div></a>';
	            html += `<div class="timeline-block mb-3">
			                  <span class="timeline-step">
			                    <i class="ni ni-chat-round text-${color} text-gradient"></i>
			                  </span>
			                  <div class="timeline-content">
			                    <h6 class="text-dark text-sm font-weight-bold mb-0">${response.data[cont].author}</h6>
			                    <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">${response.data[cont].date}</p>
			                    <p class="text-sm mt-3 mb-2">
			                      ${response.data[cont].note}
			                    </p>
			                    <span class="badge badge-sm bg-gradient-${color}">${response.data[cont].author}</span>
			                  </div>
			                </div>`
			}
		}else
			html += '<div class="text-center">No hay notas para este tramite.</div>';

		html += `</div></div></div></div></div>`

		$(".notes").html(html);
		$(".tabs").slideUp();
 		$(".notes").slideDown();
		portal.refreshTooltip();

		portal.hideMaskLoading(".modal-content");
	},

	applyAction: function(){
		objet = {};
		objet["control"] = motor.control;
		objet["llaveTramite"] = portal.llaveTramite;
		objet["comentUser"] = motor.comentUser;
		objet["passByUser"] = motor.passByUser;
		portal.ajaxGlobalJson(portal.serverUrl+'motorControlPanel/'+portal.processid, 'POST', objet, false, null, this.responseApplyAction);
	},

	listDocuments: function(response){
		if($('.documentos-necesarios')){
			var url = portal.serverUrl+'motorDocumentosObligatorios';

			App.ajax('GET', url).promise.done(function(response){
				if(response.success){
					$('.documentos-necesarios input').tagsinput('removeAll');
					$('.documentos-necesarios input').val('').val(response.data.join(','));
					$('.documentos-necesarios input').on('beforeItemRemove', function(event) {
						event.cancel = true;
					});
					$('.documentos-necesarios input').tagsinput('refresh');
					$('.documentos-necesarios .bootstrap-tagsinput').addClass('success-badge');
				}
			});
		}

		$('.bton-new-file').click();
		var data = response.data;

		html = '';
		// html += '<li><h6><u>Documento(s)</u></h6></li>';
		for(key in data){
			html+= `
			<li class="nav-item documento-traslado text-sm d-flex justify-content-between shadow-sm p-2" data-id-documento="${data[key].id_documento_x_tramite}" >
                <div class="row">
                    <div class="col-12">
                        <a class="nav-link px-1 text-start" data-type="documento" data-tab-id="${key}" data-id-documento="${data[key].id_documento_x_tramite}" data-bs-toggle="tab" href="#link1" role="tab" aria-selected="false">
                            ${data[key].nombre_tipo}
                        </a>
                    </div>
                    <div class="col-12">
                        <span class="text-xs">${data[key].fechaagregado}</span>
                    </div>
                    <div class="col-12 text-end">
                        <i class="fas fa-comment p-0 text-info cursor-pointer my-auto" data-toggle="tooltip" title="${data[key].comentarios ? data[key].comentarios : 'Sin comentarios'}" data-id-documento="${data[key].id_documento_x_tramite}" ></i>
                        <i class="fas fa-download p-0 hidden text-success cursor-pointer my-auto documento-download" data-id-documento="${data[key].id_documento_x_tramite}" ></i>
				        <i class="fas fa-trash-alt p-0 hidden text-danger cursor-pointer my-auto documento-delete" data-id-documento="${data[key].id_documento_x_tramite}" ></i>
                    </div>
                </div>
				
				
			</li>
			`
			/* html += '<li class="nav-item documento-traslado" data-id="'+data[key].id_documento_x_tramite+'" >\
			<div class="row">\
				<div class="col-9 pr-0">\
		            <a class="nav-link" data-type="documento" data-tab-id="'+key+'" data-id="'+data[key].id_documento_x_tramite+'" data-bs-toggle="tab" href="#link1" role="tab" aria-selected="false">\
		              '+data[key].nombre_tipo+'\
		            </a>\
		        </div>\
		        <div class="col-3 p-0 hidden text-danger text-center documento-delete btn-delete align-self-center" title="Eliminar" data-toggle="tooltip" data-id-documento="'+data[key].id_documento_x_tramite+'">\
			        <i class="fas fa-trash-alt fa-2x p-0 manita" style="font-size: 1.3rem !important;"></i>\
			    </div>\
		    </div>\
          </li>'; */
		};
		$('ul.nav.nav-pills.documents').html(html);
		setTimeout(() => {
			Dashboard.initNavs(document.querySelector('ul.nav.documents').parentElement)
			portal.hideMaskLoading('.modal-content')
            portal.refreshTooltip()
		}, 500);
	},

	responseApplyAction: function(response){
		if(response.success){
			data = response.data;
			if(response.function)
				eval("var postFunction = "+response.function+"()");
			
			portal.table.row(portal.indexTable).data(data).draw();
			swal({
	          title: '&iexcl;Listo!',
	          text: 'Acci&oacute;n: '+motor.titleControl+' realizada correctamente.',
	          type: 'success',
	          confirmButtonClass: "btn btn-success",
	          buttonsStyling: false
	        });
	        $(".tabs-conteiner").html("");
			$('#myModal').modal('hide');
			portal.hideMaskLoading("body")
		}else{
			portal.hideMaskLoading("body")
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))
			if(response.type_error == "pago"){
				//algo
			}
		}

		portal.hideMaskLoading('.modal-content');
	},

	deleteDocument: function(idDocumento){
		if(idDocumento){
			url = portal.serverUrl+'deleteDocument/'+idDocumento;
			App.ajax('DELETE', url).promise.done(function(response){
				if(response.success){
					$('li[data-id="'+idDocumento+'"]').remove();
					$('.bton-new-file').click();
				} else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))
			});
		}else
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', 'No se recibi&oacute; el identificador del documento. Favor de intentar nuevamente.<br /> ')
		
		portal.hideMaskLoading(".modal-content");
	},

	saveDocument:function(){
		errors = [];
		var tipoDocumento = $("#tipo_documentos").val();
		var coments = $("#coments").val();

		if(!tipoDocumento)
			errors.push("No se ha elegido un tipo de documento.");

		if(!Object.keys(motor.dataFiles).length)
			errors.push("No se ha seleccionado un documento para subir.");

		if(!errors.length){
			portal.showMaskLoading(".modal-content", "Subiendo Archivo...");
			data = {};
			data['tipoDocumento'] = tipoDocumento;
			data['coments'] = coments;
			data['file'] = motor.dataFiles;

			url = portal.serverUrl+'document/'+portal.llaveTramite;
			App.ajax('POST', url, false, data).promise.done(function(response){
				if(response.success){
					motor.listDocuments(response);
					motor.documentid = response.new.id_documento_x_tramite;
					$("ul.documents a.nav-link[data-id='"+motor.documentid+"']").addClass("active");
					motor.getDocument();
					portal.hideMaskLoading(".modal-content");

				}else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

	      	}).fail(function(jqXHR, textStatus, errorThrown) {
			    App.consoleError(jqXHR, textStatus, errorThrown);
			});

		}else
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', errors.join('<br />'))

	},

	getBase64: function(file) {
		var reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = function () {
			bytes = reader.result.replace("data:"+file.format+";base64,", "")
			let type = file.type
			if(!type){
				type = bytes.split(';')
				type = type[0].replace('data:', '')
			}

			objfile = {};
			objfile.name = file.name;
			objfile.size = file.size;
			objfile.formato = type
			objfile.file = reader.result;
			motor.dataFiles = objfile;
		};
		reader.onerror = function (error) {
			console.log('Error: ', error);
		};
		return false;
	},

	getDocument: function(){
		$("#previewFile").attr("src", 'about:blank')
		let url = portal.serverUrl+'document/'+motor.documentid
		App.ajax('GET', url, false, null).promise.done(function(response){
			if (response.data.link_dropbox == null || response.data.link_dropbox == undefined || response.data.link_dropbox == '') {
				if(response.data["archivo"]){
					var bytes = response.data["archivo"]
					var format = response.data["extencion"]
					if(format == 'application/octet-stream'){
						$(".upload-file-content").slideUp()
						$(".preview-file").slideUp()
						$(".preview-dwg").slideDown()
						motor.no_prev_file = bytes
						motor.no_prev_file_name = response.data["nombre"]
					}else{
						bytes = bytes.replace("data:"+format+";base64,", "")
						$(".upload-file-content").slideUp()
						$(".preview-dwg").slideUp()
						const blob = portal.b64toBlob(bytes, format)
						const blobUrl = URL.createObjectURL(blob)
						console.log(blobUrl)
						$("#previewFile").attr("src", blobUrl)
						$(".preview-file").slideDown()
					}
				} else{
					swal({
						title: 'No encontrado',
						text: 'El documento que trata de consultar se encuentra vac&iacute;o. Favor de eliminarlo y cargarlo nuevamente.',
						type: 'error',
						confirmButtonClass: "btn",
						buttonsStyling: true
					}).catch(swal.noop)
				}
				portal.hideMaskLoading(".modal-content")
			} else {
				if(response.data.link_dropbox){
						//$(".upload-file-content").slideUp()
						//$(".preview-dwg").slideUp()
						let db = response.data.link_dropbox
						let obj = {
							link_dropbox: db
						}
						let url = portal.serverUrl+'dropboxLink' 
						App.ajax('POST', url,  false, obj).promise.done(function(response){
				
							let bytes = response.data[0].base64
							let format = 'application/pdf'

							$(".upload-file-content").slideUp()
							$(".preview-dwg").slideUp()
							const blob = portal.b64toBlob(bytes, format)
							const blobUrl = URL.createObjectURL(blob)
							console.log(blobUrl)
							$("#previewFile").attr("src", blobUrl)
							$(".preview-file").slideDown()
				
						}).fail(function(jqXHR, textStatus, errorThrown) {
							App.consoleError(jqXHR, textStatus, errorThrown)
						})

						
						//$("#previewFile").attr("src", directPdfUrl)
						//$(".preview-file").slideDown()
				} else{
					swal({
						title: 'No encontrado',
						text: 'El documento que trata de consultar se encuentra vac&iacute;o. Favor de eliminarlo y cargarlo nuevamente.',
						type: 'error',
						confirmButtonClass: "btn",
						buttonsStyling: true
					}).catch(swal.noop)
				}
				portal.hideMaskLoading(".modal-content")
			}
			
  		});
	},

	getTableByProcessId: function(tableid, processid){

		if(tableid, processid){

			portal.showMaskLoading('.motor-content')

			let url = portal.serverUrl+'motorLista/'+processid
			App.ajax('GET', url, false, null).promise.done(function(response){

				if(response.success){
					motor.createTableByProcessId(response, tableid)
					setTimeout(function(){
						portal.refreshTooltip()
					}, 500)
				} else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

	  		}).fail(function(jqXHR, textStatus, errorThrown) {
			    App.consoleError(jqXHR, textStatus, errorThrown)
			})

			setTimeout(function(){
				portal.refreshTooltip()
			}, 500)
		}
		
	},

	filterTable: (tableid, processid, periodo = false) => {
		portal.showMaskLoading('.motor-content')

		let url = portal.serverUrl + 'motorLista/' + processid
		App.ajax('POST', url, false, { "periodo": periodo }).promise.done(function (response) {

			if (response.success){
				portal.table.clear().rows.add(response.data.data).draw()
				portal.hideMaskLoading('.motor-content')
			}else
				portal.showNotification('danger', 'ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

		}).fail(function (jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
		
		setTimeout(function(){
			portal.refreshTooltip()
		}, 800)
	},

	createTableByProcessId: function(response, tableid){

		if(response.data.actions != undefined){
			var actions = response.data.actions
			var buttons = `<div class="action-buttons btn-group">`
			for(let cont in actions){
				buttons += `<span data-function="${actions[cont].function}" data-toggle="tooltip" title="${actions[cont].title}" class="btn btn-icon-only fs-5 p-1 me-1 ${actions[cont].classColor}"><i class="${actions[cont].class}"></i></span>`
				/* buttons += `<a href="javascript:;" data-bs-toggle="tooltip" data-bs-original-title="Preview product" data-external="true">
							<i class="fas fa-eye text-secondary" aria-hidden="true"></i>
							</a>` */
				/* buttons += `<button class="btn bg-info btn-icon-only mb-0 mt-3" data-toggle="modal">
							<i class="fa fa-plus" aria-hidden="true"></i>
							</button>` */
				/* buttons += `<button type="button" class="btn btn-md btn-cancela-td" title="Cancelar " data-id="72788"><span class="btn-inner--icon"><i class="fas fa-ban fa-2x text-danger" aria-hidden="true"></i></span></button>` */
			}
			buttons+= `</div>`
		}

		if(actions){
			portal.table = $(tableid).DataTable({
				rowId: "_id",
				data: response.data.data,
				columns: response.data.columns,
				colReorder: true,
				"pagingType": "full_numbers",
				"lengthMenu": [
				  [10, 25, 50, 100, -1],
				  [10, 25, 50, 100, "All"]
				],
				"order": [[ 0, "desc" ]],
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
		}else{
			portal.table = $(tableid).DataTable({
				rowId: "_id",
				data: response.data.data,
				columns: response.data.columns,
				colReorder: true,
				"pagingType": "full_numbers",
				"lengthMenu": [
				  [10, 25, 50, 100, -1],
				  [10, 25, 50, 100, "All"]
				],
				"order": [[ 0, "desc" ]],
				responsive: true,
				language: {
				 	search: "_INPUT_",
				 	searchPlaceholder: "Buscar",
				}
			})
		}

		portal.table.on('click', '.action-buttons .btn', function(event) {
			var data, functionBtn

			data = portal.table.row($(this).closest('tr')).data()
			functionBtn = $(this).data('function')
			
			eval(functionBtn+"(data)")
		})

		$(tableid+' tbody').on( 'click', 'td', function () {
			if(!$(this).is('.actions, .sorting_1, .child')){
	            $('tr.selected').removeClass('selected')
	            $(this).parent('tr').addClass('selected')
			    var data = portal.table.row( $(this).parent()).data()
			    portal.llaveTramite = parseInt(data._id)
			    portal.indexTable = portal.table.row( $(this).parent() ).index()
	            motor.getTabsByProcessId('.tabs-conteiner', portal.processid, data)
	    	}
	    })

	    portal.hideMaskLoading(".motor-content")

	},

	setBeteenStatus: (between_status) => {
		let { id_status_ant, id_status_sig_acept, id_status_sig_rech, txt_status_ant, txt_status_sig_acept, txt_status_sig_rech, icono_avanzar, icono_rechazar, icono_retroceder, titulo_avanzar, titulo_rechazar, titulo_retroceder } = between_status

		$('#ctrl-retroceder, #ctrl-avanzar, #ctrl-rechazar').removeClass('cursor-pointer motor-control').addClass('text-secondary').removeAttr('title data-original-title data-toggle data-bs-original-title aria-label aria-hidden')
		portal.refreshTooltip()

		if (id_status_ant)
			$('#ctrl-retroceder').addClass('cursor-pointer motor-control').removeClass('text-secondary').attr({ "title": (titulo_avanzar ? titulo_avanzar : `Retroceder a ${txt_status_ant}`), "data-original-title": (titulo_avanzar ? titulo_avanzar : `Retroceder a ${txt_status_ant}`), "data-toggle": "tooltip"})
		
		if (id_status_sig_acept)
			$('#ctrl-avanzar').addClass('cursor-pointer motor-control').removeClass('text-secondary').attr({ "title": (titulo_rechazar ? titulo_rechazar : `Avanzar a ${txt_status_sig_acept}`), "data-original-title": (titulo_rechazar ? titulo_rechazar : `Avanzar a ${txt_status_sig_acept}`), "data-toggle": "tooltip" })

		if (id_status_sig_rech)
			$('#ctrl-rechazar').addClass('cursor-pointer motor-control').removeClass('text-secondary').attr({ "title": (titulo_retroceder ? titulo_retroceder : `Rechazar a ${txt_status_sig_rech}`), "data-original-title": (titulo_retroceder ? titulo_retroceder : `Rechazar a ${txt_status_sig_rech}`), "data-toggle": "tooltip" })

		if (icono_rechazar)
			$('#ctrl-retroceder').addClass(icono_rechazar)
		else
			$('#ctrl-retroceder').addClass('fas fa-chevron-left mx-3')

		if (icono_avanzar)
			$('#ctrl-avanzar').addClass(icono_avanzar)
		else
			$('#ctrl-avanzar').addClass('fas fa-chevron-right mx-3')

		if (icono_retroceder)
			$('#ctrl-rechazar').addClass(icono_retroceder)
		else
			$('#ctrl-rechazar').addClass('fas fa-ban mx-3')

		portal.refreshTooltip()
	},

	getTabsByProcessId: function(conteiner, processid, row){
		if(conteiner && processid){

			var url = portal.serverUrl+'getTabs/'+(portal.llaveTramite ? portal.llaveTramite : '')
			App.ajax('GET', url, false, false).promise.done(function(response){
	            if(response.success){
					if(response.data.data_list && portal.indexTable)
						portal.table.row(portal.indexTable).data(response.data.data_list).draw()

					$(".notes").slideUp()
					$(".tabs").slideDown()

					if ('between_status' in response.data){
						let between_status = response.data.between_status
						motor.setBeteenStatus(between_status)
					}

					var tabs = response.data.tabs
					if(!$(conteiner).html() || portal.antllaveTramite != portal.llaveTramite){
						$(conteiner).html('')

						if(!portal.llaveTramite){
							$('#myModal .modal-header .modal-title').html('<strong>Nuevo '+response.data.nombreTramite+'</strong>');
							$('#myModal .content-controls').addClass('hidden');
						}
						else{
							row = row;
							$('#myModal .modal-header .modal-title').html(`
								<div class="d-flex justify-content-between">
							    	<div>
							        	<strong>Estatus:</strong> `+response.data.ultimo_status_txt+`
							    	</div>
									<div>`+
							        	`<strong>`+response.data.nombreTramite+` No.</strong> `+response.data.idTramite+
							 	 	`</div>
							 	</div>`);
							      // '<i title="M&aacute;s Informaci&oacute;n" data-toggle="tooltip" class="small ml-3 text-gray manita material-icons">info_outlined</i></div>\
							$('#myModal .content-controls').removeClass('hidden');
						}
						motor.idUltStatus = response.data.ultimo_status;
						motor.idUltStatusTxt = response.data.ultimo_status_txt;

						/* let html_ = `<div class="card mt-0" style="box-shadow: none !important;">
						            <div class="card-header p-0">
						                <div class="nav-tabs-navigation">
						                    <div class="nav-tabs-wrapper">
						                        <ul class="nav nav-tabs" data-tabs="tabs">` */

						let html = `<div class="nav-wrapper position-relative end-0">
										<ul class="nav nav-pills nav-fill p-1 rounded-0 rounded-top-3" role="tablist">`
                            
                       
                        var collapse = 'active';
						var divStatus = '';
						var selected = 'true'
						for(let cont in tabs){
							if(cont>0){
								collapse = ''
								divStatus = !portal.llaveTramite ? 'disabled' : ''
								selected = 'false'
							}

							/* html_ += `<li class="nav-item">
                                <a class="nav-link ${collapse} ${divStatus}" href="#tab-${cont}" data-get-content="${tabs[cont].target ? "1" : "0"}" data-open="0" data-refresh="${tabs[cont].refresh}" data-tab-id="${tabs[cont].id_motor_tramites_tabs}" data-title="${tabs[cont].title}" data-toggle="tab">${tabs[cont].title}</a>
                            </li>` */

                            html += `<li class="nav-item">
								         <a class="nav-link mb-0 px-0 py-1 ${collapse} ${divStatus}" href="#tab-${cont}" 
										 data-get-content="${tabs[cont].target ? "1" : "0"}" data-refresh="${tabs[cont].refresh}" data-refresh-all="${tabs[cont].refreshall}" 
										 data-tab-id="${cont}" data-tab-dbid="${tabs[cont].id_motor_tramites_tabs}" 
										 data-title="${tabs[cont].title}" data-bs-toggle="tab" role="tab" aria-selected="${selected}">
								         ${tabs[cont].title}
								         </a>
								      </li>`

						}

						/* html_ += `</ul>
								        </div>
								    </div>
									</div><div class="card-body border">
								    <div class="tab-content text-center">` */

						html += `</ul></div><div class="card-body rounded-0 rounded-bottom-3 bg-gray-100">
								    <div class="tab-content tabs-motor">`

						collapse = 'active';
						divStatus = '';
	                	for(let cont in tabs){
	                		if(cont>0){
								collapse = ''
								divStatus = !portal.llaveTramite ? 'disabled' : ''
							}

	                		/* html_ += `<div class="tab-pane ${collapse}" id="tab-${cont}">
	                        	<form class="form" id="form-${cont}" data-tab-id="${tabs[cont].id_motor_tramites_tabs}"></form>
	                    		</div>` */
	                    		
	                    	html += `
								<div class="tab-pane ${collapse}" id="tab-${cont}" data-pane-dbid="${tabs[cont].id_motor_tramites_tabs}" data-open="0" >
									<form class="form" id="form-${cont}" ></form>
	                    		</div>`
	                	}

	                	/* html_ += `</div>
				            		</div>
				        		</div>` */
				        html += `</div>
				            		</div>`

						$(conteiner).append(html);
						
						setTimeout(function() {
							Dashboard.initNavs()
						}, 500)

						//console.log(cont)
						//$("#tab-"+cont+" a[data-toggle]").attr("data-toggle","")

						portal.antllaveTramite = portal.llaveTramite;
                    	
                    	for(let cont in tabs){
                    		if(tabs[cont].target){
                    			$('#tab-'+cont).load(tabs[cont].target, null, function(response, status, xhr){
									if( (status == 'success') || (status == 'notmodified') ){
										$('.selectpicker').selectpicker('refresh');
						    			if(tabs[cont].function_check_perms){
						    				eval(tabs[cont].function_check_perms+";");
						    			}
									}
								});

                    		}else{
	                    		let schema = tabs[cont].schema ? tabs[cont].schema.schema : ""
	                    		let form = tabs[cont].form ? tabs[cont].form.form : ""
	                    		let { before_submit, after_submit } = tabs[cont]

	                    		if(tabs[cont].schema && tabs[cont].form){
		                    		$("#form-"+cont).jsonForm({
		                    			schema,
		                    			form,
		                    			"value": tabs[cont].values,
		                    			onSubmit:function (errors, values) {
		                    				let obj_submit = {}

		                    				obj_submit.id_tramite = response.data.idTramite
		                    				obj_submit.id_motor_tramites_tabs = tabs[cont].id_motor_tramites_tabs
		                    				obj_submit.fields = values
		                    				obj_submit.processid = portal.processid


		                    				var url = portal.serverUrl+'save_tabs';
											App.ajax('POST', url, false, obj_submit).promise.done(function(response){

									            if(response.success){
													if(portal.llaveTramite)
														portal.table.row(portal.indexTable).data(response.data).draw();
													else{
														portal.llaveTramite = response.data[0];
														portal.table.row.add(response.data).draw();
													}

													$('#myModal').modal('toggle');
													
													portal.showNotification('success','fas fa-check', 'Exito.', "Cambios guardados correctamente.")
													portal.setformatMoney();
													motor.refreshProcess();
												}else
													portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

									        }).fail(function(jqXHR, textStatus, errorThrown) {
									            App.consoleError(jqXHR, textStatus, errorThrown);
									        });
		                    			}
		                    		});
	                    		}
                    		}
                    	}
					}

			    	$('#myModal').modal('show')
			    	
			    	portal.refreshTooltip()
			    	$('.selectpicker').selectpicker('refresh')
					if(portal.llaveTramite){
						if(tabs[0].target){
							portal.showMaskLoading('.modal-content', 'Cargando...', true);
							setTimeout(() => {
								portal.getContentTab(tabs[0].id_motor_tramites_tabs)
							}, 1000);
						}
					} else {
						$('#tab-0').data('open', 1)
					}
				}else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))
				
	        }).fail(function(jqXHR, textStatus, errorThrown) {
	            App.consoleError(jqXHR, textStatus, errorThrown)
	        })
		}

	},

	getTitlesListByProcessId: function(processid){

		if(processid){

			objet = {}
			objet['processid'] = processid;

			let url = portal.serverUrl+'getTitlesList/'+processid
			App.ajax('GET', url, false, false).promise.done(function(response){
				if(response.success){
					// $('.title-page').text(response.data.title);
					$('.title-list').text(response.data.titleList);
					$('.title-button').text(response.data.titleBtnNew);
				}else
					portal.showNotification('danger','ni ni-bell-55', 'Error al Cargar el Tramite.', response.errors.join('<br />'));
	  		}).fail(function(jqXHR, textStatus, errorThrown) {
			    App.consoleError(jqXHR, textStatus, errorThrown);
			})

		}else
			portal.showNotification('danger','ni ni-bell-55', 'Error al Cargar el Tramite.', 'No se recibi&oacute; el id del tramite.');

	},
	
	getComboWs: (element, campoValor, url) => {
		let urlToken = "https://www.elmarquesdigital.gob.mx/auth/realms/Bus-Servicios-Marques-Prod/protocol/openid-connect/token";
		let dataToken = "client_id=bsm-gestion-cobranza-web&client_secret=774ddb6c-e1e9-45a9-bd2f-fd3ccdf93724&username=user-gestion-cobranza-web&password=" + encodeURIComponent("U$3rGes&12") + "&grant_type=password";

		App.ajaxBianni('POST', urlToken, false, dataToken, 'application/x-www-form-urlencoded').promise.done(function (responseToken) {

			App.ajaxBianni('GET', url, false, false, 'application/json', responseToken.access_token).promise.done(function (response) {
				if (response.status == '200 OK') {
					$('#' + element).empty()
					$('#' + element).append('<option value=0>Seleccione...</option>')
					$.each(response.body, function (key, value) {
						$('#' + element).append('<option value=' + value[campoValor] + '>' + value['descripcion'] + '</option>');
					})
					$('.selectpicker').selectpicker('refresh')
					portal.hideMaskLoading('body')
				}

			}).fail(function (jqXHR, textStatus, errorThrown) {
				App.consoleError(jqXHR, textStatus, errorThrown)
			})

		}).fail(function (jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	}

}