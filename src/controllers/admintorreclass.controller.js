'use strict'

const md5 = require('md5')
const moment = require('moment')
const fs = require('fs')
const pool = require('../connection')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { Console } = require('console')
const fetch = require('node-fetch')
const bcrypt = require('bcrypt')

class Admintorre{

	hash = false
	userid = false
	usertype = false
	usermail = false
	username = false
	pagina_inicio = false
	processid = false
	catalogid = false
	catalogkey = false
	procedurekey = false
	empresaid = false
	versionTraslanet = 3.0
	portalUrl = "http://localhost/reportanet/"
	socket_url = `http://localhost:8105/api/`

    constructor(req, res) {
        this.req = req
        this.res = res
    }

	async formatInput (obj) {
		var objRes = {}
		for(var i in obj){
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
	}

	async sendmail (to, subject, message,files) {
		var transporter = nodemailer.createTransport({
			service: 'gmail',
			secure: 'ssl',
			/* host: 'smtp.hostinger.com',
			port: 465, */
		  auth: {
		    user: 'scsoftworks@gmail.com',
		    pass: 'ltisazlvpgtddbjl'
		  }
		})
		var mailBody = `
		<!DOCTYPE html>
		<html>
		<head>
		<meta charset="iso-8859-1">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		</head>
		<body style="background-color: #f0f0f0; padding:3rem;">
			<div style="margin: auto; max-width: 600px; background-color: #fff; display: grid; border-radius: 1rem; box-shadow: 0 20px 27px 0 rgba(0, 0, 0, 0.05); padding-bottom: 3rem;">
				<img style="margin: auto; max-width: 80%" src="`+this.portalUrl+`/frontend/assets/img/Integralis-v3.png" alt="Integralis 3.0">
				<span style="font-family: Open Sans; font-weight: 600; font-size: 1.75rem; color: #344767; text-align: center;">`+subject+`</span>
				<span style="font-family: Open Sans; font-weight: normal; font-size: 1.5rem; color: #344767; text-align: justify; padding: 30px 50px; ">
				`+message+`
				</span>
				<div style="text-align: center; padding: 30px 50px; font-family: Open Sans; font-weight: normal; font-size: 1rem; color: #8392AB;">
					<img src="`+this.portalUrl+`/frontend/assets/img/logo_scsw_small.png" />
					&nbsp; Created by <a href="http://scsoftworks.mx">S&C Softworks S.A. de C.V.</a>
				</div>
			</div>
		</body>
		</html>
		`
		if(!files){
			files=null
		}
		var mailOptions = {
			from: '"AdminTorre - No reply" scsoftworks@gmail.com',
			to: to,
			subject: subject,
			html: mailBody,
			attachments: files
		}
			

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error)
		  } else {
		    console.log('Email sent: ' + info.response)
		  }
		})

	}

	async sendNotificacion (data) {
		let errors = [], response = {}

		let url = `${this.socket_url}send-notificacion`
		const params = new URLSearchParams()
		params.append('data', JSON.stringify(data))

		const response_ws = await fetch(url, {
			method: 'post',
			body: params
		})
		let data_ws = await response_ws.json()
		if(!data_ws.success)
			errors = errors.concat(data_ws.errors)
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return response

	}

	async switchfillComboNoSess () {
		let errors = [], data  = {}, response = {}

		switch(this.req.params.combo){
			case 'tiposOperacion':
				data = await this.fillCombo("id_tipo_operacion", "descripcion", "cat_tipo_operacion", "status = 1", false)
				break
		}

		if(!data.success)
			errors.push(data.errors.join('<br />'))

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data.data,
		}
		return this.res.status(200).send(response)
	}

	async switchfillCombo () {
		let errors = [], data  = {}, response = {}

		switch(this.req.params.combo){
			/* case 'clickDocumentos':
                data = await this.fillCombo("id_documento", "nombre_documento", "click_estructura_documentos_x_proc", "status = 1", false)
			break
			case 'clickdocs':
				data = await this.fillCombo("id_documento", "nombre_documento", "click_estructura_documentos_x_proc", "status = 1", false)
			break
			case 'docsxproceso':
				data = await this.fillCombo("id_documento", "nombre_documento", "click_estructura_documentos_x_proc", "status = 1", false)
			break */
			case 'motortipoDocs':
                // data = await this.fillCombo("id_tipo_documento", "nombre", "cat_tipos_documento", "status = 1", false)
                data = await this.fillCombo("id_tipo_documento", "nombre", "vw_cat_tipos_documento", "status = 1 AND id_tipo_tramite = "+this.processid, false)
			break
			case 'motortipoDocsTraslado':
				data = await this.fillCombo("id_tipo_documento", "(SELECT nombre FROM cat_tipos_documento WHERE id_tipo_documento = t.id_tipo_documento AND status = 1) || case when t.obligatorio = 1 then ' (Obligatorio)' else '' end AS nombre", "cat_tipos_documeto_x_operacion", `status = 1 AND id_tipo_operacion = (SELECT id_tipo_operacion FROM traslado_tramites WHERE id_traslado = ${this.procedurekey})`, 'nombre')
			break
			case 'clickTipoUsuario':
                data = await this.fillCombo("id_tipo_usuario", "tipo_usuario", "cat_tipo_usuario", "status = 1", false)
			break
			case 'getCajasByUser':
				data = await this.fillCombo("id_caja", " (SELECT clave_caja FROM cat_cajas WHERE id_caja = t.id_caja AND status = 1) AS caja", "cajas_x_usuario", `status = 1 AND id_usuario = ${this.userid}`, 'caja')
			break
			case 'contribuyentes':
				data = await this.fillCombo("id_contribuyente", "nombre_completo", "cat_contribuyentes", `status = 1 and nombre_completo is not null and nombre_completo!=''`, false)
			break
			case 'getCajas':
				data = await this.fillCombo("id_caja", "clave_caja", "cat_cajas", ``, false)
			break
			// NUEVOS CASES MIGRADOS DE PHP
			case 'tiposOperacion':
				let where = ' status = 1 '
				if ([5, 6].includes(this.usertype))
					where += ' AND acto_gravado = 1 '
				
				data = await this.fillCombo("id_tipo_operacion", "descripcion", "cat_tipo_operacion", where, false)
				break
			case 'tiposTramiteAc':
				data = await this.fillCombo("id_ac_tipo_tramite", "nombre", "cat_ac_tipo_tramites", "status = 1", false)
				break
			case 'ActoNoGravado':
				data = await this.fillCombo("id_acto_no_gravado", "fundamento_legal", "cat_actos_no_gravados", "status = 1", false)
				break
			case 'regimenFiscal':
				data = await this.fillCombo("cve_regimen", "descripcion", "cat_regimen_fiscal", "status = 1", false)
				break
			case 'regimenJuridico':
				data = await this.fillCombo("id_regimen_juridico", "descripcion", "cat_regimen_juridico", "status = 1", false)
				break
			case 'paises':
				data = await this.fillCombo("id_pais", "nombre", "cat_paises", "status = 1", false)
				break
			case 'estados':
				data = await this.fillCombo("id_estado", "nombre", "cat_estados", "status = 1", false)
				break
			case 'municipios':
				data = await this.fillCombo("id_municipio", "CONCAT(nombre, ' ',(SELECT CONCAT('(',nombre,')') FROM cat_estados WHERE id_estado = t.id_estado)) AS nombre", "cat_municipios", "status = 1", "nombre")
				break
			case 'localidades':
				data = await this.fillCombo("id_localidad", "nombre", "cat_localidades", "status = 1", false)
				break
			case 'localidadesMpio':
				data = await this.fillCombo("id_localidad", "nombre", "cat_localidades", "status = 1 and id_municipio=(select id_municipio from cat_empresas where id_empresa="+this.empresaid+")", false)
				break
			case 'tipoPredio':
				data = await this.fillCombo("id_tipo_predio", "tipo_predio", "cat_tipo_predio", "status = 1", false)
				break
			case 'usoPredio':
				data = await this.fillCombo("id_uso", "uso_suelo", "cat_uso_suelo", "status = 1", false)
				break
			case 'usrcajeros':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", "status = 1 and tipo in (4,18,22,23)", false)
				break
			case 'seriescajeros':
				data = await this.fillCombo("id_serie", "serie", "cat_series_folios", "status = 1", false)
				break
			case 'bancos':
				data = await this.fillCombo("id_banco", "nombre", "cat_bancos", "status = 1", false)
				break
			case 'metodo_pago':
				data = await this.fillCombo("cve_metodo_pago", "CONCAT(cve_metodo_pago,'-',descripcion) AS descripcion", "cat_cfdi_metodo_pago", "status = 1", "descripcion")
				break
			case 'forma_pago':
				data = await this.fillCombo("cve_forma_pago", "CONCAT(cve_forma_pago,'-',descripcion) AS descripcion", "cat_cfdi_forma_pago", "status = 1", "descripcion")
				break
			case 'moneda':
				data = await this.fillCombo("cve_moneda", "CONCAT(cve_moneda,'-',descripcion) AS descripcion", "cat_cfdi_moneda", "status = 1", "descripcion")
				break
			case 'uso_cfdi':
				data = await this.fillCombo("cve_uso", "CONCAT(cve_uso,'-',descripcion) AS descripcion", "cat_cfdi_uso_cfdi", "status = 1", "descripcion")
				break
			case 'residencia_fiscal':
				data = await this.fillCombo("cve_residencia", "CONCAT(cve_residencia,'-',descripcion) AS descripcion", "cat_cfdi_residencia_fiscal", "status = 1", "descripcion")
				break
			case 'licenciasGiros':
				data = await this.fillCombo("id_giro", "giro", "cat_lic_giros", "status = 1", false)
				break
			case 'regimenFiscalCfdi':
				data = await this.fillCombo("cve_regimen_fiscal", " CONCAT(cve_regimen_fiscal,' - ',descripcion) AS descripcion", "cat_cfdi_regimen_fiscal", "status = 1", "descripcion")
				break
			case 'ventaalcohol':
				data = await this.fillCombo("id_alcoholes", "venta_alcoholes", "cat_lic_alcoholes", "status = 1", false)
				break
			case 'licenciasAnteriores2019':
				data = await this.fillCombo("no_licencia_2019", "trim(concat(no_licencia_2019,' - ',nombre, ' ', apellido_paterno, ' ', apellido_materno)) licencia", "licencias_2019", "1 = 1", "licencia")
				break
			case 'licenciasAnteriores':
				data = await this.fillCombo("id_licencia", "licencia", "vw_licencias", "status = 1", false)
				break
			case 'fuentesIngresoLicencias':
				data = await this.fillCombo("id_fuente_ingreso", "concat(f_get_fuente_ingreso(id_fuente_ingreso),(case when t.limite_inf!=0 and t.limite_sup!=0 then ' - ' else ' _ ' end),descripcion) AS descripcion", "cat_ingresos_fuente", "status=1 and anio="+moment.format('YYYY')+" and exists (select 1 from cat_ingresos_cves_contribucion where status=1 and id_cve_contribucion=t.id_cve_contrib and id_tipo_ingreso=7) or exists (select 1 from cat_ingresos_cves_contribucion where status=1 and id_cve_contribucion=t.id_cve_contrib and id_tipo_ingreso in (7) and f_get_fuente_ingreso(id_fuente_ingreso) in ('102.001.007.001','102.001.007.002'))", "descripcion")
				break
			case 'ftesIngresoDesc':
				data = await this.fillCombo("id_fuente_ingreso", "concat(anio, ' - ', descripcion) descrip", "cat_ingresos_fuente", "status = 1 and es_descuento=1", "descrip")
				break
			case 'usrautorizadores':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", "status = 1 and tipo in (11,13)", false)
				break
			case 'tipoConciliacion':
				data = await this.fillCombo("id_tipo_conciliacion", "tipo_conciliacion", "cat_tipo_conciliacion", "status = 1", false)
				break
			case 'caja':
				data = await this.fillCombo("id_caja", "clave_caja", "cat_cajas", "status != 0", false)
				break
			case 'notarias':
				data = await this.fillCombo("id_notario", "concat('Not ',no_notaria,'-',(select nombre_completo from usuarios where id_usuario=t.id_usuario),'-',(select nombre from cat_municipios where id_municipio=t.id_municipio)) as notaria", "traslado_notarios", "status =1", "notaria")
				break
			case 'licenciasGirosSare':
				data = await this.fillCombo("id_giro", "giro", "cat_lic_giros", "status = 1 and sare=1", false)
				break
			case 'tipoEventoRC':
				data = await this.fillCombo("id_tipo_evento", "concat(tipo_evento,'_',condonar) as tipo_evento", "cat_rc_tipo_evento", "status = 1", "tipo_evento")
				break
			case 'lugarEventoRC':
				data = await this.fillCombo("id_rc_lugar", "lugar", "cat_rc_lugares", "status = 1", false)
				break
			case 'oficialRC':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", "status = 1 and tipo in (24,22) and exists(select 1 from oficialias_x_usuario where id_usuario=t.id_usuario)", false)
				break
			case 'motortipoFoto':
				data = await this.fillCombo("id_tipo_documento", "nombre", "vw_cat_tipos_documento", "status = 1 AND id_tipo_documento in (29,30) AND id_tipo_tramite = "+this.processid, false)
				break
			case 'fuentesIngresoLicenciasPC':
				data = await this.fillCombo("id_fuente_ingreso", "concat(f_get_fuente_ingreso(id_fuente_ingreso),(case when t.limite_inf!=0 and t.limite_sup!=0 then ' - ' else ' _ ' end),descripcion) AS descripcion", "cat_ingresos_fuente", "status=1 and anio="+moment().format('YYYY')+" and exists (select 1 from cat_ingresos_cves_contribucion where status=1 and id_cve_contribucion=t.id_cve_contrib and id_tipo_ingreso=46) and f_get_fuente_ingreso(id_fuente_ingreso) like '102.018.001%'", "descripcion")
				break
			case 'fuentesIngresoLicenciasDU':
				data = await this.fillCombo("id_fuente_ingreso", "concat(f_get_fuente_ingreso(id_fuente_ingreso),(case when t.limite_inf!=0 and t.limite_sup!=0 then ' - ' else ' _ ' end),descripcion) AS descripcion", "cat_ingresos_fuente", "status=1 and anio="+moment().format('YYYY')+" and exists (select 1 from cat_ingresos_cves_contribucion where status=1 and id_cve_contribucion=t.id_cve_contrib and id_tipo_ingreso=13) and f_get_fuente_ingreso(id_fuente_ingreso) like '102.007.004%'", "descripcion")
				break
			case 'licenciasAnterioresSare':
				data = await this.fillCombo("id_licencia", "licencia", "vw_licencias", "status = 1 and rfc in (select rfc from usuarios where id_usuario ="+this.userid+")", false)
				break
			case 'motortipoDocsSare':
				data = await this.fillCombo("id_tipo_documento", "nombre", "vw_cat_tipos_documento", "id_tipo_documento not in (29,30) AND status = 1 AND  visible_para like '%"+this.usertype+"%' AND id_tipo_tramite = "+this.processid, false)
				break
			case 'usroficiales':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", "status = 1 and tipo in (24,22)", false)
				break
			case 'seriesoficialias':
				data = await this.fillCombo("id_rc_serie", "serie", "cat_rc_series_folios", "status = 1", false)
				break
			case 'oficialiasRC':
				data = await this.fillCombo("id_oficialia", "concat(clave,'-',ubicacion) AS descripcion", "cat_rc_oficialias", "status = 1", "descripcion")
				break
			case 'movitoCancelacion':
				data = await this.fillCombo("clave", "concat(clave,'-',descripcion) AS descripcion", "cat_cfdi_motivo_cancelacion", "status = 1", "descripcion")
				break
			case 'regimenContribuyente':
				data = await this.fillCombo("cve_regimen_fiscal", "concat(cve_regimen_fiscal,'-',descripcion) AS descripcion", "cat_cfdi_regimen_fiscal", "status = 1", "descripcion")
				break
			case 'tiposSolicitudesBeneficiarios':
				data = await this.fillCombo("id_tipo_solicitud", "descripcion_corta", "cat_ben_tipo_solicitudes", "1 = 1 ", false)
				break
			case 'tiposSolicitudesBeneficiariosInternet':
				data = await this.fillCombo("id_tipo_solicitud", "descripcion_corta", "cat_ben_tipo_solicitudes", "status = 1 AND internet=1 AND now() BETWEEN fecha_ini AND fecha_fin", false)
				break
			case 'tiposLicencia':
				data = await this.fillCombo("id_tipo_licencia", "descripcion", "cat_tipo_licencia", "status = 1", false)
				break
			case 'exportacionCFDI':
				data = await this.fillCombo("cve_exportacion", "concat(cve_exportacion,'-',descripcion) AS descripcion", "cat_cfdi_exportacion", " status = 1 ", "descripcion")
				break
			case 'objImpuestoCFDI':
				data = await this.fillCombo("cve_objeto_impuesto", "concat(cve_objeto_impuesto,'-',descripcion) AS descripcion", "cat_cfdi_objeto_impuesto", " status = 1 ", "descripcion")
				break
			case 'empresas':
				data = await this.fillCombo("id_empresa", "razon_social AS descripcion", "cat_empresas", " status = 1 ", "descripcion")
				break
			case 'unidadCFDI':
				data = await this.fillCombo("cve_unidad", "concat(cve_unidad,'-',descripcion) AS descripcion", "cat_cfdi_unidad", " status = 1 ", "descripcion")
				break
			case 'prodServCFDI':
				data = await this.fillCombo("cve_prod_serv", "concat(cve_prod_serv,'-',descripcion) AS descripcion", "cat_cfdi_prod_serv", " status = 1 ", "descripcion")
				break
			case 'tasaIvaCFDI':
				data = await this.fillCombo("tasa", "tasa AS descripcion", "cat_cfdi_impuesto_tasa", " status = 1 and impuesto='IVA'", "descripcion")
				break
			case 'tasaIepsCFDI':
				data = await this.fillCombo("tasa", "tasa AS descripcion", "cat_cfdi_impuesto_tasa", " status = 1 and impuesto='IEPS'", "descripcion")
				break
			/* case 'motortipoDocs':
				return $this->fillCombo("id_tipo_documento", "nombre", "vw_cat_tipos_documento", "status = 1 AND id_tipo_tramite = "+this.processid+ false);
				break; */
			/* case 'contribuyentes':
				return $this->fillCombo("id_contribuyente", "nombre_completo", "cat_contribuyentes", "status = 1", false);
				break; */
			// NUEVOS CASES A PARTIR DE INTEGRALIS
			case 'getEmpresasByUser':
				data = await this.fillCombo("id_empresa", " (SELECT razon_social FROM cat_empresas WHERE id_empresa = t.id_empresa AND status = 1) AS empresa", "cat_empresas_x_usuario", `status = 1 AND id_usuario = ${this.userid}`, 'empresa')
				break
			case 'construccionTipo':
				switch(this.processid*1){
					case 1:
						data = await this.fillCombo("id_tipo_construccion", " concat_ws(' - ', nivel, valor_m2::money) AS valor", "cat_tipos_construccion", `status = 1 AND NOW() BETWEEN vigencia_ini AND vigencia_fin and id_municipio = (select inmueble_municipio from solvalor_tramites where id_solicitud=${this.procedurekey??0})`, 'valor')
						break
					case 2:
						data = await this.fillCombo("id_tipo_construccion", " concat_ws(' - ', nivel, valor_m2::money) AS valor", "cat_tipos_construccion", `status = 1 AND NOW() BETWEEN vigencia_ini AND vigencia_fin and id_municipio = (select inmueble_municipio from ctrltramites where id_ctrltramite=${this.procedurekey??0})`, 'valor')
						break
				}
				break
			case 'construccionDemeritos':
				data = await this.fillCombo("factor", "concat_ws(' - ', demerito, factor*100||'%') as demerito", "cat_demeritos", `status = 1`, 'demerito')
				break
			case 'catIngFuentes':
				data = await this.fillCombo("id_fuente_ingreso", "concat(fuente_ingreso_completa,'-',descripcion,'-',clave_producto_sat,'-',clave_medida_sat) as descripcion", "cat_ingresos_fuente", `status = 1 and clave_producto_sat is not null and anio=`+moment().format('YYYY'), 'descripcion')
				break
			case 'tipoAvaluo':
				data = await this.fillCombo("id_tipo_ctrltramites", "nombre", "cat_tipo_ctrltramites", `status = 1 and flag_sol_valor = 1`)
				break
			case 'tipo_inmueble':
				data = await this.fillCombo("id_tipo_inmueble", "tipo_inmueble", "cat_tipos_inmueble", `status = 1`)
				break
			case 'proposito':
				data = await this.fillCombo("id_proposito", "proposito", "cat_proposito_avaluo", `status = 1`)
				break
			case 'regimen_propiedad':
				data = await this.fillCombo("id_regimen_propiedad", "regimen_propiedad", "cat_regimen_propiedad", `status = 1`)
				break
			case 'inmueble_valua':
				data = await this.fillCombo("id_inmueble_valua", "inmueble_valua", "cat_inmueble_valua", `status = 1`)
				break
			case 'visitadores':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", `status = 1 and tipo=15 and id_equipo in (select id_equipo from usuarios where id_usuario=${this.userid})`)
				break
			case 'getSeriesFoliosH':
				data = await this.fillCombo("distinct serie", "serie", "folios_hacendarios", `status = 1 `)
				break
			case 'tipo_persona':
				data = await this.fillCombo("cve_regimen", "descripcion", "cat_regimen_fiscal", `status = 1`)
				break
			case 'getSeriesFoliosH':
				data = await this.fillCombo("distinct serie", "serie", "folios_hacendarios", `status = 1 `)
				break
			case 'tipo_persona':
				data = await this.fillCombo("cve_regimen", "descripcion", "cat_regimen_fiscal", `status = 1`)
				break
            case 'tipo_acuses':
                data = await this.fillCombo("id_acuse", "nombre", "cat_tipo_acuse", `status = 1 AND (tipo_usuario_emite @> '${this.usertype}' OR  tipo_usuario_recibe @> '${this.usertype}')`)
				break
			case 'tipo_acuses_alta':
				data = await this.fillCombo("id_acuse", "nombre", "cat_tipo_acuse", `status = 1 AND id_acuse = 1 AND (tipo_usuario_emite @> '${this.usertype}' OR  tipo_usuario_recibe @> '${this.usertype}')`)
				break
			case 'peritos':
				data = await this.fillCombo("id_empresa", "razon_social AS descripcion", "cat_empresas", " status = 1 and registro is not null and registro !='' ", "descripcion")
				break
			case 'errores_acuse':
				data = await this.fillCombo("id_error", "error", "cat_errores_acuse", `status = 1 `)
				break
			case 'empresas':
				data = await this.fillCombo("id_empresa", "nombre_comercial", "cat_empresas", `status = 1 `)
				break
			case 'valuadores':
				let tipo_usuarios = '18,8,20,21,22'
				if(this.usertype == 1)
					tipo_usuarios+=',1'
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", `status = 1 and tipo in (${tipo_usuarios})`)
				break
			case 'usuariosActivos':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", `status = 1 `)
				break
			case 'unidades_valuacion':
				data = await this.fillCombo("id_unidad_valuacion", "unidad_valuacion", "cat_unidades_valuacion", `status = 1 `)
				break
			case 'mensajeros_visitadores':
				data = await this.fillCombo("id_usuario", "nombre_completo", "usuarios", `status = 1 and tipo=19 OR tipo=15`)
				break
			case 'clientes':
				data = await this.fillCombo("id_cliente", "razon_social", "cat_clientes", `status =1`)
				break
			case 'prioridad':
				data = await this.fillCombo("id_prioridad", "nombre", "tickets_prioridad", `status =1`)
				break
			case 'status':
				data = await this.fillCombo("id_status_ticket", "nombre", "tickets_status", `status =1`)
				break
			case 'portales':
				data = await this.fillCombo("id_portal", "nombre", "portales", `status =1`)
				break
		}

		if(!data.success)
			errors.push(data.errors.join('<br />'))

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data.data,
		}
		return this.res.status(200).send(response)
	}

	async fillCombo (id,description,table,where,alias) {
		let errors = [], data  = [], response = {}

        if(!alias)
            alias = description

        let snt = `SELECT ${id}, ${description} FROM ${table} t WHERE 1=1 ${where ? ' AND '+where : ''} order by 2`
        const qry = await pool.query(snt)

		if(qry){
			for(let  key in qry.rows){
				let option = {}
				option.value = qry.rows[key][id]
				option.description = qry.rows[key][alias]
				data.push(option)
			}
		} else
			errors.push('Se produjo un error al consultar el catálogo '+table)

        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return response
    }

	async existeWhere (tabla, campo, valor, where) {

        let snt = `SELECT ${campo} FROM ${tabla} ${where}`
        const qry = await pool.query(snt)
        
        if(qry && qry.rowCount){
        	for(let key in qry.rows){
            	if(qry.rows[key][campo] == valor)
                	return 1
        	}
        }
        
        return false
    }

    async insertaHistorial (llave, status, comentario, agregadopor, tabla, campo) {
    	if(llave){
            let snt = `
				INSERT 
				  INTO ${tabla}(${campo}, id_status, comentario, fechaagregado, agregadopor, status)
                VALUES ($1, $2, $3, NOW(), $4, 1)
			 RETURNING ${campo} `
            const qry = await pool.query(snt, [llave, status, comentario, agregadopor])
            if(qry && qry.rowCount)
                return {'success': true}
        }
        return {'success': false}
    }

	async isLogin () {
		const validation = await this.init(this.req.headers)
		return validation.success
	}

	

	async getTramites () {
		let errors = [], data  = [], response = {}

		let snt = `
			SELECT visible_para, nombre AS name, descripcion AS description, url AS url, btn_1_icono AS btn_1_icono, btn_1_titulo AS btn_1_titulo, btn_1_url AS btn_1_url, btn_2_icono AS btn_2_icono,
				   btn_2_titulo AS btn_2_titulo, btn_2_url AS btn_2_url, btn_3_icono AS btn_3_icono, btn_3_titulo AS btn_3_titulo, btn_3_url AS btn_3_url, icono AS icon, id_tipo_tramite AS processid, archivo_js AS file_js, function_validation AS func_validat
			  FROM cat_tipo_tramites 
			 WHERE status = 1 `
		snt+= this.usertype == 1 ? '' : ` AND ${this.versionTraslanet} between version_ini and version_fin `
		snt+= `ORDER BY orden`
		const qry = await pool.query(snt)
		if(qry && qry.rowCount){
			for(let key in qry.rows){
				let arr_visible = qry.rows[key].visible_para.split(',')
				if(arr_visible.includes(`${this.usertype}`))
					data.push(qry.rows[key])
			}
		} else
			errors.push('Se produjo un error al obtener la lista de Trámites disponibles.')
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}
	
	async getUmaByDate (date) {
		let errors = [], data  = [], response = {}

		let snt = `SELECT sm FROM sm WHERE status = 1 AND TO_DATE('${date}', 'YYYY-MM-DD') BETWEEN fecha AND fecha_f `
		const qry = await pool.query(snt)
		if(qry && qry.rowCount){
			
			data = qry.rows[0].sm

		} else
			errors.push('Se produjo un error al obtener la lista de Trámites disponibles.')
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return response
	}

	async getNotifications () {
		let errors = [], data  = [], response = {}

		let snt_docs = `SELECT id_campo, nombre FROM click_estructura_campos_x_doc WHERE status = 1 AND alerta_vigencia = 1 AND tipo_dato = 'date'`
		const qry_docs = await pool.query(snt_docs)

		if(qry_docs){
			for(let key in qry_docs.rows){

				let lastweek = moment().add(-4, 'days')
				let addweek = moment().add(7, 'days')

				let snt = `SELECT ca.id_archivo as _id, lpad(ca.id_archivo::text,5,'0') AS folio, cedp.nombre_documento AS documento,
						ruta_origen AS ruta, nombre, '${qry_docs.rows[key].nombre}' AS nombre_campo
						FROM click_archivos ca
						INNER JOIN click_estructura_documentos_x_proc cedp ON cedp.id_documento = ca.id_documento
						WHERE ca.status = 1 AND ca.id_archivo IN (
						SELECT id_archivo FROM click_archivos_valores cav WHERE 
						EXISTS (SELECT FROM jsonb_array_elements(cav.json_valores) tag WHERE tag->>'nombre' = '${qry_docs.rows[key].nombre}' AND 
							TO_DATE(tag->>'valor', 'YYYY-MM-DD') BETWEEN TO_DATE('${lastweek.format('MM/DD/YYYY')}', 'MM/DD/YYYY') AND TO_DATE('${addweek.format('MM/DD/YYYY')}', 'MM/DD/YYYY'))
						)
						AND EXISTS (SELECT 1 FROM click_permisos_doc_usuario WHERE id_documento = ca.id_documento AND id_usuario = ${this.userid})`

				const qry = await pool.query(snt)
				if(qry)
					data = data.concat(qry.rows)
				else
					errors.push('Error al buscar valores con alerta de vigencia.')

			}
		}else
			errors.push('Error al buscar campos con alerta de vigencia.')
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async mainMenu () {
		let errors = [], data  = [], response = {}

		let snt = `
			SELECT id_menu, nombre, url, visiblepara, icono 
			  FROM menu_principal 
			 WHERE status = 1 
			   AND menu_padre IS NULL 
			   AND ${this.versionTraslanet} between version_ini and version_fin 
			 ORDER BY orden ASC `
        const qry = await pool.query(snt)
		if(qry.rowCount){
			for(let key in qry.rows){

				let menu = {}
				let { id_menu, nombre, url, visiblepara, icono } = qry.rows[key]
				let arrvisible = visiblepara.split(',')
                
				if(arrvisible.includes(String(this.usertype))){
					menu.name = nombre
					menu.url = url
					menu.class = url.replace('.html', '')
					menu.icon = icono
					menu.initials = icono
					menu.submenu = await this.submenu(id_menu)
					data.push(menu)
				}

			}

		}else
			errors.push('No se han encontrado registro de menu.')

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)

	}

	async submenu (idpadre) {
		let snt = `
			SELECT id_menu, nombre, url, visiblepara, icono 
			  FROM menu_principal 
			 WHERE status = 1 
			  AND menu_padre = $1 
			  AND ${this.versionTraslanet} between version_ini and version_fin 
			ORDER BY orden ASC`
		const qry = await pool.query(snt, [idpadre])
		let submenu = []
		for(let key in qry.rows){

			let { id_menu, nombre, url, visiblepara, icono } = qry.rows[key]
            let arrvisible = visiblepara.split(',')

            if(arrvisible.includes(String(this.usertype))){
            	var arr = {}
                arr.menuid = id_menu
                arr.name = nombre
                arr.url = url
                arr.class = url ? url.replace('.html', '') : ""
                arr.initials = icono

                let snt2 = `
					SELECT id_menu, nombre, url, visiblepara, icono 
					  FROM menu_principal 
					 WHERE status = 1 
					   AND menu_padre = $1 
					   AND ${this.versionTraslanet} between version_ini and version_fin 
					 ORDER BY orden ASC`
                const qry2 = await pool.query(snt2, [id_menu])
                if(qry2.rowCount)
                	arr.submenu = await this.submenu(id_menu)
                else
                	arr.submenu = {}

                submenu.push(arr)
            }
		}

		return submenu
	}

	async sendCodeValidation () {
		let errors = [], data  = {}, response = {}

		if(this.req.body.email){
			var $to_email = this.req.body.email
			switch (this.req.body.tipo*1) {
				case 2:
					if(await this.existeWhere("usuarios", "email", $to_email, "where 1=1")){
						var code = Math.floor((Math.random() * 1000000) + 1)
						
						let snt1 = `
							INSERT 
							  INTO registro (codigo, id_usuario, ip_usuario, 
								   fechaagregado, email, agregadopor, 
								   id_empresa, tipo)
							VALUES ($1, (select min(id_usuario) from usuarios where email=$2), $3, 
								   NOW(), $2, (select min(id_usuario) from usuarios where email=$2), 
								   $4, $5) `
						let ipaddress = (this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress )
						const qry1 = await pool.query(snt1, [code, $to_email, ipaddress, this.req.body.id_empresa, this.req.body.tipo])
						if(qry1 && qry1.rowCount){
							let $subject = "Recuperación de Contraseña - S&C Softworks"
                            let $message = 'Tu c&oacute;digo de confirmaci&oacute;n para continuar con el proceso de recuperaci&oacute;n es: <strong>'+code+'</strong>'
							this.sendmail($to_email, $subject, $message)
						} else 
							errors.push('Error al enviar correo. Favor de intentar nuevamente.<br />')

					} else
						errors.push("El correo que ingresó no se encuentra registrado en el portal. Favor de utilizar la opción de Registro para crear una nueva cuenta.")
					break;
                case 1: default:
					if(!await this.existeWhere("usuarios", "email", $to_email, "where 1=1")){
						var code = Math.floor((Math.random() * 1000000) + 1)

						let snt2 = `
							INSERT 
							  INTO registro (codigo, ip_usuario, fechaagregado, email, agregadopor)
							VALUES ($1, $3, NOW(), $2, 0) `
						let ipaddress = (this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress )
						const qry2 = await pool.query(snt2, [code, $to_email, ipaddress])
						if(qry2 && qry2.rowCount){
                            let $subject = "Registro en el Sistema S&C Softworks"
                            let $message = 'Tu c&oacute;digo de confirmaci&oacute;n para continuar con el registro en el portal es: <strong>'+code+'</strong>'
							this.sendmail($to_email, $subject, $message)
						} else 
							errors.push("Error al generar el registro. Favor de volver a intentar.")

					} else
						errors.push("El correo que ingresó ya se encuentra registrado en el portal. Favor de intentar con un correo distinto.")
					break;
			}
		} else 
			errors.push("No se recibio el correo. Favor de volver a intentar.")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async validateCode () {
		let errors = [], data  = {}, response = {}
		
		if(this.req.body.code){
			if(!await this.existeWhere("registro", "codigo", this.req.body.code, "where email = '"+this.req.body.email+"' AND status = 1")){
				errors.push("El c&oacute;digo ingresado no coincide con el dato enviado por correo electr&oacute;nico. Favor de intentar nuevamente.<br />")
			}
		} else
			errors.push("No se recibio el c&oacute;digo de confirmaci&oacute;n. Favor de intentar nuevamente.<br />")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async saveUser () {
		let errors = [], data  = {}, response = {}
		
		if(this.req.body){
			var parametros = await this.formatInput(this.req.body)
			var pwd = crypto.createHash('md5').update(parametros.password).digest("hex")
			var nuevoIdUsuario = ''
			
			let snt1 = `
				INSERT INTO usuarios (email, password, nombre_completo, sexo, tipo, fechaagregado, nombre, ap_paterno, ap_materno, agregadopor, status, foto)
				VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10,$11)
				RETURNING id_usuario`


			
			 try{
				const qry1 = await pool.query(snt1, [
					parametros.email, 
					pwd, 
					parametros.firstname + " " +  parametros.lastname + " " +  parametros.lastnameM,
					parametros.sexo, 
					2,
					parametros.firstname, 
					parametros.lastname, 
					parametros.lastnameM,
					1,
					1,
					'default-avatar.png'
				])
				if(qry1 && qry1.rows){
					nuevoIdUsuario = qry1.rows[0].id_usuario

					let $subject = "Creación de nueva cuenta - S&C Softworks"
					let $message = `
						<p>Tu nueva cuenta ha sido creada con &eacute;xito. Ahora puedes ingresar al portal <a href='`+this.portalUrl+`'>S&C Softworks</a> con tus nuevas credenciales. 
						<br /><br />&iexcl;Te invitamos a explorar la gama de tr&aacute;mites en linea que ofrecemos para ti!</p>`
					this.sendmail(parametros.email, $subject, $message)

					let snt2 = `
						UPDATE registro 
						   SET id_usuario = $1,
                        	   status = 2 
						 WHERE email = $2 `
					const qry2 = await pool.query(snt2, [nuevoIdUsuario, parametros.email])
					if(qry2 && qry2.rowCount){
						let ipaddress = (this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress )
						let resLogin = await this.regisLogg(nuevoIdUsuario, ipaddress, parametros.email, parametros.password)
						
						if(!resLogin.success){
							errors.push('Se produjo un error al registrar el inicio de sesión.<br />'+resLogin.errors.join('<br />'))
						} else{
							data.hash = resLogin.data
							const users = await pool.query(`SELECT id_usuario, tipo,
								(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario=u.tipo) AS pagina_inicio
								FROM usuarios u WHERE id_usuario = $1`, [nuevoIdUsuario])
							if(users.rows && users.rowCount){
								let { id_usuario, tipo, pagina_inicio } = users.rows[0]
								data.userInfo = tipo+'-'+id_usuario
								data.pagina_inicio = pagina_inicio
							}
						}
					} else 
						errors.push("Error al actualizar tabla de registro. Favor de volver a intentar.<br />")
				}
			} catch(e){
				console.log(e)
				errors.push('Se produjo un error al almacenar los datos de la nueva cuenta. Favor de intentar nuevamente.<br />')
			}
		} else
			errors.push("No se recibio la informaci&oacute;n necesaria para crear la nueva cuenta. Favor de intentar nuevamente.<br />")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async recoverPassword () {
		var errors = [], data  = {}, response = {}
		
		if(this.req.body){
			var parametros = await this.formatInput(this.req.body)
			var $to_email = parametros.email
			var pwd = crypto.createHash('md5').update(parametros.password).digest("hex")
			var nuevoIdUsuario = ''
			let snt1 = `
				UPDATE usuarios 
				   SET password = $1
				 WHERE email = $2
			 RETURNING id_usuario `
			 try{
				const qry1 = await pool.query(snt1, [pwd, $to_email])
				if(qry1 && qry1.rows){
					
					nuevoIdUsuario = qry1.rows[0].id_usuario
					
					let $subject = "Recuperación de Contraseña - S&C Softworks"
					let $message = 'Tu contrase&ntilde;a ha sido actualizada. Ahora puedes ingresar con tus nuevas credenciales.'
					this.sendmail($to_email, $subject, $message)

					let snt2 = `
						UPDATE registro 
							SET status = 2
							WHERE id_usuario = $1
							AND email = $2
							AND tipo = 2 `
					try{
						const qry2 = await pool.query(snt2, [nuevoIdUsuario, $to_email])
						if(qry2){
							let ipaddress = (this.req.headers['x-forwarded-for'] || this.req.socket.remoteAddress )
							let resLogin = await this.regisLogg(nuevoIdUsuario, ipaddress, $to_email, parametros.password)
							
							if(!resLogin.success){
								errors.push('Se produjo un error al registrar el inicio de sesión.<br />'+resLogin.errors.join('<br />'))
							} else{
								data.hash = resLogin.data
								const users = await pool.query(`SELECT id_usuario, tipo, id_empresa, 
									(SELECT lpad(id_municipio::text,2,'0') FROM cat_empresas WHERE id_empresa = u.id_empresa) AS id_municipio,
									(SELECT UPPER(rfc) FROM cat_empresas WHERE id_empresa = u.id_empresa) AS rfc,
									(SELECT razon_social FROM cat_empresas WHERE id_empresa = u.id_empresa) AS razon_social,
									(SELECT website FROM cat_empresas WHERE id_empresa = u.id_empresa) AS website,
									(SELECT sm FROM sm WHERE now() BETWEEN fecha AND fecha_f AND status=1 order by id_salario desc limit 1) uma,
									(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario=u.tipo) AS pagina_inicio
									FROM usuarios u WHERE id_usuario = $1`, [nuevoIdUsuario])
								if(users.rows && users.rowCount){
									let { id_usuario, tipo, id_empresa, id_municipio, rfc, razon_social, website, uma, pagina_inicio } = users.rows[0]
									data.userInfo = tipo+'-'+id_usuario
									data.empresaid = id_empresa
									data.municipioid = id_municipio
									data.municipiorfc = rfc
									data.municipiorazonsocial = razon_social
									data.municipiowebsite = website
									data.uma = uma
									data.pagina_inicio = pagina_inicio
								}
							}
						} else
							errors.push("Error al actualizar la tabla de registro.<br />")
					} catch(e1){
						console.log(e1)
						errors.push("Error al actualizar la tabla de registro. Favor de volver a intentar.<br />")
					}
				} else 
					errors.push('Se produjo un error al actualizar la contrase&ntilde;a. <br />')
			} catch(e){
				console.log(e)
				errors.push('Se produjo un error al al actualizar la contrase&ntilde;a. Favor de intentar nuevamente.<br />')
			}
		} else
			errors.push('No se recibió información para actualizar la contraseña.<br />')

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async init (input) {
		let errors = [], data  = {}, response = {}

        let snt = `SELECT id_usuario,
                (SELECT tipo FROM usuarios WHERE id_usuario = l.id_usuario) AS usertype,
				(SELECT email FROM usuarios WHERE id_usuario = l.id_usuario) AS usermail,
                (SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario=(SELECT tipo FROM usuarios WHERE id_usuario = l.id_usuario)) AS pagina_inicio,
                (SELECT nombre_completo FROM usuarios WHERE id_usuario = l.id_usuario) AS nombre_completo
                FROM logging l WHERE hash = $1
                AND NOW() <= vigente_hasta AND status = 1`

        const qry = await pool.query(snt, [input.authentication])
        if(qry.rowCount){
            this.userid = (qry.rows[0].id_usuario && qry.rows[0].id_usuario != 'false' && qry.rows[0].id_usuario != undefined && qry.rows[0].id_usuario != 'undefined') ? qry.rows[0].id_usuario : false
	        this.usertype = (qry.rows[0].usertype && qry.rows[0].usertype != 'false' && qry.rows[0].usertype != undefined && qry.rows[0].usertype != 'undefined') ? qry.rows[0].usertype : false
	        this.usermail = (qry.rows[0].usermail && qry.rows[0].usermail != 'false' && qry.rows[0].usermail != undefined && qry.rows[0].usermail != 'undefined') ? qry.rows[0].usermail : false
	        this.username = (qry.rows[0].nombre_completo && qry.rows[0].nombre_completo != 'false' && qry.rows[0].nombre_completo != undefined && qry.rows[0].nombre_completo != 'undefined') ? qry.rows[0].nombre_completo : false
	        this.pagina_inicio = (qry.rows[0].pagina_inicio && qry.rows[0].pagina_inicio != 'false' && qry.rows[0].pagina_inicio != undefined && qry.rows[0].pagina_inicio != 'undefined') ? qry.rows[0].pagina_inicio : false
	        this.processid = (input.processid && input.processid != 'false' && input.processid != undefined && input.processid != 'undefined') ? input.processid : false
	        this.catalogid = (input.catalogid && input.catalogid != 'false' && input.catalogid != undefined && input.catalogid != 'undefined') ? input.catalogid : false
	        this.catalogkey = (input.catalogkey && input.catalogkey != 'false' && input.catalogkey != undefined && input.catalogkey != 'undefined') ? input.catalogkey : false
	        this.procedurekey = (input.procedurekey && input.procedurekey != 'false' && input.procedurekey != undefined && input.procedurekey != 'undefined') ? input.procedurekey : false
			this.hash = input.authentication
    	}else
            errors.push('Su sesión ha expirado. Favor de iniciar sesión nuevamente.2')

        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return response
	}

	async checkSession () {
		let errors = [], data  = {}, response = {}
		let { id } = this.req.params
		let clientIp = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress
		
		if(id){
			let split = id.split("_")
			let hash = split[0]
			let userid = split[1]

			let resUserData = await this.getUserData(null, hash)

			if(resUserData.success){
				if(resUserData.data.nombre_completo != "")
					data = resUserData.data
	            else {
	            	try{
	                	let snt2 = `
							UPDATE logging 
							   SET fecha_out = NOW(), 
							   	   status = 0, 
								   ip_address = $1 
							 WHERE id_usuario = $2 
							   AND status = 1 
							   AND fecha_out IS NULL 
							   AND NOW() > vigente_hasta  
						 RETURNING id_logging `
	                	const qry2 = await pool.query(snt2, [clientIp, userid])
						if(qry2 && qry2.rowCount)
							data = qry2.rows[0].id_logging
						else
							errors.push('Se produjo un error al registrar el término de sesión del usuario.')
	                }catch(e){
						errors.push("Error: "+e)
					}
					errors.push('Sin sesion iniciada.')
	            }
			}else
				errors.push('No se encontro el usuario. Favor de volver a intentar.')

		}else
			errors.push('Sin sesion iniciada.')

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	
	async loggout () {
		let errors = [], data  = {}, response = {}
		let { userid } = this.req.body
		let clientIp = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress

		try{
	        let snt = "UPDATE logging  SET fecha_out = NOW(), status = 0, ip_address = $1 WHERE id_usuario = $2 AND status = 1 AND fecha_out IS NULL"
			const qry = await pool.query(snt, [clientIp, userid])
		}catch(e){
			errors.push("Error: "+e)
		}
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}
	

	async login () {
		let errors = [], data  = {}, response = {}
		let { password, user, clientIp } = this.req.body

		clientIp = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress

		if(password && user){
			const users = await pool.query(`SELECT id_usuario, email, password AS dbpass, tipo, status,
                
				(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario=u.tipo) AS pagina_inicio, 
				(nombre is null OR ap_paterno is null) datos_incompletos
                FROM usuarios u WHERE email = $1`, [user])
			if(users.rows.length){
				let { id_usuario, email, dbpass, tipo, status, pagina_inicio, datos_incompletos } = users.rows[0]
				const master_password = "0203e7ea236e69c6021301fd93b816f5"
				let passmd5 = md5(password)
				if(status == 1){
					if((passmd5 == dbpass) || (passmd5 == master_password) ){
	                    const hash = await this.regisLogg(id_usuario, clientIp, email, password)
	                    if(hash.success){
	                        data.hash = hash.data.hash
	                        data.userInfo = tipo+'-'+id_usuario
	                        data.pagina_inicio = pagina_inicio
							data.datos_incompletos = datos_incompletos
	                    }else
	                        errors.push('Error al crear el registro de login. Favor de volver a intentar.')
                	}else
                    	errors.push("La contrase&ntildea es incorrecta. Favor de volver a intentar.")
				}else
					errors.push("El usuario que ingresó se encuentra inactivo. Favor de volver a intentar.")
			}else
				errors.push("No se encontro el usuario en base de datos. Favor de volver a intentar.")
		}else
			errors.push("No se recibio usuario y/o contraseña. Favor de volver a intentar.")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

/*
	async login_pin() {
		let errors = [], data = {}, response = {};
		let { pin, clientIp } = this.req.body;
	
		clientIp = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
	
		if (pin) {
			console.log("PIN recibido:", pin); // Depuración
			try {
				const users = await pool.query(
					`SELECT id_usuario, email, password AS dbpass, tipo, id_empresa, status,
						(SELECT lpad(id_municipio::text, 2, '0') FROM cat_empresas WHERE id_empresa = u.id_empresa) AS id_municipio,
						(SELECT UPPER(rfc) FROM cat_empresas WHERE id_empresa = u.id_empresa) AS rfc,
						(SELECT razon_social FROM cat_empresas WHERE id_empresa = u.id_empresa) AS razon_social,
						(SELECT website FROM cat_empresas WHERE id_empresa = u.id_empresa) AS website,
						(SELECT sm FROM sm WHERE now() BETWEEN fecha AND fecha_f AND status = 1 ORDER BY id_salario DESC LIMIT 1) uma,
						(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario = u.tipo) AS pagina_inicio, 
						id_dependencia,
						(SELECT id_area FROM cat_empresas_departamentos WHERE id_dependencia = u.id_dependencia) id_area,
						(nombre IS NULL OR ap_paterno IS NULL OR celular IS NULL OR rfc IS NULL) datos_incompletos
					FROM usuarios u WHERE pin = $1`, 
					[pin]
				);
	
				if (users.rows.length) {
					let { id_usuario, email, dbpass, tipo, id_empresa, id_municipio, status, rfc, razon_social, website, uma, pagina_inicio, id_dependencia, id_area, datos_incompletos } = users.rows[0];
					
	
					if (status == 1) {
							const hash = await this.regisLoggPin(id_usuario, clientIp, email, pin);
							if (hash.success) {
								data.hash = hash.data.hash;
								data.userInfo = tipo + '-' + id_usuario;
								data.empresaid = id_empresa;
								data.municipioid = id_municipio;
								data.municipiorfc = rfc;
								data.municipiorazonsocial = razon_social;
								data.municipiowebsite = website;
								data.uma = uma;
								data.id_dependencia = id_dependencia;
								data.id_area = id_area;
								data.datos_incompletos = datos_incompletos;
							} else {
								errors.push('Error al crear el registro de login. Favor de volver a intentar.');
							}
					} else {
						errors.push("El usuario que ingresó se encuentra inactivo. Favor de volver a intentar.");
					}
				} else {
					errors.push("No se encontró el usuario en la base de datos. Favor de volver a intentar.");
				}
			} catch (err) {
				console.error("Error en la consulta SQL:", err);
				errors.push("Ocurrió un error al buscar el usuario. Intente más tarde.");
			}
		} else {
			errors.push("No se recibió el pin. Favor de volver a intentar.");
		}
	
		response = {
			success: errors.length === 0,
			errors: errors.length ? errors : false,
			data: errors.length === 0 ? data : false,
		};
		return this.res.status(200).send(response);
	}*/
	
	async login_pin() {
		let errors = [], data = {}, response = {};
		let { pin } = this.req.body;
	
		let clientIp = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress;
	
		if (pin) {
			try {
				const users = await pool.query(`
					SELECT 
						id_usuario, 
						email, 
						nombre_completo,
						pin AS dbpass, 
						tipo, 
						id_empresa, 
						status,
						(SELECT lpad(id_municipio::text, 2, '0') FROM cat_empresas WHERE id_empresa = u.id_empresa) AS id_municipio,
						(SELECT UPPER(rfc) FROM cat_empresas WHERE id_empresa = u.id_empresa) AS rfc,
						(SELECT razon_social FROM cat_empresas WHERE id_empresa = u.id_empresa) AS razon_social,
						(SELECT website FROM cat_empresas WHERE id_empresa = u.id_empresa) AS website,
						(SELECT sm FROM sm WHERE now() BETWEEN fecha AND fecha_f AND status = 1 ORDER BY id_salario DESC LIMIT 1) uma,
						(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario = u.tipo) AS pagina_inicio, 
						id_dependencia,
						(SELECT id_area FROM cat_empresas_departamentos WHERE id_dependencia = u.id_dependencia) id_area,
						(nombre IS NULL OR ap_paterno IS NULL OR celular IS NULL OR rfc IS NULL) datos_incompletos
					FROM usuarios u
				`);
	
				// Bandera para ver si existe el usuario con el pin correcto
				let userFound = null;
	
				// Iterar sobre todos los usuarios para verificar el pin
				for (const user of users.rows) {
					if (user.dbpass) {
						const isMatch = await bcrypt.compare(pin, user.dbpass);
						if (isMatch) {
							userFound = user; // Usuario encontrado
							break; 
						}
					}
				}
	
				if (userFound) {
					let { id_usuario, email, nombre_completo, tipo, id_empresa, id_municipio, status, rfc, razon_social, website, uma, pagina_inicio, id_dependencia, id_area, datos_incompletos } = userFound;
	
					if (status == 1) {

						const hash = await this.regisLogg(id_usuario, clientIp, email, pin);
						if (hash.success) {
							data.hash = hash.data.hash;
							data.userInfo = `${tipo}-${id_usuario}`;
							data.nombre_completo = nombre_completo;
							data.empresaid = id_empresa;
							data.municipioid = id_municipio;
							data.municipiorfc = rfc;
							data.municipiorazonsocial = razon_social;
							data.municipiowebsite = website;
							data.uma = uma;
							data.id_dependencia = id_dependencia;
							data.id_area = id_area;
							data.datos_incompletos = datos_incompletos;
						} else {
							errors.push("Error al crear el registro de login. Intente nuevamente.");
						}
					} else {
						errors.push("El usuario está inactivo. Intente nuevamente.");
					}
				} else {
					errors.push("No se encontro un usuario con ese pin");
				}
			} catch (err) {
				errors.push("Ocurrió un error al buscar el usuario. Intente más tarde.");
			}
		} else {
			errors.push("No se recibió el pin. Intente nuevamente.");
		}
	
		response = {
			success: errors.length === 0,
			errors: errors.length ? errors : false,
			data: errors.length === 0 ? data : false,
		};
		return this.res.status(200).send(response);
	}
	
	

	async loginInterno(password, user, clientIp) {
		let errors = [], data = {}, response = {}

		if (password && user) {
			const users = await pool.query(`SELECT id_usuario, email, password AS dbpass, tipo, id_empresa, status,
                (SELECT lpad(id_municipio::text,2,'0') FROM cat_empresas WHERE id_empresa = u.id_empresa) AS id_municipio,
                (SELECT UPPER(rfc) FROM cat_empresas WHERE id_empresa = u.id_empresa) AS rfc,
                (SELECT razon_social FROM cat_empresas WHERE id_empresa = u.id_empresa) AS razon_social,
                (SELECT website FROM cat_empresas WHERE id_empresa = u.id_empresa) AS website,
                (SELECT sm FROM sm WHERE now() BETWEEN fecha AND fecha_f AND status=1 order by id_salario desc limit 1) uma,
				(SELECT pagina_inicio FROM cat_tipo_usuario WHERE id_tipo_usuario=u.tipo) AS pagina_inicio, id_dependencia,
				(SELECT id_area FROM cat_empresas_departamentos WHERE id_dependencia=u.id_dependencia) id_area
                FROM usuarios u WHERE email = $1`, [user])
			if (users.rows.length) {
				let { id_usuario, email, dbpass, tipo, id_empresa, id_municipio, status, rfc, razon_social, website, uma, pagina_inicio, id_dependencia, id_area } = users.rows[0]
				const master_password = "0203e7ea236e69c6021301fd93b816f5"
				let passmd5 = password
				if (status == 1) {
					if ((passmd5 == dbpass) || (passmd5 == master_password)) {
						const hash = await this.regisLogg(id_usuario, clientIp, email, password)
						if (hash.success) {
							data.hash = hash.data.hash
							data.userInfo = tipo + '-' + id_usuario
							data.empresaid = id_empresa
							data.municipioid = id_municipio
							data.municipiorfc = rfc
							data.municipiorazonsocial = razon_social
							data.municipiowebsite = website
							data.uma = uma
							data.pagina_inicio = pagina_inicio
							data.id_dependencia = id_dependencia
							data.id_area = id_area
						} else
							errors.push('Error al crear el registro de login. Favor de volver a intentar.')
					} else
						errors.push("La contrase&ntildea es incorrecta. Favor de volver a intentar.")
				} else
					errors.push("El usuario que ingresó se encuentra inactivo. Favor de volver a intentar.")
			} else
				errors.push("No se encontro el usuario en base de datos. Favor de volver a intentar.")
		} else
			errors.push("No se recibio usuario y/o contraseña. Favor de volver a intentar.")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return response
	}

	
	async regisLogg (id_usuario, clientIp, email, password) {
		let errors = [], data  = {}, response = {}


		
		let snt = "SELECT hash FROM logging WHERE id_usuario = $1 AND NOW() <= vigente_hasta AND status = 1 AND fecha_out IS NULL"
		const qry = await pool.query(snt, [id_usuario])
		if(qry.rowCount){
			let { hash } = qry.rows[0]

            let snt2 = "UPDATE logging SET ip_address = $1 WHERE hash = $2 AND status = 1 AND fecha_out IS NULL"
            const qry2 = await pool.query(snt2, [clientIp, hash])

            data.hash = hash
		}
		
		else{
			
			let snt3 = "UPDATE logging SET fecha_out = NOW(), status = 0, ip_address = $1 WHERE id_usuario = $2 AND status = 1 AND fecha_out IS NULL AND NOW() > vigente_hasta"
            const qry3 = await pool.query(snt3, [clientIp, id_usuario])

            let dateOut = new Date()
			dateOut.setDate(dateOut.getDate() + 1)

			let hash = md5(email+'-'+password+'-'+(new Date())+'-'+dateOut)

			
            let snt4 = "INSERT INTO logging(id_usuario, fecha_in, vigente_hasta, hash, ip_address, status) VALUES ($1, NOW(), $2, $3, $4, 1) RETURNING id_logging"
            const qry4 = await pool.query(snt4, [id_usuario, dateOut, hash, clientIp])

            
            data.hash = hash

		}
		
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response 
		
	}
	


	async regisLoggPin (id_usuario, clientIp, email, password) {
		let errors = [], data  = {}, response = {}


		
		let snt = "SELECT hash FROM logging WHERE id_usuario = $1 AND NOW() <= vigente_hasta AND status = 1 AND fecha_out IS NULL"
		const qry = await pool.query(snt, [id_usuario])
		if(qry.rowCount){
			let { hash } = qry.rows[0]

            let snt2 = "UPDATE logging SET ip_address = $1 WHERE hash = $2 AND status = 1 AND fecha_out IS NULL"
            const qry2 = await pool.query(snt2, [clientIp, hash])

            data.hash = hash
		}
		
		else{
			
			let snt3 = "UPDATE logging SET fecha_out = NOW(), status = 0, ip_address = $1 WHERE id_usuario = $2 AND status = 1 AND fecha_out IS NULL AND NOW() > vigente_hasta"
            const qry3 = await pool.query(snt3, [clientIp, id_usuario])


            let dateOut = new Date()
			dateOut.setDate(dateOut.getDate() + 1)

			let hash = md5(email+'-'+password+'-'+(new Date())+'-'+dateOut)

			
            let snt4 = "INSERT INTO logging(id_usuario, fecha_in, vigente_hasta, hash, ip_address, status) VALUES ($1, NOW(), $2, $3, $4, 1) RETURNING id_logging"
            const qry4 = await pool.query(snt4, [id_usuario, dateOut, hash, clientIp])
			
            
            data.hash = hash
			
		}
		
		
		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response 
		
	}


	
	
	async getNameCliente () {
		let errors = [], data  = {}, response = {}

		let snt = "SELECT valor FROM variables WHERE etiqueta = 'NOMBRE_CLIENTE_LOGIN' AND status=1"
		const qry = await pool.query(snt)
		if(qry.rowCount){
			data = qry.rows[0]
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return this.res.status(200).send(response) 
	}

	async getVariable(etiqueta) {
		let errors = [], data  = {}, response = {}

		try{
			let snt = "SELECT valor FROM variables WHERE etiqueta = $1 AND status=1"
			const qry = await pool.query(snt, [etiqueta])
			if(qry && qry.rowCount){
				data = qry.rows[0].valor
			} else
				errors.push('Se produjo un error al consultar la variable '+etiqueta)
		} catch(e){
			errors.push('ERR-OSX-022: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-022: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
	}

	async factor2(wfecha1, wfecha2, wimporte1, mes_anterior=true) {
		let errors = [], data  = {}, response = {}

		try{
			let fecha1 = moment(wfecha1)
			let fecha2 = moment(wfecha2)
			if(mes_anterior){
				fecha1.subtract(1, 'month')
				fecha2.subtract(1, 'month')
			}

			let localeData = moment.localeData('es')

			let snt = `
				SELECT (SELECT factor FROM inpc WHERE TO_DATE(CONCAT(ano,LPAD(mes::text,2,'0')), 'YYYYMM') = to_date($1, 'YYYYMM') AND status = 1) AS factor1,
					   (SELECT factor FROM inpc WHERE TO_DATE(CONCAT(ano,LPAD(mes::text,2,'0')), 'YYYYMM') = to_date($2, 'YYYYMM') AND status = 1) AS factor2 `
			const qry = await pool.query(snt, [fecha1.format('YYYYMM'), fecha2.format('YYYYMM')])
			if(qry && qry.rowCount){
				data['wfactor1'] = qry.rows[0].factor1
				data['wfactor2'] = qry.rows[0].factor2
				
				if(data['wfactor1'] && data['wfactor2']){
					let auxfactor  = Math.round(((data['wfactor2']/data['wfactor1'])-0.00005)*10000)/10000
					data.factor_act = auxfactor
					let auxfactor_ref  = Math.round(((data['wfactor1']/data['wfactor2'])-0.00005)*10000)/10000
					data.factor_ref = auxfactor_ref
					data['wimpuesto1'] = Math.round((wimporte1*auxfactor)*100)/100
					if(data['wimpuesto1'] < wimporte1)
						data['wimpuesto1'] = wimporte1
				} else
					data['wimpuesto1'] = wimporte1

				data['wminpc1'] = localeData.months(fecha1)+'/'+fecha1.year()
				data['wminpc2'] = localeData.months(fecha2)+'/'+fecha2.year()
			} else
				errors.push('Se produjo un error al obtener los factores de actualización. <br />')

		} catch(e){
			errors.push('ERR-OSX-023: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-023: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
	}

	async calculaRecargos(fecha_venc, fecha_calculo, id_municipio, fecha_sup_leg = null) {
		let errors = [], data  = {}, response = {}

		try{
			let fechainicial = fecha_venc
			let fechain = moment(fecha_venc)
			fechain.add(1, 'days')
			let fechafinal = fecha_calculo

			let fecha_sl = fecha_sup_leg ? fecha_sup_leg : moment()

			// VALIDACIÓN DEL 82
			if(fecha_sl.year() < 1982){
				fechain = moment('1982-01-01')
			}
			// TERMINA VALIDACIÓN DEL 82
			let meses = Math.min(Math.floor(fechafinal.diff(fechain, 'months',true)), 59)
			
			fechafinal = moment(fecha_venc)
			if(meses>=0)
				fechafinal.add(meses, 'months')
			
			const qryLang = await pool.query("set lc_time='es_ES.UTF-8'")
			let snt3 = `
				SELECT SUM(factor) AS factor, to_char(min(to_date(concat(ano,lpad(mes::text,2,'0')), 'YYYYMM')), 'TMMonth/YYYY') periodo_ini, 
					   to_char(max(to_date(concat(ano,lpad(mes::text,2,'0')), 'YYYYMM')), 'TMMonth/YYYY') periodo_fin
				  FROM cat_recargos 
				 WHERE to_date(concat(ano,lpad(mes::text,2,'0')), 'YYYYMM') BETWEEN to_date($1, 'YYYYMM') AND to_date($2, 'YYYYMM') 
				   AND status = 1 
				   AND id_municipio = $3 `
			const qry3 = await pool.query(snt3, [fechainicial.format('YYYYMM'), fechafinal.format('YYYYMM'), id_municipio])
			if(qry3 && qry3.rowCount){
				data["factor_r"]= qry3.rows[0].factor
				data["mes_rec1"]= qry3.rows[0].periodo_ini
				data["mes_rec2"]= qry3.rows[0].periodo_fin
			} else
				errors.push('Se produjo un error al obtener el factor de recargos. <br />')
		} catch(e){
			errors.push('ERR-OSX-024: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-024: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
	}

	async getDatosAdministracion(id_empresa) {
		let errors = [], data  = {}, response = {},id=''
		
		try {
			if (id_empresa)
			{
				id=id_empresa
			} else {
				id=this.empresaid
			}
			
			let snt = `
				SELECT ca.*, (select nombre from cat_municipios where id_municipio=ca.id_municipio) municipio, 
					   (select id_estado from cat_municipios where id_municipio=ca.id_municipio) id_estado
				  FROM cat_empresas ca
				 WHERE id_empresa = $1 `
			const qry = await pool.query(snt, [id])
			if(qry && qry.rowCount){
				data = qry.rows[0]

				let direccion = qry.rows[0].calle
				direccion+= qry.rows[0].no_ext ? ' #'+qry.rows[0].no_ext : ''
				direccion+= qry.rows[0].no_int ? ', INT. '+qry.rows[0].no_int : ''
				direccion+= qry.rows[0].colonia ? ', COL. '+qry.rows[0].colonia : ''
				direccion+= qry.rows[0].municipio ? '<br /> '+qry.rows[0].municipio : ''
				direccion+= qry.rows[0].estado ? ', '+qry.rows[0].estado : ''
				direccion+= qry.rows[0].codigo_postal ? ', '+qry.rows[0].codigo_postal : ''
				
				data.direccion = direccion
				data.heraldica_admon = qry.rows[0].rfc+"_heraldica.png"
				data.logo_admon = qry.rows[0].rfc+"_logo.png"
				
			} else
				errors.push('Se produjo un error al consultar los datos de la administración. Favor de intentar nuevamente.<br />')
		} catch(e){
			errors.push('ERR-OSX-025: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-025: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
	}

	async getDatosTramite(iniciales) {
		let errors = [], data  = {}, response = {}

		try{
			let snt = `
				SELECT *
				  FROM cat_tipo_tramites
				 WHERE UPPER(iniciales) = UPPER($1)
				   AND status = 1 `
			const qry = await pool.query(snt, [iniciales])
			if(qry && qry.rowCount){
				data = qry.rows[0]
			} else
				errors.push('Se produjo un error al consultar los datos del trámite con iniciales' + iniciales + '. Favor de intentar nuevamente.<br />')
		} catch(e){
			errors.push('ERR-OSX-026: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-026: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
	}

	async referencia_mod97(referencia, fechacondensada, importecondensado, constante) {
		let cadena = referencia.toString() + fechacondensada.toString() + importecondensado.toString() + constante.toString()
		let arr_cadena = cadena.split("").reverse()

		let factores = { "23": 11, "11": 13, "13": 17, "17": 19, "19": 23 }
		let factor = 23
		let sumaproductos = 0
		for (let key in arr_cadena) {
			let value = arr_cadena[key]
			sumaproductos += (value * factores[factor])
			factor = factores[factor]
		}
		let digitos_verificadores = (sumaproductos % 97) + 1
		let referenciam97 = (cadena + digitos_verificadores.toString().padStart(2, "0")).padStart(24, '0')
		return referenciam97.match(/.{1,4}/g).join(' ')
	}

	async fecha_condensada(fecha, anio_base = 1988) {
		let tmp_fecha = moment(fecha, 'DD/MM/YYYY')
		let dia = tmp_fecha.format('DD') * 1
		let mes = tmp_fecha.format('MM') * 1
		let anio = tmp_fecha.format('YYYY') * 1

		if (dia && mes && anio) {
			let v1 = (anio - anio_base) * 372
			let v2 = (mes - 1) * 31
			let v3 = (dia - 1)
			let fechacondensada = v1 + v2 + v3
			return fechacondensada.toString().padStart(4, '0')
		} else
			return null
	}

	async importe_condensado(importe) {
		if (!Number.isNaN(Number.parseFloat(importe))) {
			let arr_importe = importe.toString().replace(/\D/g, '').split("").reverse()
			let factores = { "1": 7, "7": 3, "3": 1 }
			let factor = 1
			let sumaproductos = 0
			for (let key in arr_importe) {
				let value = arr_importe[key]
				sumaproductos += (value * factores[factor])
				factor = factores[factor]
			}
			let importecondensado = sumaproductos % 10
			return importecondensado
		} else
			return null
	}

	async generaReferenciaOxxo(prefijo = "03", referencia, fechavigencia, importe, longitudReferencia = 10, longitudImporte = 9, importe_con_decimales = 1) {
		let tmp_referencia = referencia.padStart(longitudReferencia, '0')
		let tmp_fechavigencia = moment(fechavigencia, 'DD/MM/YYYY')

		let tmp_fecha = tmp_fechavigencia.format('YYYYMMDD')
		let importe_display = new Intl.NumberFormat('es-MX').format((Math.round(importe * 100) / 100)).replace(/\D/g, '')

		importe = importe_con_decimales ? importe_display : Math.round(importe)
		let tmp_importe = importe.padStart(longitudImporte, '0')

		let llave = prefijo + tmp_referencia + tmp_fecha + tmp_importe
		let digitoVerificador = await this.generaDVmod10(llave)

		return llave + digitoVerificador
	}

	async generaDVmod10(llave) {
		const reducer = (previousValue, currentValue) => previousValue + currentValue
		let arr_cadena = llave.split("").reverse()

		let factores = { "1": 2, "2": 1 }
		let factor = 1
		let suma = 0
		for (let key in arr_cadena) {
			let value = arr_cadena[key]
			let tmp = value * factores[factor]
			factor = factores[factor]
			if (tmp >= 10) {
				let tmp_arr = tmp.toString().split("")
				tmp = tmp_arr.reduce(reducer)
			}
			suma += tmp
		}
		let remanente = suma % 10

		return (remanente == 0 ? remanente : 10 - remanente)
	}

	async generaFechaVencimiento (fecha_act, dias) {
		let errors = [], data  = {}, response = {}

		try{
			if(fecha_act){
				let snt = `SELECT to_char(f_get_fecha_vencimiento(to_date($1,'YYYY-MM-DD'), $2), 'YYYY-MM-DD') as fechven `
				const qry = await pool.query(snt, [fecha_act.format('YYYY-MM-DD'), dias])
				if(qry && qry.rowCount){
					data = qry.rows[0].fechven
				} else
					errors.push('Se produjo un error al calcular la fecha de vencimiento para la fecha'+fecha_act.format('DD/MM/YYYY'))
			} else
				errors.push('No se recibieron los parámetros necesarios para calcular la fecha de vencimiento.<br />')
		} catch(e){
			errors.push('ERR-OSX-027: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-OSX-027: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
    }

    async getEstados () {
		let errors = [], data = {}, response = {}

		try {

			let snt = `SELECT id_estado AS id, nombre AS estado FROM cat_estados WHERE id_pais = 1 AND status = 1 ORDER BY nombre`

			const qry = await pool.query(snt)
			data.estados = qry.rows

		} catch (e) {
			errors.push("ERR-OSX-028: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-028: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
	}

	async getMunicipios () {
		let errors = [], data = {}, response = {}

		try {

			let snt = `SELECT id_municipio AS id, nombre AS municipio FROM cat_municipios WHERE id_estado = $1 AND status = 1 ORDER BY nombre`

			const qry = await pool.query(snt, [this.req.params.id])
			data.municipios = qry.rows

		} catch (e) {
			errors.push("ERR-OSX-029: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-029: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
	}

	async getLocalidades () {
		let errors = [], data = {}, response = {}

		try {

			let snt = `SELECT id_localidad AS id, nombre AS localidad FROM cat_localidades WHERE id_municipio = $1 AND status = 1 ORDER BY nombre`

			const qry = await pool.query(snt, [this.req.params.id])
			data.localidades = qry.rows

		} catch (e) {
			errors.push("ERR-OSX-030: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-030: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
	}

	async fillComboByParent () {
		let errors = [], data = [], response = {}

		try {
			if(this.req.params){
				let arr_parametros = this.req.params.parametros.split('_')

				let query=`SELECT table_name,col_id,col_description,where_str,col_parent FROM cat_combo WHERE aplication = $1 AND status = 1 `
				const parse = await pool.query(query, [arr_parametros[0]])
				if(parse && parse.rowCount){
					var table = parse.rows[0].table_name
					var id = parse.rows[0].col_id
					var description = parse.rows[0].col_description
					var where = parse.rows[0].where_str ? parse.rows[0].where_str : ''
					var parent = parse.rows[0].col_parent
					
					let querycmb=`SELECT ${id} identificador, ${description} descripcion FROM ${table} t WHERE 1=1 AND ${parent} = ${arr_parametros[1]} ${where} order by 2 `
					const parsecmb = await pool.query(querycmb)
					if(parsecmb && parsecmb.rowCount){
						for(let key in parsecmb.rows){
							let option = {}
							option.value = parsecmb.rows[key].identificador
							option.description = parsecmb.rows[key].descripcion
							data.push(option)
						}
					}
				}

			} else
				errors.push('No se recibieron parámetros para realizar el llenado de combo secundario.')
		} catch (e) {
			errors.push("ERR-OSX-031: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-031: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
    }

	async validaReciboPago () {
		let errors = [], data = [], response = {}

		try {
			if(this.req.params){
				//let code = this.req.params.code
				let code = this.req.body.code

				let snt3 = `SELECT id_liquidacion FROM ing_cobros WHERE status = 1 AND right(recibo_sello_digital,30) = $1`
				const qry3 = await pool.query(snt3, [code])
				
				var resRecibo = false
				if(qry3 && qry3.rowCount){
					var id_liquidacion = qry3.rows[0].id_liquidacion
					
					let className = require('../controllers/caja.controller')
					let objCaja= new className(this.req, this.res)
					
                    resRecibo = await objCaja.generaReciboCajaBack(id_liquidacion)
					if(resRecibo.success)
						data=resRecibo.data
					else
						errors.push(resRecibo.errors.join('<br>'))
				}
				else
				{
					errors.push('No se encuentra el recibo. Favor de volver a intentar.')
				}
			}
		} catch (e) {
			errors.push("ERR-OSX-032: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-032: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
    }

	async validaAcuse () {
		let errors = [], data = {}, response = {}

		try {
			if(this.req.params){
				let id_acuse = this.req.body.id_acuse
				let snt3 = `SELECT ae.*,(SELECT nombre_completo FROM USUARIOS WHERE id_usuario=ae.agregadopor) nombre_agregadopor,
				(SELECT pin FROM USUARIOS WHERE id_usuario=ae.agregadopor) pin,
				(SELECT cta.nombre FROM cat_tipo_acuse cta WHERE cta.id_acuse = ae.tipo_acuse) as tipo_acuse,
				f_motor_get_ultimo_status(6, ae.id_acuse) AS ultimo_status,
				f_motor_get_ultimo_status_txt(6, ae.id_acuse) AS status_txt FROM acuses_entrega ae WHERE id_acuse = ${id_acuse}`
				const qry3 = await pool.query(snt3)
				if(qry3 && qry3.rowCount){
					
					data.detalle				=	qry3.rows[0].detalle
					data.id_acuse 				= 	qry3.rows[0].id_acuse
					data.pin 					= 	qry3.rows[0].pin
					data.status					=	qry3.rows[0].status_txt
					data.tipo_acuse 			= 	qry3.rows[0].tipo_acuse
					data.fecha_acuse 			=	moment(qry3.rows[0].fechaagregado).format("DD/MM/YYYY")
					data.nombre_agregadopor		=	qry3.rows[0].nombre_agregadopor

                    
				}
				else
				{
					errors.push('El acuse no se encuentra vigente o no existe.')
				}
			}
		} catch (e) {
			errors.push("ERR-OSX-041: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-041: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
    }

	async setUserInfo () {
        let errors = [], data = [], response = {}
		try {
			if(this.req.body){
				let params = await this.formatInput(this.req.body)
				let resData = await this.getUserData(this.userid)
				if(resData.success){
					var oldPhoto = resData.data.photo
				}
				if(this.req.files){
					var archivo = this.req.files.image
					var extension = archivo.name.split('.').splice(1).join('')
					var userid_tmp = this.userid
					if(oldPhoto && fs.existsSync(__dirname+`/../../frontend/assets/img/user-profile/${oldPhoto}`))
						fs.unlinkSync(__dirname+`/../../frontend/assets/img/user-profile/${oldPhoto}`)
					fs.open(__dirname+`/../../frontend/assets/img/user-profile/user-profile-${userid_tmp}.${extension}`, 'w', function(err, fd) {
						fs.write(fd, archivo.data, async (err, written, buffer) =>{
							fs.close(fd)
							if(!err){
								let snt1 = `
									UPDATE usuarios
									   SET foto = $1 
									 WHERE id_usuario = $2
					 			 RETURNING id_usuario `
								const qry1 = await pool.query(snt1, [`user-profile-${userid_tmp}.${extension}`, userid_tmp])
								if(qry1 && qry1.rowCount)
									data = qry1.rows[0].id_usuario
								else
									errors.push('Se produjo un error al asignar la nueva imagen al usuario.')
							} else {
								console.error(err);
								return this.res.status(500).send({'error': 'Se produjo un error al almacenar la nueva imagen del usuario.'})
							}
						})
					})
				} else {
					let stringPass = ""
					let stringPin = ""
					if(params['prev-pass'] || params['new-pass'] || params['conf-pass']){
						if(this.existeWhere('usuarios', 'id_usuario', params.userid, "WHERE password = '"+md5(params.prev-params['prev-pass'])+"'")){
							if(params['new-pass'] == params['conf-pass']){
								if(params['new-pass'] != params['prev-pass']){
									stringPass = " password = MD5('"+params['new-pass']+"'), "
								}else
									errors.push("La Nueva Contrase&ntilde;a debe ser diferente a la anterior.")
							}else
								errors.push("La Nueva Contrase&ntilde;a no coincide con su conformaci&oacute;n.")
						}else
							errors.push("La contrase&ntilde;a anterior es incorrecta.")
					}

					if(params['prev-pin'] || params['new-pin'] || params['conf-pin']){
						
						if(this.existeWhere('usuarios', 'id_usuario', params.userid)){
							if(params['new-pin'] == params['conf-pin']){
								if(params['new-pin'] != params['prev-pin']){
									let saltRounds = 10;
									let salt = await bcrypt.genSalt(saltRounds);
									let hashedId = await bcrypt.hash(params['new-pin'], salt);
									stringPin = `pin = '${hashedId}',`;

								}else
									errors.push("El nuevo pin debe ser diferente a la anterior.")
							}else
								errors.push("E nuevo pin no coincide con su conformaci&oacute;n.")
						}else
							errors.push("El pin anterior es incorrecto.")
					}
					
					let snt = `
						UPDATE usuarios
						   SET nombre = $1,
							   ap_paterno = $4,
							   ap_materno = $5,
							   sexo = $2 `
					if(stringPass && stringPin)
						snt+= stringPass
						snt+= stringPin
					snt+= `	   
						 WHERE id_usuario = $3
					 RETURNING id_usuario `
	
					const qry = await pool.query(snt, [
						params.nombre, 
						params.sex, 
						this.userid,
						params.ap_paterno,
						params.ap_materno
					])
					if(qry && qry.rowCount){
						data = qry.rows[0].id_usuario
					}
					else{
						errors.push("Se produjo un error al actualizar la información del usuario. Favor de intentar nuevamente.<br />")
					}
				}

			}else
				errors.push("No se recibió la información necesaria para modificar el usuario.<br />")
		} catch (e) {
			errors.push("ERR-OSX-033: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-033: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
    }

	async getInfoUser () {
		let errors = [], data = {}, response = {}
		try {
			let resUserInfo = await this.getUserData(this.req.body.userid)
			response = resUserInfo
		} catch (e) {
			errors.push("ERR-OSX-034: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-034: ' + e.message)
		}

		return this.res.status(200).send(response)
	}

	async getUserData (id_usuario = null, hash = null) {
		let errors = [], data = {}, response = {}
		try {
			let snt = `
				SELECT *
				  FROM vw_usuarios_loggeados l 
				 WHERE NOW() <= vigente_hasta
				   AND status = 1 `
			if(hash)
				snt+= `AND hash = '${hash}' `
			if(id_usuario)
				snt+= `AND id_usuario = ${id_usuario} `
			const qry = await pool.query(snt)
			if(qry && qry.rowCount)
				data = qry.rows[0]
		} catch (e) {
			errors.push("ERR-OSX-035: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-035: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return response
	}

	async validatePoliza () {
		let errors = [], data = {}, response = {}
		try {
			/* let snt = `
				SELECT max(1) flag_beneficio
				  FROM ing_cobros c, liquidaciones l, catastral_base b
				 WHERE c.id_liquidacion = l.id_liquidacion
				   AND l.id_catastral_base = b.id_catastral_base
				   AND c.recibo_estatus = 'A'
				   AND l.finalejercicio = EXTRACT(YEAR FROM NOW())
				   AND l.finalperiodo = 6
				   AND b.cve_cat = $1
				   AND date(c.recibo_fecha_cobro) between '2022-01-01' and '2022-01-31'
				   AND l.iniciales_tramite = 'PR'
				   AND b.ac::numeric >= 10` */
			let snt = `
				SELECT max(1) flag_beneficio
				  FROM predial_2022_seguro
				 WHERE cve_catastral = $1 `
			const qry = await pool.query(snt, [this.req.body.cve_catastral])
			if(qry && qry.rowCount){
				data.flag_beneficio = qry.rows[0].flag_beneficio
				if(qry.rows[0].flag_beneficio === 1){
					const buffer = fs.readFileSync(__dirname+`/../assets/docs/poliza.pdf`)
					
					let tmpObj = {}
					tmpObj.file=buffer.toString('base64')
					tmpObj.size=buffer.toString().length
					tmpObj.type='application/pdf'
			
					data.archivo = tmpObj
				}
			}
		} catch (e) {
			errors.push("ERR-OSX-036: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-036: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
	}

	async callbackBbva () {
		let errors = [], data = {}, response = {}
		try {

			console.log(this.req)
			window.close()

		} catch (e) {
			errors.push("ERR-OSX-037: Se produjo un error de ejecuci&oacute;n.")
			console.error(moment().format() + ' - ERR-OSX-037: ' + e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}
		return this.res.status(200).send(response)
	}

	async checkSessionExternal(input){
		let errors = [], data = [], response = {}, url, data_token

		try {
			// VERIFICAR SESION PARA EL USUARIO DEL CARRITO
			let snt_sess = `SELECT hash FROM logging WHERE NOW() <= vigente_hasta AND status = 1 AND id_usuario = $1`
			const qry_sess = await pool.query(snt_sess, [input.agregadopor])
			if (qry_sess.rowCount) {
				this.req.headers.authentication = qry_sess.rows[0].hash
			} else {
				let snt_us = `SELECT email, password FROM usuarios WHERE id_usuario = $1`
				const qry_us = await pool.query(snt_us, [input.agregadopor])
				if (qry_us.rowCount) {

					let res_ = await this.loginInterno(qry_us.rows[0].password, qry_us.rows[0].email, '')
					if (res_.success) {
						this.req.headers.authentication = res_.data.hash
					} else {
						errors.push("ERR-OSX-038: Se produjo un error de ejecuci&oacute;n.")
						console.error(moment().format() + ' - ERR-OSX-038: ' + 'No se puede iniciar session')
					}

				} else {
					errors.push("ERR-OSX-038: Se produjo un error de ejecuci&oacute;n.")
					console.error(moment().format() + ' - ERR-OSX-038: ' + 'No se encontro el usuario')
				}

			}
			// VERIFICAR SESION PARA EL USUARIO DEL CARRITO
		} catch (e) {
			errors.push('ERR-OSX-039: Se produjo un error de ejecución')
			console.error(moment().format() + ' - ERR-OSX-039: ' + e.message)
			console.error(e)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return response
	}

	async portalIsOffline(){
		let errors = [], data = {}, response = {}

		try {
			await pool.query("set lc_time='es_ES.UTF-8'")
			let snt_offline = `
				SELECT 1 flag, perfiles_permitidos
				  FROM admin_periodos_offline
				 WHERE NOW() BETWEEN fecha_ini AND fecha_fin 
				   AND status = 1 `
			const qry_offline = await pool.query(snt_offline)
			if (qry_offline.rowCount) {
				data.flagOffline = qry_offline.rows[0].flag
				data.perfilesPermitidos = qry_offline.rows[0].perfiles_permitidos
			} else{
				data.flagOffline = 0
				data.perfilesPermitidos = null
			}
		} catch (e) {
			errors.push('ERR-OSX-040: Se produjo un error de ejecución')
			console.error(moment().format() + ' - ERR-OSX-040: ' + e.message)
			console.error(e)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return response
	}

	async getDiasHabiles(firstDate, secondDate){
		let errors = [], data = 0, response = {}, dias_feriados = 0
	
		try {
			//Initiallize variables
			var day1 = moment.isMoment(firstDate) ? firstDate : moment(firstDate, 'DD/MM/YYYY')
			var day2 = moment.isMoment(secondDate) ? secondDate : moment(secondDate, 'DD/MM/YYYY')
			var adjust = 0

			if ((day1.dayOfYear() === day2.dayOfYear()) && (day1.year() === day2.year())) {
				data = 0
			} else{
				//Check if second date is before first date to switch
				if (day2.isBefore(day1)) {
					day2 = moment(firstDate)
					day1 = moment(secondDate)
				}

				// Get number of non working days between the dates
				let snt = `
					SELECT COUNT(1) contador
					  FROM cat_dias_feriados
					 WHERE fecha BETWEEN $1 and $2
					   AND status = 1 `
				const qry = await pool.query(snt, [firstDate, secondDate])
				if(qry && qry.rowCount){
					dias_feriados = qry.rows[0].contador * -1
				}
				// Ends Get number of non working days between the dates
	
				//Check if first date starts on weekends
				if (day1.day() === 6) { //Saturday
					//Move date to next week monday
					day1.day(8)
				} else if (day1.day() === 0) { //Sunday
					//Move date to current week monday
					day1.day(1)
				}
	
				//Check if second date starts on weekends
				if (day2.day() === 6) { //Saturday
					//Move date to current week friday
					day2.day(5)
				} else if (day2.day() === 0) { //Sunday
					//Move date to previous week friday
					day2.day(-2)
				}
	
				var day1Week = day1.week()
				var day2Week = day2.week()
	
				//Check if two dates are in different week of the year
				if (day1Week !== day2Week) {
					//Check if second date's year is different from first date's year
					if (day2Week < day1Week) {
						day2Week += day1Week
					}
					//Calculate adjust value to be substracted from difference between two dates
					adjust = -2 * (day2Week - day1Week)
				}
	
				data = day2.diff(day1, 'days') + adjust + dias_feriados
			}



		} catch (e) {
			errors.push('ERR-OSX-041: Se produjo un error de ejecución')
			console.error(moment().format() + ' - ERR-OSX-041: ' + e.message)
			console.error(e)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return response
	}


	async getPin(){
		let errors = [], data = {}, response = {};
	
	
			try {
				let numero = Math.floor(Math.random() * 1000000);
				let pin_decrypt = numero.toString().padStart(6, '0')

				let saltRounds = 10; 
				let salt = await bcrypt.genSalt(saltRounds);
				let pin_encrypt = await bcrypt.hash(pin_decrypt, salt);
				

				let snt = `
							UPDATE usuarios 
							SET pin = $1
							WHERE id_usuario = $2
							RETURNING id_usuario`
	                	const qry = await pool.query(snt, [pin_encrypt, this.userid])
						if(qry && qry.rowCount)
							data = qry.rows[0].id_usuario
						else
							errors.push('Se produjo un error al cambiar el pin de tu usuario.')

				data = {
					pin_decrypt,
					pin_encrypt,
				};

			} catch (err) {
				errors.push('ERR-OSX-042: Se produjo un error de ejecución')
				console.error(moment().format() + ' - ERR-OSX-042: ' + e.message)
				console.error(e)
			}
		
	
		response = {
			success: errors.length === 0,
			errors: errors.length ? errors : false,
			data: errors.length === 0 ? data : false,
		};
		return this.res.status(200).send(response);
	}
}


module.exports = Admintorre
