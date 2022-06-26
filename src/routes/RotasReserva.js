const express = require('express');
const Router = express.Router();
const ReservasController = require('../controllers/reservasController');

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
//Adiar
//Router.put('/adiar/:id',ReservasController.adiar);


module.exports = Router;