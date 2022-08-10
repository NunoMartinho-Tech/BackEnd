var bd = require('../config/basedados');
var utilizador = require('../models/Utilizador');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const controllers = {}
bd.sync()

controllers.loginGestor = async(req,res) =>{
    if(req.body.email !=null && req.body.password != null){
        if(req.body.email != "" && req.body.password != ""){
            var email = req.body.email;
            var password = req.body.password;

            var user = await utilizador.findOne({where: {Email: email},
                include: {all: true}})
            .then(function(data){return data;})
            .catch(error =>{console.log('Error: ')+error; return error;})

            if(user){
                if(user.EstadoId == 1){
                    if(user.CargoId == 1){ //Gestor
                        if(password == null || typeof password == "undefined"){
                            res.json({sucesso:false, message:'Insira uma email ou palavra-passe'});
                        }else{
                            if(req.body.email && req.body.password && user){
                                const isMatch = bcrypt.compareSync(password, user.PalavraPasse);
                                //console.log(isMatch)
                                if(req.body.email == user.Email && isMatch){
                                    //console.log("Passei pela verificação")
                                    let token = jwt.sign({email: req.body.email}, config.jwtSecret, {expiresIn: '24h'});
                                    //console.log("token")
                                    res.status(200).json({
                                        sucesso: true, 
                                        message:'Autenticação com sucesso', 
                                        token: token, 
                                        user: user
                                    });
                                }else{
                                    res.json({sucesso: false, message: 'Erro no servidor'});
                                }    
                            }else{
                                res.json({sucesso:false, message:'Erro no servidor'})
                            }
                        }
                    }else{
                        res.json({sucesso:false, message:'Dados inválidos'});
                    }
                }else{
                    res.json({sucesso: false, message:'Dados inválidos'})
                }
            }else{
                res.json({sucesso: false, message: 'Dados inválidos'});
            }
        }else
            res.json({sucesso: false, message: 'Insira uma email ou palavra-passe'});
    }else
        res.json({sucesso: false, message: 'Insira uma email ou palavra-passe'});
}

controllers.loginRequesitante = async(req,res) =>{
    if(req.body.email && req.body.password){
        var email = req.body.email;
        var password = req.body.password;

        var user = await utilizador.findOne({where: {Email: email}})
        .then(function(data){return data;})
        .catch(error =>{console.log('Error: ')+error; return error;})

        if(user){
            if(user.EstadoId == 1){
                if(user.CargoId != 1){ //Requesitante ou limpeza
                    if(password == null || typeof password == "undefined"){
                        res.json({sucesso:false, message:'Insira uma email ou palavra-passe'});
                    }else{
                        if(req.body.email && req.body.password && user){
                            const isMatch = bcrypt.compareSync(password, user.PalavraPasse);
                            //console.log(isMatch)
                            if(req.body.email == user.Email && isMatch){
                                //console.log("Passei pela verificação")
                                let token = jwt.sign({email: req.body.email}, config.jwtSecret, {expiresIn: '24h'});
                                //console.log("token")
                                res.status(200).json({
                                    sucesso: true, 
                                    message:'Autenticação com sucesso', 
                                    token: token, 
                                    user: user,
                                    id: user.id,
                                    login: user.PrimeiroLogin
                                });
                            }else{
                                res.json({sucesso: false, message: 'Dados inválidos'});
                            }    
                        }else{
                            res.json({sucesso:false, message:'Insira uma email ou palavra-passe'})
                        }
                    }
                }else{
                    res.json({sucesso:false, message:'Dados inválidos'});
                }
            }else{
                res.json({sucesso: false, message:'Dados inválidos'})
            }
        }else{
            res.json({sucesso: false, message: 'Dados inválidos'});
        }
    }else
        res.json({sucesso: false, message: 'Insira uma email ou palavra-passe'});
}

module.exports = controllers