const express = require('express');
const Router = express.Router();
const CentroController = require('../controllers/centroController');
const middleware = require('../middleware');

 //listar
Router.get('/list', CentroController.list);
//Criar
Router.post('/add', CentroController.add);
//Selecionar
Router.get('/get/:id', CentroController.get);
//Editar
Router.put('/update/:id', CentroController.update);
//Ativar
Router.put('/ativar/:id', CentroController.ativar);
//Desativar
Router.put('/desativar/:id', CentroController.desativar);
//Eliminar
Router.post('/delete/:id', CentroController.delete); 

module.exports = Router;