const express = require('express');
const router = express.Router();
const TestDataController = require('../controllers/testdataController');
const middleware = require('../middleware');

router.get('/listEstados', TestDataController.listEstados );
router.get('/listCargos', TestDataController.listCargos );
router.get('/listEstadosLimpezas', TestDataController.listEstadosLimpezas );
router.get('/listTiposGestores', TestDataController.listTiposGestores );

module.exports = router
