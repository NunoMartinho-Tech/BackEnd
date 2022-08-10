const express = require('express')
const Router = express.Router();

//Importar Controlador
const autController = require('../controllers/AuthController');

//Login Site
Router.post('/loginGestor', autController.loginGestor)
//Login App Mobile
Router.post('/loginRequesitante', autController.loginRequesitante)

module.exports = Router;