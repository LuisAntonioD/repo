'use strict'

const moment = require('moment')
const pool = require('../connection')
const Motor = require('./motor.controller')

class MotorCatalogos extends Motor {

    async getListCatalogs(id = false) {
        let errors = [], data = [], response = {}, id_cb = ''

        try {

            if(id)
                id_cb = ` AND id_motor_catalogo_lista = ${id} `
            
            let snt = `SELECT id_motor_catalogo_lista, lpad(id_motor_catalogo_lista::text,5,'0') AS folio, titulo, 
                        to_char(fechaagregado, 'dd/mm/yyyy') AS fechaagregado, 
                        (SELECT nombre_completo FROM usuarios WHERE id_usuario = mcl.agregadopor) AS agregadopor,
                        (CASE WHEN status = 1 THEN 'Activo'
                        ELSE 'Inactivo' END) AS status,
                        visiblepara
                        FROM motor_catalogos_lista mcl
                        WHERE status = 1 ${id_cb} ORDER BY id_motor_catalogo_lista DESC`
            const qry = await pool.query(snt)
            for(let i in qry.rows){
                let visiblepara = qry.rows[i].visiblepara.split(',')
                if (visiblepara.includes(this.usertype.toString())){
                    data.push(qry.rows[i])
                }
            }
        } catch (e) {
            errors.push('ERR-MTC-001: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-001: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async getTitlesList() {
        let errors = [], data = {}, response = {}
        let { id } = this.req.params

        try {

            if (id) {

                let snt = `SELECT * FROM motor_catalogos_lista WHERE id_catalogo = $1`
                const qry = await pool.query(snt, [id])
                if (qry.rows.length) {
                    data.title = qry.rows[0].titulo
                    data.titleBtnNew = qry.rows[0].titulo_boton_nuevo
                    data.titleList = qry.rows[0].titulo_lista

                } else
                    errors.push("Error consulting table titles.")

            } else
                errors.push("No data received.")
        
            } catch (e) {
            errors.push('ERR-MTC-002: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-002: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async getList() {
        let errors = [], data = {}, response = {}, funcList = false, className = false, tableName = false, columns = []
        let { id } = this.req.params

        try {

            if (id){

                let snt = `SELECT nombre_columna, alineacion, ancho_inicial, nombre_columna_tabla,
                        (SELECT funcion_crea_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) AS func_list,
                        (SELECT class_name FROM motor_catalogos_lista WHERE id_catalogo = $1) AS class_name,
                        (SELECT tabla FROM motor_catalogos_lista WHERE id_catalogo = $1) AS table,
                        (SELECT visiblepara FROM motor_catalogos_lista WHERE id_catalogo = $1) AS visiblepara
                        FROM motor_catalogos_columnas WHERE id_motor_catalogo_lista = (
                        SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) AND status = 1 ORDER BY orden`
                const qry = await pool.query(snt, [id])

                let columnTable = []

                for (let i in qry.rows){
                    let arr_visiblepara = qry.rows[i].visiblepara.split(',')

                    if (arr_visiblepara.includes(String(this.usertype))) {
                        let column = {}
                        column.title = qry.rows[i].nombre_columna
                        column.className = qry.rows[i].alineacion
                        column.width = qry.rows[i].ancho_inicial
                        if (qry.rows[i].nombre_columna_tabla)
                            columnTable.push(qry.rows[i].nombre_columna_tabla)

                        if (!funcList && !className) {
                            funcList = qry.rows[i].func_list
                            tableName = qry.rows[i].table
                            className = qry.rows[i].class_name ? qry.rows[i].class_name : "MotorCatalog"
                        }
                        columns.push(column)
                    }
                }

                if (columns.length){
                    data.columns = columns
                }else
                    errors.push("Error creating columns list.")

                let snt_act = `SELECT titulo, clase, nombre_funcion, class_color
                        FROM motor_acciones_lista_cat WHERE id_motor_catalogo_lista = (
                        SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) AND STATUS = 1 ORDER BY orden`
                const qry_act = await pool.query(snt_act, [id])
                
                let actions = []
                for (let i in qry_act.rows) {
                    let action = {}
                    action.title = qry_act.rows[i].titulo
                    action.class = qry_act.rows[i].clase
                    action.function = qry_act.rows[i].nombre_funcion
                    action.classColor = qry_act.rows[i].class_color
                    actions.push(action)
                }

                if (actions.length)
                    data.actions = actions

                let list = await this.contentList(tableName, columnTable, "WHERE status = 1")

                if (list.success)
                    data.data = list.data
                else
                    data.data = []

            }else
                errors.push('No data received.')

        } catch (e) {
            errors.push('ERR-MTC-003: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-003: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async contentList(table, arr_columns, where) {
        let errors = [], data = [], response = {}

        try {
            if (table && arr_columns.length) {
                let snt = `SELECT ${ arr_columns.join(',') } FROM ${table} ${where}`
                const qry = await pool.query(snt)

                if(qry.rowCount){
                    for (let i in qry.rows) {
                        data.push(Object.values(qry.rows[i]))
                    }
                }
                
            }else
                errors.push('No data received.')

        } catch (e) {
            errors.push('ERR-MTC-004: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-004: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return response
    }

    async getDetailCat() {
        let errors = [], data = [], response = {}, columns = {}, res_data_det = {}

        try {

            let { id } = this.req.params

            if (id){
                
                let snt = `SELECT nombre_campo AS name, etiqueta AS label, descripcion AS description, es_llave AS key, 
                        tipo_dato AS type, max_length AS maxlength, obligatorio AS required,tipo_objeto AS typeobj,solo_lectura AS readonly,
                        (SELECT tabla FROM motor_catalogos_lista WHERE id_catalogo = $1) AS tabla,
                        (SELECT nombre_campo FROM motor_catalogos_campos WHERE es_llave = 1 AND id_motor_catalogo_lista = 
                        (SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1)) AS campo_llave,
                        (SELECT tabla_detalle FROM motor_catalogos_lista WHERE id_catalogo = $1) AS tabla_detalle, 
                        catalogo_valores,catalogo_descripcion,catalogo_id
                        FROM motor_catalogos_campos 
                        WHERE id_motor_catalogo_lista = 
                        (SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) ORDER BY orden`
                const qry = await pool.query(snt, [id])
                for(let i in qry.rows){
                    let arr = qry.rows[i]

                    var { tabla, campo_llave, tabla_detalle } = qry.rows[i]

                    delete arr.tabla
                    delete arr.campo_llave
                    delete arr.tabla_detalle

                    if (qry.rows[i].typeobj == "select") {
                        if (qry.rows[i].catalogo_valores) {
                            let items = []
                            let snt_item = `SELECT * FROM ${qry.rows[i].catalogo_valores} WHERE status = 1`
                            const qry_item = await pool.query(snt_item)
                            for (let n in qry_item.rows) {
                                let arr_item = {}
                                arr_item.name = qry_item.rows[n][qry.rows[i].catalogo_descripcion]
                                arr_item.id = qry_item.rows[n][qry.rows[i].catalogo_id]
                                items.push(arr_item)
                            }

                            arr.items = items
                        }

                    }

                    if (this.catalogkey && this.catalogkey != 'false' && this.catalogkey != 'null') {
                        let field = arr.name
                        if(arr.type == 'date')
                            field = `to_char(${arr.name}, 'yyyy-MM-dd') AS ${arr.name}`

                        let snt_value = `SELECT ${field} FROM ${tabla} WHERE ${campo_llave} = $1 AND STATUS = 1`
                        const qry_value = await pool.query(snt_value, [this.catalogkey])
                        arr.value = qry_value.rows[0][arr.name]

                    }

                    data.push(arr)

                }

            }else
                errors.push('No se recibio el tipo de catalogo.')

            if (tabla_detalle && !errors.length){
                columns = await this.getTableColumnsDetail(tabla_detalle, campo_llave)
                if (columns.success){

                    if (this.catalogkey && this.catalogkey != 'false' && this.catalogkey != 'null') {
                        res_data_det = await this.getContentTableDet(tabla_detalle, campo_llave, columns.data)
                        if (res_data_det.success){
                            data.data_det = res_data_det.data
                        }else
                            errors = errors.concat(res_data_det.errors)
                    }
                    
                }else
                    errors.push("Error al obtener las columnas de la tabla de detalle.")
            }

        } catch (e) {
            errors.push('ERR-MTC-005: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-005: ' + e.message)
            console.error(e)
        }

        response = {}
        response.success = errors.length ? false : true
        response.errors = errors.length ? errors : false
        if (Object.keys(columns).length)
            response.columns = errors.length ? false : columns.data
        if (Object.keys(res_data_det).length)
            response.data_det = errors.length ? false : res_data_det.data
        response.data = errors.length ? false : data
        
        return this.res.status(200).send(response)
    }

    async saveCatalog() {
        let errors = [], data = [], response = {}, valid = true

        try {

            let { catalogoid, motorCatalogo } = this.req.body

            let snt = `SELECT id_motor_catalogo_lista, tabla, funcion_valida,
                    (SELECT nombre_campo FROM motor_catalogos_campos WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave
                    FROM motor_catalogos_lista mcl WHERE id_catalogo = $1`
            const qry = await pool.query(snt, [ catalogoid ])

            let { tabla, campo_llave, id_motor_catalogo_lista, funcion_valida } = qry.rows[0]

            if (funcion_valida && this.catalogkey && this.catalogkey != "false") {
                eval(`let res = await this.funcion_valida(this.catalogkey)`)
                valid = res.success
            }

            if (valid){

                let snt_fields = `SELECT * FROM motor_catalogos_campos WHERE id_motor_catalogo_lista = $1 ORDER BY id_campo`
                const qry_fields = await pool.query(snt_fields, [id_motor_catalogo_lista])
                
                let fields = await this.formatInput(motorCatalogo)
                let str_fields = '', str_values = '', str_upd = '', arr_values = [], cont = 1, snt_save = ''
                
                for (let i in qry_fields.rows){
                    let row = qry_fields.rows[i]
                    if (fields.hasOwnProperty(row.nombre_campo)){
                        if (fields[row.nombre_campo] != '') {

                            if (this.catalogkey && this.catalogkey != 'false' && this.catalogkey != 'null' && this.catalogkey != undefined)
                                str_upd += `${row.nombre_campo} = $${cont++},`
                            else {
                                str_fields += row.nombre_campo + ","
                                str_values += `$${cont++},`
                            }
                            arr_values.push(fields[row.nombre_campo])

                        }
                    }
                }

                if (this.catalogkey && this.catalogkey != 'false' && this.catalogkey != 'null' && this.catalogkey != undefined)
                    snt_save = `UPDATE ${tabla} SET ${str_upd.trim().replace(/^\,+|\,+$/gm, '')} WHERE ${campo_llave} = ${this.catalogkey} RETURNING ${campo_llave}`
                else
                    snt_save = `INSERT INTO ${tabla} (${str_fields.trim().replace(/^\,+|\,+$/gm, '')},agregadopor, fechaagregado, status) VALUES (${str_values.trim().replace(/^\,+|\,+$/gm, '')},${this.userid}, NOW(), 1) RETURNING ${campo_llave}`

                const qry_save = await pool.query(snt_save, arr_values)
                if (qry_save.rowCount){
                    this.catalogkey = qry_save.rows[0][campo_llave]

                    let snt_col = `SELECT * FROM motor_catalogos_columnas WHERE id_motor_catalogo_lista = (
                                        SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) AND status = 1 ORDER BY orden`
                    const qry_col = await pool.query(snt_col, [this.catalogid])
                    if (qry_col.rowCount) {

                        let column_table = []
                        for (let x in qry_col.rows) {
                            if (qry_col.rows[x].nombre_columna_tabla)
                                column_table.push(qry_col.rows[x].nombre_columna_tabla)
                        }

                        let res_cont = await this.contentList(tabla, column_table, `WHERE ${campo_llave} = ${this.catalogkey}`)
                        data = res_cont.data[0]

                    } else
                        errors.push("Error consultar las columnas de la lista.")

                }else
                    errors.push('Error al guardar la informacion del catalogo.')

            } else
                errors = errors.concat(res.errors)

        } catch (e) {
            errors.push('ERR-MTC-006: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-006: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async saveCatalogDet() {
        let errors = [], data = [], response = {}, valid = true

        try {

            if(this.catalogid && this.catalogkey){
                
                let snt = `SELECT tabla_detalle,
                    (SELECT nombre_campo FROM motor_catalogos_campos WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave,
                    (SELECT nombre_campo FROM motor_catalogos_campos_det WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave_det
                    FROM motor_catalogos_lista mcl WHERE id_catalogo = $1`
                const qry = await pool.query(snt, [this.catalogid])

                let { tabla_detalle, campo_llave, campo_llave_det } = qry.rows[0]

                let snt_fields = `SELECT * FROM motor_catalogos_campos_det WHERE id_motor_catalogo_lista = $1 ORDER BY id_campo_det`
                const qry_fields = await pool.query(snt_fields, [this.catalogid])
                
                let fields = await this.formatInput(this.req.body)
                let str_fields = `${campo_llave},`, str_values = `$1,`, arr_values = [this.catalogkey], cont = 2

                for (let i in qry_fields.rows) {
                    let row = qry_fields.rows[i]
                    if (fields.hasOwnProperty(row.nombre_campo)) {
                        if (fields[row.nombre_campo] != '') {
                            str_fields += row.nombre_campo + ","
                            str_values += `$${cont++},`
                            arr_values.push(fields[row.nombre_campo])
                        }
                    }
                }
                
                let snt_save = `INSERT INTO ${tabla_detalle} (${str_fields.trim().replace(/^\,+|\,+$/gm, '')},agregadopor, fechaagregado) VALUES (${str_values.trim().replace(/^\,+|\,+$/gm, '')},${this.userid}, NOW()) RETURNING ${campo_llave_det}`
                const qry_save = await pool.query(snt_save, arr_values)
                if (qry_save.rowCount){
                    fields[campo_llave_det] = qry_save.rows[0][campo_llave_det]
                    fields['_id'] = qry_save.rows[0][campo_llave_det]
                    fields[campo_llave] = this.catalogkey
                    data = fields
                }else
                    errors.push('No se pudo guardar el detalle del catalogo.')

            }else
                errors.push('No se recibio la informacion necesaria para guardar los datos.')

        } catch (e) {
            errors.push('ERR-MTC-009: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-009: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async updCatalogDet() {
        let errors = [], data = [], response = {}, valid = true

        try {

            if(this.catalogid && this.catalogkey){
                
                let snt = `SELECT tabla_detalle,
                    (SELECT nombre_campo FROM motor_catalogos_campos WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave,
                    (SELECT nombre_campo FROM motor_catalogos_campos_det WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave_det
                    FROM motor_catalogos_lista mcl WHERE id_catalogo = $1`
                const qry = await pool.query(snt, [this.catalogid])

                let { tabla_detalle, campo_llave, campo_llave_det } = qry.rows[0]

                let snt_fields = `SELECT * FROM motor_catalogos_campos_det WHERE id_motor_catalogo_lista = $1 ORDER BY id_campo_det`
                const qry_fields = await pool.query(snt_fields, [this.catalogid])
                
                let fields = await this.formatInput(this.req.body)
                let str_fields_upd = ``, arr_values = [], cont = 1

                for (let i in qry_fields.rows) {
                    let row = qry_fields.rows[i]
                    if (fields.hasOwnProperty(row.nombre_campo)) {
                        if (fields[row.nombre_campo] != '') {
                            str_fields_upd += `${row.nombre_campo} = $${cont++},`
                            arr_values.push(fields[row.nombre_campo])
                        }
                    }
                }

                if(fields.det_key){
                    
                    let snt_save = `UPDATE ${tabla_detalle} SET ${str_fields_upd.trim().replace(/^\,+|\,+$/gm, '')} 
                                    WHERE ${campo_llave_det} = ${fields.det_key} RETURNING ${campo_llave_det}`
                    const qry_save = await pool.query(snt_save, arr_values)
                    if (qry_save.rowCount){
                        fields[campo_llave_det] = qry_save.rows[0][campo_llave_det]
                        fields['_id'] = qry_save.rows[0][campo_llave_det]
                        fields[campo_llave] = this.catalogkey
                        data = fields
                    }else
                        errors.push('No se pudo guardar el detalle del catalogo.')
                }else
                    errors.push('No se recibio el id del detalle.')

            }else
                errors.push('No se recibio la informacion necesaria para guardar los datos.')

        } catch (e) {
            errors.push('ERR-MTC-010: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-010: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async delteRowCatalogList() {
        let errors = [], data = [], response = {}, valid = true

        try {

            let snt = `SELECT tabla, (SELECT nombre_campo FROM motor_catalogos_campos WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave
                    FROM motor_catalogos_lista mcl WHERE id_catalogo = $1`
            const qry = await pool.query(snt, [this.catalogid])
            
            if(qry.rowCount){
                let { tabla, campo_llave } = qry.rows[0]

                let snt_del = `DELETE FROM ${tabla} WHERE ${campo_llave} = $1`
                await pool.query(snt_del, [this.req.params.id])

            }else
                errors.push(`Error al buscar tabla. Favor de volver a intentar.`)

        } catch (e) {
            errors.push('ERR-MTC-011: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-011: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async delteRowCatalogDet() {
        let errors = [], data = [], response = {}, valid = true

        try {

            let snt = `SELECT tabla_detalle, (SELECT nombre_campo FROM motor_catalogos_campos_det WHERE es_llave = 1 AND id_motor_catalogo_lista = mcl.id_motor_catalogo_lista) AS campo_llave_det
                    FROM motor_catalogos_lista mcl WHERE id_catalogo = $1`
            const qry = await pool.query(snt, [this.catalogid])

            if (qry.rowCount) {
                let { tabla_detalle, campo_llave_det } = qry.rows[0]

                let snt_del = `DELETE FROM ${tabla_detalle} WHERE ${campo_llave_det} = $1`
                await pool.query(snt_del, [this.req.params.id])

            } else
                errors.push(`Error al buscar tabla. Favor de volver a intentar.`)

        } catch (e) {
            errors.push('ERR-MTC-012: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-012: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return this.res.status(200).send(response)
    }

    async getTableColumnsDetail(table, campo_llave) {
        let errors = [], data = [], response = {}

        try {

            if (this.catalogid){

                let snt = `SELECT * FROM motor_catalogos_campos_det WHERE id_motor_catalogo_lista = 
                    (SELECT id_motor_catalogo_lista FROM motor_catalogos_lista WHERE id_catalogo = $1) ORDER BY id_campo_det`
                const qry = await pool.query(snt, [this.catalogid])
                if (qry.rowCount){
                    for (let i in qry.rows){
                        let arr = {}
                        arr.key = qry.rows[i].es_llave
                        arr.title = qry.rows[i].etiqueta
                        arr.label = qry.rows[i].etiqueta
                        arr.data = qry.rows[i].nombre_campo
                        arr.name = qry.rows[i].nombre_campo
                        arr.typeobj = qry.rows[i].tipo_objeto
                        arr.type = qry.rows[i].tipo_dato
                        arr.editing = qry.rows[i].solo_lectura ? false : true
                        arr.width = qry.rows[i].width_grid ? qry.rows[i].width_grid : "auto"
                        arr.visible = qry.rows[i].mostrar_en_grid ? true : false
                        arr.modificable = qry.rows[i].mostrar_en_grid ? true : false
                        arr.required = qry.rows[i].obligatorio
                        arr.catalogo_valores = qry.rows[i].catalogo_valores
                        arr.catalogo_id = qry.rows[i].catalogo_id
                        arr.catalogo_descripcion = qry.rows[i].catalogo_descripcion
                        arr.height = "auto"
                        arr.onlygrid = false

                        if (qry.rows[i].tipo_dato_grid == 'select') {
                            data.push({
                                key: qry.rows[i].es_llave,
                                title: qry.rows[i].etiqueta,
                                label: qry.rows[i].etiqueta,
                                data: qry.rows[i].nombre_campo+'_text',
                                name: qry.rows[i].nombre_campo+'_text',
                                typeobj: qry.rows[i].tipo_objeto,
                                type: qry.rows[i].tipo_dato,
                                editing: qry.rows[i].solo_lectura ? false : true,
                                width: qry.rows[i].width_grid ? qry.rows[i].width_grid : "auto",
                                visible: qry.rows[i].mostrar_en_grid ? true : false,
                                modificable: false,
                                required: qry.rows[i].obligatorio,
                                catalogo_valores: qry.rows[i].catalogo_valores,
                                catalogo_id: qry.rows[i].catalogo_id,
                                catalogo_descripcion: qry.rows[i].catalogo_descripcion,
                                height: "auto",
                                onlygrid: true
                            })
                            let items = []
                            let snt_item = `SELECT * FROM ${qry.rows[i].catalogo_valores} WHERE status = 1`
                            const qry_item = await pool.query(snt_item)
                            if (qry_item.rowCount) {
                                for (let n in qry_item.rows) {
                                    let item = {}
                                    item.name = qry_item.rows[n][qry.rows[i].catalogo_descripcion]
                                    item.id = qry_item.rows[n][qry.rows[i].catalogo_id]
                                    items.push(item)
                                }
                            }else
                                errors.push("No se encontro informacion en catalogo detalle.")

                            arr.items = items
                            arr.valueField = "id"
                            arr.textField = "name"
                            arr.visible = false
                            arr.modificable = true

                        }

                        data.push(arr)
                    }
                }else
                    errors.push("No se econcontro detalle del catalogo.")

            }else
                errors.push("No se econcontro el id del catalogo.")


        } catch (e) {
            errors.push('ERR-MTC-007: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-007: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return response
    }

    async getContentTableDet(table, campo_llave, columns) {
        let errors = [], data = [], response = {}

        try {
            
            let key = columns.find(column => column.key === 1)
            
            let fields = columns.map(function (value) {
                let field = value.data
                if (value.type == 'date')
                    field = `to_char(${value.data}, 'yyyy-MM-dd') AS ${value.data}`
                else if (value.onlygrid)
                    field = `(SELECT ${value.catalogo_descripcion} FROM ${value.catalogo_valores} 
                            WHERE ${value.catalogo_id} = t.${value.data.replace('_text', '')} ORDER BY ${value.data.replace('_text', '')} LIMIT 1) AS ${value.data}`

                return field
            })

            fields.push(`${key.data} AS _id`)
            
            let snt = `SELECT ${fields.join(',')} FROM ${table} t WHERE ${campo_llave} = ${this.catalogkey} ORDER BY ${campo_llave} ASC`
            const qry = await pool.query(snt)
            data = qry.rows

        } catch (e) {
            errors.push('ERR-MTC-008: Se produjo un error de ejecución')
            console.error(moment().format() + ' - ERR-MTC-008: ' + e.message)
            console.error(e)
        }

        response = {
            success: errors.length ? false : true,
            errors: errors.length ? errors : false,
            data: errors.length ? false : data
        }
        return response
    }
    
}

module.exports = MotorCatalogos