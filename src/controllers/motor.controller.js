'use strict'

const md5 = require('md5')
const moment = require('moment')
const pool = require('../connection')
const Admintorre = require('./admintorreclass.controller')
const fetch = require('node-fetch')

const fs = require("fs");
const axios = require("axios");
const { Dropbox } = require("dropbox");
const path = require('path');


class Motor extends Admintorre {

    tabla_estatus = false
    tabla_historial = false
    campo_llave = false
    id_status = false
    id_status_ant = false
    id_status_sig_acept = false
    id_status_sig_rech = false
    id_status_consulta = false
    func_post_avanzar = false
    func_post_avanzar_front = false
    func_post_rechazar = false
    func_post_rechazar_front = false
    func_post_retroceder = false
    func_post_retroceder_front = false
    perfiles_avanzan = false
    perfiles_rechazan = false
    perfiles_retroceden = false
    usuario_avanza = false
    usuario_rechaza = false
    usuario_retrocede = false
    func_prev_avanzar = false
    func_prev_rechazar = false
    func_prev_retroceder = false
    nombre_status_sig = false
    nombre_status_ant = false
    function_list = false
    passByUser = false
    comentUser = false
    Obj = false
    req = false
    res = false

    constructor(req, res) {
        super()

        this.req = req
        this.res = res
    }

