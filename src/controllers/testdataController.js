const Cargos = require('../models/Cargos');
const Estados = require('../models/Estado');
const EstadoLimpezas = require('../models/EstadoLimpeza');
const TipoGestores = require('../models/TipoGestor');
const sequelize = require('../config/basedados');
const controllers = {}
sequelize.sync()

//Listar Estados
controllers.listEstados = async ( req, res) => {
    const data = await Estados.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    if(data)
        res.json({sucesso: true, data: data})
    else
        res.json({sucesso: false})
}

//Listar Cargos
controllers.listCargos = async ( req, res) => {
    const data = await Cargos.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    if(data)
        res.json({sucesso: true, data: data})
    else
        res.json({sucesso: false})
}

//Listar Estados de Limpeza
controllers.listEstadosLimpezas = async ( req, res) => {
    const data = await EstadoLimpezas.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    if(data)
        res.json({sucesso: true, data: data})
    else
        res.json({sucesso: false})
}

//Listar Tipos de Gestor
controllers.listTiposGestores = async ( req, res) => {
    const data = await TipoGestores.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    if(data)
        res.json({sucesso: true, data: data})
    else
        res.json({sucesso: false})
}

module.exports = controllers;