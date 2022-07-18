var bd = require('../config/basedados');
var sala = require('../models/Salas');
var centros = require('../models/Centros');
var historicoLimpezas = require('../models/Historico_limpezas')
var historicoAdiamentos = require('../models/Historico_adiamentos')
var reserva = require('../models/Reservas');
const QRCode = require('qrcode');
const { QueryTypes } = require('sequelize');


const controllers = {}

bd.sync()

//Listar Salas

controllers.list = async (req, res) =>{
    const data = await sala.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        //console.log('Error:'+error)
        return error;
    })
    if(data)
        res.status(200).json({sucesso:true, data: data});
    else
        res.status({sucesso: false, message:"Nao foi possivel obter as salas"});
}

//Adicionar Sala

controllers.add = async (req, res) =>{
    const {Nome, Capacidade, Alocacao, TempoLimpeza, Centro} = req.body

    var AlocacaoArray = Alocacao.split(',')
    var AlocacaoNova = Number(AlocacaoArray[0]);
    var CapacidadeArray = Capacidade.split(',')
    var CapacidadeNova = Number(CapacidadeArray[0]);
    if(Centro!=null || Centro == 0 || Centro == ""){
        const centro = await centros.findOne({
            where:{ id: Centro}
        })
        
        if(centro){
            if(CapacidadeNova <= 0)
                res.json({sucesso: false, message: "A capacidade da sala nao pode ser inferior ou igual a 0"})
            else{
                if(AlocacaoNova < 1 || AlocacaoNova > 100){
                    res.json({sucesso: false, message:'A alocacao tem que ser entre 1 e 100'})
                }else{

                        var Nome_Limpo = Nome.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
                        const data = await sala.create({
                            Nome: Nome_Limpo,
                            Capacidade: CapacidadeNova,
                            Alocacao: AlocacaoNova,
                            Tempo_Limpeza: TempoLimpeza,
                            Motivo_Bloqueio: "",
                            EstadoId: '1',
                            CentroId: Centro,
                            EstadosLimpezaId: '1'
                        })
                        .then(function(data){return data;})
                        .catch(error => {
                            //console.log('Error:'+error)
                            return error;
                        })
                        res.status(200).json({sucesso: true, data: data, message: 'Sala adicionada com sucesso'});
                }
            }
        }else
            res.json({sucesso: false, message:"O centro nao existe "})
    }else{
        res.json({sucesso: false, message:'Selecione um centro'})
    }
}

//Obter Sala

