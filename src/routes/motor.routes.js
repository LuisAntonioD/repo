'use strict'

var express = require('express')
var MotorContr = require('../controllers/motor.controller')

var router = express.Router()

//get
router.get('/getTitlesList/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getTitlesList()
})
router.get('/motorLista/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.motorList()
})
router.get('/getTabs/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getTabs()
})
router.get('/getTabs', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getTabs()
})
router.get('/motorRecord/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getRecord()
})
router.get('/motorNotes/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.notes()
})
router.get('/document/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.document()
})
router.get('/getContentTab/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getContentTab()
})
router.get('/motorDocumentosObligatorios', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getDocumentosObligatorios()
})

//post
router.post('/motorLista/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.motorList()
})
router.post('/saveTabs', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.saveTabs()
})
router.post('/motorControlPanel/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.motorControlPanel()
})
router.post('/motorNotes', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.saveNotes()
})
router.post('/document/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.setDocument()
})
router.post('/catalogo/:catalogo', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.getCatalogo()
})

router.post("/upload", async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
    Motor.uploadFile(req, res)
});

router.post("/dropboxLink", async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
    Motor.dropboxLink(req, res)
});
//put

//delete
router.delete('/deleteDocument/:id', async (req, res) => {
	const Motor = new MotorContr(req, res)
	await Motor.isLogin()
	Motor.deleteDocumentById()
})

module.exports = router