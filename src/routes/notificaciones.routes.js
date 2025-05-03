'use strict'

var express = require('express')
var Notificaciones = require('../controllers/notificaciones.controller')

var router = express.Router();

//GET
router.get('/notificacion/:id', async (req, res) => {
	const Notif = new Notificaciones(req, res)
	await Notif.isLogin()
	Notif.getNotification()
})
router.get('/notificaciones', async (req, res) => {
	const Notif = new Notificaciones(req, res)
	await Notif.isLogin()
	Notif.getNotifications()
})


//POST
router.post('/socket', async (req, res) => {
	const Notif = new Notificaciones(req, res)
	await Notif.isLogin()
	Notif.setSocket()
})

router.post('/notificacion', async (req, res) => {
	const Notif = new Notificaciones(req, res)
	await Notif.isLogin()
	Notif.setNotificacion()
})

module.exports = router;