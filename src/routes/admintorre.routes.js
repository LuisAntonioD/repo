'use strict'

var express = require('express');
var AdmintorreController = require('../controllers/admintorreclass.controller');
var ticketsController = require('../controllers/tickets.controller');

var router = express.Router();

// Rutas que no necesitan validar si esta logeado
// GET

//pagar los tramites sin aplicar en sim
router.get('/pagarResagados', async (req, res) => {
    var carritoController = require('../controllers/carrito.controller');
    const Carrito = new carritoController(req, res)
    Carrito.pagarResagados()
})
router.get('/pagarResagados/:idTramite', async (req, res) => {
    var carritoController = require('../controllers/carrito.controller');
    const Carrito = new carritoController(req, res)
    Carrito.pagarResagados()
})

router.get('/notifications', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.getNotifications()
})
router.get('/checkSession/:id', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.checkSession()
})
router.get('/cliente', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.getNameCliente()
})
router.get('/fillComboNoSess/:combo', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.switchfillComboNoSess()
})

router.get('/tickets-proceso/:userid', async (req, res) => {
    const Tickets = new ticketsController(req, res)
	await Tickets.isLogin()
	Tickets.getTicketsByUser()
})

// POST
router.post('/loggout', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.loggout()
})
router.post('/login', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.login()
})
router.post('/login_pin', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.login_pin()
})
router.post('/sendCodeValidation', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.sendCodeValidation()
})
router.post('/validateCode', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.validateCode()
})
router.post('/recoverPassword', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.recoverPassword()
})
router.post('/saveUser', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.saveUser()
})
router.post('/validatePoliza', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.validatePoliza()
})
router.post('/validaReciboPago', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.validaReciboPago()
})
/*
router.post('/validaAcuse', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	Admintorre.validaAcuse()
})
*/
router.post('/callback_bbva', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
    Admintorre.callbackBbva()
})
router.post('/calculadoraTD', (req, res) => {
    const Traslado = new TrasladoController(req, res)
	Traslado.getCalculoNoSess()
})
router.post('/applyPaymentClabe', (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
    Admintorre.applyPaymentClabe()
})

module.exports = router;