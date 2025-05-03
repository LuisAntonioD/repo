$(function(){
	

	
	



	
	
	
	deleteImage = false;

	getInfoUser(portal.userid());

	$(this).on('click', '.btn-save', function(){
		validateForm();
	});

	$(this).on('click', '.btn-edit-avatar', function(){
		$('#dropzone').slideToggle()
	});

	$(this).on('click', '.close-image', function(){
		deleteImageFun();
	});

	dropzone.dropzone.on("complete", function(file) {
		// dropzone.removeFile(file);
		swal({
			title: 'La imagen fue actualizada correctamente',
			text: "",
			type: 'success',
			showCancelButton: false,
			confirmButtonClass: 'btn btn-success',
			confirmButtonText: 'Aceptar',
			buttonsStyling: false
		}).then(function() {
			location.reload()
		}).catch(swal.noop)
	});
});	

function getInfoUser(userid){
	if(userid){
		var objet = {};
		objet['userid'] = userid;

		portal.ajaxGlobalJson(portal.serverUrl+'getInfoUser', 'POST', objet, false, null, responseGetInfoUser);
	}
	return false;
}

function responseGetInfoUser(response){
	if(response.success){
	    var data = response.data
	    for(key in data){
	    	if(data[key]){
	    		switch(key){
                    case 'photo':
                        $('#'+key).attr("src", "./assets/img/user-profile/"+data[key])
                        $('.btn-change').text('Cambiar')
                        $('.close-image').show()
                        break
		    	    case 'sexo':
		    		    $("input[name='sex'][value='"+data[key]+"']").prop('checked', true)
                        break
                    case 'password':
                        break
                    default:
			    	    $('#'+key).val(data[key])
                        break
		    	}
		    }
	    }
  	}else
   		console.log(response.errors);
}

function deleteImageFun(){
	$('#photo').attr("src", "./assets/img/placeholder.jpg");
	deleteImage = true;
}


function validateForm(){
	var errors = []

    var rfcsInvalidos = [
        'XAXX010101000',
        'XEXX010101000',
    ]
    var rfcPatern = /^([a-zA-Z]){3,4}([0-9]){6}([a-zA-Z]|[0-9]){3}$/
    let prevPass = $('#prev-pass').val()
    let newPass = $('#new-pass').val()
    let confPass = $('#conf-pass').val()

	

    if(prevPass || newPass || confPass){
        if(newPass != confPass) errors.push("Las contrase&ntilde;as no coinciden")
    }

	

    if( $('#form-profile').valid() ){
        
        if(!errors.length){
            portal.showMaskLoading('body', 'Guardando...', true);
            var obj = $("#form-profile").serializeArray()
            if(deleteImage){
                obj.push({"name": "deleteImage", "value": deleteImage});
            }
            console.log(obj);
			App.ajax('POST', portal.serverUrl+'userInfo', false, obj).promise.done(function(response){
				if(response.success){
					location.reload();
				} else{
					portal.hideMaskLoading('body');
					portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'))
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				portal.hideMaskLoading('body');
				portal.showNotification('danger', 'ni ni-bell-55', 'Error',  'Se produjo un error de comunicación. Favor de intentar nuevamente.<br />')
				App.consoleError(jqXHR, textStatus, errorThrown);
			});
        }
    } else
        portal.showNotification('danger', 'ni ni-bell-55', 'Error de validaci&oacute;n', 'Por favor verifique los campos marcados con error.<br />'+errors.join('<br />'))

}

function getPin(){
	App.ajax('GET', portal.serverUrl+'getPin', false, false).promise.done(function(response){
		if(response.success){
			let data = response.data
			portal.showNotification('success', 'ni ni-bell-55', 'Exito', 'El pin se ha cambiado correctamente, guardalo en un lugar seguro!')
			$('#pin').val(data.pin_decrypt)
		} else{
			portal.showNotification('danger', 'ni ni-bell-55', 'Error', response.errors.join('<br />'))
		}
	}).fail(function(jqXHR, textStatus, errorThrown) {
		portal.hideMaskLoading('body');
		portal.showNotification('danger', 'ni ni-bell-55', 'Error',  'Se produjo un error de comunicación. Favor de intentar nuevamente.<br />')
		App.consoleError(jqXHR, textStatus, errorThrown);
	});
}