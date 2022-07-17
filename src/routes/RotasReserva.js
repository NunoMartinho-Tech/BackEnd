const express = require('express');
const Router = express.Router();
const ReservasController = require('../controllers/reservasController');
const middleware = require('../middleware');

 //listar
Router.get('/list', ReservasController.list);
//criar
Router.post('/add', ReservasController.add);
//Selecionar
Router.get('/get/:id', ReservasController.get);
//Editar
Router.put('/update/:id', ReservasController.update);
//eliminar
Router.post('/delete/:id', ReservasController.delete); 
//Ativar
Router.put('/ativar/:id',ReservasController.ativar);
//Desativar
Router.put('/desativar/:id',ReservasController.desativar);
//Listar Reservas Passadas com base no utilizador
Router.get('/reservaspassadas/:id', ReservasController.reservasPassadasdeUtilizador);
//Listar Reservas com base no utilizador
Router.get('/todasreservas/:id', ReservasController.reservasdoUtilizador);
//Listar Reservas ativas com base no utilizador
Router.get('/todasreservasativas/:id', ReservasController.reservasativasdoUtilizador);
//Listar Reservas futuras e ativas com base no utilizador
Router.get('/reservasfuturas/:id', ReservasController.reservasfuturasdoUtilizador);
//Adiar Reserva
Router.put('/adiar/:id',ReservasController.adiar);
//Terminar mais cedo
Router.put('/terminar/:id', ReservasController.terminarCedo);
//# de reservas por range de datas
Router.put('/entredatas/:id', ReservasController.entredatas);

module.exports = Router;