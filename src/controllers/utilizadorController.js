var bd = require('../config/basedados');
var utilizador = require('../models/Utilizador');
var pertence =  require('../models/Pertence');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt'); //encripta a pass a guardar na BD
const multer = require('multer');


var nodemailer = require('nodemailer');
const sequelize = require('sequelize');
const e = require('express');

//Dados para enviar email
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'softinsaprojetofinalestgv@gmail.com',
        pass: 'yikuljposxhrqziy'
    }
});

const controllers = {}

bd.sync()

//Listar Utilizadores

controllers.list = async (req, res) =>{
    const data = await utilizador.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    }) 
    if(data)
        res.status(200).json({sucesso:true, data: data});
    else
        res.json({sucesso: false, message:'Nao foi possivel listar os utilizadores', data: data})
}

//Obter Utilizador

controllers.get = async(req,res) =>{
    const {id} = req.params;
    var utilizadorData = await utilizador.findOne({
        where:{id:id}
    })
    if(utilizadorData){
        const data = await utilizador.findOne({
            where: {id: id},
            include: {all: true}
        })
        .then(function(data){return data;})
        .catch(error => {
            console.log('Error:'+error)
            return error;
        })
        res.status(200).json({ sucesso: true, user: data});
    }else {
        res.json({sucesso: false, message: 'Utilizador nao existe'});
    }

}

//Editar Utilizador lado gestor

controllers.update = async (req, res) =>{ 
    const {id} = req.params;
    const {PNome, UNome, Email, PalavraPasse, FotoNome, FotoData, TipoGestor, Cargos} = req.body
    var data
    if(Cargos == 1){
        if(TipoGestor == null){
            res.status({sucesso:false, message: "Insira um tipo de gestor"})
        }else{
            data = await utilizador.update({
                Pnome: PNome,
                Unome: UNome,
                Email: Email,
                PalavraPasse: PalavraPasse,
                FotoNome: FotoNome,
                FotoData: FotoData,
                TiposGestorId: TipoGestor,
                CargoId: Cargos
            },{
                where: {id: id},
            })
            .then(function(data){return data;})
            .catch(error =>{
                console.log('Error: '+error);
                return error;
            })
        }
    }else{
        data = await utilizador.update({
            Pnome: PNome,
            Unome: UNome,
            Email: Email,
            PalavraPasse: PalavraPasse,
            FotoNome: FotoNome,
            FotoData: FotoData,
            TiposGestorId: null,
            CargoId: Cargos
        },{
            where: {id: id},
        })
        .then(function(data){return data;})
        .catch(error =>{
            console.log('Error: '+error);
            return error;
        })
    }
    res.status(200).json({sucesso: true, data: data, message:'Utilizador atualizado com sucesso'})
}

//Editar Utilizador lado requesitante

controllers.updateMobile = async (req, res) =>{ 
    const {id} = req.params;
    const {PNome, UNome, Email, PalavraPasse, FotoNome, FotoData} = req.body
    const data = await utilizador.update({
        Pnome: PNome,
        Unome: UNome,
        Email: Email,
        PalavraPasse: PalavraPasse,
        FotoNome: FotoNome,
        FotoData: FotoData
    },{
        where: {id: id},
    })
    .then(function(data){return data;})
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Utilizador atualizado com sucesso'})
}

//Eliminar Utilizador

controllers.delete = async (req, res) =>{
    const {id} = req.params;
    const data = await utilizador.destroy({
        where: {id: id},
    })
    res.status(200).json({
        sucesso: true,
        message: "Utilizador eliminado com sucesso",
        deleted: data
    });
}

//Desativar Utilizador

controllers.inativar = async(req,res) =>{
    const {id} = req.params;
    const data = await utilizador.update({
        EstadoId: '2'
    },{where: {id:id}})
    .then(function(data){return data;})
    .catch(error=>{console.log('Error:' + error); return error;})
    res.status(200).json({sucesso: true, data: data, message: 'Utilizador Desativado com sucesso'})
}

