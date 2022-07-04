const express = require('express');
const Router = express.Router();
const SalasController = require('../controllers/salaController');
const middleware = require('../middleware');

//listar
Router.get('/list',middleware.checkToken, SalasController.list)
//Criar
Router.post('/add',middleware.checkToken, SalasController.add)
//Selecionarw
Router.get('/get/:id',middleware.checkToken, SalasController.get)
//Editar
Router.put('/update/:id',middleware.checkToken, SalasController.update)
//Eliminar
Router.post('/delete/:id',middleware.checkToken, SalasController.delete)
//Ativada
Router.put('/ativar/:id',middleware.checkToken, SalasController.ativar);
//Desativada
Router.put('/desativar/:id',middleware.checkToken, SalasController.desativar);
//Obter Codigo
Router.get('/codigo/:id',middleware.checkToken, SalasController.code);
//Obter Lista de Salas com base no centro
Router.get('/centro/:id',middleware.checkToken, SalasController.Salas);

module.exports = Router;