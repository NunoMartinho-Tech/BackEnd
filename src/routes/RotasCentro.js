const express = require('express');
const Router = express.Router();
const CentroController = require('../controllers/centroController');

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
//Utilizadores registados
Router.get('/utilizadores/:id', CentroController.utilizadorestotal)
//Utilizadores ativos
Router.get('/utilizadoresativos/:id', CentroController.utilizadoresativos)
//Utilizadores inativos
Router.get('/utilizadoresinativos/:id', CentroController.utilizadoresinativos)

module.exports = Router;