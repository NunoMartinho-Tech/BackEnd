const express = require('express');
const Router = express.Router();
const SalasController = require('../controllers/salaController');


//listar
Router.get('/list',SalasController.list)
//Listar salas com base no centro
Router.get('/listSalas/:id', SalasController.ListarSalas)
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
 //listar reservas ativas
Router.get('/listativas/:id', SalasController.listReservas);

//Validar utilizador com base na sala
Router.get('/utilizador/:iduser/:idsala', SalasController.user);

module.exports = Router; 