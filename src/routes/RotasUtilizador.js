const express = require('express');
const Router = express.Router();
const UtilizadoresController = require('../controllers/utilizadorController');
const middleware = require('../middleware');

//listar
Router.get('/list', UtilizadoresController.list)
//Selecionar
Router.get('/get/:id', middleware.checkToken, UtilizadoresController.get)
//Editar
Router.put('/update/:id', middleware.checkToken, UtilizadoresController.update)
//Eliminar
Router.post('/delete/:id', middleware.checkToken, UtilizadoresController.delete)
//Registar
Router.post('/register',  UtilizadoresController.register);
//Desativar
Router.put('/bloquear/:id', middleware.checkToken, UtilizadoresController.inativar);
//Ativar
Router.put('/ativar/:id', middleware.checkToken, UtilizadoresController.ativar);
//Login
Router.post('/login', UtilizadoresController.login);
//Obter Centros que pertence
//Router.get('/pertence/:id',UtilizadoresController.centros);

module.exports = Router;