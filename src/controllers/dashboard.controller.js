
'use strict'
const moment = require('moment')
const pool = require('../connection')
const Admintorre = require('./admintorreclass.controller')

class Dashboard extends Admintorre {
    
    arr_months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    constructor(req, res) {
        super()

        this.req = req
        this.res = res
    }

    async checaPerfil () {
        let errors = [], data  = {}, response = {}
        
		try{
            if(this.pagina_inicio){
                data.pagina_inicio = this.pagina_inicio
            } else
                errors.push("No se encuentra configurada la página de inicio para este perfil.<br />")
        } catch(e){
			errors.push('ERR-DSH-001: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-DSH-001: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    async getCountTickets () {
        let errors = [], data  = {}, response = {}
        
		try{
            
            let snt = `
            SELECT
                COUNT(*) AS tickets_registrados,
                COUNT(*) FILTER (WHERE id_categoria = 2) AS tickets_proceso,
                COUNT(*) FILTER (WHERE id_categoria = 5) AS tickets_resueltos,
                COUNT(*) FILTER (WHERE id_categoria = 6) AS tickets_cancelados
            FROM tickets
            `;

           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-DSH-001: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-DSH-001: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}

    
}

module.exports = Dashboard
