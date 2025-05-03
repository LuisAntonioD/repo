$(document).ready(function() {

  portal.checkSession();
  
  $(this).on('click','a.nav-link', function(event){
    event.preventDefault();
    thisId = $(this).attr('id');
    if($(this).attr('id')!='#' && $(this).attr('id') != undefined){
      if(portal.setMenuActive(thisId))
        window.location.href = $(this).attr('href');
    }
  });

  $(this).on('click', '.osx-link', function(){
    if($(this).hasClass('acerca-de')){
      window.open('http://scsoftworks.mx/about/');
    }
    else { 
      window.open('http://scsoftworks.mx');
    }
  });

  $(this).on('click', '.user .info-user', () => {
    location.href = 'perfil.html'
  })

  $(this).on('click', '#btnEntrarModal', (e) => {
    e.preventDefault()
    
    portal.showMaskLoading('body')
    error = '';
    user = $('#userModal').val()
    password = $('#passwordModal').val()

    if (!password)
      error += 'El campo "Contrase&ntilde;a" no puede estar vacio. Favor de volver a intentar.<br>'
    if (!user)
      error += 'El campo "Email" no puede estar vacio. Favor de volver a intentar.<br>'

    if (!error) {
      var Obj = {};
      Obj.user = user;
      Obj.password = password;

      var url = portal.serverUrl + 'login';

      App.ajax('POST', url, false, Obj).promise.done(function (response) {
        if (response.success) {
          var data = response.data;
          Cookies.set('admintorre_sess_hash', data.hash, { expires: 1 });
          Cookies.set('admintorre_sess_user', data.userInfo, { expires: 1 });
          Cookies.set('admintorre_sess_empresaid', data.empresaid, { expires: 1 });
          Cookies.set('admintorre_sess_municipioid', data.municipioid, { expires: 1 });
          Cookies.set('admintorre_sess_municipiorfc', data.municipiorfc, { expires: 1 });
          Cookies.set('admintorre_sess_uma', data.uma, { expires: 1 });
          Cookies.set('admintorre_sess_pag_ini', data.pagina_inicio, { expires: 1 });

          if (!Cookies.get('admintorre_sess_temp')) {
            jsonTempleteVal = {}
            jsonTempleteVal['data-color'] = 'orange';
            jsonTempleteVal['data-background-color'] = 'black';
            jsonTempleteVal['sidebar-mini'] = true;
            jsonTempleteVal['menu-active'] = 'dashboard';
            jsonTempleteVal['sidebar-image'] = true;
            jsonTempleteVal['img-holder'] = 'sidebar-1';

            Cookies.set('admintorre_sess_temp', jsonTempleteVal, { expires: 365 });
          }

          location.reload()

        } else {
          portal.showNotification('danger', 'ni ni-bell-55', 'Error al Iniciar Sesi&oacute;n.', response.errors[0])
          portal.hideMaskLoading('body')
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        App.consoleError(jqXHR, textStatus, errorThrown);
      })
    } else {
      portal.hideMaskLoading('body')
      portal.showNotification('danger', 'ni ni-bell-55', 'Error al Iniciar Sesi&oacute;n.', error)
    }
  })

  $(this).on('click', '.user .logout-user', () => {
    portal.loggout(function(){
      location.href = 'login.html'
    })
  })

  $(this).on('click', '#dropdownBuscarButton', () => {
    $( "#FolioClave" ).trigger( "focus" );
  })

  $(this).on('click', 'a.dropdown-item.notification', function(e) {
    let notificacion_id = $(this).data('noti-id')
    portal.getNotification(notificacion_id)
  })

  setTimeout(function() {
    //portal.setPreferenceTemplate();
    //Carrito.updatePreviewInShoppingCart()
  }, 500);
  
  setTimeout(function() {
    var url = window.location.pathname.split('/');
    menuIdCurrent = url[url.length - 1].replace('.html', '');
    portal.setMenuActive(menuIdCurrent);
    Dashboard.navbarMinimize(document.getElementById('navbarMinimize'))
    Dashboard.sidebarType(document.getElementById('btnWhiteSidebar'))
  }, 1000);

  setTimeout(function(){
    $('[data-toggle="tooltip"]').tooltip();
  },1000);
  /* $().ready(function() {


  }); */

  $.extend( true, $.fn.dataTable.defaults, {
    
    dom: "<'row'<'col-12 d-flex justify-content-start'B><'col-xl-6'l><'col-xl-6 text-right'f>>" +
         "tr" +
         "<'row'<'col-xl-5'i><'col-xl-7'p>>",
    buttons:{
      buttons: [
        {
          extend: 'excel', 
          text: '<i class="fas fa-file-excel fa-2x text-success" title="Exportar a Excel" data-toggle="tooltip"></i>',
          className: 'pt-1 pb-1 pl-2 pr-2' 
        },
        {
          extend: 'pdf', 
          text: '<i class="fas fa-file-pdf fa-2x text-success" title="Exportar a PDF" data-toggle="tooltip"></i>',
          className: 'pt-1 pb-1 pl-2 pr-2'
        },
        {
          extend: 'print', 
          text: '<i class="fas fa-print fa-2x text-success" title="Imprimir" data-toggle="tooltip"></i>',
          className: 'pt-1 pb-1 pl-2 pr-2'
        },
      ]
    },
    language: {
        processing:     "Procesando...",
        search:         "Buscar",
        lengthMenu:     "<span class='mt-1 me-2'>Mostrar</span> _MENU_ <span class='mt-1 ms-2'>registros</span>",
        info:           "Mostrando registros del _START_ al _END_ - Total _TOTAL_",
        infoEmpty:      "Mostrando registros del 0 al 0 - Total 0 ",
        infoFiltered:   "(de _MAX_ elementos)",
        infoPostFix:    "",
        loadingRecords: "Cargando...",
        zeroRecords:    "No se encontr&oacute; informaci&oacute;n",
        emptyTable:     "La tabla no contiene informaci&oacute;n",
        paginate: {
            first:      "Inicio",
            previous:   "Prev.",
            next:       "Sig.",
            last:       "Fin"
      },
    },
    initComplete: function(settings, json){
      portal.refreshTooltip();
    },
  });

  $.extend(true, $.fn.dataTable.Buttons.defaults, {
    buttons: [
      {
        exted: 'excel',
        className: 'btn-success'
      }
    ],
  });

  /*md.showNotification('top','center', `<h3>
    ATENTO AVISO: Debido a labores de mantenimiento programado, este sitio se encontrar&aacute; <strong>FUERA DE SERVICIO</strong> el d&iacute;a de hoy, <strong>06/Feb/2020</strong>,
    en un horario de <strong>20:00hrs a 21:00hrs</strong>. Agradecemos su comprensi&oacute;n y lamentamos las molestias que podamos ocasionarle.
  </h3>`, 'warning', 6000);*/

  $('.main-panel').prepend(`<div style="top: 1rem;" class="position-relative text-center"><img style="height:80px" src="assets/img/`+portal.municipiorfc+`_logo.png" /></div>`);
});




