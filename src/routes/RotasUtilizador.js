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
//Editar
Router.put('/updateMobile/:id', UtilizadoresController.updateMobile)
//Eliminar
Router.post('/delete/:id', UtilizadoresController.delete)
//Registar
Router.post('/register', UtilizadoresController.register);
//Desativar
Router.put('/desativar/:id', UtilizadoresController.inativar);
//Ativar
Router.put('/ativar/:id', UtilizadoresController.ativar);
//Obter Centros que pertence
Router.get('/pertence/:id', UtilizadoresController.centros);
//Atualizar a palavra passe
Router.put('/editpasse/:id', UtilizadoresController.atualizarPalavraPasse);
//Registar Utilizador por ficheiro
Router.post('/ficheiro', UtilizadoresController.ficheiro)


module.exports = Router;