const express = require('express');
const Router = express.Router();
const CentroController = require('../controllers/centroController');
const middleware = require('../middleware');

 //listar
Router.get('/list',middleware.checkToken, CentroController.list);
//Criar
Router.post('/add',middleware.checkToken, CentroController.add);
//Selecionar
Router.get('/get/:id',middleware.checkToken, CentroController.get);
//Editar
Router.put('/update/:id',middleware.checkToken, CentroController.update);
//Ativar
Router.put('/ativar/:id',middleware.checkToken, CentroController.ativar);
//Desativar
Router.put('/desativar/:id',middleware.checkToken, CentroController.desativar);
//Eliminar
Router.post('/delete/:id',middleware.checkToken, CentroController.delete); 

module.exports = Router;