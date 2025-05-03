$(function(){
	portal.loggout()
    var imgIndx =  Math.floor(Math.random() * 7) + 1
    $('.login-bg').attr('style',"background-image: url('assets/img/back_"+imgIndx+".jpg') ")

	$(this).on('click', '.lnk-reenviar-correo', function(){
		var email = $("#email").val()
		portal.sendCodeValidation(email)
	})

	$(this).on('click','.radsexo', function() {
        $("#sexo").val(this.value)
    });

	//STEPS BAR CLICK FUNCTION
	Registro.DOMstrings.stepsBar.addEventListener('click', e => {
		return 
		/* //check if click target is a step button
		const eventTarget = e.target
		if (!eventTarget.classList.contains(`${Registro.DOMstrings.stepsBtnClass}`)) {
			return
		}
		let lastPanelNum = Array.from(Registro.DOMstrings.stepFormPanels).indexOf(Registro.getActivePanel())

		//get active button step number
		const activeStep = Registro.getActiveStep(eventTarget)
		
		Registro.execFormActions(activeStep, lastPanelNum) */
	})

	//PREV/NEXT BTNS CLICK
	Registro.DOMstrings.stepsForm.addEventListener('click', e => {
		const eventTarget = e.target

		//check if we clicked on `END` button
		if (eventTarget.classList.contains(`${Registro.DOMstrings.stepEndBtnClass}`)) {
			Registro.finalizaRegistro()
			return
		}
		//check if we clicked on `PREV` or NEXT` buttons
		if (!(eventTarget.classList.contains(`${Registro.DOMstrings.stepPrevBtnClass}`) || eventTarget.classList.contains(`${Registro.DOMstrings.stepNextBtnClass}`))) {
			return
		}
		
		//find active panel
		const activePanel = Registro.findParent(eventTarget, `${Registro.DOMstrings.stepFormPanelClass}`)

		let lastPanelNum = Array.from(Registro.DOMstrings.stepFormPanels).indexOf(activePanel)
		let activePanelNum = Array.from(Registro.DOMstrings.stepFormPanels).indexOf(activePanel)
		//set active step and active panel onclick
		if (eventTarget.classList.contains(`${Registro.DOMstrings.stepPrevBtnClass}`)) {
			activePanelNum--
			
			Registro.avanzaTab(activePanelNum)
		} else {
			activePanelNum++

			Registro.execFormActions(activePanelNum, lastPanelNum)
		}

	})

	//SETTING PROPER FORM HEIGHT ONLOAD
	window.addEventListener('load', Registro.setFormHeight, false)

	//SETTING PROPER FORM HEIGHT ONRESIZE
	window.addEventListener('resize', Registro.setFormHeight, false)

	$('body').slideDown()
})

