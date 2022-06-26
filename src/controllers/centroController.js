var bd = require('../config/basedados');
var centro = require('../models/Centros');
var estado = require('../models/Estado');

const controllers = {};

bd.sync()

//Listar Centros

controllers.list = async (req, res) =>{
    const data = await centro.findAll({
        include: [estado]
    })
    .then(function(data){return data;})
    .catch(error =>{return error;})
    res.status(200).json({sucesso: true, data: data});
}

//Adicionar Centro

controllers.add = async(req, res) => {
    const {Nome, Endereco, Hora_abertura, Hora_fecho, Telefone} = req.body

    const data = await centro.create({
        Nome: Nome,
        Endereco: Endereco,
        Hora_abertura: Hora_abertura,
        Hora_fecho: Hora_fecho,
        Telefone: Telefone,
        EstadoId: '1'
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message: 'Centro adicionado'});
}

//Obter Centro

controllers.get = async(req,res) => {
    const {id} = req.params;
    const data = await centro.findAll({
        where: {id: id},
        include: [estado]
    })
    .then(function(data){
        return data;
    })
    .catch(error => {
        console.log('Error: '+error)
        return error;
    })
    res.status(200).json({
        sucesso: true,
        data: data
    })
}

//Editar Centro

controllers.update = async(req,res) => {
    const {id} = req.params;

    const {Nome, Endereco, Hora_abertura, Hora_fecho, Telefone} = req.body

    const data = await centro.update({
        Nome: Nome,
        Endereco: Endereco,
        Hora_abertura: Hora_abertura,
        Hora_fecho: Hora_fecho,
        Telefone: Telefone,
    },{where: {id: id}})
    .then(function(data){
        return data;
    })
    .catch(error => {
        console.log('Error: '+error)
        return error;
    })
    res.status(200).json({
        sucesso: true,
        data: data,
        message: 'Centro atualizado com sucesso'
    })
}

//Eliminar Centro

controllers.delete = async(req,res) => {
    const {id} = req.params;
    const data = await centro.destroy({
        where: {id: id},
    })
    res.status(200).json({
        sucesso: true,
        message: "Centro eliminado com sucesso",
        deleted: data
    });
}

//Inativar centro

controllers.desativar = async(req,res) => {
    const {id} = req.params;

    const data = await centro.update({
        EstadoId: '2'
    },{where: {id: id}})
    .then(function(data){
        return data;
    })
    .catch(error => {
        console.log('Error: '+error)
        return error;
    })
    res.status(200).json({
        sucesso: true,
        data: data,
        message: 'Centro desativado com sucesso'
    })
}

//Ativar centro

controllers.ativar = async(req,res) => {
    const {id} = req.params;

    const data = await centro.update({
        EstadoId: '1'
    },{where: {id: id}})
    .then(function(data){
        return data;
    })
    .catch(error => {
        console.log('Error: '+error)
        return error;
    })
    res.status(200).json({
        sucesso: true,
        data: data,
        message: 'Centro ativado com sucesso'
    })
}


module.exports = controllers