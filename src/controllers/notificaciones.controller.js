'use strict'

const moment = require('moment')
const pool = require('../connection')
const Motor = require('./motor.controller')
const { query } = require('express')

class Notificaciones extends Motor {

    constructor(req, res) {
        super()
        this.req = req
        this.res = res

    }

    async setSocket() {
        let errors = [], data = {}, response = {}

        try {

            let snt = 'UPDATE vw_usuarios_loggeados SET id_socket = $1 WHERE id_usuario = $2'
            const qry = await pool.query(snt, [this.req.body.socket_id, this.userid])
            if(!qry.rowCount)
                errors.push("Error al actualizar socket_id")

        } catch (e) {
            errors.push("ERR-NOT-001: Se produjo un error de ejecuci&oacute;n.")
            console.error(moment().format() + ' - ERR-NOT-001: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
			data: errors.length ? false : data
        }
        return this.res.status(200).send(response)

    }

    async setNotificacion() {
        let errors = [], data = {}, response = {}, snt = false

        try {

            let { tipo_usuario, usuarios } = this.req.body

            if((tipo_usuario && tipo_usuario.length) && (usuarios && usuarios.length)){
                snt = `SELECT id_socket FROM vw_usuarios_loggeados WHERE tipo IN (${Array.isArray(tipo_usuario) ? tipo_usuario.join(',') : tipo_usuario})
                            UNION 
                        SELECT id_socket FROM vw_usuarios_loggeados WHERE id_usuario IN (${Array.isArray(usuarios) ? usuarios.join(',') : usuarios})`
            }else{
                if(tipo_usuario && tipo_usuario.length)
                    snt = `SELECT id_socket FROM vw_usuarios_loggeados WHERE tipo IN (${Array.isArray(tipo_usuario) ? tipo_usuario.join(',') : tipo_usuario})`

                if(usuarios && usuarios.length)
                    snt = `SELECT id_socket FROM vw_usuarios_loggeados WHERE id_usuario IN (${Array.isArray(usuarios) ? usuarios.join(',') : usuarios})`
            }

            const qry = await pool.query(snt)
            if(qry.rowCount){
                const sockets = qry.rows
                .filter(objeto => objeto.id_socket !== null)
                .map(objeto => objeto.id_socket)
                if(sockets.length)
                    data.sockets = sockets
                else
                    errors.push("No hay usuarios conectados para esta busqueda..")
            }else
                errors.push("No hay usuarios conectados para esta busqueda...")

        } catch (e) {
            errors.push("ERR-NOT-002: Se produjo un error de ejecuci&oacute;n.")
            console.error(moment().format() + ' - ERR-NOT-002: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
			data: errors.length ? false : data
        }
        return this.res.status(200).send(response)

    }

    
    async saveNotification(sockets, notificacion) {
        let errors = [], data = [], response = {}

        try {

            let { title, message } = notificacion

            for(let i in sockets){
                let snt_user = `
                SELECT l.id_usuario, u.tipo
                FROM logging l
                JOIN usuarios u ON u.id_usuario = l.id_usuario
                WHERE id_socket = $1`
                const qry_user = await pool.query(snt_user, [sockets[i]])
                
                if(qry_user.rowCount){
                    let snt = `INSERT INTO notificaciones 
                                (title, message, agregadopor)
                            VALUES
                                ($1, $2, $3) RETURNING id_notificacion`
                    const qry = await pool.query(snt, [title, message, this.userid])
                    if(qry.rowCount){
                        data.push({id_notificacion: qry.rows[0].id_notificacion, socket: sockets[i]})
                    }else
                        errors.push("Error al insertar notificacion.")
                }else
                    errors.push("No se encontro el usuario para guardar notificacion.")
            }

        } catch (e) {
            errors.push("ERR-NOT-003: Se produjo un error de ejecuci&oacute;n.")
            console.error(moment().format() + ' - ERR-NOT-003: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
			data: errors.length ? false : data
        }
        return response

    }
    

    async getNotification() {
        let errors = [], data = {}, response = {}

        try {

            let { id = false } = this.req.params

            if(id){
                let snt = `SELECT title, message, link, json_noti FROM notificaciones WHERE id_notificacion = $1`
                const qry = await pool.query(snt, [id])
                if(qry.rowCount){
                    let snt_read = `UPDATE notificaciones SET read = true WHERE id_notificacion = $1`
                    const qry_read = await pool.query(snt_read, [id])
                    if(qry_read.rowCount)
                        data = qry.rows
                    else
                        errors.push("Error al marcar notificacion como leida.")
                }else
                    errors.push("No se encontro informacion de la notificacion.")
            }else
                errors.push("No se recibio el id de la notificacion.")

        } catch (e) {
            errors.push("ERR-NOT-004: Se produjo un error de ejecuci&oacute;n.")
            console.error(moment().format() + ' - ERR-NOT-004: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
			data: errors.length ? false : data
        }
        return this.res.status(200).send(response)

    }

    async getNotifications() {
        let errors = [], data = {}, response = {}, snt = false

        try {

            let snt = `SELECT id_notificacion, title, message FROM notificaciones WHERE id_usuario = $1 AND read = false `

            const qry = await pool.query(snt, [this.userid])
            if(qry.rowCount)
                data = qry.rows

        } catch (e) {
            errors.push("ERR-NOT-005: Se produjo un error de ejecuci&oacute;n.")
            console.error(moment().format() + ' - ERR-NOT-005: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
			data: errors.length ? false : data
        }
        return this.res.status(200).send(response)

    }

}
module.exports = Notificaciones