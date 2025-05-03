'use strict'

var express = require('express');
var AdmintorreController = require('../controllers/admintorreclass.controller');

var router = express.Router();

//get
router.get('/tramites', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getTramites()
})

router.get('/fillCombo/:combo', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.switchfillCombo()
})

router.get('/fillComboByParent/:parametros', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.fillComboByParent()
})

router.get('/getEstados/', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getEstados()
})

router.get('/getMunicipios/:id', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getMunicipios()
})

router.get('/getLocalidades/:id', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getLocalidades()
})
router.get('/getPin', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getPin()
})


//post
router.post('/mainMenu', async (req, res) => {
	const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.mainMenu()
})

router.post('/getInfoUser', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.getInfoUser()
})

router.post('/userInfo', async (req, res) => {
    const Admintorre = new AdmintorreController(req, res)
	await Admintorre.isLogin()
	Admintorre.setUserInfo()
})




module.exports = router;