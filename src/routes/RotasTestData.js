const express = require('express');
const router = express.Router();
const TestDataController = require('../controllers/testdataController');

//Listar Estados
router.get('/listEstados', TestDataController.listEstados);
//Listar Cargos
router.get('/listCargos', TestDataController.listCargos);
//Listar Estados de Limpeza
router.get('/listEstadosLimpezas', TestDataController.listEstadosLimpezas);
//Listar Tipos de Gestor
router.get('/listTiposGestores', TestDataController.listTiposGestores);

module.exports = router
