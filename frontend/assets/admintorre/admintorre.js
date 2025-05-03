const config = portalConfig[portalConfig.ENV]
var portal = {
	serverUrl: config.serverUrl, 
	socketsUrl: config.socketsUrl,
	hash: Cookies.get('admintorre_sess_hash'),
	uma: Cookies.get('admintorre_sess_uma'),
	processid: Cookies.get('osx_tn_procedure'),
	adminid: Cookies.get('admintorre_sess_adminid'),
	municipioid: Cookies.get('admintorre_sess_municipioid'),
	municipiorfc: Cookies.get('admintorre_sess_municipiorfc'),
	municipiors: Cookies.get('admintorre_sess_municipiors'),
	municipioweb: Cookies.get('admintorre_sess_municipioweb'),
	filejs: Cookies.get('osx_tn_filejs'),
	funcvalidat: Cookies.get('osx_tn_funcvalidat'),
	catalogid: false,
	llaveTramite: false,
	llaveCatalog: false,
	antllaveTramite: false,
	table: false,
	indexTable: false,
	liquidacionid: false,
	pagina_inicio: Cookies.get('admintorre_sess_pag_ini'),
	user_dependencia: Cookies.get('admintorre_sess_dependencia'),
	user_secretaria: Cookies.get('admintorre_sess_secretaria'),
	socket: false,
	portalid: 1,

	showNotification: function(type, icon, title, content, positionV = 'top', positionH = 'center', size = '50', duration = 5000, permanent = false) {
		var body = document.querySelector('body');
		var alert = document.createElement('div');
	
		alert.classList.add('alert', 'position-fixed', 'border-0', 'text-white', 'w-'+size, 'py-2', 'z-index-extra-sticky');
	
		if (positionV === 'top')
			alert.classList.add('top-0')
		else if (positionV === 'bottom')
			alert.classList.add('bottom-3')
	
		if (positionH === 'left')
			alert.classList.add('start-1', 'mx-auto')
		else if (positionH === 'right')
			alert.classList.add('end-1', 'mx-auto')
		else if (positionH === 'center')
			alert.classList.add('start-0', 'end-0', 'mx-auto')
	
		alert.classList.add('alert-' + type)
		alert.style.transform = 'translate3d(0px, 0px, 0px)'
		alert.style.opacity = '0'
		alert.style.transition = '.35s ease'
	
		setTimeout(function() {
			alert.style.transform = 'translate3d(0px, 20px, 0px)'
			alert.style.setProperty("opacity", "1", "important")
		}, 100)
	
		alert.innerHTML = '<div class="d-flex mb-1">' +
			'<div class="alert-icon me-1">' +
			'<i class="' + icon + ' mt-1"></i>' +
			'</div>' +
			'<span class="alert-text"><strong>' + title + '</strong></span>' +
			'</div>' +
			'<span class="text-sm">' + content + '</span>'
	
		body.appendChild(alert)
	
		if (!permanent) {
			setTimeout(function() {
				alert.style.transform = 'translate3d(0px, 0px, 0px)'
				alert.style.setProperty("opacity", "0", "important")
			}, duration)
	
			setTimeout(function() {
				alert.parentElement.querySelector('.alert').remove()
			}, duration + 500)
		}
	},

	initMaterialWizard: function() {
	    // Code for the Validator
	    var $validator = $('.card-wizard form').validate({
	      rules: {
	        confirmationcode: {
	          required: true,
	          minlength: 5,
	          validateCode: true
	        }
	      },

	      highlight: function(element) {
	        $(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
	      },
	      success: function(element) {
	        $(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
	      },
	      errorPlacement: function(error, element) {
	        $(element).append(error);
	      }
	    });

		$.validator.addMethod("validateCode", function(value, element) {
			portal.showMaskLoading(".form-register", "Validando Codigo...");
			var Obj = {};
            Obj.code = $("#confirmationcode").val();
            Obj.email = $("#email").val();
            var isSuccess = false;

			var url = portal.serverUrl+'validateCode';
			$.ajax({
				type: "POST",
				url: url,
				data: Obj ? JSON.stringify(Obj) : '',
				dataType:"json",
				async: false,
				success: function(response){
					if(response.success)
						isSuccess = true;
					else{
						isSuccess = false;
						portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
					}
					portal.hideMaskLoading(".form-register");
				}
			});
			return isSuccess;

		}, "El codigo no coincide con el que se envio al correo. Favor de volver a intentar.");

	    // Wizard Initialization
	    $('.card-wizard').bootstrapWizard({
	      'tabClass': 'nav nav-pills',
	      'nextSelector': '.btn-next',
	      'previousSelector': '.btn-previous',

	      onNext: function(tab, navigation, index) {
	        var $valid = $('.card-wizard form').valid();
	        if (!$valid) {
	          // $validator.focusInvalid();
	          return false;
	        }
	      },

	      onInit: function(tab, navigation, index) {
	        //check number of tabs and fill the entire row
	        var $total = navigation.find('li').length;
	        var $wizard = navigation.closest('.card-wizard');

	        $first_li = navigation.find('li:first-child a').html();
	        $moving_div = $('<div class="moving-tab">' + $first_li + '</div>');
	        $('.card-wizard .wizard-navigation').append($moving_div);

	        refreshAnimation($wizard, index);

	        $('.moving-tab').css('transition', 'transform 0s');
	      },

	      onTabClick: function(tab, navigation, index) {
	        var $valid = $('.card-wizard form').valid();

	        if (!$valid) {
	          return false;
	        } else {
	          return true;
	        }
	      },

	      onTabShow: function(tab, navigation, index) {
	        var $total = navigation.find('li').length;
	        var $current = index + 1;

	        var $wizard = navigation.closest('.card-wizard');

	        // If it's the last tab then hide the last button and show the finish instead
	        if ($current >= $total) {
	          $($wizard).find('.btn-next').hide();
	          $($wizard).find('.btn-finish').show();
	        } else {
	          $($wizard).find('.btn-next').show();
	          $($wizard).find('.btn-finish').hide();
	        }

	        button_text = navigation.find('li:nth-child(' + $current + ') a').html();

	        setTimeout(function() {
	          $('.moving-tab').text(button_text);
	        }, 150);

	        var checkbox = $('.footer-checkbox');

	        if (!index == 0) {
	          $(checkbox).css({
	            'opacity': '0',
	            'visibility': 'hidden',
	            'position': 'absolute'
	          });
	        } else {
	          $(checkbox).css({
	            'opacity': '1',
	            'visibility': 'visible'
	          });
	        }

	        refreshAnimation($wizard, index);
	      }
	    });


	    // Prepare the preview for profile picture
	    $("#wizard-picture").change(function() {
	      readURL(this);
	    });

	    $('[data-toggle="wizard-radio"]').click(function() {
	      wizard = $(this).closest('.card-wizard');
	      wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
	      $(this).addClass('active');
	      $(wizard).find('[type="radio"]').removeAttr('checked');
	      $(this).find('[type="radio"]').attr('checked', 'true');
	    });
		
	    $('[data-toggle="wizard-checkbox"]').click(function() {
	      if ($(this).hasClass('active')) {
	        $(this).removeClass('active');
	        $(this).find('[type="checkbox"]').removeAttr('checked');
	      } else {
	        $(this).addClass('active');
	        $(this).find('[type="checkbox"]').attr('checked', 'true');
	      }
	    });

	    $('.set-full-height').css('height', 'auto');

	    //Function to show image before upload

	    function readURL(input) {
	      if (input.files && input.files[0]) {
	        var reader = new FileReader();

	        reader.onload = function(e) {
	          $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
	        }
	        reader.readAsDataURL(input.files[0]);
	      }
	    }

	    $(window).resize(function() {
	      $('.card-wizard').each(function() {
	        $wizard = $(this);

	        index = $wizard.bootstrapWizard('currentIndex');
	        refreshAnimation($wizard, index);

	        $('.moving-tab').css({
	          'transition': 'transform 0s'
	        });
	      });
	    });

	    function refreshAnimation($wizard, index) {
	      $total = $wizard.find('.nav li').length;
	      $li_width = 100 / $total;

	      total_steps = $wizard.find('.nav li').length;
	      move_distance = $wizard.width() / total_steps;
	      index_temp = index;
	      vertical_level = 0;

	      mobile_device = $(document).width() < 600 && $total > 3;

	      if (mobile_device) {
	        move_distance = $wizard.width() / 2;
	        index_temp = index % 2;
	        $li_width = 50;
	      }

	      $wizard.find('.nav li').css('width', $li_width + '%');

	      step_width = move_distance;
	      move_distance = move_distance * index_temp;

	      $current = index + 1;

	      if ($current == 1 || (mobile_device == true && (index % 2 == 0))) {
	        move_distance -= 8;
	      } else if ($current == total_steps || (mobile_device == true && (index % 2 == 1))) {
	        move_distance += 8;
	      }

	      if (mobile_device) {
	        vertical_level = parseInt(index / 2);
	        vertical_level = vertical_level * 38;
	      }

	      $wizard.find('.moving-tab').css('width', step_width);
	      $('.moving-tab').css({
	        'transform': 'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
	        'transition': 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'

	      });
	    }
  	},

  	registerUser: function(dataUser){
		portal.showMaskLoading("body", "Creando cuenta...");
        var url = portal.serverUrl+'saveUser';
  		App.ajax('POST', url, false, dataUser).promise.done(function(response){
            if(response.success){

            	var data = response.data;
                Cookies.set('admintorre_sess_hash', data.hash, { expires: 1 });
                Cookies.set('admintorre_sess_user', data.userInfo, { expires: 1 });
                Cookies.set('admintorre_sess_adminid', data.adminid, { expires: 1 });
                Cookies.set('admintorre_sess_municipioid', data.municipioid, { expires: 1 });
                Cookies.set('admintorre_sess_uma', data.uma, { expires: 1 });
                Cookies.set('admintorre_sess_pag_ini', data.pagina_inicio, { expires: 1 });

                location.href = data.pagina_inicio ? data.pagina_inicio : 'dashboard.html'

            }else{
				portal.hideMaskLoading('body')
                portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
			}

        }).fail(function(jqXHR, textStatus, errorThrown) {
			portal.hideMaskLoading('body')
            App.consoleError(jqXHR, textStatus, errorThrown);
        });
  	},

  	recoverPassword: function(dataUser){
        var url = portal.serverUrl+'recoverPassword';
  		App.ajax('POST', url, false, dataUser).promise.done(function(response){
            if(response.success){
				var data = response.data;
                Cookies.set('admintorre_sess_hash', data.hash, { expires: 1 });
                Cookies.set('admintorre_sess_user', data.userInfo, { expires: 1 });
                Cookies.set('admintorre_sess_adminid', data.adminid, { expires: 1 });
                Cookies.set('admintorre_sess_municipioid', data.municipioid, { expires: 1 });
                Cookies.set('admintorre_sess_uma', data.uma, { expires: 1 });
                Cookies.set('admintorre_sess_pag_ini', data.pagina_inicio, { expires: 1 });

                location.href = data.pagina_inicio ? data.pagina_inicio : 'dashboard.html'

            }else{
				portal.hideMaskLoading('body')
                portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
			}

        }).fail(function(jqXHR, textStatus, errorThrown) {
            App.consoleError(jqXHR, textStatus, errorThrown);
        });
  	},

  	sendCodeValidation: function(email, tipo = 1, callback=''){
  		portal.showMaskLoading("body", "Enviando...");
  		var Obj = {};
  		var nombreProceso = '';
        Obj.email = email;
        Obj.id_administracion = 3;
        Obj.tipo = tipo;

        switch(tipo*1){
        	case 1:
        		nombreProceso = 'registro';
        		break;
        	case 2:
        		nombreProceso = 'recuperaci&oacute;n';
        		break;
        }

        var url = portal.serverUrl+'sendCodeValidation';
  		App.ajax('POST', url, false, Obj).promise.done(function(response){
            if(response.success){
            	swal({
		            title: 'Correo Enviado',
		            text: 'Se ha enviado un correo electr&oacute;nico a la cuenta que ingres&oacute;, con un c&oacute;digo que le permitir&aacute; continuar el proceso de '+nombreProceso+'. Favor de ingresarlo en el campo correspondiente.',
		            type: 'success',
		            confirmButtonClass: "btn",
		            buttonsStyling: true
		         }).then((result) => {
					 if(result)
					 	eval(callback)
				 })
            }else
                portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));

            portal.hideMaskLoading('body')
			return true
        }).fail(function(jqXHR, textStatus, errorThrown) {
            App.consoleError(jqXHR, textStatus, errorThrown);
        });

		return false;
  	},

	validateRegCode: function(code, email,  callback=''){
		portal.showMaskLoading("body", "Validando Codigo...");
		var Obj = {};
		Obj.code = code
		Obj.email = email
		var isSuccess = false;

		var url = portal.serverUrl+'validateCode';
		App.ajax('POST', url, false, Obj ).promise.done(function(response){
			if(response.success){
				swal({
		            title: 'C&oacute;digo Correcto',
		            text: 'El c&oacute;digo que ingres&oacute; ha sido validado. Puede continuar con el proceso de registro en el portal.',
		            type: 'success',
		            confirmButtonClass: "btn",
		            buttonsStyling: true
		         }).then((result) => {
					 if(result)
					 	eval(callback)
				 })
				 isSuccess = true;
			} else {
				isSuccess = false;
				portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
			}
			portal.hideMaskLoading("body");
		}).fail(function(jqXHR, textStatus, errorThrown) {
            App.consoleError(jqXHR, textStatus, errorThrown)
        });

		return isSuccess;
	},


	formatMoney: function(n, c, d, t) {
	  var c = isNaN(c = Math.abs(c)) ? 2 : c,
	    d = d == undefined ? "." : d,
	    t = t == undefined ? "," : t,
	    s = n < 0 ? "-" : "",
	    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
	    j = (j = i.length) > 3 ? j % 3 : 0;

	  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	},

	formatCurrency: function(input, blur) {
		// appends $ to value, validates decimal side
		// and puts cursor back in right position.

		// get input value
		var input_val = input.val();

		// don't validate empty input
		if (input_val === "") { return; }

		// original length
		var original_len = input_val.length;

		// initial caret position 
		var caret_pos = input.prop("selectionStart");

		// check for decimal
		if (input_val.indexOf(".") >= 0) {

			// get position of first decimal
			// this prevents multiple decimals from
			// being entered
			var decimal_pos = input_val.indexOf(".");

			// split number by decimal point
			var left_side = input_val.substring(0, decimal_pos);
			var right_side = input_val.substring(decimal_pos);

			// add commas to left side of number
			left_side = portal.formatNumber(left_side);

			// validate right side
			right_side = portal.formatNumber(right_side);

			// On blur make sure 2 numbers after decimal
			if (blur === "blur") {
			right_side += "00";
			}

			// Limit decimal to only 2 digits
			right_side = right_side.substring(0, 2);

			// join number by .
			input_val = "$" + left_side + "." + right_side;

		} else {
			// no decimal entered
			// add commas to number
			// remove all non-digits
			input_val = portal.formatNumber(input_val);
			input_val = "$" + input_val;

			// final formatting
			if (blur === "blur") {
				input_val += ".00";
			}
		}

		// send updated string to input
		input.val(input_val);

		// put caret back in the right position
		var updated_len = input_val.length;
		caret_pos = updated_len - original_len + caret_pos;
		input[0].setSelectionRange(caret_pos, caret_pos);
	},

	formatNumber: function(n) {
	  // format number 1000000 to 1,234,567
	  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	},

	setformatMoney: function(){
		$("input[data-type='currency']").each(function() {        
			portal.formatCurrency($(this));
		});
	},

	usertype: function(){
		if(Cookies.get('admintorre_sess_user')){
			user = Cookies.get('admintorre_sess_user').split('-');
			return user[0]
		}
		return false;
	},

	userid: function(){
		if(Cookies.get('admintorre_sess_user')){
			user = Cookies.get('admintorre_sess_user').split('-');
			return user[1]
		}
		return false;
	},
	
	templateCookieObj: function(){
		if(Cookies.get('admintorre_sess_temp') != undefined)
			return JSON.parse(Cookies.get('admintorre_sess_temp'))

		return false
	},

	includeJs: function(archivo){
        var oHead = document.getElementsByTagName('head')[0];
        var oScript = document.createElement('script');
        oScript.type = 'text/javascript';
        oScript.charset = 'utf-8';
        oScript.src = archivo;
        
		let arr_pathname=window.location.pathname.split('/')

		var scripts = document.getElementsByTagName('script');
		let scriptencontrado=0

		let urlarchivo=window.location.origin+'/'+arr_pathname[1]+'/'+arr_pathname[2]+'/'+archivo
		if(arr_pathname[1]=='frontend')
			urlarchivo=window.location.origin+'/'+arr_pathname[1]+'/'+archivo
		
		for (var i = 0; i < scripts.length; i++) {
			if(urlarchivo==scripts[i].src)
			{
				scriptencontrado = 1
				break; // Detén el bucle 
			}
		}
		if(scriptencontrado==0)
		{
			oHead.appendChild(oScript);
		}
	},

	removeJs: function(archivo) {
		var scripts = document.getElementsByTagName('script');
		for (var i = 0; i < scripts.length; i++) {
			if (scripts[i].src && scripts[i].src.includes(archivo)) {
				scripts[i].parentNode.removeChild(scripts[i]);
				break; // Detén el bucle después de eliminar el archivo
			}
		}
	},

	showMaskLoading: function(container, text="Cargando...", mask=true){
		$(container).mLoading({
			text: text,
			mask: mask
		});
	},

	hideMaskLoading: function(container){
		$(container).mLoading('hide');
	},

	setFormValidation: function(id) {
      $(id).validate({
        highlight: function(element) {
			$(element).closest('.form-group').removeClass('has-success').addClass('has-danger');
			$(element).closest('.form-check').removeClass('has-success').addClass('has-danger');
        },
        success: function(element) {
			$(element).closest('.form-group').removeClass('has-danger').addClass('has-success');
			$(element).closest('.form-check').removeClass('has-danger').addClass('has-success');
        },
        errorPlacement: function(error, element) {
        	$(element).append(error);
        },
      });
    },

    saveCatalog: function(formsData, catalogoid){
		if(Object.keys(formsData).length){
			
			formsData['llaveTramite'] = this.llaveTramite;
			formsData['catalogoid'] = catalogoid;
			formsData['adminid'] = portal.adminid;
			formsData['userid'] = this.userid();

			this.ajaxGlobalJson(this.serverUrl+'saveCatalog', 'POST', formsData, false, null, this.responseSaveCatalog);

		}
	},

	responseSaveCatalog: function(response){

		if(response.success){
			
			if(portal.llaveCatalog)
				portal.table.row(portal.indexTable).data(response.data).draw();
			else
				portal.table.row.add(response.data).draw();

			$('#myModal').modal('toggle');

		}else
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
		
		portal.hideMaskLoading('.modal-content');

	},

	saveTabs: function(formsData, processid, closeModal){
		if(Object.keys(formsData).length){
			
			formsData['llaveTramite'] = this.llaveTramite;
			formsData['processid'] = processid;
			formsData['adminid'] = portal.adminid;
			formsData['userid'] = this.userid();

			//this.ajaxGlobalJson(this.serverUrl+'saveTabs', 'POST', formsData, false, null, this.responseSaveTabs);

			var url = this.serverUrl+'saveTabs';
			App.ajax('POST', url, false, formsData).promise.done(function(response){
					
				if(response.success){
					if(portal.llaveTramite)
						portal.table.row(portal.indexTable).data(response.data).draw();
					else{
						portal.llaveTramite = response.data._id;
						portal.table.row.add(response.data).draw();
					}

					if(closeModal)
						$('#myModal').modal('toggle');
					
					portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n procesada con &eacute;xito', "Cambios guardados correctamente.");
					portal.setformatMoney();

					let refreshall = $('.tabs-conteiner.tabs-motor .nav-link.active').data('refresh-all')
					if(refreshall)
						motor.refreshProcess();

					if (response.hasOwnProperty('function'))
						eval(response.function + "(" + JSON.stringify(response) + ")")
				}else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
				
				portal.hideMaskLoading('.modal-content');


	      	}).fail(function(jqXHR, textStatus, errorThrown) {
			    App.consoleError(jqXHR, textStatus, errorThrown);
			});

		}
	},

	getContentTab: function(tabId){
		if(tabId){
			objet = {}
			objet['tabId'] = tabId;
			objet['processid'] = portal.processid;

			this.ajaxGlobal(this.serverUrl+'getContentTab/'+tabId, 'GET', objet, false, null, this.setContentTab);
		}
	},

	setContentTab: function(response){
		var containerDiv = $('.tab-content').find('[data-pane-dbid="'+objet['tabId']+'"]')
		if(response.success){
			containerDiv.data('open', 1)
			if(response.hasOwnProperty('function')){
				eval(response.function+"("+JSON.stringify(response)+")");
			}else{
				var form = containerDiv.find('form').attr('id');
				portal.setFormByObj('#' + form, response.data)
			}
		}else{
			if (response.hasOwnProperty('function_error')) {
				eval(response.function_error + "(" + JSON.stringify(response) + ")");
			}else
				portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
		}

		portal.hideMaskLoading('.modal-content');
	},

	getOptionsCombo: function(element, url){
		if(element && url){
			$.ajax({
				url: this.serverUrl+'fillCombo/'+url,
				type: 'GET',
				headers: {
		            'Authentication': portal.hash,
		            'processid': portal.processid,
		            'adminid': portal.adminid,
		            'procedureKey': portal.llaveTramite,
		            'userid': portal.userid(),
		            'objName': false
		        },
				dataType:"json",
				success: function(response){
					if(response.success){
						var data = response.data;
						var html = '';
						for(key in data){
							html += '<option value="'+data[key].value+'">'+data[key].description+'</option>';
						}
						$(element).html(html);
						$('.selectpicker').selectpicker('refresh');
					}else
						portal.showNotification('danger','ni ni-bell-55', 'Error.', response.errors.join('<br />'))
					
				},
				error: function(jqXHR, textStatus, error) {
					console.error( "error: " + jqXHR.responseText);
				}
			});
		}
	},

	getOptionsComboNoSess: function(element, url){
		if(element && url){
			$.ajax({
				url: this.serverUrl+'fillComboNoSess/'+url,
				type: 'GET',
				headers: {
		            'Authentication': portal.hash,
		            'processid': portal.processid,
		            'adminid': portal.adminid,
		            'procedureKey': portal.llaveTramite,
		            'userid': portal.userid(),
		            'objName': false
		        },
				dataType:"json",
				success: function(response){
					if(response.success){
						var data = response.data;
						var html = '';
						for(key in data){
							html += '<option value="'+data[key].value+'">'+data[key].description+'</option>';
						}
						$(element).html(html);
						$('.selectpicker').selectpicker('refresh');
					}else
						portal.showNotification('danger','ni ni-bell-55', 'Error.', response.errors.join('<br />'))
					
				},
				error: function(jqXHR, textStatus, error) {
					console.error( "error: " + jqXHR.responseText);
				}
			});
		}
	},

	getOptionsComboByObj: function(element, obj){
		var data = obj;
		var html = '';
		for(key in data){
			html += '<option value="'+data[key].value+'">'+data[key].description+'</option>';
		}
		$(element).html(html);
		$('.selectpicker').selectpicker('refresh');
	},

	getOptionsComboByParent: function(element, url, parentId, callback = false){
		if(element && url){
			$.ajax({
				url: this.serverUrl+'fillComboByParent/'+url+'_'+parentId,
				type: 'GET',
				headers: {
		            'Authentication': portal.hash,
		            'processid': portal.processid,
		            'adminid': portal.adminid,
		            'procedureKey': portal.llaveTramite,
		            'userid': portal.userid(),
		            'objName': false
		        },
				dataType:"json",
				success: function(response){
					if(response.success){
						var data = response.data;
						var html = '';
						for(key in data){
							html += '<option value="'+data[key].value+'">'+data[key].description+'</option>';
						}
						$(element).html('').html(html);
						$('.selectpicker').selectpicker('refresh');
						portal.hideMaskLoading('body')
					}else
						portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'))

					if(callback)
						callback(response)
					
				},
				error: function(jqXHR, textStatus, error) {
					console.error( "error: " + jqXHR.responseText);
					portal.hideMaskLoading('body')
				}
			});
		} else {
			portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', 'No se recibieron los parámetros necesarios para llenar el combo hijo.');
			portal.hideMaskLoading('body')
		}
	},

	setFormByObj: function(form, objet){
		for(key in objet){

			var type = $("input[name='"+key+"']").attr('type');

			if(type == "radio")
				$("input[name='"+key+"'][type=radio][value='"+objet[key]+"']").prop('checked', true);

			else if(type == "checkbox"){
				if(objet[key] && objet[key]!='0')
					$("input[name='"+key+"'][type=checkbox][value='"+objet[key]+"']").prop('checked', true);
				else
					$("input[name='"+key+"'][type=checkbox]").prop('checked', false);
			}else if(type == undefined){
				if($('#'+key).hasClass('selectpicker')){
					for(let i=0; i<=50; i++){
						$(form + " #" + key).val(objet[key])
					}
				}else{
					if($(form+' #'+key).length){
						$(form+' #'+key).html(objet[key])
					}
				}
			}else{
				$(form+" #"+key).val(objet[key]);
			}
			$(form+' .selectpicker').selectpicker('refresh'); 
		}
		portal.setformatMoney();
		portal.hideMaskLoading('.modal-content');
	},

    cleanForm: function(form){
    	$(form+" input[type=text]").val("");
    	$(form+" input[type=date]").val("");
    	$(form+" input[type=number]").val("");
    	$(form+" input[type=email]").val("");
    	$(form+" input[type=password]").val("");
    	$(form+" input[type=color]").val("");
    	$(form+" input[type=datetime-local]").val("");
    	$(form+" input[type=file]").val("");
    	$(form+" input[type=hidden]").val("");
    	$(form+" input[type=image]").val("");
    	$(form+" input[type=month]").val("");
    	$(form+" input[type=range]").val("");
    	$(form+" input[type=reset]").val("");
    	$(form+" input[type=search]").val("");
    	$(form+" input[type=tel]").val("");
    	$(form+" input[type=time]").val("");
    	$(form+" input[type=url]").val("");
    	$(form+" input[type=week]").val("");
    	$(form+" select").val("");
    	$(form+" textarea").val("");
    	$(form+" input[type=radio]").prop('checked', false);
    	$(form+" input[type=checkbox]").prop('checked', false);
    	$('.selectpicker').selectpicker('refresh');
    },

	deleteRow: function(data){
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
		}).then(function() {

			var url = portal.serverUrl+'delteRowCatalogList/'+parseInt(data[0]);

			portal.ajaxGlobalJson(url, 'DELETE', data, false, null, function(response){
				if(response.success){
					portal.table.row(portal.indexTable).remove().draw();
					portal.showNotification('success','ni ni-bell-55', 'Petici&oacute;n procesada con &eacute;xito', "Cambios guardados correctamente.");
				}
				else
					portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));

			});

		},function(dismiss) {
			if (dismiss === 'cancel') {
				swal({
				  title: 'Cancelado',
				  text: 'No se elimino el registro.',
				  type: 'error',
				  confirmButtonClass: "btn btn-osx",
				  buttonsStyling: false
				}).catch(swal.noop)
			}
		});
	},

	getDataTableDetailCat2: function(response){
		return response.data;
	},

	getObjetHmtl: function(data){
		let html = "";
		switch(data.typeobj) {
		  case "input":
		  		if(data.type=="date"){
		  			/*let current_datetime = new Date(data.value);
					console.log(data.value);
					data.value = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + (current_datetime.getDate() < 9 ? '0'+current_datetime.getDate() : current_datetime.getDate())
					console.log(data.value);*/
					data.value = data.value

		  		}

			    html = '<input type="'+data.type+'" class="form-control osx" value="'+(data.value ? data.value : '')+'" id="'+data.name+'" name="'+data.name+'" '+(data.required ? 'required': '')+' '+((data.readonly==1) ? 'readonly': '')+'>'
		    break
		  case "select":
		  		// console.log(data);
		    	html = '<select class="form-control osx selectpicker" data-size="7" title="'+data.label+'" data-style="select-osx select-with-transition" data-live-search="true" name="'+data.name+'" id="'+data.name+'" '+(data.required ? 'required': '')+'>'
		    	if(data.items != undefined && data.items.length){
		    		for(var key in data.items){
		    			checked = ''
		    			if(data.items[key].id == data.value)
		    				checked = 'selected'
		    			html += '<option value="'+data.items[key].id+'" '+checked+'>'+data.items[key].name+'</option>'
		    		}
		    	}
                html += '</select>'
		    break
		  case "textarea":
			    html = '<textarea class="form-control osx" id="'+data.name+'" name="'+data.name+'" '+(data.required ? 'required': 'false')+' '+(data.readonly ? 'readonly': '')+'>'+(data.value ? data.value : '')+'</textarea>'
		    break
		}
		return html
	},

	refreshTooltip: function(){
		$('[data-toggle="tooltip"]').tooltip();
	},

	setMenuActive: function(activeId){
		if(activeId){
			if(this.setTemplateCookieObj('menu-active', activeId)){
				$('.main-menu .nav-item').removeClass('active');
				$('#'+activeId).parents('.collapse').addClass('show');
				$('#'+activeId).parents('.nav-item').addClass('active');
				$('#'+activeId).parents('.nav-item').find('.nav-link').attr('aria-expanded', true);
				$('#'+activeId).parent().addClass('active');
				return true;
			}
		}
		return false;
	},

	setPreferenceTemplate: function(){
		var arrCookiesTemplate = this.templateCookieObj();
		$('#badge-'+arrCookiesTemplate['data-background-color']).trigger('click');
		$('#active-color-'+arrCookiesTemplate['data-color']).trigger('click');
		if(arrCookiesTemplate['sidebar-mini'])
			$('.switch-sidebar-mini input').trigger('click');
		if(!arrCookiesTemplate['sidebar-image'])
			$('.switch-sidebar-image input').trigger('click');
		$('#'+arrCookiesTemplate['img-holder']).trigger('click');
	},

	setTemplateCookieObj: function(key, value){
		if(key){
			var jsonTempleteVal = this.templateCookieObj();
			jsonTempleteVal[key] = value;
			Cookies.set('admintorre_sess_temp', jsonTempleteVal, { expires: 365 });
			return true;
		}
		return false
	},
	
  	checkFullPageBackgroundImage: function() {
	    $page = $('.full-page');
	    image_src = $page.data('image');

	    if (image_src !== undefined) {
	      image_container = '<div class="full-page-background" style="background-image: url(' + image_src + ') "/>'
	      $page.append(image_container);
    	}
  	},

  	getMainMenu: function(){
		var objet = {};

		if(this.hash){

			var url = portal.serverUrl+'mainMenu'
			App.ajax('POST', url, false, false).promise.done(function(response){
				
				portal.showMainMenu(response)

	        }).fail(function(jqXHR, textStatus, errorThrown) {
	            App.consoleError(jqXHR, textStatus, errorThrown);
	        });
		
		}else
			location.href = "login.html";
  	},

	showMainMenu: function(response){
		if(response.success){
			html = '';
			var data = response.data;
			for(cont in data){
				if(data[cont].submenu.length){
					html += `
					<li class="nav-item">
			          <a data-bs-toggle="collapse" href="#`+data[cont].url+`" class="nav-link" aria-controls="`+data[cont].url+`" role="button" aria-expanded="false">
			            <div class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center  me-2">
			              <i class="`+data[cont].icon+` text-lg text-dark"></i>
			            </div>
			            <span class="nav-link-text ms-1">`+data[cont].name+`</span>
			          </a>
			          <div class="collapse" id="`+data[cont].url+`">
			            <ul class="nav ms-4 ps-3">`;
					var submenu = data[cont].submenu;
					for(contSub in submenu){
						if(submenu[contSub].submenu.length){
							html += `
								<li class="nav-item ">
					                <a class="nav-link " data-bs-toggle="collapse" aria-expanded="false" href="#`+submenu[contSub].url+`">
					                  <span class="sidenav-mini-icon"> `+submenu[contSub].initials+` </span>
					                  <span class="sidenav-normal"> `+submenu[contSub].name+` <b class="caret"></b></span>
					                </a>
					                <div class="collapse " id="`+submenu[contSub].url+`">
					                  <ul class="nav nav-sm flex-column">`;
							var submenu_2 = submenu[contSub].submenu;
							for(contSub_2 in submenu_2){
								linkId_2 = submenu_2[contSub_2].url.replace('.html', '');
								html += `
											<li class="nav-item">
												<a class="nav-link" id="`+linkId_2+`" href="`+submenu_2[contSub_2].url+`">
													<span class="sidenav-mini-icon"> `+submenu_2[contSub_2].initials+` </span>
													<span class="sidenav-normal"> `+submenu_2[contSub_2].name+` </span>
												</a>
											</li>`;
							}
							html += `
										</ul>
										<hr class="border-secondary" />
									</div>
								</li> `;
						} else {
						  	linkId = submenu[contSub].url.replace('.html', '');
							html += `
								<li class="nav-item">
									<a class="nav-link" id="`+linkId+`" href="`+submenu[contSub].url+`">
										<span class="sidenav-mini-icon"> `+submenu[contSub].initials+` </span>
										<span class="sidenav-normal"> `+submenu[contSub].name+` </span>
									</a>
								</li>`;
						}
		      		}
					html += `
							</ul>
						</div>
					</li>`;

				} else {

					linkId = data[cont].url.replace('.html', '');

					html += `
			        <li class="nav-item">
			          <a id="`+linkId+`" href="`+data[cont].url+`" class="nav-link">
			            <div class="icon icon-shape icon-sm shadow border-radius-md bg-white text-center d-flex align-items-center justify-content-center  me-2">
			              <i class="`+data[cont].icon+` text-lg text-dark"></i>
			            </div>
			            <span class="nav-link-text ms-1">`+data[cont].name+`</span>
			          </a>
			        </li>`
				}

			}
			$('.navbar-nav.main-menu').append(html)
			portal.showFooter()
			$('body').slideDown()
		}else
			console.log(response.errors);

	},

  	showFooter: function(){
  		html = `<div class="container-fluid">
		          <div class="row align-items-center justify-content-lg-between">
		            <div class="col-lg-6 mb-lg-0 mb-4">
		              <div class="copyright text-center text-sm text-muted text-lg-start">
		                &copy; ${new Date().getFullYear()} ,
		                Created by
		                <a class="osx-link manita">S&C Softworks S.A. de C.V.</a>
		              </div>
		            </div>
		            <div class="col-lg-6">
		              <ul class="nav nav-footer justify-content-center justify-content-lg-end">
		                <li class="nav-item">
		                  <a class="osx-link manita nav-link text-muted" target="_blank"><img src="assets/img/logo_scsw_small.png">&nbsp;S&C Softworks</a>
		                </li>
		                <li class="nav-item">
		                  <a class="osx-link manita acerca-de nav-link text-muted" target="_blank">Acerca de Nosotros</a>
		                </li>
		              </ul>
		            </div>
		          </div>
		        </div>`;
        $("footer.footer").html(html);
  	},

  	checkSession: function(){
		if(this.hash){

			var url = portal.serverUrl+'checkSession/'+this.hash+'_'+this.userid()
			App.ajax('GET', url, false, false).promise.done(function(response){
	            if(response.success){
					portal.createHeaders()
					portal.createFixedPlugin()
					var data = response.data
					$('.user span.user-name').html(`Hola ${data.nombre}!`)
					$('.user span.user-full-name').html(data.nombre_completo)
					$('.user span.user-perfil').html(`<strong>Perfil:</strong> ${data.perfil}`)
					$('.user span.user-email').html(`${data.email}`)
					photo = data.foto ? data.foto : 'default-avatar.png'
					$('img.user-avatar').attr('src', './assets/img/user-profile/'+photo)
					portal.getMainMenu()
					$('body').fadeIn('10000')
					portal.getSocketId()
					portal.getNotifications()
				}else
					location.href = 'login.html'

	        }).fail(function(jqXHR, textStatus, errorThrown) {
	            App.consoleError(jqXHR, textStatus, errorThrown)
	        })

		}else
			location.href = "login.html"
  	},

	getSocketId: function() {
		portal.socket = io.connect(portal.socketsUrl, { forceNew: true, transports: ['websocket', 'polling', 'flashsocket'] })
		portal.socket.on("connection-socket", function (data) {

			let url = portal.serverUrl + 'socket'
			App.ajax('POST', url, false, data).promise.done(function (response) {

				if (response.success) {

					portal.socket.on("notificacion", function (data) {
						let { type_noti, tipo_notificacion, icono, posicion_vertical, posicion_horizontal, tamanio, duracion, portal, title_mensaje, text_mensaje, dropdown_noti = false} = data
						permanente = false
						if(duracion == 'permanente'){
							duracion = 0
							permanente = true
						}

						if(type_noti*1 == 1)
							portal.showNotification(tipo_notificacion, icono, title_mensaje, text_mensaje, posicion_vertical, posicion_horizontal, tamanio, duracion, portal, permanente)
						else if(type_noti*1 == 2){

							let dataswal = {
								title: title_mensaje,
								text: text_mensaje,
								type: tipo_notificacion
							}
							if(!permanente)
							dataswal.timer = duracion*1000
						
							swal(dataswal).catch(swal.noop)
						}

						if(dropdown_noti)
							portal.addNotificationDropdown(dropdown_noti)
						
					})
			
					portal.socket.on("notificacion-error", function (data) {
						portal.hideMaskLoading('body')
						swal({
							title: 'Error en notificación.',
							text: data.message.join('</ br>'),
							type: 'error',
							confirmButtonClass: "btn",
							buttonsStyling: true,
							allowEnterKey: true,
						}).catch(swal.noop)
					})

					portal.socket.on("notificacion-ok", function (data) {
						portal.hideMaskLoading('body')
						swal({
							title: 'Notificacion Enviada.',
							text: 'Se envió la notificación a los usuarios seleccionados.',
							type: 'success',
							confirmButtonClass: "btn",
							buttonsStyling: true,
							allowEnterKey: true,
						}).catch(swal.noop)
					})

				} else
					portal.showNotification('danger', 'ni ni-bell-55', 'Se produjo un error.', response.errors.join('<br />'))
				
			}).fail(function (jqXHR, textStatus, errorThrown) {
				portal.hideMaskLoading('body')
				App.consoleError(jqXHR, textStatus, errorThrown)
			})

		})

	},

	getTramiteJson: function(json_tramite, filejs, tramiteid, funcvalidat){
		if(json_tramite)
		{
			Cookies.set('admintorre_motor_settings', json_tramite, { expires: 1 })
			Cookies.set('osx_tn_procedure', tramiteid, { expires: 1 });
			Cookies.set('osx_tn_filejs', filejs, { expires: 1 });
			Cookies.set('osx_tn_funcvalidat', funcvalidat, { expires: 1 });
			setTimeout(() => {
				location.href = 'motor_lista.html'
			}, 500)
			
		}
	},

	getNotification: function(notificacion){
		let url = portal.serverUrl + 'notificacion/' + notificacion
		App.ajax('GET', url, false, false).promise.done(function (response) {

			if (response.success) {

				let { json_noti = false, link = false } = response.data[0]
				if(json_noti)
					Cookies.set('admintorre_motor_settings', json_noti, { expires: 1 })

				if(link)
					location.href = link
						
			} else
				portal.showNotification('danger', 'ni ni-bell-55', 'Se produjo un error.', response.errors.join('<br />'))
			
		}).fail(function (jqXHR, textStatus, errorThrown) {
			portal.hideMaskLoading('body')
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},

	getNotifications: function(notificacion){
		let url = portal.serverUrl + 'notificaciones'
		App.ajax('GET', url, false, false).promise.done(function (response) {

			if (response.success) {

				let data = response.data
				for(let i in data)
					portal.addNotificationDropdown(data[i])
						
			} else
				portal.showNotification('danger', 'ni ni-bell-55', 'Se produjo un error.', response.errors.join('<br />'))
			
		}).fail(function (jqXHR, textStatus, errorThrown) {
			portal.hideMaskLoading('body')
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},

	addNotificationDropdown: function(noti_obj){
		let { title, message, id_notificacion } = noti_obj,
			counter =  ($("#notification-counter").data('counter')*1)+1,
			html = ` <li class="mb-2" id="empty-cart">
						<a class="dropdown-item notification" href="#" data-noti-id="${id_notificacion}">
							<div class="d-flex py-1">
								<div class="ms-2 d-flex flex-column justify-content-center">
									<h6 class="text-sm font-weight-normal mb-1">
										<span class="font-weight-bold user-full-name">${title}</span>
									</h6>
									<p class="text-xs text-secondary m-0 ">
										<span class=" user-email">${message}</span>
									</p>
								</div>
							</div>
						</a>
					</li> `

		if(counter>1)
			$("#notification-preview").prepend(html)
		else
			$("#notification-preview").html(html)


		let html_counter = `<span class="badge badge-circle bg-gradient-success position-absolute bottom-0 end-0 me-n3 mb-n2">${counter}</span>`
		$("#notification-counter").html(html_counter)
		$("#notification-counter").data('counter', counter)
	},

	createHeaders: function(){

		html = `<i class="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
			      <a class="navbar-brand m-0" href=" dashboard.html">
			        <img src="./assets/img/admintorre-v2.png" class="navbar-brand-img h-100" alt="main_logo">
			        <span class="ms-1 font-weight-bold"><span style="color:#0d83e1;">Admin</span>Torre</span>
			        <!--<img src="assets/img/scsoftworks-v1.png" class="ms-1 font-weight-bold col-10 img-logo-2">-->
			      </a>`
    	$(".sidenav-header").html(html)
		{/* <li class="nav-item pe-2 d-flex align-items-center">
			  <a href="javascript:;" class="nav-link text-body p-0">
				<i class="fa fs-5 fa-cog fixed-plugin-button-nav cursor-pointer"></i>
			  </a>
			</li> */}
    	html_up = `<div class="container-fluid py-1 px-0 px-lg-4">
        <div class="sidenav-toggler sidenav-toggler-inner d-xl-block d-none ">
          <a href="javascript:;" class="nav-link text-body p-0">
            <div class="sidenav-toggler-inner">
              <i class="sidenav-toggler-line"></i>
              <i class="sidenav-toggler-line"></i>
              <i class="sidenav-toggler-line"></i>
            </div>
          </a>
        </div>
        <div class="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
          <div class="ms-md-auto pe-md-3 d-flex align-items-center">
          </div>
          <ul class="navbar-nav  justify-content-end">
			<li class="nav-item d-xl-none pe-3 d-flex align-items-center">
              <a href="javascript:;" class="nav-link text-body p-0" id="iconNavbarSidenav">
                <div class="sidenav-toggler-inner">
                  <i class="sidenav-toggler-line"></i>
                  <i class="sidenav-toggler-line"></i>
                  <i class="sidenav-toggler-line"></i>
                </div>
              </a>
            </li>
			
          	<li class="nav-item dropdown pe-2 d-flex align-items-center user">
              <a href="javascript:;" class="nav-link text-body p-0" id="dropdownUserButton" data-bs-toggle="dropdown" aria-expanded="false">
			  <span class="d-sm-inline d-none user-name me-2">Sign In</span>
			  <i class="fa fs-5 fa-user me-sm-1"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end px-2 py-3 me-sm-n4" aria-labelledby="dropdownUserButton">
                <li class="mb-2 info-user">
                  <a class="dropdown-item border-radius-md">
                    <div class="d-flex py-1">
                      <div class="avatar avatar-xl position-relative">
                        <img src="" class="w-100  border-radius-lg shadow-sm user-avatar" alt="user image">
                      </div>
                      <div class="ms-2 d-flex flex-column justify-content-center">
                        <h6 class="text-sm font-weight-normal mb-1">
                          <span class="font-weight-bold user-full-name">Mi perfil</span>
                        </h6>
						<p class="text-xs text-secondary m-0 ">
							<i class="fas fa-id-card-alt"></i>
							<span class=" user-perfil"></span>
                        </p>
						<p class="text-xs text-secondary m-0 ">
							<i class="fas fa-at"></i>
							<span class=" user-email"></span>
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
				<li class="border-top text-end logout-user">
					Cerrar Sesi&oacute;n
				</li>
              </ul>
            </li>
			<li class="nav-item dropdown pe-3 d-flex align-items-center">
				<div class="position-relative">
					<a href="javascript:;" class="nav-link text-body p-0" id="dropdownNotifButton" data-bs-toggle="dropdown" aria-expanded="false" title="Notificaciones">
						<i class="fa fs-5 fa-bell cursor-pointer" id="notification-counter" data-counter="0"></i>
					</a>
					<ul class="dropdown-menu dropdown-menu-end px-2 py-3 me-sm-n4 mw-20" aria-labelledby="dropdownNotifButton" id="notification-preview">
						<li class="mb-2" id="empty-cart">
							<a class="dropdown-item" href="#">
								<div class="d-flex py-1">
									No hay notificaciones por el momento.
								</div>
							</a>
						</li>
					</ul>
			  	</div>
			</li>
			
			
			
            
          </ul>
        </div>
      </div>`

      $(".navbar.navbar-main").html(html_up)
	  portal.refreshTooltip()

	},

	createFixedPlugin: function(){
		html = `<a class="fixed-plugin-button text-dark position-fixed px-3 py-2">
			      <i class="fa fa-cog py-2"> </i>
			    </a>
			    <div class="card shadow-lg blur">
			      <div class="card-header pb-0 pt-3  bg-transparent ">
			        <div class="float-start">
			          <h5 class="mt-3 mb-0">Configuraci&oacute;n - Report</span><span class="text-osx-alt">@</span><span class="text-osx-dark">net</h5>
			          <p>Seleccione las opciones deseadas</p>
			        </div>
			        <div class="float-end mt-4">
			          <button class="btn btn-link text-dark p-0 fixed-plugin-close-button">
			            <i class="fa fa-close"></i>
			          </button>
			        </div>
			        <!-- End Toggle Button -->
			      </div>
			      <hr class="horizontal dark my-1">
			      <div class="card-body pt-sm-3 pt-0">
			        <!-- Sidebar Backgrounds -->
			        <div>
			          <h6 class="mb-0">Color de men&uacute; lateral</h6>
			        </div>
			        <a href="javascript:void(0)" class="switch-trigger background-color">
			          <div class="badge-colors my-2 text-start">
			            <span class="badge filter bg-gradient-light active" data-color="primary" onclick="Dashboard.sidebarColor(this)"></span>
			            <span class="badge filter bg-gradient-dark" data-color="dark" onclick="Dashboard.sidebarColor(this)"></span>
			            <span class="badge filter bg-gradient-info" data-color="info" onclick="Dashboard.sidebarColor(this)"></span>
			            <span class="badge filter bg-gradient-success" data-color="success" onclick="Dashboard.sidebarColor(this)"></span>
			            <span class="badge filter bg-gradient-warning" data-color="warning" onclick="Dashboard.sidebarColor(this)"></span>
			            <span class="badge filter bg-gradient-danger" data-color="danger" onclick="Dashboard.sidebarColor(this)"></span>
			          </div>
			        </a>
			        <!-- Sidenav Type -->
			        <div class="mt-3">
			          <h6 class="mb-0">Tipo de men&uacute; lateral</h6>
			          <p class="text-sm">Elija el estilo:</p>
			        </div>
			        <div class="d-flex">
			          <button class="btn bg-gradient-light w-100 px-3 mb-2 active" data-class="bg-transparent" onclick="Dashboard.sidebarType(this)" id="btnTransparentSidebar">Transparente</button>
			          <button class="btn bg-gradient-light w-100 px-3 mb-2 ms-2" data-class="bg-white" onclick="Dashboard.sidebarType(this)" id="btnWhiteSidebar">Fondo blanco</button>
			        </div>
			        <p class="text-sm d-xl-none d-block mt-2">Esta propiedad aplica &uacute;nicamente para la vista de escritorio.</p>
			        <!-- Navbar Fixed -->
			        <div class="mt-3">
			          <h6 class="mb-0">Men&uacute; superior Fijo</h6>
			        </div>
			        <div class="form-check form-switch ps-0">
			          <input class="form-check-input mt-1 ms-auto" type="checkbox" id="navbarFixed" onclick="Dashboard.navbarFixed(this)">
			        </div>
			        <hr class="horizontal dark mb-1">
			        <div class="mt-2">
			          <h6 class="mb-0">Men&uacute; lateral Mini <small>(s&oacute;lo iconos)</small></h6>
			        </div>
			        <div class="form-check form-switch ps-0">
			          <input class="form-check-input mt-1 ms-auto" type="checkbox" id="navbarMinimize" onclick="Dashboard.navbarMinimize(this)">
			        </div>
			        <hr class="horizontal dark my-sm-4">
			      </div>
			    </div>`

    	$('.fixed-plugin').html(html);

	},

	loggout: function(callback = null){
		if(this.userid()){
			var Obj = {};
	        Obj.userid = this.userid();

			var url = portal.serverUrl+'loggout';
			App.ajax('POST', url, false, Obj).promise.done(function(response){
	            if(response.success){

	            	Cookies.remove('admintorre_sess_hash');
	            	Cookies.remove('admintorre_sess_user');
	            	Cookies.remove('admintorre_sess_adminid');
	            	Cookies.remove('osx_tn_procedure');
	            	Cookies.remove('osx_tn_filejs');
					Cookies.remove('admintorre_sess_pag_ini');
	            	// Cookies.remove('admintorre_sess_temp');

					if(callback){
						callback()
					}
	            }else
	                portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));

	        }).fail(function(jqXHR, textStatus, errorThrown) {
	            App.consoleError(jqXHR, textStatus, errorThrown);
	        });
    	}
	},

	ajaxGlobal: function(url, type, data, recursive, timer, successCallback, objName=false){

		var jqXhr = $.ajax({
		    data: data,
		    type: type,
		    dataType: "json",
		    headers: {
	            'Authentication': portal.hash,
	            'processid': portal.processid,
	            'catalogid': portal.catalogid,
	            'adminid': portal.adminid,
	            'procedureKey': portal.llaveTramite,
	            'catalogKey': portal.llaveCatalog,
	            'userid': portal.userid(),
	            'objName': objName
	        },
		    url: url,
		})
		
		jqXhr.then(successCallback);

		jqXhr.fail(function( jqXHR, textStatus, errorThrown ) {
		     if ( console && console.log ) {
		         console.log( "La solicitud ha fallado: " +  textStatus);
		     }
		});

		if(recursive)
			setTimeout(function(){this.ajaxGlobal(url, type, data, objeto, recursive, timer, successCallback);}, timer);

	},

	ajaxGlobalJson: function(url, type, data, recursive, timer, successCallback, objName=false){

		var jqXhr = $.ajax({
		    data: JSON.stringify(data),
		    type: type,
		    headers: {
	            'Content-Type':'application/json',
	            'Authentication': portal.hash,
	            'processid': portal.processid,
	            'catalogid': portal.catalogid,
	            'adminid': portal.adminid,
	            'procedureKey': portal.llaveTramite,
	            'catalogKey': portal.llaveCatalog,
	            'userid': portal.userid(),
	            'objName': objName
	        },
		    dataType: "json",
		    url: url,
		})
		
		jqXhr.then(successCallback);

		jqXhr.fail(function( jqXHR, textStatus, errorThrown ) {
		     if ( console && console.log ) {
		         console.log( "La solicitud ha fallado: " +  textStatus);
		     }
		});

		if(recursive)
			setTimeout(function(){this.ajaxGlobal(url, type, data, objeto, recursive, timer, successCallback);}, timer);

	},

	showModalLogin: () => {
		if (!$('#modal-login').length){
			portal.showMaskLoading('body', 'Validando Sesion...', true)
			html = `<div class="modal fade" id="modal-login" role="dialog">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-body" id="modalBody">
							<div class="card">
								<div class="card-header text-center pt-4">
								<img src="./assets/img/admintorre.png" class="col-11">
								<h5>Inicio de sesi&oacute;n</h5>
								</div>
								<div class="row px-xl-5 px-sm-4 px-3">
								<div class="card-body">
								<form role="form" class="text-start form-login">
									<div class="mb-3">
									<input type="email" class="form-control" id="userModal" placeholder="Email" aria-label="Email">
									</div>
									<div class="mb-3">
									<input type="password" class="form-control" id="passwordModal" placeholder="Password" aria-label="Password">
									</div>
									<div class="text-center">
									<button type="submit" class="btn bg-gradient-info w-100 my-4 mb-2" id="btnEntrarModal">Entrar</button>
									</div>
									<div class="mb-2 position-relative text-center">
									<p class="text-sm font-weight-bold mb-2 text-secondary text-border d-inline z-index-2 bg-white px-3">
										&oacute;
									</p>
									</div>
									<div class="text-center">
									<button type="button" class="btn bg-gradient-dark w-100 mt-2 mb-4" onclick="location.href='login.html'">Cancelar</button>
									</div>
								</form>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`
			$('body').append(html)
			setTimeout(() => {
				$('#modal-login').modal({ backdrop: 'static', keyboard: false, show: true })
				$('#modal-login').modal('show')
				portal.hideMaskLoading('.card')
				portal.hideMaskLoading('body')
			}, 500)
		}
	},

	validaPolizaSeguro: function(cve_cat, callback = null){
		var Obj = {};
		Obj.cve_catastral = cve_cat
	
		var url = portal.serverUrl+'validatePoliza';
		App.ajax('POST', url, false, Obj).promise.done(function(response){
			if(response.success){
				if(response.data.flag_beneficio === 1){
					swal({
						title: 'Felicidades!',
						text: 'Su predio cuenta con el beneficio de seguro para la vivienda. Por favor haga click en el bot&oacute;n de "Descargar P&oacute;liza" para obtener el documento.',
						type: 'success',
						confirmButtonClass: "btn",
						buttonsStyling: true,
						confirmButtonText: 'Descargar P&oacute;liza',
						cancelButtonText: 'Cerrar',
					}).then((result) => {
						if(result){
							if(response.data.archivo){
								var bytes = response.data.archivo.file
								var format = response.data.archivo.type
								bytes = bytes.replace("data:"+format+";base64,", "");
								let pdfWindow = window.open("");
								pdfWindow.document.write("<iframe width='100%' height='100%' src='data:"+format+";base64, " + encodeURI(bytes)+"'></iframe>");
							}
							if(callback) 
								eval(callback)
						 }
					})
				} else{
					swal({
						title: 'Clave Catastral sin Beneficio',
						text: 'Lo sentimos, su predio no cumple con los requisitos para disfrutar del beneficio de seguro para vivienda.',
						type: 'error',
						confirmButtonClass: "btn",
						buttonsStyling: true,
						allowEnterKey: true,
					}).catch(swal.noop)
				}
			} else {
				portal.showNotification('danger','ni ni-bell-55', 'Error en el motor.', response.errors.join('<br />'));
			}
			portal.hideMaskLoading("body");
		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		});
	},

	validaReciboIngresos: function(code, callback = null){
		var Obj = {};
		Obj.code = code

		var url = portal.serverUrl+'validaReciboPago'

		App.ajax('POST', url, false, Obj).promise.done(function(response){
			
			if(response.success)
			{
				let bytes = response.data[0].file
				let format = response.data[0].type
				bytes = bytes.replace("data:"+format+";base64,", "");
				$("#codeValidation").val("")
				$('.div-consulta-adeudo').hide();
				$('.modal-header .modal-title').html('<strong>Consultar Recibo de Caja</strong>');
				$('.div-consulta-recibo').html("<iframe class=\"w-100\" height='500px' src='data:"+format+";base64, " + encodeURI(bytes)+"'></iframe>").show();
				$('#myModal').modal('show');
				
				portal.hideMaskLoading('body');
			}
			else
			{
				portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));
				$('.div-consulta-recibo').html("")
				$("#codeValidation").val("")
			}
		
		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
	},

	// FUNCIONES TRAIDAS DE MATERIAL DASHBOARD PARA EL MANEJO DE GRAFICAS CHARTIST
	startAnimationForLineChart: function(chart) {
		chart.on('draw', function(data) {
			if (data.type === 'line' || data.type === 'area') {
			data.element.animate({
				d: {
				begin: 600,
				dur: 700,
				from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
				to: data.path.clone().stringify(),
				easing: Chartist.Svg.Easing.easeOutQuint
				}
			});
			} else if (data.type === 'point') {
			seq++;
			data.element.animate({
				opacity: {
				begin: seq * delays,
				dur: durations,
				from: 0,
				to: 1,
				easing: 'ease'
				}
			});
			}
		});

		seq = 0;
	},

	startAnimationForBarChart: function(chart) {
		chart.on('draw', function(data) {
			if (data.type === 'bar') {
			seq2++;
			data.element.animate({
				opacity: {
				begin: seq2 * delays2,
				dur: durations2,
				from: 0,
				to: 1,
				easing: 'ease'
				}
			});
			}
		});

		seq2 = 0;
	},

	formatInput: function(obj) {
		let objRes = {}
		for(let i in obj){
			if (obj[i].name in objRes){
				if(Array.isArray(objRes[obj[i].name]))
					objRes[obj[i].name].push(obj[i].value)
				else{
					let value = objRes[obj[i].name]
					objRes[obj[i].name] = []
					objRes[obj[i].name].push(value)
					objRes[obj[i].name].push(obj[i].value)
				}
			}else
				objRes[obj[i].name] = obj[i].value
		}

		return objRes
	},

	b64toBlob: function(b64Data, contentType = '', sliceSize = 512){
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, { type: contentType });
		return blob;
	},

	showModalBusqueda: () => {
		if (!$('#modal-login').length){
			portal.showMaskLoading('body', 'Buscando...', true)
			html = `<div class="modal fade bd-example-modal-lg" id="modal-busqueda" role="dialog">
				<div class="modal-dialog modal-xl">
					<div class="modal-content">
						<div class="modal-header">
							<div class="col-md-12 text-start">
								<h4 class="modal-title w-100">Resultado de la B&uacute;squeda</h4>
							</div>
						</div>
						<div class="modal-body" id="modalBody">
							<div class="card">
								<div class="card-body">
									<div class="row">
										<div class="col-xl-12">
											<div class="table-responsive">
												<table id="tablaFoliosInterno" class="table table-flush" width="100%" style="width:100%">
												<thead>
													<tr>
														<th>Folio Interno</th>
														<th>Folio Hacendario</th>
														<th>Valudador</th>
														<th>Estatus</th>
														<th>Clave Catastral</th>
														<th>Fecha</th>
														<th>Valor</th>
														<th>Cliente</th>
													</tr>
												</thead>
												<tfoot>
													<tr>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
														<th>&nbsp;</th>
													</tr>
												</tfoot>
												<tbody>
												</tbody>
												</table>
											</div>
										</div>
										<!-- end col-md-12 -->
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`
			$('body').append(html)
			setTimeout(() => {
				//$('#modal-busqueda').modal({ backdrop: 'static', keyboard: false, show: true })
				
				let folioClave = $('#buscaFolioClave').val()
				
				let buscaFolio = ''
				let buscaClave = ''
				
				if(Number.isInteger(folioClave *1) && folioClave.length==15)
				{
					buscaFolio = ''
					buscaClave = folioClave
				}
				else
				{
					if(folioClave.substring(0,2)=='f:' || folioClave.substring(0,2)=='F:')
					{
						buscaFolio = ''
						buscaClave = folioClave.substring(2, folioClave.length)
					}
					else
					{
						buscaFolio = folioClave
						buscaClave = ''
					}
				}
				let data = '_______'+buscaClave+'_'+buscaFolio

				if(folioClave.length>=3)
				{
					var url = portal.serverUrl+'getFoliosInternosList/'+data;
					App.ajax('GET', url, false, false).promise.done(function(response){
							
						if(response.success){
							if (!$.fn.dataTable.isDataTable( '#tablaFoliosInterno' ) ) {
								App.tablaFoliosInterno = $("#tablaFoliosInterno").DataTable({
									responsive: true,
									paging: true,
									searching: true,
									ordering: true,
									info: false,
									autoWidth: true,
									rowId: 'id',
									columns: [
										{data: "folio", className: "text-center"},
										{data: "folio_hacendario", className: "text-center"},
										{data: "valuador", className: "text-left"},
										{data: "estatus", className: "text-center"},
										{data: "inmueble_cve_catastral", className: "text-center"},
										{data: "fecha", className: "text-center"},
										{data: "valor", className: "text-end"},
										{data: "cliente_txt", className: "text-left"}
									],
									order: [[ 0, "asc" ]],
									
								});

								App.tablaFoliosInterno.clear().rows.add(response.data).draw()

								App.tablaFoliosInterno.on('click', 'tbody tr', function (event) {

									let esteregistro = App.tablaFoliosInterno.row($(this).closest('tr')).data()
									let esteJson = {}
									let filejs, tramiteid, funcvalidat=''
									if(esteregistro.id_ctrltramite && esteregistro.id_ctrltramite * 1 > 0)
									{
										esteJson.key = esteregistro.id_ctrltramite
										esteJson.filejs = filejs = 'assets/js/control-tramites.js'
										esteJson.procedure = tramiteid = 2
										funcvalidat='Tramites.validate'
									}
									else
									{
										esteJson.key = esteregistro.id_solicitud
										esteJson.filejs = filejs = 'assets/js/solicitudes-valor.js'
										esteJson.procedure = tramiteid = 1
										funcvalidat='SolicitudesValor.validate'
									}
									portal.getTramiteJson(esteJson, filejs, tramiteid, funcvalidat)
								});
							}
							else
							{
								App.tablaFoliosInterno.clear().rows.add(response.data).draw()
							}

							portal.hideMaskLoading('.card')
							portal.hideMaskLoading('body')
							
							portal.showNotification('success','ni ni-bell-55', 'Consulta realizada con &Eacute;xito', "");



							$('#modal-busqueda').modal('show')

							
						}else
						{
							portal.hideMaskLoading('.card')
							portal.hideMaskLoading('body')
							portal.showNotification('danger','ni ni-bell-55', 'Error.', response.errors.join('<br />'));
						}

					}).fail(function(jqXHR, textStatus, errorThrown) {
						App.consoleError(jqXHR, textStatus, errorThrown);
					});
				}
				else
				{
					portal.hideMaskLoading('.card')
					portal.hideMaskLoading('body')
					portal.showNotification('danger','ni ni-bell-55', 'Error.','Escribir al menos tres digitos de b&uacute;squeda');
				}
				
				

			}, 500)
		}
	}

}

