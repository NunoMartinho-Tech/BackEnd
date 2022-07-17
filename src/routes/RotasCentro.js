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

//Dashboard

//Utilizadores registados
Router.get('/utilizadores/:id', CentroController.utilizadorestotal);
//Utilizadores ativos
Router.get('/utilizadoresativos/:id', CentroController.utilizadoresativos);
//Utilizadores inativos
Router.get('/utilizadoresinativos/:id', CentroController.utilizadoresinativos);
//% de salas mais utilizadas
Router.get('/salasmaisutilizadas/:id', CentroController.salaporcapacidade);
//% de alocacao diaria por mes
Router.get('/alocacaodiaria/:id', CentroController.alocacaoDiaria);
//Necessidade atual de limpeza
Router.get('/salasporlimpar/:id', CentroController.limpezaDiaria);
//Obter reservas
Router.get('/reservasfeitas/:id', CentroController.reserasfeitas);
module.exports = Router;