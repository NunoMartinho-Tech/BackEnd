var bd = require('../config/basedados');
var utilizador = require('../models/Utilizador');
var pertence =  require('../models/Pertence');
var centro = require('../models/Centros');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
var nodemailer = require('nodemailer');

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

//Atualizar a palavraPasse

//Editar só para o Utilizador foto, nome e email

//Editar o Utilizador palavraPasse

//Listar Centros com base no id do utilizador include tabela pertence

/* controllers.centros = async(req,res) =>{
    const {id} = req.params;
    const data = utilizador.findAll({
        include:  centro
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    }) 
    res.status(200).json({sucesso:true, data: data});
} */

//Listar Utilizadores

controllers.list = async (req, res) =>{
    const data = await utilizador.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    }) 
    res.status(200).json({sucesso:true, data: data});
}

//Obter Utilizador

controllers.get = async(req,res) =>{

    const {id} = req.params;
    const data = await utilizador.findAll({
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

//Editar Utilizador

controllers.update = async (req, res) =>{ 
    const {id} = req.params;
    const {PNome, UNome, Email, PalavraPasse, Foto, TipoGestor, Cargos} = req.body

    const data = await utilizador.update({
        Pnome: PNome,
        Unome: UNome,
        Email: Email,
        PalavraPasse: PalavraPasse,
        Foto: Foto,
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
    const [id] = req.params;
    const data = await utilizador.update({
        EstadoId: '2'
    },{where: {id:id}})
    .then(function(data){return data;})
    .catch(error=>{console.log('Error:' + error); return error;})
    res.status(200).json({sucesso: true, data: data, message: 'Utilizador Desativado com sucesso'})
}

//Ativar Utilizador

controllers.ativar = async(req,res) =>{
    const [id] = req.params;
    const data = await utilizador.update({
        EstadoId: '1'
    },{where: {id:id}})
    .then(function(data){return data;})
    .catch(error=>{console.log('Error:' + error); return error;})
    res.status(200).json({sucesso: true, data: data, message: 'Utilizador Ativado com sucesso'})
}

//Registar Utilizador 

controllers.register = async (req, res) =>{
    const {PNome, UNome, Email, PalavraPasse, Foto, TipoGestor, Cargos, Centro} = req.body
    const data = await utilizador.create({
        Pnome: PNome,
        Unome: UNome,
        Email: Email,
        PalavraPasse: PalavraPasse,
        Foto: Foto, 
        PrimeiroLogin: '1',
        EstadoId: '1',
        TiposGestorId: TipoGestor,
        CargoId: Cargos
    })
    .then(function(data){return data;})
    .catch(error =>{console.log('Error: '+error); return error;})
    //Falta o adicionar ao centro

    //Mandar email de registo
    var mailOptions = {
        from: 'softinsaprojetofinalestgv@gmail.com',
        to: data.Email,
        subject: 'Confirmação do Registo',
        text: ` 
            É com muito gosto que confirmamos o seu registo no centro da Softinsa em ....
            
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
    res.status(200).json({sucesso: true, message: 'Utilizador criado com sucesso', data:data})
}

//Registar utilizador por ficheiro



//Login Utilizador

controllers.login = async(req,res) =>{
    if(req.body.email && req.body.password){
        var email = req.body.email;
        var password = req.body.password;
    }
    var user = await utilizador.findOne({where: {Email: email}})
    .then(function(data){return data;})
    .catch(error =>{console.log('Error: ')+error; return error;})
    if(password == null || typeof password == "undefined"){
        res.status(403).json({sucesso:false, message:'Campos em Branco'});
    }else{
        if(req.body.email && req.body.password && user){
            const isMatch = bcrypt.compareSync(password, user.PalavraPasse);
            //console.log(isMatch)
            if(req.body.email == user.Email && isMatch){
                //console.log("Passei pela verificação")
                let token = jwt.sign({email: req.body.email}, config.jwtSecret, {expiresIn: '1h'});
                //console.log("token")
                res.status(200).json({sucesso: true, message:'Utilizador autenticado com sucesso', data: token});
            }else{
                res.status(403).json({sucesso: false, message: 'Dados de autenticação inválidos.'});
            }    
        }else{
            res.status(403).json({sucesso:false, message:'Erro no processo de autenticação: Por favor tente mais tarde' })
        }
    }
}

module.exports = controllers