var Registro = {
	////////////////////////////////// CONTROLES DE WIZARD //////////////////////////////////
	//DOM elements
	DOMstrings : {
		stepsBtnClass: 'multisteps-form__progress-btn',
		stepsBtns: document.querySelectorAll(`.multisteps-form__progress-btn`),
		stepsBar: document.querySelector('.multisteps-form__progress'),
		stepsForm: document.querySelector('.multisteps-form__form'),
		stepsFormTextareas: document.querySelectorAll('.multisteps-form__textarea'),
		stepFormPanelClass: 'multisteps-form__panel',
		stepFormPanels: document.querySelectorAll('.multisteps-form__panel'),
		stepPrevBtnClass: 'js-btn-prev',
		stepNextBtnClass: 'js-btn-next',
		stepEndBtnClass: 'js-btn-end'
	},


	//remove class from a set of items
	removeClasses : (elemSet, className) => {
		elemSet.forEach(elem => {
			elem.classList.remove(className)
		})
	},

	//return exect parent node of the element
	findParent : (elem, parentClass) => {
		let currentNode = elem
		while (!currentNode.classList.contains(parentClass)) {
			currentNode = currentNode.parentNode
		}
		return currentNode
	},

	//get active button step number
	getActiveStep : (elem) => {
		return Array.from(Registro.DOMstrings.stepsBtns).indexOf(elem)
	},

	//set all steps before clicked (and clicked too) to active
	setActiveStep : (activeStepNum) => {
		//remove active state from all the state
		Registro.removeClasses(Registro.DOMstrings.stepsBtns, 'js-active')
		//set picked items to active
		Registro.DOMstrings.stepsBtns.forEach((elem, index) => {
			if (index <= activeStepNum) {
				elem.classList.add('js-active')
			}
		})
	},

	//get active panel
	getActivePanel : () => {
		let activePanel
		Registro.DOMstrings.stepFormPanels.forEach(elem => {
			if (elem.classList.contains('js-active')) {
				activePanel = elem
			}
		})
		return activePanel
	},

	//open active panel (and close unactive panels)
	setActivePanel : (activePanelNum) => {
		//remove active class from all the panels
		Registro.removeClasses(Registro.DOMstrings.stepFormPanels, 'js-active')
		//show active panel
		Registro.DOMstrings.stepFormPanels.forEach((elem, index) => {
			if (index === activePanelNum) {
				elem.classList.add('js-active')
				Registro.setFormHeight(elem)
			}
		})
	},

	//set form height equal to current panel height
	formHeight : (activePanel) => {
		const activePanelHeight = activePanel.offsetHeight
		Registro.DOMstrings.stepsForm.style.height = `${activePanelHeight}px`
	},

	setFormHeight : () => {
		const activePanel = Registro.getActivePanel()
		Registro.formHeight(activePanel)
	},

	// FUNCIONES DE CONTROL DEL FLUJO
	execFormActions : (activePanelNum, lastPanelNum) => {
		var errors = []

		switch(lastPanelNum){
			case 0:		// datos de registro
				$('#firstname').prop('required', true)
				$('#lastname').prop('required', true)
				$('#lastnameM').prop('required', true)
				$('#email').prop('required', true)
				$('#rfc').prop('required', false)
				$('#birthdate').prop('required', false)
				$('#celphone').prop('required', false)
				$('#password').prop('required', false)
				$('#confirmpass').prop('required', false)
				$('#flag_tyc').prop('required', false)
	
				if($('.form-registro').valid()){
					portal.sendCodeValidation($('#email').val(), 1, 'Registro.avanzaTab('+activePanelNum+')')
				} else
					errors.push('Por favor verifique los campos obligatorios')
				break
			case 1:		// datos de validacion
				$('#confirmationcode').prop('required', true)
	
				if($('.form-registro').valid()){
					portal.validateRegCode($('#confirmationcode').val(), $('#email').val(), 'Registro.avanzaTab('+activePanelNum+')')
				} else
					errors.push('Por favor verifique los campos obligatorios')
				break
			case 2:
				Registro.finalizaRegistro()
				break
			default:
				break
		}
	
		if(errors.length ){
			portal.showNotification('danger', 'ni ni-bell-55', 'Verifique los datos capturados', errors.join('<br />'))
		}	
	},

	finalizaRegistro : () => {
		var errors = []



		$('#password').prop('required', true)
		$('#confirmpass').prop('required', true)
		$('#flag_tyc').prop('required', true)

		if($('.form-registro').valid()){
			if(!$('.flag_tyc').prop('checked')) errors.push("Debe aceptar los T&eacute;rminos y Condiciones antes de continuar.<br />")
			if($("#password").val() != $("#confirmpass").val()) errors.push("Las contrase&ntilde;as no coinciden")
			
			if(!errors.length){
				var obj = $(".form-registro").serializeArray();
				var image = $("#wizardPicturePreview").attr('src');
				if(image != "./assets/img/default-avatar.png")
					obj.push({"name": "image", "value": image});
				
				portal.registerUser(obj);
			}
		} else
			errors.push('Por favor verifique los campos obligatorios')
		
		if(errors.length ){
			portal.showNotification('danger', 'ni ni-bell-55', 'Verifique los datos capturados', errors.join('<br />'))
		}	
	},
	
	avanzaTab : (activePanelNum) => {
		Registro.setActiveStep(activePanelNum)
		Registro.setActivePanel(activePanelNum)
	}
}