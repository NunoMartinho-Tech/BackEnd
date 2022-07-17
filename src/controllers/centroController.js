var bd = require('../config/basedados');
var centro = require('../models/Centros');
var estado = require('../models/Estado');
var sala = require('../models/Salas');
var utilizador = require('../models/Utilizador');
var reserva = require('../models/Reservas');
var pertence = require('../models/Pertence');
var historicoLimpeza = require('../models/Historico_limpezas');
var historicoAdiamentos = require('../models/Historico_adiamentos');
const { QueryTypes } = require('sequelize');
const { json } = require('body-parser');

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
                            //console.log('Historico de limpezas da reserva com id: '+ reservas[i].id +' eliminada')
                            var deleteHistAdiame = await historicoAdiamentos.destroy({
                                where: {ReservaId: reservas[i].id}
                            })
                            //console.log('Historico de adiamento da reserva com id: '+ reservas[i].id +' eliminada')
                        }
                        //Eliminar as reservas
                        var deleteReservas = await reserva.destroy({
                            where: {SalaId: salas[i].id}
                        })
                        //if(deleteReservas){
                            //console.log('Reservas eliminadas')
                        //}else
                            //console.log('Nao foi possivel eliminar as reservas associadas a sala com id: '+ salas[i].id);
                    }//else
                        //console.log('Nao existem reservas na sala' + salas[i].id)
                }
                var deletedSalas = await sala.destroy({
                    where:{CentroId: dataCentro.id}
                })
                //if(deletedSalas)
                    //console.log('Salas Eliminadas');
                //else
                    //console.log('Nao foi possivel eliminar as salas');
            }//else{
                //console.log('Nao existem salas no centro com o id: ' + id)
            //}
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
            }//else
                //console.log('Nao existem utilizadores associados ao centro com id: ', id)

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
                        //if(dataReservas)
                           // console.log("Reservas desativadas");
                        //else
                            //console.log('Nao foi possivel desativar as reservas associadas a sala com id: '+ salas[i].id);
                    }//else
                        //console.log('Nao existem reservas na sala' + salas[i].id)
                }
            }//else{
               // console.log('Nao existem salas no centro com o id: ' + id)
           // }
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
            }//else{
                //console.log('Nao existem utilizadores associados ao centro com id: ', id)
            //}

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
                        //if(dataReservas)
                            //console.log("Reservas ativadas");
                        //else
                            //console.log('Nao foi possivel ativar as reservas associadas a sala com id: '+ salas[i].id);
                    }//else
                        //console.log('Nao existem reservas na sala' + salas[i].id)
                }
            }//else{
               // console.log('Nao existem salas no centro com o id: ' + id)
            //}
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
            }//else{
                //console.log('Nao existem utilizadores associados ao centro com id: ', id)
            //}

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

//DASHBOARD

