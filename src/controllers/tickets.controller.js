
'use strict'
const moment = require('moment')
const pool = require('../connection')
const Admintorre = require('./admintorreclass.controller')
const Notificaciones = require('../controllers/notificaciones.controller')


class Tickets extends Admintorre {
    

    constructor(req, res) {
        super()

        this.req = req
        this.res = res
    }
    
    async getTicketsRegistrados () {
        let errors = [], data  = {}, response = {}
        
		try{
            
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, t.id_prioridad,
                tp.nombre AS nombre_prioridad, p.nombre as portal, titulo,
                t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha,
                t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
            JOIN portales p ON p.id_portal = t.id_portal
            JOIN tickets_status ts ON ts.id_status_ticket = t.id_status 
            `;

           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-001: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-001: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getTicketsFacturanot () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 1
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-002: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-002: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getTicketsResueltos () {
        let errors = [], data  = {}, response = {}
		try{
            
          

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_prioridad, tp.nombre AS nombre_prioridad, t.id_categoria,
                tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,
                TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
            WHERE t.id_categoria = 5
            `;

           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-003: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-003: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getTicketsCancelados () {
        let errors = [], data  = {}, response = {}
        
		try{
            
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_prioridad, tp.nombre AS nombre_prioridad, t.id_categoria,
                tc.nombre AS nombre_categoria, p.nombre as portal, titulo,
                t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status,
                t.id_status, ts.nombre as ticket_status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
            WHERE t.id_categoria = 6
            `;

           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-004: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-004: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async refreshnotification(){
        let mensaje = this.req.body.mensaje
        this.sendNotificacion(mensaje)
    }

    async sendNotificacion(mensaje) {
        let errors = [], data = [], response = {}
        try {

            let snt = ` SELECT id_socket
                        FROM logging
                        WHERE id_socket IS NOT NULL AND status = 1`
            const qry = await pool.query(snt)

            
            const sockets = qry.rows.filter(objeto => objeto.id_socket !== null).map(objeto => objeto.id_socket)
            if(sockets.length){

                    let title = 'Mensaje Enviado',
                        message = mensaje,
                        params = {}

                    params.title = title,
                    params.message = message,
                    params.icon = 'ni ni-air-baloon',
                    params.duration = 5000,
                    params.size = 20,
                    params.horizontal_position = 'right',
                    params.vertical_position = 'bottom',
                    params.notification_type = 'success',
                    params.type_noti = 1,
                    params.portal = 1
                    params.dropdown_noti = {
                        title: title,
                        message: message
                    }

                    let save_notification = {
                        title: title,
                        message: message
                        
                    }

                    let Noti = new Notificaciones(this.req, this.res)
                    await Noti.isLogin()
                    let res_save_noti = await Noti.saveNotification(sockets, save_notification)
                    

                
            }
            

        } catch (e) {
            errors.push('ERR-T-005: Se produjo un error de ejecuci&oacute;n')
            console.error(moment().format() + ' - ERR-T-005: ' + e.message)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        }

        return response
    }


    async getTicketsRecientes () {
        let errors = [], data  = {}, response = {}
		try{
            
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-006: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-006: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getTicketsAvaluos () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 2
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-007: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-007: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async getTicketsCorregidora () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 3
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-008: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-008: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async getTicketsMarques () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 4
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-009: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-009: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async getTicketsEzequiel () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 5
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-010: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-010: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async getTicketsSJoaquin () {
        let errors = [], data  = {}, response = {}
		try{
            

            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, u.nombre_completo AS nombre_usuario_asignado,
                t.id_categoria, tc.nombre AS nombre_categoria, p.nombre as portal, titulo, t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            JOIN portales p ON p.id_portal = t.id_portal
            WHERE t.id_categoria = 2 AND t.id_portal = 6
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-011: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-011: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getPortales () {
        let errors = [], data  = {}, principal = {}, response = {}
		try{
            
            let encabezado = `<li class="nav-item" id="btntab1" onMouseOver="this.style.cursor='pointer'">
            <a class="nav-link mb-0 px-0 py-1 active" data-bs-target="#tabPorRecibir" data-bs-toggle="tab"
              role="tab" aria-selected="true">
              <span class="text-info">
                <i class="fa-solid fa-ticket ext-lg opacity-10" aria-hidden="true"></i>
              </span>
              Recientes
            </a>
          </li>`

            let snt = `
            SELECT
                p.id_portal, p.llavetab, p.target, p.name, p.coloricono, p.nombre as portal
            FROM portales p
            WHERE p.status = 1 ORDER BY p.id_portal
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows
            principal = encabezado

        } catch(e){
			errors.push('ERR-T-012: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-012: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
            principal: errors.length ? false : principal,
		}

		return this.res.status(200).send(response)
	}


    async table () {
        let errors = [], data  = {}, response = {}
		try{
            let id_portal = this.req.body.id_portal

            let snt = `
            SELECT
                p.id_portal, p.target, p.coloricono as colorportal, tp.coloricono as colorprioridad, p.nombre as portal,
                t.id_ticket, t.id_usuario_crea_ticket,
                u.nombre_completo AS nombre_usuario_asignado, t.id_categoria,
                t.id_status, ts.nombre as nombre_status,
                tc.nombre AS nombre_categoria, t.titulo, t.descripcion,tp.nombre as prioridad,
                TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha, t.status,count(t.id_ticket) as count_tickets
            FROM portales p
            LEFT JOIN tickets t ON p.id_portal = t.id_portal AND t.id_categoria = 2
            LEFT JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            LEFT JOIN tickets_categorias tc ON tc.id_categoria = t.id_categoria
            LEFT JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
            LEFT JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            WHERE p.id_portal = $1
            GROUP BY p.id_portal,t.id_ticket,u.nombre_completo,tc.nombre, prioridad, nombre_status, colorprioridad, colorportal
            `;


           
            const qry = await pool.query(snt,[id_portal])
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-012: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-012: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    async detalleTicket () {
        let errors = [], data  = {}, msg = {}, response = {}
		try{
            let id_ticket = this.req.body.id_ticket

            let snt = `
            SELECT  t.id_usuario_crea_ticket AS usuario,
                    t.titulo, t.descripcion, TO_CHAR(t.fechaagregado, 'DD/MM/YYYY HH24:MI:SS') AS fecha,
                    p.nombre AS portal, p.coloricono AS color
            FROM tickets t
            JOIN portales p ON p.id_portal=t.id_portal
            WHERE t.id_categoria = 2 AND t.id_ticket = $1
            `;

            const qry = await pool.query(snt, [id_ticket])
            data = qry.rows


            let mensajes = `
                SELECT dt.message, dt.usertype, TO_CHAR(dt.fechaagregado, 'HH24:MI:SS') AS fecha, dt.id_categoria
                FROM detalle_ticket dt
                JOIN tickets t ON t.id_ticket=dt.id_ticket
                WHERE dt.id_categoria = 2 AND t.id_ticket = $1 ORDER BY dt.fechaagregado
            `;

            const qryMensajes = await pool.query(mensajes, [id_ticket])
            msg = qryMensajes.rows
            

        } catch(e){
			errors.push('ERR-T-013: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-013: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
            msg: errors.length ? false : msg,
		}

		return this.res.status(200).send(response)
	}


    async historialTicket () {
        let errors = [], data  = {}, msg = {}, response = {}
		try{
            let id_ticket = this.req.body.id_ticket
            let snt = `


            SELECT dt.title, dt.message, dt.usertype, dt.fechaagregado AS fecha, dt.id_categoria, p.nombre as portal
                FROM detalle_ticket dt
                JOIN tickets t ON t.id_ticket = dt.id_ticket
            JOIN portales p ON p.id_portal = t.id_portal
                WHERE t.id_ticket = $1 ORDER BY dt.fechaagregado
            `;

            const qry = await pool.query(snt, [id_ticket])
            data = qry.rows
            

        } catch(e){
			errors.push('ERR-T-014: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-014: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
            msg: errors.length ? false : msg,
		}

		return this.res.status(200).send(response)
	}

    async enviarTicketResuelto () {
        let errors = [], data  = {}, res  = {}, response = {}
		try{
            let id_ticket = this.req.body.id_ticket
            
            let snt = ` UPDATE tickets SET id_categoria = 5 WHERE id_ticket = $1  RETURNING id_portal `;

            const qry = await pool.query(snt, [id_ticket])
            data = qry.rows


            let resuelto = `
            INSERT INTO detalle_ticket (title, message, agregadopor, id_usuario, usertype, id_ticket, id_categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`;
            
            const qryresuelto = await pool.query(resuelto, ["Ticket Resuelto", `Este Ticket ha sido resuelto por el usuario ${this.username}`, this.userid, this.userid, this.usertype, id_ticket, 5])
            res = qryresuelto.rows

            

        } catch(e){
			errors.push('ERR-T-015: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-015: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
            res: errors.length ? false : res,
		}

		return this.res.status(200).send(response)
	}

    async enviarTicketCancelado () {
        let errors = [], data  = {}, res  = {}, response = {}
		try{
            let id_ticket = this.req.body.id_ticket
            
            let snt = ` UPDATE tickets SET id_categoria = 6 WHERE id_ticket = $1 RETURNING id_portal`;

            const qry = await pool.query(snt, [id_ticket])
            data = qry.rows

            let cancelado = `
            INSERT INTO detalle_ticket (title, message, agregadopor, id_usuario, usertype, id_ticket, id_categoria)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`;

            const arycancelado = await pool.query(resuelto, ["Ticket Cancelado", `Este Ticket ha sido cancelado por el usuario ${this.username}`, this.userid, this.userid, this.usertype, id_ticket, 6])
            res = arycancelado.rows
            

        } catch(e){
			errors.push('ERR-T-016: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-016: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
            res: errors.length ? false : res,
		}

		return this.res.status(200).send(response)
	}


    async getTickets() {
        let errors = [], data = {}, response = {}
    
        let portal = this.req.body.portal
        console.log("id_portal: ",portal)
        try {
            let snt = `SELECT * FROM tickets WHERE id_portal = $1`
            const qry = await pool.query(snt, [portal])
            
            if(qry.rowCount) {
                data = qry.rows
            } else {
                errors.push("No se encontraron registros en la tabla de tickets")
            }
    
        } catch (e) {
            errors.push("ERR-T-017: Se produjo un error al consultar la tabla.")
            console.error(moment().format() + ' - ERR-T-017: ' + e.message)
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }


    async getTicketsTotales() {
        let errors = [], data = {}, response = {}
    
        let fecha_ini = this.req.body.fecha_ini
        let fecha_fin = this.req.body.fecha_fin
        try {
            if (fecha_ini == '' || fecha_fin == '') {
                if (fecha_ini == '' && fecha_fin == '') {
                    errors.push('Por favor, selecciona un rango de fechas valido');
                } else if (fecha_ini == '') {
                    errors.push('Por favor, selecciona una fecha de inicio');
                } else {
                    errors.push('Por favor, selecciona una fecha de fin');
                }
            } else {
               let snt = `
               SELECT
                    COUNT(*) FILTER (WHERE id_categoria = 1) AS tickets_registrados,
                    COUNT(*) FILTER (WHERE id_categoria = 2) AS tickets_proceso,
                    COUNT(*) FILTER (WHERE id_categoria = 5) AS tickets_resueltos,
                    COUNT(*) FILTER (WHERE id_categoria = 6) AS tickets_cancelados
                FROM tickets
                WHERE TO_CHAR(fechaagregado, 'DD-MM-YYYY') BETWEEN $1 AND $2`
                const qry = await pool.query(snt, [fecha_ini, fecha_fin])
                
                if(qry.rowCount) {
                    if (qry.rows[0].tickets_registrados == 0 && qry.rows[0].tickets_proceso == 0 && qry.rows[0].tickets_resueltos == 0 && qry.rows[0].tickets_cancelados == 0) {
                        errors.push('No se encontraron registros en la tabla de tickets');
                    } else {
                       data = qry.rows 
                    }
                } else {
                    errors.push("No se encontraron registros en la tabla de tickets")
                }
            }
            
            
    
        } catch (e) {
            errors.push("ERR-T-018: Se produjo un error al consultar la tabla.")
            console.error(moment().format() + ' - ERR-T-018: ' + e.message)
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
        
    }

    async prioridadTicket() {
        let errors = [], data = {}, response = {}
    
        let id_ticket = this.req.body.id_ticket

        
        try {
            
            let snt = `
                SELECT t.*, p.nombre as portal, tp.nombre as nombre_prioridad
                    FROM tickets t 
                    JOIN portales p on p.id_portal = t.id_portal
                    JOIN tickets_prioridad tp on tp.id_prioridad = t.id_prioridad
                WHERE id_ticket = $1 `
            const qry = await pool.query(snt, [id_ticket])
            data = qry.rows 
                

        } catch (e) {
            errors.push("ERR-T-019: Se produjo un error al consultar la tabla.")
            console.error(moment().format() + ' - ERR-T-019: ' + e.message)
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
        
    }

    async updatePrioridad() {
        let errors = [], data = {}, response = {}
    
        let id_ticket = this.req.body.id_ticket
        let id_prioridad = this.req.body.id_prioridad

        
        try {
            
            
            let snt = ` UPDATE tickets set id_prioridad = $1 WHERE id_ticket = $2 `
            const qry = await pool.query(snt, [id_prioridad, id_ticket])
            data = qry.rows 
            
                

        } catch (e) {
            errors.push("ERR-T-020: Se produjo un error al consultar la tabla.")
            console.error(moment().format() + ' - ERR-T-020: ' + e.message)
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
        
    }


    async TicketsFiltrados () {
        let errors = [], data = {}, response = {};
        let prioridades = this.req.body.prioridades || []; 
        let status = this.req.body.status || [];
        let portales = this.req.body.portales || []; 
    
        try {
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, t.id_prioridad,
                tp.nombre AS nombre_prioridad, p.nombre as portal, titulo,
                t.descripcion, TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha,
                t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
                JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
                JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
                JOIN portales p ON p.id_portal = t.id_portal
                JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            WHERE 1=1`;
    
            if (prioridades.length > 0) {
                snt += ` AND t.id_prioridad = ANY(ARRAY[${prioridades}])`;
            }
    
            if (status.length > 0) {
                snt += ` AND t.id_status = ANY(ARRAY[${status}])`;
            }

            if (portales.length > 0) {
                snt += ` AND t.id_portal = ANY(ARRAY[${portales}])`;
            }
    
            const qry = await pool.query(snt);
            data = qry.rows;
    
        } catch(e) {
            errors.push('ERR-T-021: Se produjo un error de ejecución');
            console.error(moment().format() + ' - ERR-T-021: ' + e.message);
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        };
    
        return this.res.status(200).send(response);
    }

    async TicketsFiltradosResueltos () {
        let errors = [], data = {}, response = {};
        let prioridades = this.req.body.prioridades || []; 
        let portales = this.req.body.portales || []; 
    
        try {
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, t.id_prioridad,
                tp.nombre AS nombre_prioridad, p.nombre as portal, titulo,
                t.descripcion, TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha,
                t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
                JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
                JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
                JOIN portales p ON p.id_portal = t.id_portal
                JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            WHERE 1=1 AND t.id_status = 3`; 
    
            if (prioridades.length > 0) {
                snt += ` AND t.id_prioridad = ANY(ARRAY[${prioridades}])`;
            }
    
            if (portales.length > 0) {
                snt += ` AND t.id_portal = ANY(ARRAY[${portales}])`;
            }
    
            const qry = await pool.query(snt);
            data = qry.rows;
    
        } catch(e) {
            errors.push('ERR-T-022: Se produjo un error de ejecución');
            console.error(moment().format() + ' - ERR-T-022: ' + e.message);
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        };
    
        return this.res.status(200).send(response);
    }


    async TicketsFiltradosCancelados () {
        let errors = [], data = {}, response = {};
        let prioridades = this.req.body.prioridades || []; 
        let portales = this.req.body.portales || []; 
    
        try {
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, t.id_prioridad,
                tp.nombre AS nombre_prioridad, p.nombre as portal, titulo,
                t.descripcion, TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha,
                t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
                JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
                JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
                JOIN portales p ON p.id_portal = t.id_portal
                JOIN tickets_status ts ON ts.id_status_ticket = t.id_status
            WHERE 1=1 AND t.id_status = 4`; 
    
            if (prioridades.length > 0) {
                snt += ` AND t.id_prioridad = ANY(ARRAY[${prioridades}])`;
            }
    
            if (portales.length > 0) {
                snt += ` AND t.id_portal = ANY(ARRAY[${portales}])`;
            }
    
            const qry = await pool.query(snt);
            data = qry.rows;
    
        } catch(e) {
            errors.push('ERR-T-023: Se produjo un error de ejecución');
            console.error(moment().format() + ' - ERR-T-023: ' + e.message);
        }
    
        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data,
        };
    
        return this.res.status(200).send(response);
    }


    async getTicketsByUser () {
        let errors = [], data  = {}, response = {}
        
		try{
            
            let snt = `
            SELECT
                t.id_ticket, t.id_usuario_crea_ticket, t.id_prioridad,
                tp.nombre AS nombre_prioridad, p.nombre as portal, titulo,
                t.descripcion,TO_CHAR(t.fechaagregado, 'YYYY-MM-DD') AS fecha,
                t.status, t.id_status, ts.nombre as ticket_status
            FROM tickets t
            JOIN usuarios u ON u.id_usuario = t.id_usuario_crea_ticket
            JOIN tickets_prioridad tp ON tp.id_prioridad = t.id_prioridad
            JOIN portales p ON p.id_portal = t.id_portal
            JOIN tickets_status ts ON ts.id_status_ticket = t.id_status WHERE t.id_usuario_crea_ticket = $1
            `;

           
            const qry = await pool.query(snt, [this.req.params.userid])
            data = qry.rows

        } catch(e){
			errors.push('ERR-T-001: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-T-001: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    

    
}

module.exports = Tickets
