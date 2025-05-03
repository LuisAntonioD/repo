
'use strict'
const moment = require('moment')
const pool = require('../connection')
const Admintorre = require('./admintorreclass.controller')


class Edificios extends Admintorre {
    

    constructor(req, res) {
        super()

        this.req = req
        this.res = res
    }
    
    


    async getEdificios () {
        let errors = [], data  = {}, principal = {}, response = {}
		try{
            
            

            let snt = `
            SELECT
                vwce.id_edificio, vwce.id_tab, vwce.target, vwce.nombre as edificio_nombre, vwce.color_tab, vwce.icono_tab
            FROM vw_cat_edificios vwce
            WHERE vwce.status = 1 ORDER BY vwce.id_edificio
            `;


           
            const qry = await pool.query(snt)
            data = qry.rows

        } catch(e){
			errors.push('ERR-E-001: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-E-001: '+e.message)
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
            let id_edificio = this.req.body.id_edificio

            console.log('ID EDIFICIO: ', id_edificio)
            let snt = `
            SELECT
                vwce.id_edificio, vwce.target, vwce.color_tab as colortab, vwce.icono_tab as icono, vwce.nombre as edificio,
                TO_CHAR(vwce.fechaagregado, 'YYYY-MM-DD') AS fecha
            FROM vw_cat_edificios vwce
            WHERE vwce.id_edificio = $1
            GROUP BY vwce.id_edificio, vwce.target, vwce.nombre, vwce.fechaagregado, colortab, icono
            `;


           
            const qry = await pool.query(snt,[id_edificio])
            data = qry.rows

        } catch(e){
			errors.push('ERR-E-002: Se produjo un error de ejecución')
			console.error(moment().format()+' - ERR-E-002: '+e.message)
		}

		response = {
			success: errors.length ? false : true,
			errors: errors.length ? errors : false,
			data: errors.length ? false : data,
		}

		return this.res.status(200).send(response)
	}


    

    
}

module.exports = Edificios
