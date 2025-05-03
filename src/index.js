'use strict'

require('dotenv').config({ path: __dirname + '/../.env' });
var app = require('./app');
var port = 8005;

app.listen(port, ()=>{
	console.log('Servidor corriendo en http://localhost:'+port);
});