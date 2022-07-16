var bd = require('../config/basedados');
var centro = require('../models/Centros');
var estado = require('../models/Estado');
var sala = require('../models/Salas');
var utilizador = require('../models/Utilizador');
var reserva = require('../models/Reservas');
var pertence = require('../models/Pertence');
var historicoLimpeza = require('../models/Historico_limpezas');
var historicoAdiamentos = require('../models/Historico_adiamentos');

const controllers = {};

bd.sync()

//Listar Centros

controllers.list = async (req, res) =>{
    const data = await centro.findAll({
        include: [estado]
    })
    .then(function(data){return data;})
    .catch(error =>{return error;})
    if(data)
        res.status(200).json({sucesso: true, data: data});
    else
        res.json({sucesso: false, message: 'Nao existem centros, por favor adicione.'});
}

//Adicionar Centro

controllers.add = async(req, res) => {
    const {Nome, Endereco, Hora_abertura, Hora_fecho, Telefone} = req.body

    const abertura = new Date('2022-01-01 ' + Hora_abertura);
    const fecho = new Date('2022-01-01 ' + Hora_fecho);
    
    if(fecho.getTime() > abertura.getTime()){
        var Nome_Limpo = Nome.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
        const data = await centro.create({
            Nome: Nome_Limpo,
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
        if(data)
            res.status(200).json({sucesso: true, data: data, message: 'Centro adicionado com sucesso'});
        else
            res.json({sucesso: false,message: 'Não foi possível adicionar o centro'});
    }else{
        res.json({sucesso: false,message: 'A hora final tem que ser maior que a hora inicial'});
    }
}

//Obter Centro

controllers.get = async(req,res) => {
    const {id} = req.params;
    if(id!=null){
        const data = await centro.findOne({
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
        if(data)
            res.status(200).json({sucesso: true, data: data});
        else
            res.json({sucesso: false, message: 'Nao foi possivel encontrar o centro com o id = ' + id});
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Editar Centro

controllers.update = async(req,res) => {
    const {id} = req.params;

    const {Nome, Endereco, Hora_abertura, Hora_fecho, Telefone} = req.body

    const abertura = new Date('2022-01-01 ' + Hora_abertura);
    const fecho = new Date('2022-01-01 ' + Hora_fecho);

    if(id!=null){
        if(fecho.getTime() > abertura.getTime()){
            var Nome_Limpo = Nome.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
            const data = await centro.update({
                Nome: Nome_Limpo,
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
            if(data)
                res.status(200).json({sucesso: true, data: data, message: 'Centro atualizado com sucesso'});
            else
                res.json({sucesso: false,message: 'Não foi possível atualizar o centro'});
        }else{
            res.json({sucesso: false,message: 'A hora final tem que ser maior que a hora inicial'});
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Eliminar Centro

controllers.delete = async(req,res) => {
    const {id} = req.params;
    //Procurar o centro
    if(id!=null){
        const dataCentro = await centro.findOne({
            where:{id:id}
        })
        if(dataCentro){
            //Procurar por Salas
            var salas = await sala.findAll({
                where:{CentroId: dataCentro.id}
            })
            if(salas){
                //Procurar por reservas
                for(let i = 0; i < salas.length; i++ ){
                    var reservas = await reserva.findAll({
                        where: {SalaId: salas[i].id}
                    })
                    if(reservas){
                        //Eliminamos nos historicos
                        for(let i = 0; i < reservas.length; i++ ){
                            var deleteHistLimpe = await historicoLimpeza.destroy({
                                where:{ReservaId: reservas[i].id}
                            })
                            console.log('Historico de limpezas da reserva com id: '+ reservas[i].id +' eliminada')
                            var deleteHistAdiame = await historicoAdiamentos.destroy({
                                where: {ReservaId: reservas[i].id}
                            })
                            console.log('Historico de adiamento da reserva com id: '+ reservas[i].id +' eliminada')
                        }
                        //Eliminar as reservas
                        var deleteReservas = await reserva.destroy({
                            where: {SalaId: salas[i].id}
                        })
                        if(deleteReservas){
                            console.log('Reservas eliminadas')
                        }else
                            console.log('Nao foi possivel eliminar as reservas associadas a sala com id: '+ salas[i].id);
                    }else
                        console.log('Nao existem reservas na sala' + salas[i].id)
                }
                var deletedSalas = await sala.destroy({
                    where:{CentroId: dataCentro.id}
                })
                if(deletedSalas)
                    console.log('Salas Eliminadas');
                else
                    console.log('Nao foi possivel eliminar as salas');
            }else{
                console.log('Nao existem salas no centro com o id: ' + id)
            }
            //Procurar Utilizadores
            const Utilizadores = await pertence.findAll({
                where: {CentroId: id}
            })
            if(Utilizadores){
                //Eliminar na tabela das limpezas
                for(let i = 0; i < Utilizadores.length; i++){
                    var deletUtiliHistoricoLimpe = await historicoLimpeza.destroy({
                        where:{UtilizadoresId: Utilizadores[i].UtilizadoreId}
                    })
                    var deletReservas = await reserva.destroy({
                        where:{UtilizadoreId: Utilizadores[i].UtilizadoreId}
                    })
    /*                 if(deletUtiliHistoricoLimpe)
                        console.log('Utilizadores eliminados do historico de limpezas')
                    else
                        console.log('Erro ao elminar utilizadores historico de limpezas') */

                    //Eliminar utilizadores
                    var utilizadoreseliminados = await utilizador.destroy({
                        where:{id: Utilizadores[i].UtilizadoreId}
                    })   
                }
            }else
                console.log('Nao existem utilizadores associados ao centro com id: ', id)

                const data = await centro.destroy({
                    where: {id: id}
                })
                if(data)
                    res.status(200).json({sucesso: true,message: 'Centro eliminado com sucesso', data: data + ' ' + deleteHistLimpe + ' ' + deleteHistAdiame + ' ' + deleteReservas + ' ' + deletUtiliHistoricoLimpe + ' ' + utilizadoreseliminados + ' ' + deletedSalas + ' '+ deletReservas});
                else
                    res.json({sucesso: false, mensagem:'Nao foi possivel eliminar o centro'});

        }else{
            res.json({sucesso: false,message: 'Nao foi possivel eliminar o centro com o id: ' + id});
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Inativar centro

controllers.desativar = async(req,res) => {
    const {id} = req.params;
    //Procurar o centro
    if(id!=null){
        const dataCentro = await centro.findOne({
            where:{id:id}
        })
        if(dataCentro){
            //Procurar por Salas
            var salas = await sala.findAll({
                where:{CentroId: dataCentro.id}
            })
            if(salas){
                //Inativar as Salas
                var dataSalas = await sala.update({
                    EstadoId: 2,
                    Motivo_Bloqueio: 'Centro Inativado'
                },{where: {CentroId: dataCentro.id}})

                //Procurar por reservas
                for(let i = 0; i < salas.length; i++ ){
                    var reservas = await reserva.findAll({
                        where: {SalaId: salas[i].id}
                    })
                    if(reservas){
                        //Inativar as reservas
                        var dataReservas = await reserva.update({
                            EstadoId: 2
                        },{where: {SalaId: salas[i].id}})
                        if(dataReservas)
                            console.log("Reservas desativadas");
                        else
                            console.log('Nao foi possivel desativar as reservas associadas a sala com id: '+ salas[i].id);
                    }else
                        console.log('Nao existem reservas na sala' + salas[i].id)
                }
            }else{
                console.log('Nao existem salas no centro com o id: ' + id)
            }
            //Procurar Utilizadores
            const Utilizadores = await pertence.findAll({
                where: {CentroId: id}
            })
            if(Utilizadores){
                for(let i = 0; i < Utilizadores.length; i++){
                    //Desativar utilizadores
                    var utilizadoresdesativados = await utilizador.update({
                        EstadoId: 2
                    },{where:{id: Utilizadores[i].UtilizadoreId}})
                }
            }else{
                console.log('Nao existem utilizadores associados ao centro com id: ', id)
            }

            const data = await centro.update({
                EstadoId: '2'
            },{where: {id: id}})

            res.status(200).json({sucesso: true,message: 'Centro desativado com sucesso', data: data + ' ' + utilizadoresdesativados + ' ' + dataReservas + ' ' + dataSalas});

        }else{
            res.json({sucesso: false,message: 'Nao foi possivel desativar o centro com o id: ' + id});
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Ativar centro

controllers.ativar = async(req,res) => {
    const {id} = req.params;
    //Procurar o centro
    if(id!=null){
        const dataCentro = await centro.findOne({
            where:{id:id}
        })
        if(dataCentro){
            //Procurar por Salas
            var salas = await sala.findAll({
                where:{CentroId: dataCentro.id}
            })
            if(salas){
                //Inativar as Salas
                var dataSalas = await sala.update({
                    EstadoId: 1,
                    Motivo_Bloqueio: ''
                },{where: {CentroId: dataCentro.id}})

                //Procurar por reservas
                for(let i = 0; i < salas.length; i++ ){
                    var reservas = await reserva.findAll({
                        where: {SalaId: salas[i].id}
                    })
                    if(reservas){
                        //Inativar as reservas
                        var dataReservas = await reserva.update({
                            EstadoId: 1
                        },{where: {SalaId: salas[i].id}})
                        if(dataReservas)
                            console.log("Reservas ativadas");
                        else
                            console.log('Nao foi possivel ativar as reservas associadas a sala com id: '+ salas[i].id);
                    }else
                        console.log('Nao existem reservas na sala' + salas[i].id)
                }
            }else{
                console.log('Nao existem salas no centro com o id: ' + id)
            }
            //Procurar Utilizadores
            const Utilizadores = await pertence.findAll({
                where: {CentroId: id}
            })
            if(Utilizadores){
                for(let i = 0; i < Utilizadores.length; i++){
                    //Desativar utilizadores
                    var utilizadoresdesativados = await utilizador.update({
                        EstadoId: 1
                    },{where:{id: Utilizadores[i].UtilizadoreId}})
                }
            }else{
                console.log('Nao existem utilizadores associados ao centro com id: ', id)
            }

            const data = await centro.update({
                EstadoId: '1'
            },{where: {id: id}})

            res.status(200).json({sucesso: true,message: 'Centro ativado com sucesso', data: data + ' ' + utilizadoresdesativados + ' ' + dataReservas + ' ' + dataSalas});

        }else{
            res.json({sucesso: false,message: 'Nao foi possivel ativar o centro com o id: ' + id});
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Utilizadores Registados
controllers.utilizadores = async(req,res)=>{
    const {id} = req.params
    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const users = await pertence.findAll({
                where:{CentroId: id}
            })
            if(users){
                res.json({sucesso: true, data: users.length})
            }else{
                res.json({sucesso: false, message:'Nao foi possivel encontrar os utilizadores'})
            }
        }else{
            res.json({sucesso: false, message:'Centro nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

module.exports = controllers