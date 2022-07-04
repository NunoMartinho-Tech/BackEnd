const express = require('express');
const Router = express.Router();
const ReservasController = require('../controllers/reservasController');
const middleware = require('../middleware');

 //listar
Router.get('/list',middleware.checkToken, ReservasController.list);
//criar
Router.post('/add',middleware.checkToken, ReservasController.add);
//Selecionar
Router.get('/get/:id',middleware.checkToken, ReservasController.get);
//Editar
Router.put('/update/:id',middleware.checkToken, ReservasController.update);
//eliminar
Router.post('/delete/:id',middleware.checkToken, ReservasController.delete); 
//Adiar
//Router.put('/adiar/:id',ReservasController.adiar);


module.exports = Router;