controllers.get = async(req,res) =>{

    const {id} = req.params;
    if(id!=null){
        const data = await sala.findOne({
            where: {id: id},
            include: {all: true}
        })
        .then(function(data){return data;})
        .catch(error => {
            console.log('Error:'+error)
            return error;
        })
        if(data)
            res.status(200).json({sucesso: true, data: data});
        else
            res.json({sucesso:false, message:'Nao foi possivel encontrar a sala com o id: ' + id})
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Editar Sala

controllers.update = async (req, res) =>{ 
    const {id} = req.params;

    const {Nome, Capacidade, Alocacao, TempoLimpeza, Centro, Estado, MotivoBloqueio} = req.body

    var Nome_Limpo = Nome.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

    if(id!=null){

        const saladata = await sala.findOne({
            where:{id:id}
        })
        const centro = await centros.findOne({
            where:{ id: Centro}
        })

        if(saladata){
            if(centro){
                if(Capacidade <= 0)
                    res.json({sucesso: false, message: "A capacidade da sala nao pode ser inferior ou igual a 0"})
                else{
                    if(Alocacao < 1 || Alocacao > 100){
                        res.json({sucesso: false, message:'A alocacao tem que ser entre 1 e 100'})
                    }else{
                            if(Estado==2){ 
                                if(MotivoBloqueio==""){
                                    res.json({sucesso: false, message:'Insira um motivo de inativação'});
                                }else{
                                    const data = await sala.update({ 
                                        Nome: Nome_Limpo,
                                        Capacidade: Capacidade,
                                        Alocacao: Alocacao,
                                        Tempo_Limpeza: TempoLimpeza,
                                        CentroId: Centro,
                                        Motivo_Bloqueio: MotivoBloqueio
                                    },{where: {id: id}})
                                    .then(function(data){
                                        return data;
                                    })
                                    .catch(error =>{
                                        console.log('Error: '+error);
                                        return error;
                                    })
                                    res.status(200).json({sucesso: true, data: data, message:'Sala atualizada com sucesso'})
                                }
                            }else{
                                if(Estado==1){
                                    const data = await sala.update({ 
                                        Nome: Nome_Limpo,
                                        Capacidade: Capacidade,
                                        Alocacao: Alocacao,
                                        Tempo_Limpeza: TempoLimpeza,
                                        CentroId: Centro
                                    },{where: {id: id}})

                                    .then(function(data){
                                        return data;
                                    })
                                    .catch(error =>{
                                        console.log('Error: '+error);
                                        return error;
                                    })
                                    res.status(200).json({sucesso: true, data: data, message:'Sala atualizada com sucesso'})
                                }else
                                    res.json({sucesso:false, message:"O Estado nao e valiudo"});
                            }
                    }
                }
            }else
                res.json({sucesso: false, message:"Nao existe nenhum centro com o id: " + Centro})
        }else{
            res.json({sucesso:false, message:"A sala com o id "+id+' nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Desativar Sala

controllers.desativar= async (req,res) =>{
    const {id} = req.params;
    const {Motivo} = req.body

    var Motivo_Limpo = Motivo.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    if(id!=null){
        const saladata = await sala.findOne({
            where:{id:id}
        })
        if(saladata){
            var estado= saladata.EstadoId;
            if(estado == 1){
                if(Motivo == ""){
                    res.json({sucesso: false, message:'Insira o motivo de inativação'})
                }else{
                    //Desativar as reservas associadas a sala
                    const query = `update public."Reservas" set "EstadoId" = 2 
                    where "SalaId" = ${id} and "DataReserva" >= CURRENT_DATE `
                    const datareserva = await bd.query(query,{ type: QueryTypes.UPDATE })

                    const data = await sala.update({ 
                        Motivo_Bloqueio: Motivo_Limpo,
                        EstadoId: '2'
                    },{where: {id: id}})

                    .then(function(data){
                        return data;
                    })  
                    .catch(error =>{
                        console.log('Error: '+error);
                        return error;
                    })
                    res.status(200).json({sucesso: true, data: data + ' ' + datareserva, message:'Sala desativada com sucesso'})
                }
                }else{
                    res.json({sucesso: false, message:"A sala "+saladata.Nome+' ja se encontra desativada'})
                }
        }else
            res.json({sucesso:false, message:"A sala com o id "+id+' nao existe'})
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Ativar Sala

controllers.ativar= async(req,res) =>{
    const {id} = req.params;

    if(id!=null){

        const saladata = await sala.findOne({
            where:{id:id}
        })
        if(saladata){
            var estado= saladata.EstadoId;
            if(estado == 2){
                    //Ativar as reservas associadas a sala
                    const query = `update public."Reservas" set "EstadoId" = 1 
                    where "SalaId" = ${id} and "DataReserva" >= CURRENT_DATE `
                    const datareserva = await bd.query(query,{ type: QueryTypes.UPDATE })

                    const data = await sala.update({ 
                        Motivo_Bloqueio: "",
                        EstadoId: '1'
                    },{where: {id: id}})

                    .then(function(data){
                        return data;
                    })
                    .catch(error =>{
                        console.log('Error: '+error);
                        return error;
                    })
                    res.status(200).json({sucesso: true, data: data + ' ' + datareserva, message:'Sala ativada com sucesso'})
            }else{
                res.json({sucesso: false, message:"A sala "+saladata.Nome+' ja se encontra ativada'})
            }
        }else
            res.json({sucesso:false, message:"A sala com o id "+id+' nao existe'})
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Eliminar Sala

controllers.delete = async (req, res) =>{
    const {id} = req.params;

    if(id!=null){

        const saladata = await sala.findOne({
            where:{id:id}
        })

        if(saladata){
            //Buscar as reservas
            const reservasdata = await reserva.findAll({
                where:{SalaId: id}
            })
            if(reservasdata){
                for(let i = 0; i< reservasdata.length; i++){
                    //Eliminar o historico de adiamentos
                    const histadiamentos = await historicoAdiamentos.destroy({
                        where:{ReservaId: reservasdata[i].id}
                    })
                    /* if(histadiamentos)
                        console.log('Os historicos de adiamentos da reserva '+reservasdata[i].id+' foram eliminados')
                    else
                        console.log('Nao foram eliminados os registos de adiamentos') */
                    //Eliminar o historico de limpezas
                    const histlimpeza = await historicoLimpezas.destroy({
                        where:{ReservaId: reservasdata[i].id}
                    })
                    /* if(histlimpeza)
                        console.log('Os historicos de limpezas da reserva '+reservasdata[i].id+' foram eliminados')
                    else
                        console.log('Nao foram eliminados os registos de limpezas') */
                }
                //Eliminar as reservas
                const deletReservas = await reserva.destroy({
                    where:{SalaId: id} 
                })
                /* if(deletReservas)
                    console.log('Reservas eliminadas')
                else
                    console.log('Reservas nao foram eliminadas') */
            }
            //Eliminar as salas
            const data = await sala.destroy({
                where: {id: id},
            })
            if(data)
                res.status(200).json({sucesso: true, message: "Sala eliminada com sucesso",deleted: data});
            else
                res.json({sucesso:false, message:'A sala nao foi eliminada'})
        }else
            res.json({sucesso:false, message:"A sala com o id "+id+' nao existe'})
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Obter QR Code

controllers.code = async(req,res) =>{
    const {id} = req.params;

    if(id!=null){
        const data = await sala.findOne({
            where: {id: id}
        })
        if(data){
            let info = JSON.stringify(data);
            //Print na Consola
            QRCode.toString(info,{type:'terminal'},function (err, code) { 
                if(err) return console.log("error occurred")
                // Imprimir o codigo
                //console.log(code)
            })
            //Converter para base64
            QRCode.toDataURL(info,function (err, code) { 
                if(err) return console.log("error occurred")
                // Imprimir o codigo
                //console.log(code)
                res.status(200).json({sucesso: true, data: code, message:"Codigo gerado com sucesso"} )
            })
        }else
            res.json({sucesso:false, message:"A sala com o id "+id+' nao existe'})
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Listar Salas com base no id do centro e com o estado ativo

controllers.Salas = async(req,res) =>{
    const {id} = req.params;

    if(id!=null){
        const centroData = await centros.findOne({
            where:{id:id}
        })
        if(centroData){
            const data = await sala.findAll({
                where: {CentroId: id, EstadoId: '1'},
                include: {all: true}
            })
            if(data){
                res.status(200).json({sucesso: true, data: data});
            }else{
                res.json({sucesso:false, message:'Nao foi possivel obter as salas do centro '})
            }
        }else{
            res.json({sucesso:false, message:'Nao existe nenhum centro com o id ' + id})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Listar reservas apenas ativas com base no id da sala 
controllers.listReservas = async (req, res) =>{ 
    var {id} = req.params
    if(id!=null){
        const salaData = await sala.findOne({
            where:{id:id}
        })
        if(salaData){
            if(salaData.EstadoId ==1){
                const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."SalaId" = ${id} `
                const data = await bd.query(query,{ type: QueryTypes.SELECT })
                //console.log(data)
                if(data)
                    if(data.length != 0)
                        res.json({sucesso: true, data: data})
                    else{
                        res.json({sucesso: true, data: data, message:'Nao existem reservas para esta sala'})
                    }
                else{
                    res.json({sucesso: false, message:'Nao foi possivel obter as reservas da sala'})
                }
            }else{
                res.json({sucesso:false, message:'A sala nao esta ativa'})
            }
        }else{
            res.json({sucesso:false, message:'A sala nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}


module.exports = controllers
