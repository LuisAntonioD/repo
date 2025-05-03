$(function(){
    portal.loggout()
    var imgIndx =  Math.floor(Math.random() * 7) + 1;
    $('.login-bg').attr('style',"background-image: url('assets/img/back_"+imgIndx+".jpg'); ");

    $('.form-login').on('submit', (event) => {
        return false
    })

    $('.form-login').on('keypress', (e) => {
        if (e.which === 13){
            $('#btnEntrar').trigger('click')
            return false
        }
    })

	$('.texto').keyup(function(e) {
		switch(e.which)
		{
			case 13:
				$('#btnEntrar').trigger('click')
				break;
			default:
				$('.texto').each(function(index, element) {
					var texto = $(this).val();
					$(this).val(texto.replace("'", ''));
				});
				break;
		}
	})

	setTimeout("$('#user').trigger('click')", 2300);

    $('.osx_link').click(function(e) {
        window.open('http://www.scsoftworks.com/','_blank','')
    })

    $('.contact_link').click(function(e) {
        let ventana = window.open("mailto:soporte@scsoftworks.mx?subject=Soporte al portal Trasl@net")
        ventana.close();
    })

    $('#btnEntrar').click(function(){
        portal.showMaskLoading('body')

        error = '';
        user = $('#user').val()
        password = $('#password').val()

        if(!password)
            error+= 'El campo "Contrase&ntilde;a" no puede estar vacio. Favor de volver a intentar.<br>'
        if(!user)
            error+= 'El campo "Email" no puede estar vacio. Favor de volver a intentar.<br>'

        if(!error){
            var Obj = {};
            Obj.user = user;
            Obj.password = password;

            var url = portal.serverUrl+'login';
            
            App.ajax('POST', url, false, Obj).promise.done(function(response){
                if(response.success){
                    var data = response.data;
                    Cookies.set('admintorre_sess_hash', data.hash, { expires: 1 });
                    Cookies.set('admintorre_sess_user', data.userInfo, { expires: 1 });
                    Cookies.set('admintorre_sess_empresaid', data.empresaid, { expires: 1 });
                    Cookies.set('admintorre_sess_municipioid', data.municipioid, { expires: 1 });
                    Cookies.set('admintorre_sess_municipiorfc', data.municipiorfc, { expires: 1 });
                    Cookies.set('admintorre_sess_uma', data.uma, { expires: 1 });
                    Cookies.set('admintorre_sess_pag_ini', data.pagina_inicio, { expires: 1 });
                    Cookies.set('admintorre_sess_dependencia', data.id_dependencia, { expires: 1 });
                    Cookies.set('admintorre_sess_secretaria', data.id_area, { expires: 1 });

                    if(!Cookies.get('admintorre_sess_temp')){
                      jsonTempleteVal = {}
                      jsonTempleteVal['data-color'] = 'orange';
                      jsonTempleteVal['data-background-color'] = 'black';
                      jsonTempleteVal['sidebar-mini'] = true;
                      jsonTempleteVal['menu-active'] = 'dashboard';
                      jsonTempleteVal['sidebar-image'] = true;
                      jsonTempleteVal['img-holder'] = 'sidebar-1';

                      Cookies.set('admintorre_sess_temp', jsonTempleteVal, { expires: 365 });
                    }
                    
                    // location.href = 'dashboard.html';
                    if(data.datos_incompletos){
                        portal.hideMaskLoading('body')
                        swal({
                            title: 'Verifique su Perfil',
                            text: `
                                <p>
                                Lo invitamos a completar la informaci&oacute;n necesaria en su perfil de usuario para poder disfrutar al m&aacute;ximo los beneficios de esta nueva plataforma.
                                Una vez realizada dicha verificaci&oacute;n, este mensaje se desactivar&aacute; de manera autom&aacute;tica.
                                </p>
                            `,
                            type: 'warning',
                            confirmButtonClass: "btn",
                            buttonsStyling: true
                        }).then(function () {
                            location.href = 'perfil.html'
                        })
                    } else{
                        location.href = data.pagina_inicio ? data.pagina_inicio : 'dashboard.html'
                    }

                }else{
                    portal.showNotification('danger','ni ni-bell-55', 'Error al Iniciar Sesi&oacute;n.', response.errors[0]);
                    portal.hideMaskLoading('body')
                }
            }).fail(function(jqXHR, textStatus, errorThrown) {
                App.consoleError(jqXHR, textStatus, errorThrown);
            });
        }else{
            //portal.showNotification('bottom','center', error, 'danger', 1000);
            portal.hideMaskLoading('body')
            portal.showNotification('danger','ni ni-bell-55', 'Error al Iniciar Sesi&oacute;n.', error);
        }


    })

    
	$('body').slideDown()
    portal.refreshTooltip()
});