var App = {
  	promise: null,
	tablaConsultaFoliosInternos: false,
  	ajax: function(method, url, objName=false, data = {}){
		this.promise = $.ajax({
			"method":   method,
			"url"   :   url,
			"timeout": 9000000,
			"data": data ? JSON.stringify(data) : '',
			"headers": {
				'Content-Type':'application/json',
				'Authentication': portal.hash,
				'processid': portal.processid,
				'catalogid': portal.catalogid,
				'adminid': portal.adminid,
				'procedureKey': portal.llaveTramite,
				'catalogKey': portal.llaveCatalog,
				'userid': portal.userid(),
				'objName': objName
			},
			"dataType":"json"
    	})
    	return this
  	},

	ajaxBianni: function (method, url, objName = false, data = {}, contentType = 'application/json', token = false) {
		let headers = {}
		if (token) {
			headers = {
				'Content-Type': contentType,
				'Authorization': 'Bearer ' + token
			}
		} else {
			headers = {
				'Content-Type': contentType
			}
		}

		this.promise = $.ajax({
			"method": method,
			"url": url,
			"timeout": 9000000,
			"data": data,
			"headers": headers
		});
		return this
	},

  	consoleError: function(jqXHR, textStatus, errorThrown){
		if (console && console.log) {
			portal.hideMaskLoading('body')
			portal.hideMaskLoading('.modal-content')
			if (jqXHR.status == 401)
				portal.showModalLogin()
			else{
				swal({
					title: 'Error de comunicaci&oacute;n',
					text: 'Se produjo un error de comunicaci&oacute;n con la aplicaci&oacute;n. Si el problema persiste favor de comunicarse con soporte t&eacute;cnico.',
					type: 'error',
					confirmButtonClass: "btn",
					buttonsStyling: true,
					allowEnterKey: false,
				}).catch(swal.noop)
					console.log( "La solicitud ha fallado: " +  textStatus)
			}
		}
  	},
};
