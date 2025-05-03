'use strict'

var express = require('express');
var ticketsController = require('../controllers/tickets.controller');

var router = express.Router();

//GET
router.get('/getTicketsRegistrados/', async (req, res) => {
	const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsRegistrados()
})
router.get('/getPortales/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getPortales()
})
router.get('/getTicketsRecientes/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsRecientes()
})
router.get('/getTicketsFacturanot/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsFacturanot()
})
router.get('/getTicketsAvaluos/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsAvaluos()
})
router.get('/getTicketsCorregidora/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsCorregidora()
})
router.get('/getTicketsMarques/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsMarques()
})
router.get('/getTicketsEzequiel/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsEzequiel()
})
router.get('/getTicketsSJoaquin/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsSJoaquin()
})
router.get('/getTicketsResueltos/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsResueltos()
})
router.get('/getTicketsCancelados/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsCancelados()
})
/*router.get('/tickets-proceso/:userid', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsByUser()
})*/







//POST
router.post('/getTickets/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
    Tickets.getTickets()
})

router.post('/refreshnotification/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.refreshnotification()
})
router.post('/table/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.table()
})
router.post('/detalleTicket/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.detalleTicket()
})
router.post('/historialTicket/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.historialTicket()
})
router.post('/enviarTicketResuelto/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.enviarTicketResuelto()
})
router.post('/enviarTicketCancelado/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.enviarTicketCancelado()
})
router.post('/getTicketsTotales/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsTotales()
})
router.post('/prioridadTicket/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.prioridadTicket()
})
router.post('/TicketsFiltrados/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.TicketsFiltrados()
})
router.post('/TicketsFiltradosResueltos/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.TicketsFiltradosResueltos()
})
router.post('/TicketsFiltradosCancelados/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.TicketsFiltradosCancelados()
})

/*
router.post('/getTicketsProceso/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsProceso()
})
*/



//PUT
router.put('/updatePrioridad/', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.updatePrioridad()
})



module.exports = router;