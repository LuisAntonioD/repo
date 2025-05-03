$(function(){

    portal.getOptionsCombo("#tipo_usuario", "clickTipoUsuario")
    portal.getOptionsCombo("#usuarios", "usuariosActivos")
    $('.tipo-perfil, .tipo-banner, .tipo-emergente').hide()

    $(this).on('change', '.rad-enviar', function(){
        if($(this).val() == 1)
            $('.tipo-perfil').slideUp()
        else
            $('.tipo-perfil').slideDown()
    })

    $(this).on('change', '.rad-tipo', function(){
        if($(this).val() == 1){
            $('.tipo-emergente').slideUp()
            $('.tipo-banner').slideDown()
        }else{
            $('.tipo-banner').slideUp()
            $('.tipo-emergente').slideDown()
        }
    })

    $(this).on('submit', '#form_notificaciones', function(e){
        e.preventDefault()
        Notificaciones.validNotification()
    })

})

const Notificaciones = {

    socket: false,

    validNotification: () => {
        
        portal.showMaskLoading('body', 'Enviando Notificacion...')
        let data = $("#form_notificaciones").serializeArray()
        console.log(data)
        data.push({'name': 'hash', 'value': portal.hash})
        
        portal.socket.emit("new-notificacion", data)

    }

}