'use strict'

var express = require('express')
var MotorCatalogosContr = require('../controllers/motorcatalogos.controller')

var router = express.Router();

//GET
router.get('/listaMotorCat', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.getListCatalogs()
})
router.get('/getTitlesListCat/:id', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.getTitlesList()
})
router.get('/motorListaCat/:id', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.getList()
})
router.get('/getDetailCat/:id', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.getDetailCat()
})

//POST
router.post('/saveCatalog', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.saveCatalog()
})
router.post('/detailCatalog', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.saveCatalogDet()
})

//PUT
router.put('/detailCatalog', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.updCatalogDet()
})

//DELETE
router.delete('/delteRowCatalogList/:id', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.delteRowCatalogList()
})
router.delete('/delteRowCatalogDet/:id', async (req, res) => {
    const MotorCatalogos = new MotorCatalogosContr(req, res)
    await MotorCatalogos.isLogin()
    MotorCatalogos.delteRowCatalogDet()
})

module.exports = router;