//Ativar Utilizador

controllers.ativar = async(req,res) =>{
    const {id} = req.params;
    const data = await utilizador.update({
        EstadoId: '1'
    },{where: {id:id}})
    .then(function(data){return data;})
    .catch(error=>{console.log('Error:' + error); return error;})
    res.status(200).json({sucesso: true, data: data, message: 'Utilizador Ativado com sucesso'})
}

//Registar Utilizador 

controllers.register = async (req, res) =>{
    const {PNome, UNome, Email, PalavraPasse, FotoNome, FotoData, TipoGestor, Cargos, Centro} = req.body
    var data;
    if(Cargos==1){
            data = await utilizador.create({
            Pnome: PNome,
            Unome: UNome,
            Email: Email,
            PalavraPasse: PalavraPasse,
            FotoNome: FotoNome, 
            FotoData: FotoData, 
            PrimeiroLogin: '1',
            EstadoId: '1',
            TiposGestorId: TipoGestor,
            CargoId: Cargos
        })
        .then(function(data){return data;})
        .catch(error =>{console.log('Error: '+error); return error;})
    }else{
            data = await utilizador.create({
            Pnome: PNome,
            Unome: UNome,
            Email: Email,
            PalavraPasse: PalavraPasse,
            FotoNome: FotoNome, 
            FotoData: FotoData, 
            PrimeiroLogin: '1',
            EstadoId: '1',
            TiposGestorId: null,
            CargoId: Cargos
        })
        .then(function(data){return data;})
        .catch(error =>{console.log('Error: '+error); return error;})
    }
    // adicionar ao centro
    const util_pertence = await pertence.create({
        CentroId: Centro,
        UtilizadoreId: data.id
    })
    .then(function(data){return data;})
    .catch(error=>{return error});

    //Mandar email de registo
    var mailOptions = {
        from: 'softinsaprojetofinalestgv@gmail.com',
        to: data.Email,
        subject: 'Confirmação do Registo',
        text: ` 
            É com muito gosto que confirmamos o seu registo no centro da Softinsa
            
            As suas credenciais de acesso encontram-se mais abaixo, por favor mantenha as em segurança.
            Email: ${data.Email}
            Palavra Passe: ${PalavraPasse}

            PS:Não responda a este email
            `
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.status(200).json({sucesso: true, message: 'Utilizador criado com sucesso', data:data, data2: util_pertence})
}

//Atualizar a palavraPasse

controllers.atualizarPalavraPasse = async(req,res) =>{
    const {id} = req.params;
    const {PalavraPasse} = req.body
    if(PalavraPasse == ""){
        res.json({sucesso: false, message:'Insira uma palavra'})
    }

    
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(PalavraPasse, salt, function(err, hash) {
            const data = utilizador.update({
                PalavraPasse: hash
            },{
                where: {id: id},
            })
            .then(function(data){return data;})
            .catch(error =>{
                console.log('Error: '+error);
                return error;
            })
            res.status(200).json({sucesso: true, message:'Palavra Passe atualizada com sucesso'})
        });
    });
}


//Listar Centros com base no id do utilizador include tabela pertence

controllers.centros = async(req,res) =>{
    const {id} = req.params;
    const query = `select "Centros".id, "Centros"."Nome" from public."Centros" inner join public."Utilizador_Centros" on "Centros".id = "Utilizador_Centros"."CentroId"
    WHERE "Utilizador_Centros"."UtilizadoreId" = ${id}` 
    const data = await bd.query(query,{ type: QueryTypes.SELECT })
    .then(function(data){return data;})
    .catch(error=>{console.log(error); return error})
    if(data)
        res.status(200).json({sucesso: true, data: data});
    else
        res.status(403).json({sucesso: false, data: data});
}

//Registar utilizador por ficheiro


module.exports = controllers
