var bd = require('../config/basedados');
var sala = require('../models/Salas');
var centro = require('../models/Centros');
const QRCode = require('qrcode');


const controllers = {}

bd.sync()

//Listar Salas com base no id do centro e com o estado ativo

controllers.Salas = async(req,res) =>{
    const {id} = req.params;
    const data = await sala.findAll({
        where: {CentroId: id, EstadoId: '1'},
        include: {all: true}
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso: true, data: data});
}


//Listar Salas

controllers.list = async (req, res) =>{
    const data = await sala.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso:true, data: data});
}

//Adicionar Sala

controllers.add = async (req, res) =>{
    const {Nome, Capacidade, Alocacao, TempoLimpeza, Centro} = req.body

    const data = await sala.create({
        Nome: Nome,
        Capacidade: Capacidade,
        Alocacao: Alocacao,
        Tempo_Limpeza: TempoLimpeza,
        Motivo_Bloqueio: 'null',
        EstadoId: '1',
        CentroId: Centro,
        EstadosLimpezaId: '1'
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message: 'Sala adicionada'});
}

//Obter QR Code

controllers.code = async(req,res) =>{
    const {id} = req.params;
    const data = await sala.findAll({
        where: {id: id}
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    let info = JSON.stringify(data);
    //Print na Consola
    QRCode.toString(info,{type:'terminal'},function (err, code) { 
        if(err) return console.log("error occurred")
        // Imprimir o codigo
        console.log(code)
    })
    //Converter para base64
    QRCode.toDataURL(info,function (err, code) { 
        if(err) return console.log("error occurred")
        // Imprimir o codigo
        console.log(code)
        res.status(200).json({sucesso: true, data: code, message:"Codigo gerado com sucesso"} )
    })
}

//Obter Sala

controllers.get = async(req,res) =>{

    const {id} = req.params;
    const data = await sala.findAll({
        where: {id: id},
        include: {all: true}
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso: true, data: data});
}

//Editar Sala

controllers.update = async (req, res) =>{ 
    const {id} = req.params;

    const {Nome, Capacidade, Alocacao, TempoLimpeza, QRCode, Centro} = req.body

    const data = await sala.update({ 
        Nome: Nome,
        Capacidade: Capacidade,
        Alocacao: Alocacao,
        Tempo_Limpeza: TempoLimpeza,
        QR_Code: QRCode,
        CentroId: Centro
    },{where: {id: id}})

    .then(function(data){
        return data;
    })
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Sala atualizada'})
}

//Editar QRCode

//Desativar Sala

controllers.desativar= async (req,res) =>{
    const {id} = req.params;

    const {Motivo} = req.body

    const data = await sala.update({ 
        Motivo_Bloqueio: Motivo,
        EstadoId: '2'
    },{where: {id: id}})

    .then(function(data){
        return data;
    })
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Sala desativada com sucesso'})
}

//Ativar Sala

controllers.ativar= async(req,res) =>{
    const {id} = req.params;

    const data = await sala.update({  
        EstadoId: '1',
        Motivo_Bloqueio: ""
    },{where: {id: id}})

    .then(function(data){
        return data;
    })
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Sala ativada com sucesso'})
}

//Eliminar Sala

controllers.delete = async (req, res) =>{
    const {id} = req.params;
    const data = await sala.destroy({
        where: {id: id},
    })
    res.status(200).json({
        sucesso: true,
        message: "Sala eliminada com sucesso",
        deleted: data
    });
}


module.exports = controllers
