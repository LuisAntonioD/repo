$(function() {

  listProcedures();

  $(this).on("click", ".process", function(){
    var arrId = $(this).attr("id").split("-");
    var filejs = $(this).data('file-js') ? $(this).data('file-js') : "";
    var funcvalidat = $(this).data('func-validat') ? $(this).data('func-validat') : "";
    Cookies.set('osx_tn_procedure', arrId[1], { expires: 1 });
    Cookies.set('osx_tn_filejs', filejs, { expires: 1 });
    Cookies.set('osx_tn_funcvalidat', funcvalidat, { expires: 1 });
  });

  $(this).on('click', '.btnMasInfo', (eventHandler) => {
    $('.divMasinfo-'+eventHandler.currentTarget.dataset.processid).toggle(350)
  })

});

function listProcedures(){

    var url = portal.serverUrl+'tramites/';
    App.ajax('GET', url, 'MenuTramites', null).promise.done(function(response){
        if(response.success){
            var data = response.data;
            var html = '';
            if(data.length){
              for(cont in data){
                html += `<div class="col-12 col-md-6 col-xxl-4 mb-4">
                          <div class="card card-tipotramites">
                            <div class="card-body p-3">
                              <div class="row">
                                <div class="col-12 col-md-6 col-xl-7 my-auto">
                                  <img src='./assets/img/${data[cont].icon}' class="img-fluid border-radius-lg shadow opacity-10 w-md-90">
                                </div>
                                <div class="col-12 col-md-6 col-xl-5 top-n10 position-relative my-auto">
                                  <div class="float-end text-end me-3">
                                    <h5>
                                      <a class="process text-dark" data-func-validat="${(data[cont].func_validat ? data[cont].func_validat : '')}" data-file-js="${(data[cont].file_js ? data[cont].file_js : '')}" id="process-${data[cont].processid}" href="${data[cont].url}">${data[cont].name}</a>
                                    </h5>
                                  </div>
                                </div>
                                <div class="col-12">
                                  <p class="text-sm mt-3"> ${data[cont].description} </p>
                                </div>
                              </div>
                              <hr class="horizontal dark">
                            </div>
                          </div>
                        </div>`
              }
              
            } else
              html = `<h6 class="text-center my-5">El usuario no tiene habilitados tr&aacute;mites disponibles.<h6>`

          $(".listProcedures").html(html);
        }else
            md.showNotification('bottom','center', response.errors[0], 'danger');

        }).fail(function(jqXHR, textStatus, errorThrown) {
        App.consoleError(jqXHR, textStatus, errorThrown);
    });

}


