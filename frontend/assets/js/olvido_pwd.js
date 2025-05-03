$(function(){
	olvidoPwd.initForm()

	$(this).on("click", ".btn.btn-next", function(event){
		if ($('.card-body form').valid()) {
			var email = $("#email").val();
			portal.sendCodeValidation(email, 2, 'olvidoPwd.codeSendedCallback()');
		} else
			portal.showNotification('warning', 'ni ni-bell-55', 'Datos incompletos', 'Por favor capture los campos requeridos');
	});
	
	$(this).on("click", ".btn.btn-finish", function(event){
		if ($('.card-body form').valid()){
			if($("#password").val() == $("#confirmpass").val()){
				portal.showMaskLoading("body", "Enviando...");
				$('#email').prop( "disabled", false )
				var obj = $(".card-body form").serializeArray();

				portal.recoverPassword(obj);
			}else
				portal.showNotification('danger', 'ni ni-bell-55', 'Error al recuperar contrase&ntilde;a', 'Las contrase&ntilde;as no coinciden');
		} else
			portal.showNotification('warning', 'ni ni-bell-55', 'Datos incompletos', 'Por favor capture los campos requeridos');
	});

	$(this).on("click", ".btn.btn-reset", function(event){
		olvidoPwd.initForm()
	});

	$(this).on('click', '.lnk-reenviar-correo', function(){
		var email = $("#email").val();
		portal.sendCodeValidation(email, 2);
	});

	$(this).on('click', '.lnk-tyc', function(){
		$('.modal').modal('show');
	})

	$('body').slideDown()

});

var olvidoPwd = {

	initForm: function(){
		$('.divCodigo').hide()
		$('.btn-next').show()
		$('.btn-reset').hide()
		$('.btn-finish').hide()
		$('#codigo').removeAttr('required')
		$('#password').removeAttr('required')
		$('#confirmpass').removeAttr('required')
		$('#email').prop('required',true).prop( "disabled", false )
	},
	
	codeSendedCallback: function(){
		$('.divCodigo').show()
		$('.btn-next').hide()
		$('.btn-reset').show()
		$('.btn-finish').show()
		$('#email').removeAttr('required').prop( "disabled", true )
		$('#codigo').prop('required',true)
		$('#password').prop('required',true)
		$('#confirmpass').prop('required',true)
	},
}