    async deleteDocumentById () {
        let errors = [], data  = {}, response = {}

        let snt = `DELETE 
                FROM motor_documentos_x_tramite 
               WHERE id_documento_x_tramite = $1`

        const qry = await pool.query(snt, [this.req.params.id])

        if(!qry.rowCount)
            errors.push("Error al eliminar el archivo. Favor de volver a intentar.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return this.res.status(200).send(response)
    }

    async deleteDocument (tipoTramite, tipoDocumento, llave_tramite) {
        let errors = [], data  = {}, response = {}

		try{
            let snt = `
                DELETE 
                  FROM motor_documentos_x_tramite 
                 WHERE id_tipo_tramite = $1
                   AND tipo_documento = $2
                   AND llave_tramite = $3 `
            const qry = await pool.query(snt, [tipoTramite, tipoDocumento, llave_tramite])
            if(!qry){
                errors.push("Error al eliminar el archivo. Favor de volver a intentar.")
            }
        } catch(e){
			errors.push('ERR-MOT-002: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-MOT-002: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data
		}

		return response
    }

    async getContentTab () {
        if(this.req.params.id){
            let className = await this.getNameClassByProcessId(this.processid)
            if(className){
                let Controller = require('../controllers/'+className.toLowerCase()+'.controller')
                this.Obj = new Controller(this.req, this.res)
                await this.Obj.isLogin()
                eval(`this.Obj.getContentTab(this.req, this.res)`)
            }
        }
    }

    async motorControlPanel () {
        let { control } = this.req.body
        let { id } = this.req.params

        if(Object.keys(this.req.body).length && this.processid){
            let className = await this.getNameClassByProcessId(this.processid)
            let { passByUser, comentUser } = this.req.body
            this.passByUser = passByUser, this.comentUser = comentUser

            let Controller = require('../controllers/'+className.toLowerCase()+'.controller')
            this.Obj = new Controller(this.req, this.res)
            await this.Obj.isLogin()

            let res_sep = await this.setEngineParameters(this.processid, this.procedurekey)

            if(res_sep.success){
                switch(control) {
                    case 'adva':
                        this.advanceProcessor(this.req.body)
                        break;
                    case 'back':
                        this.backProcessor(this.req.body)
                        break;
                    case 'reject':
                        this.rejectProcess(this.req.body)
                        break;
                    default:
                        return this.res.status(200).send({
                            success: false,
                            errors: ["Invalid control."],
                            data: false
                        })
                        errors.push('')
                }
            }else
                return this.res.status(200).send({
                    success: false,
                    errors: res_sep.errors,
                    data: false
                })

        }else
            return this.res.status(200).send({
                success: false,
                errors: ['Missing parameters.'],
                data: false
            })

    }

    async setDocument () {
        let errors = [], response = {}

        try{
            let  llave_tramite = this.req.params.id
            let input = {}
            input.file = this.req.body.file
            input.tipoDocumento = this.req.body.tipoDocumento
            input.coments = this.req.body.coments
            
            let resDoc = await this.setDocumentMotor(input, this.processid, llave_tramite)
            response = resDoc
        } catch(e){
			errors.push('ERR-MOT-005: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-MOT-005: '+e.message)

            response = {
                success: false,
                errors: errors,
                data: false,
            }

            return this.res.status(200).send(response)
		}

        return this.res.status(200).send(response)
    }
    
    async setDocumentMotor (input, processid, llave_tramite) {
        let errors = [], data  = {}, response = {}, insert = ''

        try{
            let snt = `
                INSERT 
                  INTO motor_documentos_x_tramite (id_tipo_tramite, tipo_documento, archivo, nombre, 
                       tamanio, extencion, comentarios, agregadopor, llave_tramite, fechaagregado, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 1)
             RETURNING id_documento_x_tramite `
                
            const qry = await pool.query(snt, [processid, input.tipoDocumento, input.file.file, input.file.name, input.file.size, (input.file.type ? input.file.type : input.file.formato), input.coments, this.userid, llave_tramite])
            if(qry.rowCount)
                insert = qry.rows[0].id_documento_x_tramite
            else
                erros.push("Error al guardar el archivo. Favor de volver a intentar.")
                
                
            var docs = await  this.getDocumentos(this.processid, llave_tramite)
            var newDoc = await  this.getDocument(insert)

        } catch(e){
			errors.push('ERR-MOT-006: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-MOT-006: '+e.message)
		}

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : docs.data,
            new: errors.length ? false : newDoc.data,
        }

        return response
    }

    async document () {
        let data = await this.getDocument(this.req.params.id)
        return this.res.status(200).send(data)
    }

    async getDocument (id) {
        let errors = [], data  = {}, response = {}

        let snt = `
            SELECT mdt.*,
                   (SELECT nombre FROM cat_tipos_documento WHERE id_tipo_documento = mdt.tipo_documento) AS nombre_tipo,
                   (fechaagregado > '2022-11-11') is_new, migrado
              FROM motor_documentos_x_tramite mdt
             WHERE id_documento_x_tramite = $1 `
        const qry = await pool.query(snt, [id])
        if(qry.rowCount){
            data = qry.rows[0]
            if(data.archivo){
                data.archivo = data.archivo.toString()
                console.log(data.link_dropbox)
                /* if(qry.rows[0].is_new || qry.rows[0].migrado){
                    // despues de la migracion
                }  */
            } else {
                // antes de la migracion
                if(!qry.rows[0].migrado){
                    // TRAER EL DOCUMENTO POR WS
                    let url = "https://elmarques.traslanet.com/apiMigraTraslanet3/traslado/trasladoDocumentos.php";
                    let parametros = {
                        "idTrasladoDocumento" : id,
                    }
                    console.log(parametros);
                    try{
                        const resWsDocumentos = await fetch(url, {
                            method: 'POST',
                            body: JSON.stringify(parametros),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        
                        let res_ws = await resWsDocumentos.json()
                        if(res_ws.ARCHIVO){
                            let sntUpd = `
                                UPDATE motor_documentos_x_tramite
                                    SET archivo = $1,
                                        migrado = true
                                    WHERE id_documento_x_tramite = $2 `
                            const qryUpd = await pool.query(sntUpd, [res_ws.ARCHIVO, id])
                            data.archivo = res_ws.ARCHIVO
                        } else {
                            data.archivo = null
                        }
                    } catch(e){
                        data.archivo = null
                        console.error("ERR-MOT-007: Se produjo un error de ejecución" + e.message)
                    }
                }
            }
        }else
            errors.push("Error al consultar documento. Favor de volver a intentar.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response

    }

    async getDocumentos (tipoTramite, llave_tramite) {
        let errors = [], data  = {}, response = {}

        let snt = `SELECT id_documento_x_tramite, id_tipo_tramite, tipo_documento, nombre, tipo, tamanio, 
                extencion, comentarios, agregadopor, to_char(fechaagregado, 'DD/MM/YYYY') AS fechaagregado, status, llave_tramite,
                (SELECT nombre FROM cat_tipos_documento WHERE id_tipo_documento = mdt.tipo_documento) AS nombre_tipo
                FROM motor_documentos_x_tramite mdt
                WHERE id_tipo_tramite = $1 AND llave_tramite = $2`

        const qry = await pool.query(snt, [tipoTramite, llave_tramite])
        if(qry)
            data = qry.rows
        else
            errors.push("Error al consultar tabla de documentos. Favor de volver a intentar.")

        response =  {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
            function: "motor.listDocuments"
        }
        return response
    }

    async notes() {
        let errors = [], data  = {}
        let { id } = this.req.params

        let arrid = id.split("_")

        if(arrid[0] && arrid[1]){

            let res_gn = await this.getNotes(arrid[0], arrid[1])
            if(res_gn.success)
                data = res_gn.data
            else
                errors.push(res_gn.errors)

        }else
            errors.push("No se recibieron los datos necesarios.")

        return this.res.status(200).send({
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        })
    }

    async getNotes(processid, procedureKey) {
        let errors = [], data  = {}, response = {}

        if(processid && procedureKey){

            let snt = `SELECT nota AS note, to_char(fechaagregado, 'dd/mm/yyyy') AS date, 
            (SELECT nombre_completo FROM usuarios WHERE id_usuario = mn.agregadopor) AS author
            FROM motor_notas mn WHERE id_tipo_tramite = $1 AND llave_tramite = $2 ORDER BY id_nota DESC`;
            const qry = await pool.query(snt, [processid, procedureKey])
            if(qry){
                data = qry.rows
            }else
                errors.push("Error consulting processor table.")

        }else
            errors.push("No se recibieron los datos necesarios.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }

        return response
    }

    async saveNotes() {
        let errors = [], data  = {}
        let { note, procedureKey, processid } = this.req.body

        if(note){
            let snt = `INSERT INTO motor_notas (llave_tramite, id_tipo_tramite, nota, agregadopor)
                        VALUES
                        ($1, $2, $3, $4)`

            const qry = await pool.query(snt, [procedureKey, processid, note, this.userid])
            if(qry.rowCount){
                let res_gn = await this.getNotes(processid, procedureKey)
                if(res_gn.success)
                    data = res_gn.data
                else
                    errors.push(res_gn.errors)
            }else
                errors.push("Error al guardar la nota. Favor de volver a intentar.")
        }else
            errors.push("Debe escribir una nota para poder continuar. Favor de volver a intentar.")


        return this.res.status(200).send({
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        })
    }

    async getRecord() {
        let errors = [], data  = {}
        let { id } = this.req.params

        let arrid = id.split("_")

        if(arrid[0] && arrid[1]){
            let res_sep = await this.setEngineParameters(arrid[0], arrid[1])
            if(res_sep.success){
                let snt = `SELECT ts.estatus AS status, 
                        (SELECT MAX(id_status) FROM ${this.tabla_historial} WHERE status=1 and id_status = ts.id_status AND ${this.campo_llave} = ${this.procedurekey}) AS complete,
                        (SELECT to_char(MAX(fechaagregado), 'dd/mm/yyyy') FROM ${this.tabla_historial} WHERE status=1 and id_status = ts.id_status AND ${this.campo_llave} = ${this.procedurekey}) AS date,
                        (SELECT nombre_completo FROM usuarios WHERE ID_USUARIO = (SELECT MAX(agregadopor) FROM ${this.tabla_historial} WHERE id_status = ts.id_status AND ${this.campo_llave} = ${this.procedurekey})) AS author
                        FROM ${this.tabla_estatus} ts
                        WHERE exists (select 1 from cat_flujos_det where id_status=ts.id_status and id_flujo = (select id_flujo from cat_flujos_x_tipotram where id_tipotram=${this.processid}))
                          AND ts.status=1 and orden IS NOT NULL ORDER BY orden `;
                const qry = await pool.query(snt)
                if(qry)
                    data.criticalRoute = qry.rows;
                else
                    errors.push("Error consulting processor table.")

                let snt_his = `SELECT comentario AS coment, to_char(fechaagregado, 'dd/mm/yyyy') AS date,
                        (SELECT nombre_completo FROM usuarios WHERE id_usuario = th.agregadopor) AS author,
                        (SELECT estatus FROM ${this.tabla_estatus} WHERE id_status = th.id_status) AS status,
                        (SELECT class_icon FROM ${this.tabla_estatus} WHERE id_status = th.id_status) AS classIcon
                        FROM ${this.tabla_historial} th WHERE status=1 and  ${this.campo_llave} = ${this.procedurekey} ORDER BY id_historial DESC`;
                const qry_his = await pool.query(snt_his)
                if(qry_his)
                    data.record = qry_his.rows;
                else
                    errors.push("Error consulting processor table.")

            }else
                errors.push(res_sep.errors)
        }else
            errors.push("No se recibieron los datos necesarios.")

        return this.res.status(200).send({
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        })
    }

    async rejectProcess(input) {
        let validate = await this.validatePass()

        if(validate.success){
            if(this.id_status_sig_rech){

                if(this.usuario_rechaza){

                    if(this.usuario_rechaza == this.userid){
                        
                        if(this.func_prev_rechazar){
                            let this_class = this
                            eval(`this.Obj.${this.func_prev_rechazar}(function(res_callback){
                                if(res_callback.success)
                                    this_class.applyAction("adva", res_callback.data)
                                else{
                                    return this_class.res.status(200).send({
                                        success: false,
                                        errors: res_callback.errors,
                                        data: false,
                                    })
                                }
                            })`)
                        }
                        else
                            this.applyAction('reject');
                        
                    }else
                        return this.res.status(200).send({
                            success: false,
                            errors: ['Su usuario no tiene permiso para rechazar este tr&aacute;mite.'],
                            data: false
                        })
                
                }else{

                    let arr_perf = this.perfiles_rechazan.split(",")

                    if(arr_perf.includes(String(this.usertype))){

                        if(this.func_prev_rechazar){

                            let this_class = this
                            eval(`this.Obj.${this.func_prev_rechazar}(function(res_callback){
                                if(res_callback.success)
                                    this_class.applyAction("adva", res_callback.data)
                                else{
                                    return this_class.res.status(200).send({
                                        success: false,
                                        errors: res_callback.errors,
                                        data: false,
                                    })
                                }
                            })`)

                        }else
                            this.applyAction("reject");

                    }else
                        return this.res.status(200).send({
                            success: false,
                            errors: ["Su perfil no tiene permiso para rechazar este tr&aacute;mite."],
                            data: false
                        })
                }

            }else
                return this.res.status(200).send({
                    success: false,
                    errors: ["No se puede rechazar este tr&aacute;mite debido a que no existe un estatus para rechazo."],
                    data: false
                })
        }else
            return this.res.status(200).send({
                success: false,
                errors: validate.errors,
                data: false
            })
    }

    async backProcessor(input) {
        let validate = await this.validatePass()

        if(validate.success){
            if(this.id_status_ant){

                if(this.usuario_retrocede){

                    if(this.usuario_retrocede == this.userid){
                        
                        if(this.func_prev_retroceder){
                            let this_class = this
                            eval(`this.Obj.${this.func_prev_retroceder}(function(res_callback){
                                if(res_callback.success)
                                    this_class.applyAction("adva", res_callback.data)
                                else{
                                    return this_class.res.status(200).send({
                                        success: false,
                                        errors: res_callback.errors,
                                        data: false,
                                    })
                                }
                            })`)
                        }
                        else
                            this.applyAction('back');
                        
                    }else
                        return this.res.status(200).send({
                            success: false,
                            errors: ['Su usuario no tiene permiso para retroceder este tr&aacute;mite.'],
                            data: false
                        })
                
                }else{

                    let arr_perf = this.perfiles_retroceden.split(",")

                    if(arr_perf.includes(String(this.usertype))){

                        if(this.func_prev_retroceder){

                            let this_class = this
                            eval(`this.Obj.${this.func_prev_retroceder}(function(res_callback){
                                if(res_callback.success)
                                    this_class.applyAction("adva", res_callback.data)
                                else{
                                    return this_class.res.status(200).send({
                                        success: false,
                                        errors: res_callback.errors,
                                        data: false,
                                    })
                                }
                            })`)

                        }else
                            this.applyAction("back");

                    }else
                        return this.res.status(200).send({
                            success: false,
                            errors: ["Su perfil no tiene permiso para retroceder este tr&aacute;mite."],
                            data: false
                        })
                }

            }else
                return this.res.status(200).send({
                    success: false,
                    errors: ["No se puede retroceder este tr&aacute;mite debido a que se encuentra en su estatus inicial."],
                    data: false
                })
        }else
            return this.res.status(200).send({
                success: false,
                errors: validate.errors,
                data: false
            })
    }

    async validatePass() {
        let errors = [], data  = {}, response = {}

        if(this.passByUser && this.comentUser){
            let snt = "SELECT password FROM usuarios WHERE id_usuario = $1"
            const qry = await pool.query(snt, [this.userid])
            if(qry.rowCount){
                if(qry.rows[0].password != md5(this.passByUser))
                    errors.push("La contraseña es incorrecta. Favor de volver a intentar.")
            }else
                errors.push("Error al consultar tabla de usuarios. Favor de volver a intentar.")
        }else
            errors.push("El comentario y la contrase&ntilde;a son obligatorias. Favor de volver a intentar.")

        return {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
    }

    async advanceProcessor(input) {
        if(this.id_status_sig_acept){
        
            if(this.usuario_avanza){

                if(this.usuario_avanza == this.userid){
                    
                    if(this.func_prev_avanzar){
                       let this_class = this
                        eval(`this.Obj.${this.func_prev_avanzar}(function(res_callback){
                            if(res_callback.success)
                                this_class.applyAction("adva", res_callback.data)
                            else{
                                return this_class.res.status(200).send({
                                    success: false,
                                    errors: res_callback.errors,
                                    data: false,
                                })
                            }
                        })`)
                    }
                    else
                        this.applyAction("adva")
                    
                }else
                    return this.res.status(200).send({
                        success: false,
                        errors: ['Su usuario no tiene permiso para avanzar este tr&aacute;mite.'],
                        data: false
                    })
            
            }else{

                let arr_perf = this.perfiles_avanzan.split(",")

                if(arr_perf.includes(String(this.usertype))){

                    if(this.func_prev_avanzar){
                        let this_class = this
                        eval(`this.Obj.${this.func_prev_avanzar}(function(res_callback){
                            if(res_callback.success)
                                this_class.applyAction("adva", res_callback.data)
                            else{
                                return this_class.res.status(200).send({
                                    success: false,
                                    errors: res_callback.errors,
                                    data: false,
                                })
                            }
                        })`)
                    }
                    else
                        this.applyAction("adva")

                }else
                    return this.res.status(200).send({
                        success: false,
                        errors: ['Su perfil no tiene permiso para avanzar este tr&aacute;mite.'],
                        data: false
                    })

            }

        }else
            return this.res.status(200).send({
                success: false,
                errors: ['No se puede avanzar este trámite debido a que no existe un estatus para avance.'],
                data: false
            })

    }

    async applyAction(control, input) {
        let coment = false, stat_hist = false, function_post = false, func_post_front = false, resp_func_post = {}

        if(control){

            switch(control)
            {
                case "adva"://avanzar
                    coment = "Expediente enviado a siguiente estatus por el usuario "+this.username+"."
                    stat_hist = this.id_status_sig_acept
                    function_post = this.func_post_avanzar
                    func_post_front = this.func_post_avanzar_front
                    break
                case "back"://retroceder
                    coment = "Expediente retrocedido por el usuario "+this.username+". "+this.comentUser+"."
                    stat_hist = this.id_status_ant
                    function_post = this.func_post_retroceder
                    func_post_front = this.func_post_retroceder_front
                    break
                case "reject"://rechazar
                    coment = "Correcci&oacuten solicitada por el usuario "+this.username+". "+this.comentUser+"."
                    stat_hist = this.id_status_sig_rech
                    function_post = this.func_post_rechazar
                    func_post_front = this.func_post_rechazar_front
                    break;
            }

            if(await this.insertaHistorial(this.procedurekey, stat_hist, coment, this.userid, this.tabla_historial, this.campo_llave)){
                let res_send_mail = await this.sendMailStatus(stat_hist, coment)

                if (res_send_mail.success) {
                    if (function_post) {
                        let this_class = this
                        eval(`this.Obj.${function_post}((resp_func_post)=>{
                            if(resp_func_post.success){
                                this_class.getListByObj(func_post_front)
                            }else
                                return this_class.res.status(200).send({
                                    success: false,
                                    errors: resp_func_post.errors,
                                    data: false
                                })
                        })`)
                    } else
                        this.getListByObj(func_post_front)

                } else
                    return this.res.status(200).send({
                        success: false,
                        errors: res_send_mail.errors,
                        data: false
                    })

            }else
                return this.res.status(200).send({
                    success: false,
                    errors: ['Error al insertar en la tabla de Historial. Favor de volver a intentar.'],
                    data: false
                })


        }else
            return this.res.status(200).send({
                success: false,
                errors: ['Internal error: Missing parameters.'],
                data: false
            })
    }

    async sendMailStatus(status, coment) {
        let errors = [], response = {}

        if (status && coment) {

            let snt = `SELECT notificar_x_correo FROM cat_flujos_det WHERE status = 1 AND id_status = $1 AND id_flujo = (SELECT id_flujo FROM cat_flujos_x_tipotram WHERE id_tipotram = $2)`
            const qry = await pool.query(snt, [status, this.processid])
            if (qry.rowCount) {

                if (qry.rows[0].notificar_x_correo) {

                    let snt_2 = `SELECT email FROM usuarios WHERE status = 1 AND id_usuario = 
                                (SELECT agregadopor FROM ${this.tabla_historial} 
                                WHERE ${this.campo_llave} = $1 ORDER BY fechaagregado, id_historial LIMIT 1)`
                    const qry_2 = await pool.query(snt_2, [this.procedurekey])

                    if (qry_2.rowCount)
                        this.sendmail(qry_2.rows[0].email, 'Notificación de Trámite - Portal Trasla@net', coment)

                    else
                        errors.push("No se encontro el informacion del usuario a notificar.")

                }

            } else
                console.error("El estatus al que se desea enviar no tiene registro el la tabla de flujos.")

        } else
            errors.push("No se recibieron los datos necesarios para notificar mediante email.")


        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false
        }

        return response
    }

    async getListByObj(func_post_front) {
        let errors = [], data  = {}, response = {}

        let reslist = await this.Obj.getList(this.procedurekey)

        if(reslist.success)
            data = reslist.data
        else
            errors.push(reslist.errors)

        return this.res.status(200).send({
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data[0],
            function: func_post_front ? func_post_front : false
        })
    }

    async setEngineParameters(processid, procedurekey) {
        let errors = [], data  = {}, response = {}

        if(processid && procedurekey){

            let  arr_tables = await this.getTablesByProcessorId(processid)
            if(arr_tables.length){

                let { tabla_estatus, tabla_historial, campo_llave } = arr_tables[0]
                this.tabla_estatus = tabla_estatus, this.tabla_historial = tabla_historial, this.campo_llave = campo_llave

                let lastStatus = await this.getLastStatusProcedure(procedurekey, this.tabla_historial, this.campo_llave)
                
                let snt = `SELECT fd.id_status, fd.id_status_ant, fd.id_status_sig_acept, fd.id_status_sig_rech, fd.id_status_consulta, 
                               fd.func_post_avanzar, fd.func_post_rechazar, fd.func_post_retroceder, fd.perfiles_avanzan, fd.perfiles_rechazan, 
                               fd.perfiles_retroceden, fd.usuario_avanza, fd.usuario_rechaza, fd.usuario_retrocede, 
                               fd.func_prev_avanzar, fd.func_prev_rechazar, fd.func_prev_retroceder,func_post_avanzar_front,func_post_rechazar_front,func_post_retroceder_front,
                               COALESCE((SELECT estatus FROM ${this.tabla_estatus} WHERE id_status=fd.id_status_sig_acept),'sin estatus') nombre_status_sig,
                               COALESCE((SELECT estatus FROM ${this.tabla_estatus} WHERE id_status=fd.id_status_sig_rech),'sin estatus') nombre_status_ant,
                               (SELECT funcion_crea_lista FROM motor_tramites_lista WHERE id_tipo_tramite = $1) as function_list
                          FROM cat_flujos_x_tipotram fxt, cat_flujos_det fd
                         WHERE fxt.id_flujo = fd.id_flujo
                           AND fd.id_status = $2
                           AND fxt.id_tipotram = $1
                           AND fd.status = 1`
                const qry = await pool.query(snt, [processid, lastStatus])
                if(qry.rowCount){

                    this.id_status = qry.rows[0].id_status
                    this.id_status_ant = qry.rows[0].id_status_ant
                    this.id_status_sig_acept = qry.rows[0].id_status_sig_acept
                    this.id_status_sig_rech = qry.rows[0].id_status_sig_rech
                    this.id_status_consulta = qry.rows[0].id_status_consulta
                    this.func_post_avanzar = qry.rows[0].func_post_avanzar
                    this.func_post_avanzar_front = qry.rows[0].func_post_avanzar_front
                    this.func_post_rechazar = qry.rows[0].func_post_rechazar
                    this.func_post_rechazar_front = qry.rows[0].func_post_rechazar_front
                    this.func_post_retroceder = qry.rows[0].func_post_retroceder
                    this.func_post_retroceder_front = qry.rows[0].func_post_retroceder_front
                    this.perfiles_avanzan = qry.rows[0].perfiles_avanzan
                    this.perfiles_rechazan = qry.rows[0].perfiles_rechazan
                    this.perfiles_retroceden = qry.rows[0].perfiles_retroceden
                    this.usuario_avanza = qry.rows[0].usuario_avanza
                    this.usuario_rechaza = qry.rows[0].usuario_rechaza
                    this.usuario_retrocede = qry.rows[0].usuario_retrocede
                    this.func_prev_avanzar = qry.rows[0].func_prev_avanzar
                    this.func_prev_rechazar = qry.rows[0].func_prev_rechazar
                    this.func_prev_retroceder = qry.rows[0].func_prev_retroceder
                    this.nombre_status_sig = qry.rows[0].nombre_status_sig
                    this.nombre_status_ant = qry.rows[0].nombre_status_ant
                    this.function_list = qry.rows[0].function_list
                }else
                    errors.push("No existen flujos para este tipo de tramite.")

            }else
                errors.push("Error consulting processor table.")

        }else
            errors.push("Missing process id.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response
    }

    async getLastStatusProcedure (procedureKey, tablaHistorial, campoLlave) {

        if(procedureKey && tablaHistorial && campoLlave){
            let snt = `SELECT id_status FROM ${tablaHistorial}
                WHERE ${campoLlave} = $1 ORDER BY fechaagregado DESC LIMIT 1`
            const qry = await pool.query(snt, [procedureKey])
            if(qry.rowCount)
                return qry.rows[0].id_status
            
        }

        return false;

    }

    async getTablesByProcessorId (processid) {
        if(processid){
            let snt = `SELECT tabla_estatus, tabla_historial, campo_llave
                   FROM cat_flujos_x_tipotram fxt, cat_flujos f
                  WHERE fxt.id_flujo = f.id_flujo
                    AND fxt.id_tipotram = $1
                    AND f.status = 1`;
            const qry = await pool.query(snt, [processid])
            if(qry.rowCount)
                return qry.rows
        }

        return false;
    }

    async saveTabs () {
        let errors = [], data = {}, response = {}, response_tab = {}

        let processid = this.req.body.processid
        
        if(processid){
            let className = await this.getNameClassByProcessId(processid)
            if(className){
                const Controller = require('../controllers/'+className.toLowerCase()+'.controller')
                let Obj = new Controller(this.req, this.res)
                await Obj.isLogin()
                response_tab = await Obj.setTabs(this.req.body)

                if(response_tab.success){
                    let res_sjftv = await this.setJsonFormTabValues(this.req.body, response_tab.data)
                    if(res_sjftv.success){
                        let reslist = await Obj.getList(response_tab.data)
                        data = reslist.data[0]
                    }else
                        errors.push(res_sjftv.errors.join("<br />"))
                }else
                    errors.push(response_tab.errors.join("<br />"))
            }
        }else
            errors.push("No se recibieron los datos necesarios.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }

        if ('function' in response_tab && response_tab.function)
            response.function = response_tab.function

        return this.res.status(200).send(response)
        
    }

    async setJsonFormTabValues (input, id_tramite) {
        let errors = [], data  = {}, response = {}
        let { processid, id_motor_tramites_tabs, fields } = input

        if(Object.keys(input).length){
            let snt = `INSERT INTO motor_json_form_values (id_tramite, id_llave_tramite, id_tramites_tabs, values, agregadopor)
                        VALUES ($1, $2, $3, $4, $5) RETURNING id_json_form_values`
            const qry = await pool.query(snt, [processid, id_tramite, id_motor_tramites_tabs, fields, this.userid])
            if(!qry.rowCount)
                errors.push('Error al insertar en tabla "motor_json_form_values".')

        }else
            errors.push("No data received.")

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response
    }

    async getNameClassByProcessId (processid) {
        if(processid){
            let snt = "SELECT class_name FROM cat_tipo_tramites WHERE id_tipo_tramite = $1";
            const qry = await pool.query(snt, [processid])
            if(qry.rows.length)
                return qry.rows[0].class_name

        }

        return false;
    }

    async getTabs () {
        let errors = [], data = {}, response = {}, res_status_consulta = {}, bet_status = {}, list = false
        let id = (this.req.params.id && this.req.params.id != undefined && this.req.params.id != 'undefined') ? this.req.params.id : 0

        try{
            if(this.processid){

                if (id)
                    res_status_consulta = await this.setStatusConsulta()
                else
                    res_status_consulta.success = true

                if (res_status_consulta.success){

                    let snt = `SELECT mtt.id_motor_tramites_tabs, mjf.id_json_form, mjf.schema,mjf.form, mtt.id_motor_tramites_tabs AS tabId, mtt.nombre AS title,
                                    mtt.url AS  target, mtt.always_refresh AS  refresh, refresh_on_save AS refreshall, mtt.visible_para,
                                (SELECT nombre FROM cat_tipo_tramites WHERE id_tipo_tramite = $1) AS nombretramite,
                                f_motor_get_ultimo_status($1, $2) AS ultimo_status,
                                f_motor_get_ultimo_status_txt($1, $2) AS ultimo_status_txt,
                                function_check_perms,
                                (SELECT tabla_estatus FROM cat_flujos WHERE id_flujo = 
                                (SELECT id_flujo FROM cat_flujos_x_tipotram WHERE id_tipotram = $1 AND status = 1)) AS tabla_estatus,
                                (SELECT values FROM motor_json_form_values WHERE id_tramite = $1 AND id_llave_tramite = $2 
                                AND id_tramites_tabs = mtt.id_motor_tramites_tabs ORDER BY fechaagregado DESC LIMIT 1) AS values,
                                (SELECT class_name FROM cat_tipo_tramites WHERE id_tipo_tramite = $1) AS name_class
                            FROM motor_tramites_tabs mtt 
                            LEFT JOIN motor_json_form mjf ON mjf.id_json_form = mtt.id_json_form
                            WHERE id_tipo_tramite = $1 AND mtt.status = 1 ORDER BY orden`
                    
                    const qry = await pool.query(snt, [this.processid, id])
                    if(qry.rows.length){

                        if (id)
                            bet_status = await this.getBetweenStatus(qry.rows[0].ultimo_status, qry.rows[0].tabla_estatus)
                        else
                            bet_status.success = true

                        if (bet_status.success) {
                            let tabs = await this.getCatalogo(qry.rows)

                            data.tabs = []

                            for (let i in qry.rows) {
                                let visiblepara = qry.rows[i].visible_para.split(',').map(userid => parseInt(userid))

                                if (visiblepara.includes(this.usertype)) {
                                    data.tabs.push(qry.rows[i])
                                }
                            }

                            if(id){
                                const Controller = require('../controllers/'+qry.rows[0].name_class.toLowerCase()+'.controller')
                                let Obj = new Controller(this.req, this.res)
                                await Obj.isLogin()
                                list = await Obj.getList(this.procedurekey)
                            }

                            data.nombreTramite = qry.rows[0].nombretramite
                            data.idTramite = id
                            data.ultimo_status = qry.rows[0].ultimo_status
                            data.ultimo_status_txt = qry.rows[0].ultimo_status_txt
                            data.between_status = bet_status.data
                            data.data_list = list ? list.data[0] : false

                        }else
                            errors = errors.concat(bet_status.errors)

                    }else
                        errors.push("Error al consultar tabs.")

                }else
                    errors = errors.concat(res_status_consulta.errors)

            }else
                errors.push("No data received.")
        } catch(e){
			errors.push('ERR-MOT-009: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-MOT-009: '+e.message)
			console.error(e)
		}

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return this.res.status(200).send(response)
    }

    async getBetweenStatus(ult_status, tabla_estatus) {
        let errors = [], data = {}, response = {}

        let snt = `SELECT id_status_ant, id_status_sig_acept, id_status_sig_rech,
                COALESCE((SELECT estatus FROM ${this.tabla_estatus} WHERE id_status = cfd.id_status_ant),'sin estatus') AS txt_status_ant,
                COALESCE((SELECT estatus FROM ${this.tabla_estatus} WHERE id_status = cfd.id_status_sig_acept),'sin estatus') AS txt_status_sig_acept,
                COALESCE((SELECT estatus FROM ${this.tabla_estatus} WHERE id_status = cfd.id_status_sig_rech),'sin estatus') AS txt_status_sig_rech,
                icono_avanzar, icono_rechazar, icono_retroceder,
                titulo_avanzar, titulo_rechazar, titulo_retroceder
                FROM cat_flujos_det cfd WHERE id_status = $1 AND id_flujo = 
                (SELECT id_flujo FROM cat_flujos_x_tipotram WHERE id_tipotram = $2 AND status = 1) AND status = 1`

        const qry = await pool.query(snt, [ult_status, this.processid])

        if (qry.rowCount)
            data = qry.rows[0]
        else
            errors.push(`No se encontro informacion de flujos.`)

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response
    }

    async setStatusConsulta() {
        let errors = [], data = {}, response = {}

        let res_sep = await this.setEngineParameters(this.processid, this.procedurekey)
        if (res_sep.success){

            if (this.id_status_consulta){
                if (this.usuario_avanza) {
                    
                    if (this.usuario_avanza == this.userid) {
                        let resHistorial = await this.insertaHistorial(this.procedurekey, this.id_status_consulta, "TRÁMITE AVANZADO AL CONSULTAR.", this.userid, this.tabla_historial, this.campo_llave)
                        if (!resHistorial.success)
                            errors.push("Se produjo un error al almacenar los datos del historial. Favor de intentar nuevamente.")
                    }

                }else{
                    let arr_perf = this.perfiles_avanzan.split(",")

                    if (arr_perf.includes(String(this.usertype))) {

                        let resHistorial = await this.insertaHistorial(this.procedurekey, this.id_status_consulta, "TRÁMITE AVANZADO AL CONSULTAR.", this.userid, this.tabla_historial, this.campo_llave)
                        if (!resHistorial.success)
                            errors.push("Se produjo un error al almacenar los datos del historial. Favor de intentar nuevamente.")

                    }
                }
            }

        }else
            errors = errors.concat(res_sep.errors)

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response
    }

    async getCatalogo (tabs) {
        let errors = [], data  = [], response = {}

        for(let key  in tabs){
            if(tabs[key].schema && tabs[key].form){
                let schema = tabs[key].schema.schema
                for(let ks in tabs[key].schema.schema){
                    if(tabs[key].schema.schema[ks].type == "osx_select"){
                        let {table, descr, value, where} = tabs[key].schema.schema[ks]
                        let res = await this.fillCombo(value, descr, table, where, '')
                        if(res.success)
                            tabs[key].schema.schema[ks].options = res.data
                        
                    }
                }
            }
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }
        return response
    }

	async getTitlesList () {
		let errors = [], data  = {}, response = {}
		let { id } = this.req.params

		if(id){

			let snt = `SELECT * FROM motor_tramites_lista WHERE id_tipo_tramite = $1`
			const qry = await pool.query(snt, [id])
            if(qry.rows.length){
                data.title = qry.rows[0].titulo
                data.titleBtnNew = qry.rows[0].titulo_boton_nuevo
                data.titleList = qry.rows[0].titulo_lista

            }else
                errors.push("Error consulting table titles.")

        }else
            errors.push("No data received.")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

	async motorList () {
		let errors = [], data  = {}, response = {}, columns = [], actions = []

		if(this.processid){

            let snt = `SELECT titulo_columna, nombre_columna, mtc.class_name as alineacion, ancho_inicial,
                    (SELECT funcion_crea_lista FROM motor_tramites_lista WHERE id_tipo_tramite = $1) AS func_list,
                    (SELECT class_name FROM cat_tipo_tramites WHERE id_tipo_tramite = $1) AS class_name
                    FROM motor_tramites_columnas mtc WHERE id_motor_tramites_lista = (
                    SELECT id_motor_tramites_lista FROM motor_tramites_lista WHERE id_tipo_tramite = $1) AND status = 1 ORDER BY orden`
            const qry = await pool.query(snt, [this.processid])

            if(qry){
            	let { funcList, className } = false

            	for(let key in qry.rows) {
                    let column = {}
                    column.title = qry.rows[key].titulo_columna
                    column.data = qry.rows[key].nombre_columna
                    column.className = qry.rows[key].alineacion

                    if(!funcList && !className){
                        funcList = qry.rows[key].func_list
                        className = qry.rows[key].class_name
                    }
                    columns.push(column)
                }

                if(columns.length)
                    data.columns = columns
                else
                    errors.push("Error creating columns list.")

                let sntact = `SELECT titulo, clase, nombre_funcion, class_color
                        FROM motor_acciones_lista WHERE id_motor_tramites_lista = (
                        SELECT id_motor_tramites_lista FROM motor_tramites_lista WHERE id_tipo_tramite = $1) AND STATUS = 1 ORDER BY orden`
                const qryact = await pool.query(sntact, [this.processid])
                if(qryact){
                    for(let keyact in qryact.rows){
                        var action = {}
                        action.title = qryact.rows[keyact].titulo
                        action.class = qryact.rows[keyact].clase
                        action.function = qryact.rows[keyact].nombre_funcion
                        action.classColor = qryact.rows[keyact].class_color
                        actions.push(action)
                    }
                }else
                    errors.push("Error consulting actions table.")

                if(actions.length)
                    data.actions = actions

                const Controller = require('../controllers/'+className.toLowerCase()+'.controller')
                let Obj = new Controller(this.req, this.res)
                await Obj.isLogin()
                let list = await Obj.getList()

                if(list.success)
                    data['data'] = list.data
                else
                    errors.push(list.errors.join("<br />"))
                
            }else
                errors.push("Error consulting processor table.")

        }else
            errors.push("No data received.")

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}
		return this.res.status(200).send(response)
	}

    async getDocumentosObligatorios () {
        let errors = [], data  = [], response = {}

        try{
            let snt = `
                SELECT documento
                  FROM vw_cat_documentos_x_tramite
                 WHERE id_tipo_tramite = $1
                   AND obligatorio = 1 `
            const qry = await pool.query(snt, [this.processid])

            if(qry && qry.rowCount)
                data = qry.rows
            else
                errors.push("Error al consultar los documentos obligatorios. Favor de volver a intentar.")
		} catch(e){
			errors.push('ERR-MOT-008: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-MOT-008: '+e.message)
			console.error(e)
		}
        response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
    }


    //función para acceder a las variables del .env y gener un token dinamico para no limitar el tiempo de uso de la api
    async  getAccessToken() {
        try {
            const response = await axios.post("https://api.dropbox.com/oauth2/token", null, {
                params: {
                    grant_type: "refresh_token",
                    refresh_token: process.env.REFRESH_TOKEN,
                    client_id: process.env.APP_KEY,
                    client_secret: process.env.APP_SECRET
                }
            });
            return response.data.access_token;
        } catch (error) {
            console.error("Error obteniendo access_token:", error.response ? error.response.data : error.message);
            throw new Error("No se pudo obtener un nuevo access_token.");
        }
    }

    async uploadFile(req, res) {
        if (!req.files || !req.files.file) {
            console.log("No se recibió ningún archivo.");
            return res.status(400).json({ message: "No se ha recibido ningún archivo" });
        }
    
        let file = req.files.file;
        let originalName = path.parse(file.name).name;
        let extension = path.extname(file.name);
        let targetPath = path.join(__dirname, "..", "uploads", file.name);
        
        file.mv(targetPath, async (err) => {
            if (err) {
                console.error("Error al mover el archivo:", err);
                return res.status(500).json({ message: "Error al mover el archivo", error: err });
            }
    
            try {
                //tomar el accesstoken del .env para acceder a la api 
                const accessToken = await this.getAccessToken();
                const dbx = new Dropbox({ accessToken });
                let fileContent = fs.readFileSync(targetPath);
                let fileName = file.name;
                let dropboxPath = `/archivos_subidos/${fileName}`;
                let counter = 1;
    
                //mientras exista el archivo renombrara el nombre del archivo para poder almacenar folios repetidos
                while (await this.fileExistsInDropbox(dbx, dropboxPath)) {
                    fileName = `${originalName}_${counter}${extension}`;
                    dropboxPath = `/archivos_subidos/${fileName}`;
                    counter++;
                }
    
                const uploadResponse = await dbx.filesUpload({
                    path: dropboxPath,
                    contents: fileContent,
                    mode: "add"
                });
    
                const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
                    path: uploadResponse.result.path_display,
                });
    
                const sharedLink = sharedLinkResponse.result.url.replace('?dl=0', '?raw=1');
                console.log("Archivo subido a Dropbox. Enlace compartido:", sharedLink);
                fs.unlinkSync(targetPath);
    
                res.json({ message: "Archivo subido correctamente", sharedLink, fileName });
            } catch (error) {
                console.error("Error al subir el archivo a Dropbox:", error);
                res.status(500).json({ message: "Error al subir archivo a Dropbox", error });
            }
        });
    }
    
    //función para verificar si existe el archivo en dropbox
    async fileExistsInDropbox(dbx, filePath) {
        try {
            //Metodo filesGetMetadata sirve para traer la metadata de los arhcivos que hay subidos en la carpeta
            await dbx.filesGetMetadata({ path: filePath });
            return true;
        } catch (error) {
            if (error.status === 409) {
                return false;
            }
            throw error;
        }
    }


    async dropboxLink() {
        let errors = [], data = [], response = {}, obj = this.req.body, link_dropbox, archivoDescargado = null;
            
        try {
            link_dropbox = obj.link_dropbox;
            let uploadsDir = path.join(__dirname, "..", "tempo");
        
            let downloadUrl = link_dropbox.replace('dl=0', 'dl=1');
            let urlObj = new URL(link_dropbox);
            let fileName = path.basename(urlObj.pathname);
            archivoDescargado = path.join(uploadsDir, fileName);

        
            let writer = fs.createWriteStream(archivoDescargado);
            let axiosResponse = await axios({
                method: 'get',
                url: downloadUrl,
                responseType: 'stream'
            });
        
            axiosResponse.data.pipe(writer);
        
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
        
            let fileStats = fs.statSync(archivoDescargado);
            let fileBuffer = fs.readFileSync(archivoDescargado);
            let base64Encoded = fileBuffer.toString('base64');
        
            data.push({
                original_link: link_dropbox,
                file_name: fileName,
                file_size: fileStats.size,
                base64: base64Encoded 
            });
            fs.unlinkSync(archivoDescargado);
        
        } catch (e) {
            errors.push('ERR-TA-023: Error al descargar o convertir el archivo a Base64');
            console.error(`${new Date().toISOString()} - ERR-TA-023: ${e.message}`);
        }
        
        response = {
            success: errors.length === 0,
            errors: errors.length ? errors : null,
            data: errors.length ? null : data
        };
        
        return this.res.status(200).send(response);
    }

}

module.exports = Motor