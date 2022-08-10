const express = require('express');
const Router = express.Router();
const ReservasController = require('../controllers/reservasController');

 //listar
Router.get('/list', ReservasController.list);
//Listar reservas com base no centro e no user
Router.get('/listReservas/:id',ReservasController.listReservas)
//Listar reservas com base no centro e no user MOBILE
Router.put('/listReservasUserCentro/:id',ReservasController.listReservasMobile)
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
//Lista a proxima reuniao
Router.post('/proximareuniao/:id', ReservasController.proximareserva)
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