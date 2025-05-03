'use strict'

const { Pool } = require('pg')

const config = {
	host: 'scsoftworks.ddns.net',
	user: 'uadmintorre',
	password: 'M|603k?0a/*K',
	database: 'admintorre'
}

const pool = new Pool(config)

// Setear el lc_time para lenguaje español
pool.query("set lc_time='es_ES.UTF-8'")
pool.query("set timezone='America/Mexico_City'")

module.exports = pool
