const Cargos = require('../models/Cargos');
const Estados = require('../models/Estado');
const EstadoLimpezas = require('../models/EstadoLimpeza');
const TipoGestores = require('../models/TipoGestor');
const sequelize = require('../config/basedados');


const controllers = {}
sequelize.sync()

controllers.listEstados = async ( req, res) => {
    const data = await Estados.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    res.json({
        sucesso: true,
        data: data
    })
}

controllers.listCargos = async ( req, res) => {
    const data = await Cargos.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    res.json({
        sucesso: true,
        data: data
    })
}

controllers.listEstadosLimpezas = async ( req, res) => {
    const data = await EstadoLimpezas.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    res.json({
        sucesso: true,
        data: data
    })
}

controllers.listTiposGestores = async ( req, res) => {
    const data = await TipoGestores.findAll()
    .then(function(data){return data;})
    .catch(error =>{
        return error;
    })
    res.json({
        sucesso: true,
        data: data
    })
}

module.exports = controllers;