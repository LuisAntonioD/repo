
$(function(){
  Dashboard_OSX.checaPerfil();
  Dashboard_OSX.getCountTickets();

  setInterval(function() {
    $('div.cardGrafica').remove();
    Dashboard_OSX.loadContent();
  }, 1000 * 60 * 5);

  var chart = new ApexCharts(document.querySelector("#chart"), Dashboard_OSX);
  chart.render();

  

  var initialConfig = {
    series: [{
      name: "Registrados",
      data: [0, 0, 0, 0]
    },
    {
      name: "En Proceso",
      data: [0, 0, 0, 0]
    },
    {
      name: 'Resueltos',
      data: [0, 0, 0, 0]
    },
    {
      name: 'Cancelados',
      data: [0, 0, 0, 0]
    }],
    // El resto de la configuración permanece igual
    chart: {
        height: 350,
        type: 'line',
        zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: {
        width: [5, 5, 5, 5],
        curve: 'straight',
        dashArray: [6, 6, 6, 6]
    },
    colors: ['#fff300', '#106add', '#54dd10', '#ff0e00'],
    legend: {
        tooltipHoverFormatter: function(val, opts) {
            return val + '  <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>';
        }
    },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    xaxis: {
        categories: ['Tickets', 'Tickets', 'Tickets', 'Tickets'],
        labels: {
          show: false, 
      },
    },
    tooltip: {
        y: [
            { title: { formatter: function (val) { return val ; } } },
            { title: { formatter: function (val) { return val; } } },
            { title: { formatter: function (val) { return val; } } },
            { title: { formatter: function (val) { return val; } } }
        ]
    },
    grid: { borderColor: '#f1f1f1' }
  };

  var chart = new ApexCharts(document.querySelector("#chart"), initialConfig);
  chart.render();
  Dashboard_OSX.chart = chart;

  $(this).on('click', '#buscar', function(){
      Dashboard_OSX.getTicketsTotales();  
  });

  

});


var Dashboard_OSX = {

  chart: null, 
  /* CONFIGURACION DE LA GRAFICA DE TICKETS */
  series: [{
    name: "Registrados",
    data: [135, 52, 38, 2]
  },
  {
      name: "En Proceso",
      data: [2, 5, 56, 23]
  },
  {
      name: 'Resueltos',
      data: [100, 80, 85, 70]
  },
  {
    name: 'Cancelados',
    data: [5, 14, 2, 4,]
  }],
  chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: false }
  },
  dataLabels: { enabled: false },
  stroke: {
      width: [5, 5, 5, 5],
      curve: 'straight',
      dashArray: [6, 6, 6, 6]
  },
  colors: ['#fff300', '#106add', '#54dd10', '#ff0e00'],
  //title: { text: 'Page Statistics', align: 'left' },
  legend: {
      tooltipHoverFormatter: function(val, opts) {
          return val + '  <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>';
      }
  },
  markers: { size: 0, hover: { sizeOffset: 6 } },
  xaxis: {
      categories: ['Tickets', 'Tickets', 'Tickets', 'Tickets'],
      labels: {
        show: false, 
    },
  },
  tooltip: {
      y: [
          { title: { formatter: function (val) { return val ; } } },
          { title: { formatter: function (val) { return val; } } },
          { title: { formatter: function (val) { return val; } } },
          { title: { formatter: function (val) { return val; } } }
      ]
  },
  grid: { borderColor: '#f1f1f1' },
 

  checaPerfil: function(){
    portal.showMaskLoading('body', 'Cargando...', true);
    var inicio = portal.pagina_inicio

    if(window.location.href.match(/[^\/]+$/)[0] != inicio){
      window.location.href = inicio;
    } else {
        Dashboard_OSX.loadContent();
    }
  },

  loadContent: function(){
    
    portal.hideMaskLoading('body')
  },

  getCountTickets: function(){
    let url = portal.serverUrl+'getCountTickets' 
		App.ajax('GET', url, false, null).promise.done(function(response){

			if(response.success){
        /* Aui poner los valores en cada card */
        $('#tickets_registrados').text(response.data[0].tickets_registrados)
        $('#tickets_en_proceso').text(response.data[0].tickets_proceso)
        $('#tickets_resueltos').text(response.data[0].tickets_resueltos)
        $('#tickets_cancelados').text(response.data[0].tickets_cancelados)
			}
			else{
        portal.showNotification('danger','ni ni-bell-55', 'Error ', response.errors.join('<br />'));
      }
				

		}).fail(function(jqXHR, textStatus, errorThrown) {
			App.consoleError(jqXHR, textStatus, errorThrown)
		})
  },


  getTicketsTotales: function(){
    let fecha_ini = $("#fecha_ini").val()
    let fecha_fin = $("#fecha_fin").val()
    let obj = {
                fecha_ini: fecha_ini,
                fecha_fin: fecha_fin
              }

    let url = portal.serverUrl+'getTicketsTotales' 
    App.ajax('POST', url, false, obj).promise.done(function(response){
      if(response.success){
        portal.showNotification('success','ni ni-bell-55', 'Datos Recibidos', "En un momento se cargaran los datos solicitados.");
        Dashboard_OSX.updateChart(response.data[0]);
      }
      else{
        portal.showNotification('danger','ni ni-bell-55', 'Error', response.errors.join('<br />'));
      }
    }).fail(function(jqXHR, textStatus, errorThrown) {
      App.consoleError(jqXHR, textStatus, errorThrown)
    })
  },

   updateChart: function(data) {
    if (this.chart) {
      this.chart.updateSeries([{
        name: "Registrados",
        data: [parseInt(data.tickets_registrados), 0, 0, 0]
      },
      {
        name: "En Proceso",
        data: [0, parseInt(data.tickets_proceso), 0, 0]
      },
      {
        name: 'Resueltos',
        data: [0, 0, parseInt(data.tickets_resueltos), 0]
      },
      {
        name: 'Cancelados',
        data: [0, 0, 0, parseInt(data.tickets_cancelados)]
      }]);
    }
  },

  
 
};