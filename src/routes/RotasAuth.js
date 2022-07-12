const express = require('express')
const Router = express.Router();

//Importar Controlador
const autController = require('../controllers/AuthController');

Router.post('/loginGestor', autController.loginGestor)
Router.post('/loginRequesitante', autController.loginRequesitante)

module.exports = Router;