'use strict'

var express = require('express');
var dashboardController = require('../controllers/dashboard.controller');

var router = express.Router();

//get
router.get('/checaPerfil/', async (req, res) => {
	const Dashboard = new dashboardController(req, res)
	await Dashboard.isLogin()
	Dashboard.checaPerfil()
})
 
//post
router.get('/getCountTickets/', async (req, res) => {
	const Dashboard = new dashboardController(req, res)
	await Dashboard.isLogin()
	Dashboard.getCountTickets()
})


module.exports = router;