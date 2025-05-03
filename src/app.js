'use strct'

//cargar modulos de node para crear servisor
var express = require('express');
var bodyParser = require('body-parser');
const fileupload = require("express-fileupload");

//ejecutar express
var app = express()
app.use(fileupload())

//cargar ficheros rutas
var admintorreRoutes = require('./routes/admintorre.routes');
var admintorrevRoutes = require('./routes/admintorrev.routes');
var motorRoutes = require('./routes/motor.routes');
var dashboard = require('./routes/dashboard.routes');
var motorcatalogos = require('./routes/motorcatalogos.routes');
var notificaciones = require('./routes/notificaciones.routes');
var edificios = require('./routes/edificios.routes');



//Middlewares
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.json({limit: "50mb"}));

//CORS (se ejecuta antes de cada ruta para permitir que cualquier cliente pueda hacer peticiones)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, Authentication, processid, catalogid, empresaid, procedureKey, catalogKey, userid, objName, cache-control');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//Añadir prefijos rutas / cargar rutas
app.use('/api', admintorreRoutes);

app.use(async (req, res, next) => {
    if (req.method != 'OPTIONS'){
        var admintorreController = require('./controllers/admintorreclass.controller');
        const admintorre = new admintorreController(req, res)
        if (await admintorre.isLogin())
            next()
        else{
            let response = {
                success: false,
                errors: ["Su sesión ha expirado. Favor de iniciar sesión nuevamente."],
                data: false
            }   
            return res.status(401).send(response)
        }
    } else
        return res.status(200).send({})
})

app.use('/api', admintorrevRoutes);
app.use('/api', motorRoutes);
app.use('/api', dashboard);
app.use('/api', motorcatalogos);
app.use('/api', notificaciones);
app.use('/api', edificios);
module.exports = app;