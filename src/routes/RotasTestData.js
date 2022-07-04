const express = require('express');
const router = express.Router();
const TestDataController = require('../controllers/testdataController');
const middleware = require('../middleware');

router.get('/listEstados', middleware.checkToken, TestDataController.listEstados );
router.get('/listCargos', middleware.checkToken, TestDataController.listCargos );
router.get('/listEstadosLimpezas', middleware.checkToken, TestDataController.listEstadosLimpezas );
router.get('/listTiposGestores', middleware.checkToken, TestDataController.listTiposGestores );

module.exports = router
