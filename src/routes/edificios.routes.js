'use strict'

var express = require('express');
var edificiosController = require('../controllers/edificios.controller');

var router = express.Router();

//GET
router.get('/getEdificios/', async (req, res) => {
    const Edificio = new edificiosController(req, res)
	await Edificio.isLogin()
    Edificio.getEdificios()
})


//POST
router.post('/table/', async (req, res) => {
    const Edificio = new edificiosController(req, res)
	await Edificio.isLogin()
	Edificio.table()
})



//PUT
router.put('/updatePrioridad/', async (req, res) => {
    const Edificio = new edificiosController(req, res)
	await Edificio.isLogin()
	Edificio.updatePrioridad()
})



module.exports = router;