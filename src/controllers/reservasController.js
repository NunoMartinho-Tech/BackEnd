var bd = require('../config/basedados');
var reserva = require('../models/Reservas');
var historicoAdiamentos = require('../models/Historico_adiamentos');

const controllers = {}

bd.sync()

//Listar Reservas passadas com base no id do utilizador, e data atual

//Listar Reservas futuras com base no id do utilizador, e data e ativas 

//Listar reservas com base no id do utilizador ALTERAR

//Adiar reserva muda hora fim. TESTAR

/* controllers.adiar = async(req,res) =>{
    const {id} = req.params;
    const {HoraFim} = req.body
    

    const data = await reserva.update({
        HoraFim: HoraFim,
    },{
        where: {id: id},
    })
    .then(function(data){return data;})
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    const data1 = historicoAdiamentos.create({
        HoraAntiga: 
    })
    res.status(200).json({sucesso: true, data: data, message:'Reserva adiada com sucesso'})
} */


controllers.list = async (req, res) =>{
    const data = await reserva.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso:true, data: data});
}

//Adicionar reserva Ver melhor isto

controllers.add = async (req, res) =>{
    const {NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala} = req.body

    const data = await reserva.create({
        NomeReserva: NomeReserva,
        DataReserva: DataReserva,
        NumeroParticipantes: NumeroParticipantes,
        HoraInicio: HoraInicio,
        HoraFim: HoraFim,
        EstadoId: '1',
        UtilizadoreId: Utilizador,
        SalaId: Sala
    })
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error:'+error)
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message: 'Reserva adicionada'});
}

//Obter reserva

controllers.get = async(req,res) =>{

    const {id} = req.params;
    const data = await reserva.findAll({
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

//Editar reserva

controllers.update = async (req, res) =>{ 
    const {id} = req.params;
    const {NomeReserva, DataReserva, NumeroParticipantes, HoraFim, Estado} = req.body

    const data = await reserva.update({
        NomeReserva: NomeReserva,
        DataReserva: DataReserva,
        NumeroParticipantes: NumeroParticipantes,
        HoraFim: HoraFim,
        EstadoId: Estado,
    },{
        where: {id: id},
    })
    .then(function(data){return data;})
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Reserva atualizada com sucesso'})
}

//Eliminar reserva

controllers.delete = async (req, res) =>{
    const {id} = req.params;
    const data = await reserva.destroy({
        where: {id: id},
    })
    res.status(200).json({
        sucesso: true,
        message: "Reserva eliminada com sucesso",
        deleted: data
    });
}

//Ativar Reserva

controllers.ativar = async (req, res) =>{ 
    const {id} = req.params;

    const data = await reserva.update({
        EstadoId: '1',
    },{
        where: {id: id},
    })
    .then(function(data){return data;})
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Reserva ativada com sucesso'})
}

//Desativar Reserva

controllers.desativar = async (req, res) =>{ 
    const {id} = req.params;

    const data = await reserva.update({
        EstadoId: '2',
    },{
        where: {id: id},
    })
    .then(function(data){return data;})
    .catch(error =>{
        console.log('Error: '+error);
        return error;
    })
    res.status(200).json({sucesso: true, data: data, message:'Reserva desativada com sucesso'})
}

module.exports = controllers