//Utilizadores Registados
controllers.utilizadorestotal = async(req,res)=>{
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
                var data = users.length
                res.json({sucesso: true, data: data})
            }else{
                res.json({sucesso: true, data:0})
            }
        }else{
            res.json({sucesso: false, message:'Centro nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Utilizadores Registados ativos
controllers.utilizadoresativos = async(req,res)=>{
    const {id} = req.params
    var numero = 0;

    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const users = await pertence.findAll({
                where:{CentroId: id}
            })
            if(users){
                if(users.length!=0){
                    for(let i =0; i< users.length; i++){
                        const usersarray = await utilizador.findOne({
                            where:{
                                id:users[i].UtilizadoreId,
                                EstadoId:1
                            }
                        })
                        //console.log(usersarray)
                        if(usersarray != null){
                            if(usersarray.length!=0){
                                numero = numero + 1;
                            }
                        }
                    }
                    res.json({sucesso:true, data: numero})
                }else{
                    res.json({sucesso: true, data: 0})
                }
            }else{
                res.json({sucesso: false, data:0})
            }
        }else{
            res.json({sucesso: false, message:'Centro nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//Utilizadores Registados inativos
controllers.utilizadoresinativos = async(req,res)=>{
    const {id} = req.params
    var numero = 0;

    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const users = await pertence.findAll({
                where:{CentroId: id}
            })
            if(users){
                if(users.length!=0){
                    for(let i =0; i< users.length; i++){
                        const usersarray = await utilizador.findOne({
                            where:{
                                id:users[i].UtilizadoreId,
                                EstadoId:2
                            }
                        })
                        console.log(usersarray)
                        if(usersarray != null){
                            if(usersarray.length!=0){
                                numero = numero + 1;
                            }
                        }
                    }
                    res.json({sucesso:true, data: numero})
                }else{
                    res.json({sucesso: true, data: 0})
                }
            }else{
                res.json({sucesso: false, data:0})
            }
        }else{
            res.json({sucesso: false, message:'Centro nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//% de salas face a capacidade por centro
controllers.salaporcapacidade = async(req,res)=>{
    const {id} = req.params

    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const query = `select "Salas"."Capacidade" as "id",  "Salas"."Capacidade" as "label", Cast(count("Salas"."Capacidade")/0.100 AS INTEGER) as "value"
            from public."Reservas" inner join public."Salas" on "Reservas"."SalaId" = "Salas"."id"
            where "Reservas"."EstadoId" = 1 and "Salas"."CentroId" = ${id}
            group by "Salas"."Capacidade"`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Não foi possível obter a % de salas face a capacidade'})
        }else{
            res.json({sucesso: false, message:'Centro nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneca um id'})
    }
}

//% de alocacao diaria com base no mes
controllers.alocacaoDiaria = async(req,res) =>{
    const {id} = req.params
    //Verificamos se o id foi fornecido
    if(id!=null){
        //Verificamos se o centro existe
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            //Fazer a querry previamente testada no data base
            const query = `select  cast(cast(count("Salas"."id")as float)/cast((select count(*) from public."Salas" where "Salas"."CentroId" = 1)as float)*100 as integer)  as "value", "Reservas"."DataReserva" as "day"
            from public."Reservas" inner join public."Salas" on "Reservas"."SalaId" = "Salas"."id"
            where "Reservas"."EstadoId" = 1 and "Salas"."EstadoId" = 1 and "Salas"."CentroId" = ${id} 
            group by "Reservas"."DataReserva"`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
        }else{
            res.json({sucesso: false, message:'Nao foi possivel obter o centro'})
        }
    }else{
        res.json({sucesso:false, message:'Insira um id'})
    }
}

//Necessidade atual de limpeza
controllers.limpezaDiaria = async(req,res) =>{
    const {id} = req.params
    const ArrayReservas = []
    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const query = `select "Reservas"."HoraFim", "Salas"."Nome", "Salas"."Tempo_Limpeza"
            from public."Reservas" inner join public."Salas" on "Reservas"."SalaId" = "Salas"."id"
            where "Reservas"."EstadoId" = 1 and "Salas"."EstadoId" = 1 and "Salas"."CentroId" = ${id} and "Reservas"."DataReserva" = Current_Date order by "Reservas"."HoraFim"`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data){
                //console.log(data)
                //Ir buscar a hora atual
                var data_atual = new Date();
                var horas_atuais = (data_atual.getHours()).toString()
                //console.log(horas_atuais)
                var minutos_atuais = (data_atual.getMinutes()).toString()
                //console.log( minutos_atuais)
                var hora_atual_numero = Number(horas_atuais + minutos_atuais)
                //console.log(hora_atual_numero)

                if(data.length!=0){
                    for(let i =0; i< data.length;i++){
                         //Vamos buscar a hora fim
                        //var horafinal = data[i].HoraFim
                        var horaFimArray = (data[i].HoraFim).split(':')
                        var horaFim = horaFimArray[0]
                        var minutosFim = horaFimArray[1]
                        var horaFimNumero = Number(horaFim+minutosFim)
                        //console.log(horaFimNumero)
                        //Vamos buscar o tempo de limpeza da sala
                        //var tempolimpeza = data[i].Tempo_Limpeza
                        var tempoLimpezaArray = (data[i].Tempo_Limpeza).split(':')
                        var horaLimpeza = tempoLimpezaArray[0]
                        var minutosLimpeza = tempoLimpezaArray[1]
                        var tempoLimpezaNumero = Number(horaLimpeza+minutosLimpeza)
                        //console.log(tempoLimpezaNumero)
                        //Calcular a hora final
                        var horafinalLimpeza = horaFimNumero + tempoLimpezaNumero
                        //console.log(horafinalLimpeza)
                        //Verificamos se a hora fim e menor que a hora atual e se a hora fim com limpeza e maior que a hora atual
                        if(horaFimNumero <= hora_atual_numero && horafinalLimpeza > hora_atual_numero){
                            //console.log('entrei no if')
                            ArrayReservas.push(data[i])
                        }else{
                            continue;
                        }
                    }
                    res.json({sucesso: true, data: ArrayReservas })
                    
                }else{
                    res.json({sucesso: true, message:'Nao existem reservas', data: ArrayReservas})
                }
            }else
                res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
        }else{
            res.json({sucesso: false, message: 'Nao existem centros com esse id'})
        }
    }else{
        res.json({sucesso: false, message: 'Insira um id'})
    }
}

//Reservas feitas hoje depois no centro no centro

controllers.reserasfeitas = async(req,res)=>{
    const {id} = req.params
    if(id!=null){
        const centros = await centro.findOne({
            where:{id:id}
        })
        if(centros){
            const query = `select "Salas"."Nome" as "SalaNome", concat("Utilizadores"."Pnome",' ',"Utilizadores"."Unome") as "UtilizadorNome", "Reservas"."DataReserva", "Reservas"."HoraInicio", "Reservas"."HoraFim" 
            from public."Reservas" inner join "public"."Utilizadores" on "Reservas"."UtilizadoreId" = "Utilizadores"."id" inner join public."Salas"
            on "Reservas"."SalaId" = "Salas"."id"
            where "Salas"."CentroId" = ${id} and "Reservas"."DataReserva" >= Current_date and "Reservas"."EstadoId" = 1 and "Reservas"."HoraInicio" >= current_time
            order by "Reservas"."DataReserva", "Reservas"."HoraInicio"`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data){
                res.json({sucesso: true, data: data})
            }else
                res.json({sucesso: false, message:'Nao foi possivel obter as reservas do centro'})
        }else
            res.json({sucesso:false, message: 'O centro nao existe'})
    }else
        res.json({sucesso:false, message: 'Forneca um id'})
}
module.exports = controllers