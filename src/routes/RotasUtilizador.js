const express = require('express');
const Router = express.Router();
const UtilizadoresController = require('../controllers/utilizadorController');
const middleware = require('../middleware');

//listar
Router.get('/list', UtilizadoresController.list)
//Selecionar
Router.get('/get/:id', UtilizadoresController.get)
//Editar
Router.put('/update/:id', UtilizadoresController.update)
//Eliminar
Router.post('/delete/:id', UtilizadoresController.delete)
//Registar
Router.post('/register', UtilizadoresController.register);
//Desativar
Router.put('/bloquear/:id', UtilizadoresController.inativar);
//Ativar
Router.put('/ativar/:id', UtilizadoresController.ativar);
//Obter Centros que pertence
Router.get('/pertence/:id', UtilizadoresController.centros);

module.exports = Router;