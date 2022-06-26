const express = require('express');
const Router = express.Router();
const SalasController = require('../controllers/salaController');

//listar
Router.get('/list', SalasController.list)
//Criar
Router.post('/add', SalasController.add)
//Selecionarw
Router.get('/get/:id', SalasController.get)
//Editar
Router.put('/update/:id', SalasController.update)
//Eliminar
Router.post('/delete/:id', SalasController.delete)
//Ativada
Router.put('/ativar/:id', SalasController.ativar);
//Desativada
Router.put('/desativar/:id', SalasController.desativar);
//Obter Codigo
Router.get('/codigo/:id', SalasController.code);
//Obter Lista de Salas com base no centro
Router.get('/centro/:id', SalasController.Salas);
module.exports = Router;