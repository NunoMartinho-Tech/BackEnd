var bd = require('../config/basedados');
var reserva = require('../models/Reservas');
var sala = require('../models/Salas');
var centro = require('../models/Centros');
var utilizador = require('../models/Utilizador');
var historicoLimpeza = require('../models/Historico_limpezas');
var historicoAdiamentos = require('../models/Historico_adiamentos');
const { QueryTypes, ConnectionAcquireTimeoutError } = require('sequelize');
const date = require('date-and-time');
const controllers = {}
bd.sync()

//Listar todas as reservas
controllers.list = async (req, res) =>{
    const data = await reserva.findAll({include: {all: true}})
    .then(function(data){return data;})
    .catch(error => {
        console.log('Error: '+error)
        return error;
    })
    if(data)
        res.json({sucesso: true, data: data})
    else
        res.json({sucesso: false})
}

//Listar Reservas com base no id da Sala
controllers.listReservasSala = async (req, res) =>{
    const {salaid} = req.params;
    if(salaid!=null){
        const salaData = await sala.findOne({
            where:{id:salaid}
        })
        if(salaData){
            const query = `
    select "Reservas"."id" as "ReservaId", "Reservas"."DataReserva", "Reservas"."NumeroParticipantes","Reservas"."HoraInicio",
    "Reservas"."HoraFim", "Reservas"."EstadoId" as "Reserva Estado","Utilizadores"."id" as "UtilizadoreId","Utilizadores"."Pnome","Utilizadores"."Unome", "Salas"."EstadoId" as "Sala Estado", "Salas"."Motivo_Bloqueio"
    from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id" 
    inner join "Utilizadores" on "Reservas"."UtilizadoreId" = "Utilizadores"."id"
    where "Salas"."id" = ${salaid} and "Reservas"."EstadoId"=1 and "Reservas"."DataReserva" >= CURRENT_DATE 
    order by "Reservas"."DataReserva", "Reservas"."HoraInicio"`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            res.status(200).json({sucesso: true, data: data})
        }else
            res.json({sucesso: false, message: 'Sala não existe'})
    }else
        res.json({sucesso: false, message: 'Insira um id'})
}

//Listar reservas com base no centro e no user WebSite
controllers.listReservas = async (req, res) =>{
    const {idUser} = req.params
    //console.log(idUser)
    const {centroId} = req.body
    //console.log(centroId)
    if(idUser!=null){
        if(centroId !=null){
            const query = `select * from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id" inner join "Utilizadores" on "Reservas"."UtilizadoreId" = "Utilizadores"."id"
            where "Utilizadores"."id" = ${idUser} and "Salas"."CentroId" = ${centroId}`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            //console.log(data)
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
        }else
            res.json({sucesso: false, message: 'Insira um centro'})
    }else
        res.json({sucesso: false, message: 'Forneça um id'})
}

//Listar reservas com base no centro e no user mobile
controllers.listReservasAtivasMobile = async (req, res) =>{
    const {id,centroId} = req.params;
    //console.log(id)
    //console.log(centroId)
    if(id!=null){
        const userData = await utilizador.findOne({
            where:{id:id}
        })
        if(userData){
            if(centroId !=null){
                const centroData = await centro.findOne({
                    where:{id:centroId}
                })
                if(centroData){
                    const query = `select "Reservas"."EstadoId","Reservas"."id" as "ReservasId","Reservas"."NomeReserva","Reservas"."NumeroParticipantes",
"Reservas"."SalaId" as "SalaId", "Reservas"."DataReserva","Reservas"."HoraInicio","Reservas"."HoraFim",
"Salas"."Nome", "Utilizadores"."id" as "UtilizadoreId", "Utilizadores"."Pnome", "Utilizadores"."Unome"   
from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id" inner join "Utilizadores" on "Reservas"."UtilizadoreId" = "Utilizadores"."id"
where "Reservas"."UtilizadoreId" = ${id} and "Salas"."CentroId" = ${centroId} and "Reservas"."EstadoId"=1 and "Reservas"."DataReserva" >= CURRENT_DATE order by "Reservas"."DataReserva", "Reservas"."HoraInicio"`
                    const data = await bd.query(query,{ type: QueryTypes.SELECT })
                    .then(function(data){return data;})
                    .catch(err=>console.log(err))
                    //console.log(data)
                    if(data){
                        //Vamos buscar a data atual e as horas
                        var data_atual = new Date()
                        var AnoAtual = (data_atual.getFullYear()).toString()
                        var MesAtual = (data_atual.getMonth() + 1).toString()
                        var DiaAtual = (data_atual.getDate()).toString()
                        var DataAtualString = (AnoAtual + MesAtual + DiaAtual)
                        //console.log("Data atual:",DataAtualString)
                        var horas_atuais = Number((data_atual.getHours()).toString())
                        var minutos_atuais = Number((data_atual.getMinutes()).toString())
                        //console.log("Horas atuais:",horas_atuais)
                        //console.log("Minutos atuais:",minutos_atuais)
                        for(let i =0; i < data.length; i++){
                            var dateReserva = new Date(data[i].DataReserva) 
                            var AnoReserva = (dateReserva.getFullYear()).toString()
                            var MesReserva = (dateReserva.getMonth() + 1).toString()
                            var DiaReserva = (dateReserva.getDate()).toString()
                            var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                            //console.log("Data da reserva:",DataReservaString)
                            const horasFim = data[i].HoraFim;
                            const horasFim_Array = horasFim.split(':')
                            const horaF = Number(horasFim_Array[0])
                            const minutosF = Number(horasFim_Array[1])
                            //const HorasAtivasF = Number(horaF+minutosF)
                            //console.log("Horas da reserva:",horaF)
                            //console.log("Minutos da reserva:",minutosF)
                            if(DataReservaString == DataAtualString){
                                if(horaF == horas_atuais){
                                    if(minutosF <= minutos_atuais)
                                        delete data[i];
                                    else
                                        continue;
                                }else{
                                    if(horaF < horas_atuais)
                                        delete data[i];
                                    else
                                        continue;
                                }
                            }else
                                continue;                 
                        }
                        res.status(200).json({sucesso: true, data: data})
                    }else
                        res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
                }else
                    res.json({sucesso: false, message: 'Centro não existe'})
            }else
                res.json({sucesso: false, message: 'Insira um centro'})
        }else
            res.json({sucesso: false, message: 'User não existe'})
    }else
        res.json({sucesso: false, message: 'Insira um id'})
}

//Listar reservas com base no centro e no user mobile
controllers.listReservasDesativasMobile = async (req, res) =>{
    const {id,centroId} = req.params;
    //console.log(id)
    //console.log(centroId)
    if(id!=null){
        const userData = await utilizador.findOne({
            where:{id:id}
        })
        if(userData){
            if(centroId !=null){
                const centroData = await centro.findOne({
                    where:{id:centroId}
                })
                if(centroData){
                    const query = `select "Reservas"."EstadoId","Reservas"."id" as "ReservasId","Reservas"."NomeReserva","Reservas"."NumeroParticipantes",
"Reservas"."SalaId" as "SalaId", "Reservas"."DataReserva","Reservas"."HoraInicio","Reservas"."HoraFim",
"Salas"."Nome", "Utilizadores"."id" as "UtilizadoreId", "Utilizadores"."Pnome", "Utilizadores"."Unome"   
from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id" inner join "Utilizadores" on "Reservas"."UtilizadoreId" = "Utilizadores"."id"
where "Reservas"."UtilizadoreId" = ${id} and "Salas"."CentroId" = ${centroId} and "Reservas"."DataReserva" <= CURRENT_DATE 
order by "Reservas"."DataReserva" desc`
                    const data = await bd.query(query,{ type: QueryTypes.SELECT })
                    .then(function(data){return data;})
                    .catch(err=>console.log(err))
                    //console.log(data)
                    if(data){
                        //Vamos buscar a data atual e as horas
                        var data_atual = new Date()
                        var AnoAtual = (data_atual.getFullYear()).toString()
                        var MesAtual = (data_atual.getMonth() + 1).toString()
                        var DiaAtual = (data_atual.getDate()).toString()
                        var DataAtualString = (AnoAtual + MesAtual + DiaAtual)
                        //console.log("Data atual String:",DataAtualString)
                        var horas_atuais = Number((data_atual.getHours()).toString())
                        var minutos_atuais = Number((data_atual.getMinutes()).toString())
                        //console.log("Horas atuais",horas_atuais)
                        //console.log("Minutos atuais",minutos_atuais)
                        for(let i = 0; i < data.length; i++){
                            console.log("Reserva numero: ", i)
                            var dateReserva = new Date(data[i].DataReserva) 
                            var AnoReserva = (dateReserva.getFullYear()).toString()
                            var MesReserva = (dateReserva.getMonth() + 1).toString()
                            var DiaReserva = (dateReserva.getDate()).toString()
                            var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                            //console.log("Data da reserva:",DataReservaString)
                            const horasFim = data[i].HoraFim;
                            const horasFim_Array = horasFim.split(':')
                            const horaF = Number(horasFim_Array[0])
                            const minutosF = Number(horasFim_Array[1])
                            //console.log("Horas da reserva:",horaF)
                            //console.log("minutos da reserva:",minutosF)
                            if(DataReservaString == DataAtualString){
                                if(horaF == horas_atuais){
                                    if(minutosF > minutos_atuais){
                                        delete data[i];
                                        //console.log("Removi"); 
                                    }else
                                        continue;
                                }else{
                                    if(horaF > horas_atuais){
                                        delete data[i];
                                        //console.log("Passei aqui e removi");
                                    }else
                                        continue;
                                }
                            }                  
                        }
                        //console.log(data)
                        res.status(200).json({sucesso: true, data: data})
                    }else
                        res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
                }else
                    res.json({sucesso: false, message: 'Centro não existe'})
            }else
                res.json({sucesso: false, message: 'Insira um centro'})
        }else
            res.json({sucesso: false, message: 'User não existe'})
    }else
        res.json({sucesso: false, message: 'Insira um id'})
}

//Adicionar reserva
controllers.add = async (req, res) =>{
    const {NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala} = req.body
    var participantesLimp = NumeroParticipantes
    var Disponivel = true
    const utilizadorData = await utilizador.findOne({
        where:{id: Utilizador}
    })
    if(utilizadorData){
        if(utilizadorData.EstadoId == 1){
            const data = await sala.findOne({
                where:{id: Sala}
            })
            if(data){
                if(data.EstadoId == 1){
                    var data_reserva = new Date(DataReserva)
                    var data_atual = new Date();
                    if(date.isSameDay(data_atual,data_reserva)){
                        //console.log("Reserva para hoje")
                        //Horas Atuais
                        var horas_atuais = (data_atual.getHours()).toString()
                        //console.log('Hora atual: ' + horas_atuais)

                        var minutos_atuais = (data_atual.getMinutes()).toString()
                        //console.log('Minutos atuais: ' + minutos_atuais)

                        var hora_atual_numero = Number(horas_atuais + minutos_atuais)
                        //console.log('Horas atuais em numero: '+hora_atual_numero)

                        //Tempo de Limpeza
                        var TempLimpSala = data.Tempo_Limpeza
                        var tempoLimpezaArray = TempLimpSala.split(':')

                        var horaLimpeza = Number(tempoLimpezaArray[0])
                        //console.log("Horas Limpeza", horaLimpeza)

                        var minutoLimpeza = Number(tempoLimpezaArray[1])
                        //console.log("Minutos Limpeza", minutoLimpeza)

                        //Tempo da reserva
                        var hora_fim_array =  HoraFim.split(':')

                        var horas_fim = Number(hora_fim_array[0])
                        //console.log("Hora fim", horas_fim)

                        var minutos_fim = Number(hora_fim_array[1])
                        //console.log("Minutos fim", minutos_fim)

                        var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                        //console.log('Hora + minutos fim: '+ hora_fim_numero)

                        var horas_fim_limpeza_numero = horas_fim + horaLimpeza
                        //console.log('Horas fim mais limpeza: '+horas_fim_limpeza_numero)

                        var minutos_fim_limpeza_numero = minutos_fim + minutoLimpeza
                        //console.log('Minutos fim mais limpeza: '+ minutos_fim_limpeza_numero)

                        var hora_inicio_array =  HoraInicio.split(':')

                        var hora_inicio = Number(hora_inicio_array[0])
                        //console.log("Horas Inicio: ", hora_inicio)

                        var minutos_inicio = Number(hora_inicio_array[1])
                        //console.log("Minutos Inicio: ", minutos_inicio)

                        var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                        //console.log('Horas + minutos Inicio: ' + hora_incio_numero);

                        if(minutos_fim_limpeza_numero >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                            let resto = Math.trunc(minutos_fim_limpeza_numero / 60 ) 
                            //console.log("Resto:", resto)

                            let diferenca = minutos_fim_limpeza_numero - 60 //Vamos buscar a diferenca
                            //console.log("Diferenca:", diferenca)

                            var novosminutos_fim = diferenca
                            //console.log("Novos minutos mais limpeza", novosminutos_fim)

                            var novashoras_fim = horas_fim_limpeza_numero + resto
                            //console.log("Novos Horas mais limpeza", novashoras_fim)
                        }else{
                            novosminutos_fim = minutos_fim_limpeza_numero
                            //console.log("Novos minutos mais limpeza", novosminutos_fim)

                            novashoras_fim = horas_fim_limpeza_numero
                            //console.log("Novos Horas mais limpeza", novashoras_fim)
                        }

                        //console.log("Hora Reserva a adicionar")

                        var hora_inicio_string = hora_inicio.toString()
                        //console.log("Hora Inicio",hora_inicio_string)

                        var minutos_inicio_string = minutos_inicio.toString()
                        //console.log("Minutos Inicio",minutos_inicio_string)

                        if(minutos_inicio_string.length === 1){
                            var minutos_inicio_string = "0" + minutos_inicio_string
                            //console.log("Minutos Iniciais em String:",minutos_inicio_string)
                        }

                        var horas_inicio_numero = Number(hora_inicio_string+minutos_inicio_string)
                        //console.log("Horas Inicio em numero",horas_inicio_numero)

                        var hora_fim_string = novashoras_fim.toString()
                        //console.log("Hora Fim",hora_fim_string)

                        var minutos_fim_string = novosminutos_fim.toString()
                        //console.log("Minutos Fim",minutos_fim_string)

                        if(minutos_fim_string.length === 1){
                            var minutos_fim_string = "0" + minutos_fim_string
                            //console.log("Minutos Iniciais em String:",minutos_fim_string)
                        }

                        var horas_fim_numero = Number(hora_fim_string+minutos_fim_string)
                        //console.log("Horas Fim em numero",horas_fim_numero)

                        if(hora_incio_numero < hora_fim_numero){
                            if(hora_incio_numero > hora_atual_numero){
                                var participantesPermitidos = (data.Alocacao * (data.Capacidade/100));
                                if(participantesLimp > participantesPermitidos){
                                    res.json({sucesso: false, message: 'Número de participantes superior ao limite da sala'});
                                }else{
                                    var dataCentros = await centro.findOne({
                                        where: {id: data.CentroId}
                                    })
                                    if(dataCentros){
                                        if(dataCentros.EstadoId == 1){
                                            var horaInicioCentro = dataCentros.Hora_abertura
                                            var horaInicioCentroArray = horaInicioCentro.split(':')
                                            var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                            //console.log('Hora de abertura: ' + horaInicioCentroNumber)
                                            var horaFimCentro = dataCentros.Hora_fecho
                                            var horaFimCentroArray = horaFimCentro.split(':')
                                            var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])
                                            //console.log('Hora de fechar: ' + horaFimCentroNumber)

                                            if((horas_inicio_numero < horaInicioCentroNumber) || (horas_fim_numero > horaFimCentroNumber)){
                                                res.json({sucesso: false, message: 'O horário do centro é entre as '+dataCentros.Hora_abertura+' e as ' + dataCentros.Hora_fecho+ ' !'});
                                            }else{
                                                const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${DataReserva}' and "Reservas"."SalaId" = ${Sala} order by "Reservas"."HoraInicio"`
                                                const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                                //console.log(reservas.length)
                                                if(reservas.length != 0){
                                                    for(let i = 0; i < reservas.length; i++){
                                                        //Reserva para comparar
                                                        //Hora inicio
                                                        //console.log("Reserva para comparar nº",i)

                                                        const horasInicio = reservas[i].HoraInicio;
                                                        const horasInicio_Array = horasInicio.split(':')

                                                        const horaI = Number(horasInicio_Array[0])
                                                        //console.log('Hora Inicio:' + horaI)

                                                        const minutosI = Number(horasInicio_Array[1])
                                                        //console.log('Minutos Inicio:' + minutosI)

                                                        //Hora Fim
                                                        const horasFim = reservas[i].HoraFim;
                                                        const horasFim_Array = horasFim.split(':')

                                                        const horaF = Number(horasFim_Array[0])
                                                        //console.log('Hora Fim:' + horaF)

                                                        const minutosF = Number(horasFim_Array[1])
                                                        //console.log('Minutos Fim:' + minutosF)

                                                        const HoramaisLimpeza = horaF + horaLimpeza 
                                                        //console.log("Horas final mais limpeza", HoramaisLimpeza)

                                                        const MinutosmaisLimpeza = minutosF + minutoLimpeza 
                                                        //console.log("Minutos final mais limpeza", MinutosmaisLimpeza)

                                                        if(MinutosmaisLimpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                            let resto = Math.trunc(MinutosmaisLimpeza / 60 ) 
                                                            //console.log("Resto:", resto)

                                                            let diferenca = MinutosmaisLimpeza - 60 //Vamos buscar a diferenca
                                                            //console.log("Diferenca:", diferenca)

                                                            var novosminutos_fim_Reserva = diferenca
                                                            //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                            var novashoras_fim_Reserva = HoramaisLimpeza + resto
                                                            //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                        }else{
                                                            novosminutos_fim_Reserva = MinutosmaisLimpeza 
                                                            //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                            novashoras_fim_Reserva = HoramaisLimpeza
                                                            //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                        }

                                                        //console.log("Hora Reserva a Comparar")

                                                        var hora_reserva_inicio_string = horaI.toString()
                                                        //console.log("Hora Inicio",hora_reserva_inicio_string)

                                                        var minutos_reserva_inicio_string = minutosI.toString()
                                                        //console.log("Minutos Inicio",minutos_reserva_inicio_string)

                                                        if(minutos_reserva_inicio_string.length === 1){
                                                            var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                                            //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                                        }

                                                        var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                                        //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                                        var hora_reserva_fim_string = novashoras_fim_Reserva.toString()
                                                        //console.log("Hora Fim",hora_reserva_fim_string)

                                                        var minutos_reserva_fim_string = novosminutos_fim_Reserva.toString()
                                                        //console.log("Minutos Fim",minutos_reserva_fim_string)

                                                        if(minutos_reserva_fim_string.length === 1){
                                                            var minutos_reserva_fim_string = "0" + minutos_reserva_fim_string
                                                            //console.log("Minutos Iniciais em String:",minutos_reserva_fim_string)
                                                        }

                                                        var horas_reserva_fim_numero = Number(hora_reserva_fim_string+minutos_reserva_fim_string)
                                                        //console.log("Horas Fim em numero",horas_reserva_fim_numero)

                                                        /*
                                                        ***********************Variaveis***********************
                                                        *******************Reserva a adicionar*****************
                                                        Hora Inicio : horas_inicio_numero

                                                        Hora Fim mais limpeza: horas_fim_numero

                                                        ********************Reserva a comparar****************
                                                        Hora Inicio :horas_reserva_inicio_numero

                                                        Hora Fim mais limpeza: horas_reserva_fim_numero
                                                        */

                                                        //Se comecar antes e acabar durante a reserva
                                                        if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) && (horas_reserva_fim_numero <= horas_fim_numero)){
                                                            //console.log('Passei aqui 1')
                                                            Disponivel = false
                                                            break
                                                        }else{
                                                            //Se comecar durante a reserva e acabar depois
                                                            if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                //console.log('Passei aqui 2')
                                                                Disponivel = false
                                                                break
                                                            }else{
                                                                //Se a reserva comecar antes e acabar depois
                                                                if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                    //console.log('Passei aqui 3')
                                                                    Disponivel = false
                                                                    break
                                                                }else{
                                                                    //Se a reserva comecar depois e acabar antes
                                                                    if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) &&(horas_reserva_fim_numero <= horas_fim_numero)){
                                                                        //console.log('Passei aqui 4')
                                                                        Disponivel = false
                                                                        break
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //Nao sobrepoem a reserva logo pode ser ativada
                                                    if(Disponivel){
                                                        //Nao existem reservas com essa data entao pode-se dar update 
                                                        const data = await reserva.create({
                                                            NomeReserva: NomeReserva,
                                                            DataReserva: DataReserva,
                                                            NumeroParticipantes: participantesLimp,
                                                            HoraInicio: HoraInicio,
                                                            HoraFim: HoraFim,
                                                            EstadoId: 1,
                                                            SalaId: Sala,
                                                            UtilizadoreId: Utilizador
                                                        })
                                                        .then(function(data){return data;})
                                                        .catch(error => {
                                                            console.log('Error:'+error)
                                                            return error;
                                                        }) 
                                                        if(data)
                                                            res.status(200).json({sucesso: true,data: data, message: 'Reserva adicionada com sucesso'});
                                                        else
                                                            res.json({sucesso:false, message: 'Não foi possível adicionar a reserva'})
                                                    }else{
                                                        res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva'})
                                                    }
                                                }else{
                                                    //Nao existem reservas com essa data entao pode-se dar update 
                                                    const data = await reserva.create({
                                                        NomeReserva: NomeReserva,
                                                        DataReserva: DataReserva,
                                                        NumeroParticipantes: participantesLimp,
                                                        HoraInicio: HoraInicio,
                                                        HoraFim: HoraFim,
                                                        EstadoId: 1,
                                                        SalaId: Sala,
                                                        UtilizadoreId: Utilizador
                                                    })
                                                    .then(function(data){return data;})
                                                    .catch(error => {
                                                        console.log('Error:'+error)
                                                        return error;
                                                    }) 
                                                    if(data)
                                                        res.status(200).json({sucesso: true,data: data, message: 'Reserva adicionada com sucesso'});
                                                    else
                                                        res.json({sucesso:false, message: 'Não foi possível adicionar a reserva'})
                                                }
                                            }
                                        }else{
                                            res.json({sucesso:false, message:'O centro está desativado'})
                                        }
                                    }else{
                                        res.json({sucesso:false, message:'O centro não existe'})
                                    }
                                }
                            }else{
                                res.json({sucesso:false, message:'A hora de inicio necessita ser superior à hora atual'})
                            }
                        }else{
                            res.json({sucesso:false, message:'A hora fim necessita ser superior à hora inicio'})
                        }
                    }else{
                        if(data_atual.getTime() > data_reserva.getTime())
                            res.json({sucesso: false, message: 'Insira uma data igual ou superior a ' + data_atual});
                        else{
                        //Reserva no futuro
                        //Tempo de Limpeza
                        var TempLimpSala = data.Tempo_Limpeza
                        var tempoLimpezaArray = TempLimpSala.split(':')

                        var horaLimpeza = Number(tempoLimpezaArray[0])
                        //console.log("Horas Limpeza", horaLimpeza)

                        var minutoLimpeza = Number(tempoLimpezaArray[1])
                        //console.log("Minutos Limpeza", minutoLimpeza)

                        //Tempo da reserva
                        var hora_fim_array =  HoraFim.split(':')

                        var horas_fim = Number(hora_fim_array[0])
                        //console.log("Hora fim", horas_fim)

                        var minutos_fim = Number(hora_fim_array[1])
                        //console.log("Minutos fim", minutos_fim)

                        var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                        //console.log('Hora + minutos fim: '+ hora_fim_numero)

                        var horas_fim_limpeza_numero = horas_fim + horaLimpeza
                        //console.log('Horas fim mais limpeza: '+horas_fim_limpeza_numero)

                        var minutos_fim_limpeza_numero = minutos_fim + minutoLimpeza
                        //console.log('Minutos fim mais limpeza: '+ minutos_fim_limpeza_numero)

                        var hora_inicio_array =  HoraInicio.split(':')

                        var hora_inicio = Number(hora_inicio_array[0])
                        //console.log("Horas Inicio: ", hora_inicio)

                        var minutos_inicio = Number(hora_inicio_array[1])
                        //console.log("Minutos Inicio: ", minutos_inicio)

                        var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                        //console.log('Horas + minutos Inicio: ' + hora_incio_numero);

                        if(minutos_fim_limpeza_numero >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                            let resto = Math.trunc(minutos_fim_limpeza_numero / 60 ) 
                            //console.log("Resto:", resto)

                            let diferenca = minutos_fim_limpeza_numero - 60 //Vamos buscar a diferenca
                            //console.log("Diferenca:", diferenca)

                            var novosminutos_fim = diferenca
                            //console.log("Novos minutos mais limpeza", novosminutos_fim)

                            var novashoras_fim = horas_fim_limpeza_numero + resto 
                            //console.log("Novos Horas mais limpeza", novashoras_fim)
                        }else{
                            novosminutos_fim = minutos_fim_limpeza_numero
                            //console.log("Novos minutos mais limpeza", novosminutos_fim)

                            novashoras_fim = horas_fim_limpeza_numero
                            //console.log("Novos Horas mais limpeza", novashoras_fim)
                        }

                        //console.log("Hora Reserva a adicionar")

                        //Inicio

                        var hora_inicio_string = hora_inicio.toString()
                        //console.log("Hora Inicio",hora_inicio_string)

                        var minutos_inicio_string = minutos_inicio.toString()
                        //console.log("Minutos Inicio",minutos_inicio_string)

                        if(minutos_inicio_string.length === 1){
                            var minutos_inicio_string = "0" + minutos_inicio_string
                            //console.log("Minutos Iniciais em String:",minutos_inicio_string)
                        }

                        var horas_inicio_numero = Number(hora_inicio_string+minutos_inicio_string)
                        //console.log("Horas Inicio em numero",horas_inicio_numero)

                        //Fim

                        var hora_fim_string = novashoras_fim.toString()
                        //console.log("Hora Fim",hora_fim_string)

                        var minutos_fim_string = novosminutos_fim.toString()
                        //console.log("Minutos Fim",minutos_fim_string)

                        if(minutos_fim_string.length === 1){
                            var minutos_fim_string = "0" + minutos_fim_string
                            //console.log("Minutos Iniciais em String:",minutos_fim_string)
                        }

                        var horas_fim_numero = Number(hora_fim_string+minutos_fim_string)
                        //console.log("Horas Fim em numero",horas_fim_numero)

                            if(hora_incio_numero < hora_fim_numero){
                                var participantesPermitidos = (data.Alocacao * (data.Capacidade/100));
                                if(participantesLimp > participantesPermitidos){
                                    res.json({sucesso: false, message: 'Número de participantes superior ao limite da sala'});
                                }else{
                                    var dataCentros = await centro.findOne({
                                        where: {id: data.CentroId}
                                    })
                                    if(dataCentros){
                                        if(dataCentros.EstadoId == 1){

                                            var horaInicioCentro = dataCentros.Hora_abertura
                                            var horaInicioCentroArray = horaInicioCentro.split(':')
                                            var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                            //console.log('Hora de abertura: ' + horaInicioCentroNumber)

                                            var horaFimCentro = dataCentros.Hora_fecho
                                            var horaFimCentroArray = horaFimCentro.split(':')
                                            var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])
                                            //console.log('Hora de fechar: ' + horaFimCentroNumber)

                                            if((horas_inicio_numero < horaInicioCentroNumber) || (horas_fim_numero > horaFimCentroNumber)){
                                                res.json({sucesso: false, message: 'O horário do centro é entre as '+dataCentros.Hora_abertura+' e as ' + dataCentros.Hora_fecho+ ' !'});
                                            }else{
                                                const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${DataReserva}' and "Reservas"."SalaId" = ${Sala} order by "Reservas"."HoraInicio"`
                                                const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                                //console.log(reservas.length)
                                                if(reservas.length != 0){
                                                    for(let i = 0; i < reservas.length; i++){
                                                        //Reserva para comparar
                                                        //Hora inicio
                                                        //console.log("Reserva para comparar nº",i)

                                                        const horasInicio = reservas[i].HoraInicio;
                                                        const horasInicio_Array = horasInicio.split(':')

                                                        const horaI = Number(horasInicio_Array[0])
                                                        //console.log('Hora Inicio:' + horaI)

                                                        const minutosI = Number(horasInicio_Array[1])
                                                        //console.log('Minutos Inicio:' + minutosI)

                                                        //Hora Fim
                                                        const horasFim = reservas[i].HoraFim;
                                                        const horasFim_Array = horasFim.split(':')

                                                        const horaF = Number(horasFim_Array[0])
                                                        //console.log('Hora Fim:' + horaF)

                                                        const minutosF = Number(horasFim_Array[1])
                                                        //console.log('Minutos Fim:' + minutosF)

                                                        const HoramaisLimpeza = horaF + horaLimpeza 
                                                        //console.log("Horas final mais limpeza", HoramaisLimpeza)

                                                        const MinutosmaisLimpeza = minutosF + minutoLimpeza 
                                                        //console.log("Minutos final mais limpeza", MinutosmaisLimpeza)

                                                        if(MinutosmaisLimpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                            let resto = Math.trunc(MinutosmaisLimpeza / 60 ) 
                                                            //console.log("Resto:", resto)

                                                            let diferenca = MinutosmaisLimpeza - 60 //Vamos buscar a diferenca
                                                            //console.log("Diferenca:", diferenca)

                                                            var novosminutos_fim_Reserva = diferenca
                                                            //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                            var novashoras_fim_Reserva = HoramaisLimpeza + resto
                                                            //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                        }else{
                                                            novosminutos_fim_Reserva = MinutosmaisLimpeza 
                                                            //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                            novashoras_fim_Reserva = HoramaisLimpeza
                                                            //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                        }

                                                        //console.log("Hora Reserva a Comparar")

                                                        var hora_reserva_inicio_string = horaI.toString()
                                                        //console.log("Hora Inicio",hora_reserva_inicio_string)

                                                        var minutos_reserva_inicio_string = minutosI.toString()
                                                        //console.log("Minutos Inicio",minutos_reserva_inicio_string)

                                                        if(minutos_reserva_inicio_string.length === 1){
                                                            var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                                            //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                                        }

                                                        var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                                        //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                                        var hora_reserva_fim_string = novashoras_fim_Reserva.toString()
                                                        //console.log("Hora Fim",hora_reserva_fim_string)

                                                        var minutos_reserva_fim_string = novosminutos_fim_Reserva.toString()
                                                        //console.log("Minutos Fim",minutos_reserva_fim_string)

                                                        if(minutos_reserva_fim_string.length === 1){
                                                            var minutos_reserva_fim_string = "0" + minutos_reserva_fim_string
                                                            //console.log("Minutos Iniciais em String:",minutos_reserva_fim_string)
                                                        }

                                                        var horas_reserva_fim_numero = Number(hora_reserva_fim_string+minutos_reserva_fim_string)
                                                        //console.log("Horas Fim em numero",horas_reserva_fim_numero)

                                                        /*
                                                        ***********************Variaveis***********************
                                                        *******************Reserva a adicionar*****************
                                                        Hora Inicio : horas_inicio_numero

                                                        Hora Fim mais limpeza: horas_fim_numero

                                                        ********************Reserva a comparar****************
                                                        Hora Inicio :horas_reserva_inicio_numero

                                                        Hora Fim mais limpeza: horas_reserva_fim_numero
                                                        */

                                                        //Se comecar antes e acabar durante a reserva
                                                        if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) && (horas_reserva_fim_numero <= horas_fim_numero)){
                                                            //console.log('Passei aqui 1')
                                                            Disponivel = false
                                                            break
                                                        }else{
                                                            //Se comecar durante a reserva e acabar depois
                                                            if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                //console.log('Passei aqui 2')
                                                                Disponivel = false
                                                                break
                                                            }else{
                                                                //Se a reserva comecar antes e acabar depois
                                                                if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                    //console.log('Passei aqui 3')
                                                                    Disponivel = false
                                                                    break
                                                                }else{
                                                                    //Se a reserva comecar depois e acabar antes
                                                                    if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) &&(horas_reserva_fim_numero <= horas_fim_numero)){
                                                                        //console.log('Passei aqui 4')
                                                                        Disponivel = false
                                                                        break
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                    //Nao sobrepoem a reserva logo pode ser adicionada
                                                    if(Disponivel){
                                                            const data = await reserva.create({
                                                                NomeReserva: NomeReserva,
                                                                DataReserva: DataReserva,
                                                                NumeroParticipantes: participantesLimp,
                                                                HoraInicio: HoraInicio,
                                                                HoraFim: HoraFim,
                                                                EstadoId: 1,
                                                                SalaId: Sala,
                                                                UtilizadoreId: Utilizador
                                                            })
                                                            .then(function(data){return data;})
                                                            .catch(error => {
                                                                console.log('Error:'+error)
                                                                return error;
                                                            }) 
                                                            if(data)
                                                                res.status(200).json({sucesso: true,data: data, message: 'Reserva adicionada com sucesso'});
                                                            else
                                                                res.json({sucesso:false, message: 'Não foi possível adicionada a reserva'})
                                                    }else{
                                                        res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva'})
                                                    }
                                                }else{
                                                    //Nao existem reservas com essa data entao pode-se adicionar
                                                    const data = await reserva.create({
                                                        NomeReserva: NomeReserva,
                                                        DataReserva: DataReserva,
                                                        NumeroParticipantes: participantesLimp,
                                                        HoraInicio: HoraInicio,
                                                        HoraFim: HoraFim,
                                                        EstadoId: 1,
                                                        SalaId: Sala,
                                                        UtilizadoreId: Utilizador
                                                    })
                                                    .then(function(data){return data;})
                                                    .catch(error => {
                                                        console.log('Error:'+error)
                                                        return error;
                                                    }) 
                                                    if(data)
                                                        res.status(200).json({sucesso: true,data: data, message: 'Reserva adicionada com sucesso'});
                                                    else
                                                        res.json({sucesso:false, message: 'Não foi possível adicionar a reserva'})
                                                }
                                            }
                                        }else{
                                            res.json({sucesso:false, message:'O centro está desativado'})
                                        }
                                    }else{
                                        res.json({sucesso:false, message:'O centro não existe'})
                                    }
                                }
                            }else{
                                res.json({sucesso:false, message:'A hora final necessita ser superior à hora inicio'})
                            }
                        }
                    }
                }else{
                    res.json({sucesso:false, message:'A sala está desativada'})
                }
            }else{
                res.json({sucesso:false, message:'A sala escolhida não existe'})
            }
        }else{
            res.json({sucesso:false, message:'O utilizador está desativado'})
        }
    }else{
        res.json({sucesso:false, message:'O utilizador não existe'})
    }
}

//Obter reserva
controllers.get = async(req,res) =>{
    const {id} = req.params;
    if(id!=null){
        const query = `select "Reservas"."id", "Reservas"."NomeReserva", "Reservas"."DataReserva" , "Reservas"."NumeroParticipantes", "Reservas"."HoraInicio", "Reservas"."HoraFim",
"Reservas"."EstadoId", "Reservas"."UtilizadoreId", "Reservas"."SalaId", "Centros"."Nome" as "CentroNome", "Salas"."Nome" as "SalaNome"
from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id" inner join "Centros" on "Salas"."CentroId" = "Centros"."id"
where "Reservas"."id" = ${id}`
        const data = await bd.query(query,{ type: QueryTypes.SELECT })
        .then(function(data){return data;})
        .catch(error => {
            console.log('Error:'+error)
            return error;
        })
        if(data)
            res.status(200).json({sucesso: true, data: data});
        else
            res.json({sucesso: false, message:'Impossível obter a reserva'});
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Editar reserva
controllers.update = async (req, res) =>{ 
    const {id} = req.params;
    const {NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala} = req.body
    var ParticipantesArray = NumeroParticipantes.split(',')
    //console.log(ParticipantesArray)
    var participantesLimp = Number(ParticipantesArray[0])
    //console.log(participantesLimp)
    var Disponivel = true
    if(id!=null){
        const reservaData = await reserva.findOne({
            where:{id:id}
        })
        if(reservaData){
            if(reservaData.EstadoId == 1){
                const utilizadorData = await utilizador.findOne({
                where:{id: Utilizador}
                })
                if(utilizadorData){
                    if(utilizadorData.EstadoId == 1){
                        const data = await sala.findOne({
                            where:{id: Sala}
                        })
                        if(data){
                            if(data.EstadoId == 1){
                                //Para o caso de querer mudar apenas os participantes ou a tag
                                var participantesPermitidos = (data.Alocacao * (data.Capacidade/100));
                                if(NumeroParticipantes > participantesPermitidos){
                                    res.json({sucesso: false, message: 'Número de participantes superior ao limite da sala.'});
                                }else{
                                    if(DataReserva == reservaData.DataReserva && HoraInicio == reservaData.HoraInicio && HoraFim == reservaData.HoraFim){
                                        const data = await reserva.update({
                                            NomeReserva: NomeReserva,
                                            DataReserva: DataReserva,
                                            NumeroParticipantes: participantesLimp,
                                            HoraInicio: HoraInicio,
                                            HoraFim: HoraFim
                                        }, {where: {id: id}})
                                        .then(function(data){return data;})
                                        .catch(error => {
                                            console.log('Error:'+error)
                                            return error;
                                        }) 
                                        if(data)
                                            res.status(200).json({sucesso: true,data: data, message: 'Reserva atualizada com sucesso'});
                                        else
                                            res.json({sucesso:false, message: 'Impossível atualizar a reserva'})
                                    }else{
                                        //Validar o nome
                                        var data_reserva = new Date(DataReserva)
                                        var data_atual = new Date();
                                        if(date.isSameDay(data_atual,data_reserva)){
                                            //console.log("Reserva para hoje")
                                            //Horas Atuais
                                            var horas_atuais = (data_atual.getHours()).toString()
                                            //console.log('Hora atual: ' + horas_atuais)

                                            var minutos_atuais = (data_atual.getMinutes()).toString()
                                            //console.log('Minutos atuais: ' + minutos_atuais)

                                            var hora_atual_numero = Number(horas_atuais + minutos_atuais)
                                            //console.log('Horas atuais em numero: '+hora_atual_numero)

                                            //Tempo de Limpeza
                                            var TempLimpSala = data.Tempo_Limpeza
                                            var tempoLimpezaArray = TempLimpSala.split(':')

                                            var horaLimpeza = Number(tempoLimpezaArray[0])
                                            //console.log("Horas Limpeza", horaLimpeza)

                                            var minutoLimpeza = Number(tempoLimpezaArray[1])
                                            //console.log("Minutos Limpeza", minutoLimpeza)

                                            //Tempo da reserva
                                            var hora_fim_array =  HoraFim.split(':')

                                            var horas_fim = Number(hora_fim_array[0])
                                            //console.log("Hora fim", horas_fim)

                                            var minutos_fim = Number(hora_fim_array[1])
                                            //console.log("Minutos fim", minutos_fim)

                                            var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                                            //console.log('Hora + minutos fim: '+ hora_fim_numero)

                                            var horas_fim_limpeza_numero = horas_fim + horaLimpeza
                                            //console.log('Horas fim mais limpeza: '+horas_fim_limpeza_numero)

                                            var minutos_fim_limpeza_numero = minutos_fim + minutoLimpeza
                                            //console.log('Minutos fim mais limpeza: '+ minutos_fim_limpeza_numero)

                                            var hora_inicio_array =  HoraInicio.split(':')

                                            var hora_inicio = Number(hora_inicio_array[0])
                                            //console.log("Horas Inicio: ", hora_inicio)

                                            var minutos_inicio = Number(hora_inicio_array[1])
                                            //console.log("Minutos Inicio: ", minutos_inicio)

                                            var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                                            //console.log('Horas + minutos Inicio: ' + hora_incio_numero);

                                            if(minutos_fim_limpeza_numero >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                let resto = Math.trunc(minutos_fim_limpeza_numero / 60 ) 
                                                //console.log("Resto:", resto)

                                                let diferenca = minutos_fim_limpeza_numero - 60 //Vamos buscar a diferenca
                                                //console.log("Diferenca:", diferenca)

                                                var novosminutos_fim = diferenca
                                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                                var novashoras_fim = horas_fim_limpeza_numero + resto
                                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                                            }else{
                                                novosminutos_fim = minutos_fim_limpeza_numero
                                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                                novashoras_fim = horas_fim_limpeza_numero
                                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                                            }

                                            //console.log("Hora Reserva a editar")

                                            var hora_inicio_string = hora_inicio.toString()
                                            //console.log("Hora Inicio",hora_inicio_string)

                                            var minutos_inicio_string = minutos_inicio.toString()
                                            //console.log("Minutos Inicio",minutos_inicio_string)

                                            if(minutos_inicio_string.length === 1){
                                                var minutos_inicio_string = "0" + minutos_inicio_string
                                                //console.log("Minutos Iniciais em String:",minutos_inicio_string)
                                            }

                                            var horas_inicio_numero = Number(hora_inicio_string+minutos_inicio_string)
                                            //console.log("Horas Inicio em numero",horas_inicio_numero)

                                            var hora_fim_string = novashoras_fim.toString()
                                            //console.log("Hora Fim",hora_fim_string)

                                            var minutos_fim_string = novosminutos_fim.toString()
                                            //console.log("Minutos Fim",minutos_fim_string)

                                            if(minutos_fim_string.length === 1){
                                                var minutos_fim_string = "0" + minutos_fim_string
                                                //console.log("Minutos Iniciais em String:",minutos_fim_string)
                                            }

                                            var horas_fim_numero = Number(hora_fim_string+minutos_fim_string)
                                            //console.log("Horas Fim em numero",horas_fim_numero)

                                            if(hora_incio_numero < hora_fim_numero){
                                                if(hora_incio_numero > hora_atual_numero){
                                                    var participantesPermitidos = (data.Alocacao * (data.Capacidade/100));
                                                    if(participantesLimp > participantesPermitidos){
                                                        res.json({sucesso: false, message: 'Número de participantes superior ao limite da sala'});
                                                    }else{
                                                        var dataCentros = await centro.findOne({
                                                            where: {id: data.CentroId}
                                                        })
                                                        if(dataCentros){
                                                            if(dataCentros.EstadoId == 1){
                                                                var horaInicioCentro = dataCentros.Hora_abertura
                                                                var horaInicioCentroArray = horaInicioCentro.split(':')
                                                                var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                                                //console.log('Hora de abertura: ' + horaInicioCentroNumber)
                                                                var horaFimCentro = dataCentros.Hora_fecho
                                                                var horaFimCentroArray = horaFimCentro.split(':')
                                                                var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])
                                                                //console.log('Hora de fechar: ' + horaFimCentroNumber)

                                                                if((horas_inicio_numero < horaInicioCentroNumber) || (horas_fim_numero > horaFimCentroNumber)){
                                                                    res.json({sucesso: false, message: 'O horário do centro é entre as '+dataCentros.Hora_abertura+' e as ' + dataCentros.Hora_fecho+ ' !'});
                                                                }else{
                                                                    const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${DataReserva}' and "Reservas"."SalaId" = ${Sala} order by "Reservas"."HoraInicio"`
                                                                    const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                                                    //console.log(reservas.length)
                                                                    if(reservas.length != 0){
                                                                        for(let i = 0; i < reservas.length; i++){
                                                                            if(reservas[i].id !== reservaData.id){
                                                                                //Reserva para comparar
                                                                                //Hora inicio
                                                                                //console.log("Reserva para comparar nº",i)

                                                                                const horasInicio = reservas[i].HoraInicio;
                                                                                const horasInicio_Array = horasInicio.split(':')

                                                                                const horaI = Number(horasInicio_Array[0])
                                                                                //console.log('Hora Inicio:' + horaI)

                                                                                const minutosI = Number(horasInicio_Array[1])
                                                                                //console.log('Minutos Inicio:' + minutosI)

                                                                                //Hora Fim
                                                                                const horasFim = reservas[i].HoraFim;
                                                                                const horasFim_Array = horasFim.split(':')

                                                                                const horaF = Number(horasFim_Array[0])
                                                                                //console.log('Hora Fim:' + horaF)

                                                                                const minutosF = Number(horasFim_Array[1])
                                                                                //console.log('Minutos Fim:' + minutosF)

                                                                                const HoramaisLimpeza = horaF + horaLimpeza 
                                                                                //console.log("Horas final mais limpeza", HoramaisLimpeza)

                                                                                const MinutosmaisLimpeza = minutosF + minutoLimpeza 
                                                                                //console.log("Minutos final mais limpeza", MinutosmaisLimpeza)

                                                                                if(MinutosmaisLimpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                                                    let resto = Math.trunc(MinutosmaisLimpeza / 60 ) 
                                                                                    //console.log("Resto:", resto)

                                                                                    let diferenca = MinutosmaisLimpeza - 60 //Vamos buscar a diferenca
                                                                                    //console.log("Diferenca:", diferenca)

                                                                                    var novosminutos_fim_Reserva = diferenca
                                                                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                                                    var novashoras_fim_Reserva = HoramaisLimpeza + resto
                                                                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                                                }else{
                                                                                    novosminutos_fim_Reserva = MinutosmaisLimpeza 
                                                                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                                                    novashoras_fim_Reserva = HoramaisLimpeza
                                                                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                                                }

                                                                                //console.log("Hora Reserva a Comparar")

                                                                                var hora_reserva_inicio_string = horaI.toString()
                                                                                //console.log("Hora Inicio",hora_reserva_inicio_string)

                                                                                var minutos_reserva_inicio_string = minutosI.toString()
                                                                                //console.log("Minutos Inicio",minutos_reserva_inicio_string)

                                                                                if(minutos_reserva_inicio_string.length === 1){
                                                                                    var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                                                                    //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                                                                }

                                                                                var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                                                                //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                                                                var hora_reserva_fim_string = novashoras_fim_Reserva.toString()
                                                                                //console.log("Hora Fim",hora_reserva_fim_string)

                                                                                var minutos_reserva_fim_string = novosminutos_fim_Reserva.toString()
                                                                                //console.log("Minutos Fim",minutos_reserva_fim_string)

                                                                                if(minutos_reserva_fim_string.length === 1){
                                                                                    var minutos_reserva_fim_string = "0" + minutos_reserva_fim_string
                                                                                    //console.log("Minutos Iniciais em String:",minutos_reserva_fim_string)
                                                                                }

                                                                                var horas_reserva_fim_numero = Number(hora_reserva_fim_string+minutos_reserva_fim_string)
                                                                                //console.log("Horas Fim em numero",horas_reserva_fim_numero)

                                                                                /*
                                                                                ***********************Variaveis***********************
                                                                                *******************Reserva a adicionar*****************
                                                                                Hora Inicio : horas_inicio_numero

                                                                                Hora Fim mais limpeza: horas_fim_numero

                                                                                ********************Reserva a comparar****************
                                                                                Hora Inicio :horas_reserva_inicio_numero

                                                                                Hora Fim mais limpeza: horas_reserva_fim_numero
                                                                                */

                                                                                //Se comecar antes e acabar durante a reserva
                                                                                if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) && (horas_reserva_fim_numero <= horas_fim_numero)){
                                                                                    //console.log('Passei aqui 1')
                                                                                    Disponivel = false
                                                                                    break
                                                                                }else{
                                                                                    //Se comecar durante a reserva e acabar depois
                                                                                    if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                                        //console.log('Passei aqui 2')
                                                                                        Disponivel = false
                                                                                        break
                                                                                    }else{
                                                                                        //Se a reserva comecar antes e acabar depois
                                                                                        if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                                            //console.log('Passei aqui 3')
                                                                                            Disponivel = false
                                                                                            break
                                                                                        }else{
                                                                                            //Se a reserva comecar depois e acabar antes
                                                                                            if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) &&(horas_reserva_fim_numero <= horas_fim_numero)){
                                                                                                //console.log('Passei aqui 4')
                                                                                                Disponivel = false
                                                                                                break
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }else
                                                                                continue;
                                                                        }
                                                                        //Nao sobrepoem a reserva logo pode ser ativada
                                                                        if(Disponivel){
                                                                            //Nao existem reservas com essa data entao pode-se dar update 
                                                                            const data = await reserva.update({
                                                                                NomeReserva: NomeReserva,
                                                                                DataReserva: DataReserva,
                                                                                NumeroParticipantes: participantesLimp,
                                                                                HoraInicio: HoraInicio,
                                                                                HoraFim: HoraFim,
                                                                                EstadoId: 1,
                                                                                SalaId: Sala,
                                                                                UtilizadoreId: Utilizador
                                                                            },{
                                                                                where: {id: reservaData.id},
                                                                            })
                                                                            .then(function(data){return data;})
                                                                            .catch(error => {
                                                                                console.log('Error:'+error)
                                                                                return error;
                                                                            }) 
                                                                            if(data)
                                                                                res.status(200).json({sucesso: true,data: data, message: 'Reserva editada com sucesso'});
                                                                            else
                                                                                res.json({sucesso:false, message: 'Não foi possível editar a reserva'})
                                                                        }else{
                                                                            res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva'})
                                                                        }
                                                                    }else{
                                                                        //Nao existem reservas com essa data entao pode-se dar update 
                                                                        const data = await reserva.update({
                                                                            NomeReserva: NomeReserva,
                                                                            DataReserva: DataReserva,
                                                                            NumeroParticipantes: participantesLimp,
                                                                            HoraInicio: HoraInicio,
                                                                            HoraFim: HoraFim,
                                                                            EstadoId: 1,
                                                                            SalaId: Sala,
                                                                            UtilizadoreId: Utilizador
                                                                        },{
                                                                            where: {id: reservaData.id},
                                                                        })
                                                                        .then(function(data){return data;})
                                                                        .catch(error => {
                                                                            console.log('Error:'+error)
                                                                            return error;
                                                                        }) 
                                                                        if(data)
                                                                            res.status(200).json({sucesso: true,data: data, message: 'Reserva editada com sucesso'});
                                                                        else
                                                                            res.json({sucesso:false, message: 'Não foi possível editar a reserva'})
                                                                    }
                                                                }
                                                            }else{
                                                                res.json({sucesso:false, message:'O centro está desativado'})
                                                            }
                                                        }else{
                                                            res.json({sucesso:false, message:'O centro não existe'})
                                                        }
                                                    }
                                                }else{
                                                    res.json({sucesso:false, message:'A hora de inicio necessita ser superior à hora atual'})
                                                }
                                            }else{
                                                res.json({sucesso:false, message:'A hora fim necessita ser superior à hora inicio'})
                                            }
                                        }else{
                                            if(data_atual.getTime() > data_reserva.getTime())
                                                res.json({sucesso: false, message: 'Insira uma data igual ou superior a ' + data_atual});
                                            else{
                                            //Reserva no futuro
                                            //Tempo de Limpeza
                                            var TempLimpSala = data.Tempo_Limpeza
                                            var tempoLimpezaArray = TempLimpSala.split(':')

                                            var horaLimpeza = Number(tempoLimpezaArray[0])
                                            //console.log("Horas Limpeza", horaLimpeza)

                                            var minutoLimpeza = Number(tempoLimpezaArray[1])
                                            //console.log("Minutos Limpeza", minutoLimpeza)

                                            //Tempo da reserva
                                            var hora_fim_array =  HoraFim.split(':')

                                            var horas_fim = Number(hora_fim_array[0])
                                            //console.log("Hora fim", horas_fim)

                                            var minutos_fim = Number(hora_fim_array[1])
                                            //console.log("Minutos fim", minutos_fim)

                                            var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                                            //console.log('Hora + minutos fim: '+ hora_fim_numero)

                                            var horas_fim_limpeza_numero = horas_fim + horaLimpeza
                                            //console.log('Horas fim mais limpeza: '+horas_fim_limpeza_numero)

                                            var minutos_fim_limpeza_numero = minutos_fim + minutoLimpeza
                                            //console.log('Minutos fim mais limpeza: '+ minutos_fim_limpeza_numero)

                                            var hora_inicio_array =  HoraInicio.split(':')

                                            var hora_inicio = Number(hora_inicio_array[0])
                                            //console.log("Horas Inicio: ", hora_inicio)

                                            var minutos_inicio = Number(hora_inicio_array[1])
                                            //console.log("Minutos Inicio: ", minutos_inicio)

                                            var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                                            //console.log('Horas + minutos Inicio: ' + hora_incio_numero);

                                            if(minutos_fim_limpeza_numero >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                let resto = Math.trunc(minutos_fim_limpeza_numero / 60 ) 
                                                //console.log("Resto:", resto)

                                                let diferenca = minutos_fim_limpeza_numero - 60 //Vamos buscar a diferenca
                                                //console.log("Diferenca:", diferenca)

                                                var novosminutos_fim = diferenca
                                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                                var novashoras_fim = horas_fim_limpeza_numero + resto
                                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                                            }else{
                                                novosminutos_fim = minutos_fim_limpeza_numero
                                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                                novashoras_fim = horas_fim_limpeza_numero
                                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                                            }

                                            //console.log("Hora Reserva a editar")

                                            //Inicio

                                            var hora_inicio_string = hora_inicio.toString()
                                            //console.log("Hora Inicio",hora_inicio_string)

                                            var minutos_inicio_string = minutos_inicio.toString()
                                            //console.log("Minutos Inicio",minutos_inicio_string)

                                            if(minutos_inicio_string.length === 1){
                                                var minutos_inicio_string = "0" + minutos_inicio_string
                                                //console.log("Minutos Iniciais em String:",minutos_inicio_string)
                                            }

                                            var horas_inicio_numero = Number(hora_inicio_string+minutos_inicio_string)
                                            //console.log("Horas Inicio em numero",horas_inicio_numero)

                                            //Fim

                                            var hora_fim_string = novashoras_fim.toString()
                                            //console.log("Hora Fim",hora_fim_string)

                                            var minutos_fim_string = novosminutos_fim.toString()
                                            //console.log("Minutos Fim",minutos_fim_string)

                                            if(minutos_fim_string.length === 1){
                                                var minutos_fim_string = "0" + minutos_fim_string
                                                //console.log("Minutos Iniciais em String:",minutos_fim_string)
                                            }

                                            var horas_fim_numero = Number(hora_fim_string+minutos_fim_string)
                                            //console.log("Horas Fim em numero",horas_fim_numero)

                                                if(hora_incio_numero < hora_fim_numero){
                                                    var participantesPermitidos = (data.Alocacao * (data.Capacidade/100));
                                                    if(participantesLimp > participantesPermitidos){
                                                        res.json({sucesso: false, message: 'Número de participantes superior ao limite da sala'});
                                                    }else{
                                                        var dataCentros = await centro.findOne({
                                                            where: {id: data.CentroId}
                                                        })
                                                        if(dataCentros){
                                                            if(dataCentros.EstadoId == 1){

                                                                var horaInicioCentro = dataCentros.Hora_abertura
                                                                var horaInicioCentroArray = horaInicioCentro.split(':')
                                                                var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                                                //console.log('Hora de abertura: ' + horaInicioCentroNumber)

                                                                var horaFimCentro = dataCentros.Hora_fecho
                                                                var horaFimCentroArray = horaFimCentro.split(':')
                                                                var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])
                                                                //console.log('Hora de fechar: ' + horaFimCentroNumber)

                                                                if((horas_inicio_numero < horaInicioCentroNumber) || (horas_fim_numero > horaFimCentroNumber)){
                                                                    res.json({sucesso: false, message: 'O horário do centro é entre as '+dataCentros.Hora_abertura+' e as ' + dataCentros.Hora_fecho+ ' !'});
                                                                }else{
                                                                    const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${DataReserva}' and "Reservas"."SalaId" = ${Sala} order by "Reservas"."HoraInicio"`
                                                                    const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                                                    //console.log(reservas.length)
                                                                    if(reservas.length != 0){
                                                                        for(let i = 0; i < reservas.length; i++){
                                                                            if(reservas[i].id !== reservaData.id){
                                                                                //Reserva para comparar
                                                                                //Hora inicio
                                                                                //console.log("Reserva para comparar nº",i)

                                                                                const horasInicio = reservas[i].HoraInicio;
                                                                                const horasInicio_Array = horasInicio.split(':')

                                                                                const horaI = Number(horasInicio_Array[0])
                                                                                //console.log('Hora Inicio:' + horaI)

                                                                                const minutosI = Number(horasInicio_Array[1])
                                                                                //console.log('Minutos Inicio:' + minutosI)

                                                                                //Hora Fim
                                                                                const horasFim = reservas[i].HoraFim;
                                                                                const horasFim_Array = horasFim.split(':')

                                                                                const horaF = Number(horasFim_Array[0])
                                                                                //console.log('Hora Fim:' + horaF)

                                                                                const minutosF = Number(horasFim_Array[1])
                                                                                //console.log('Minutos Fim:' + minutosF)

                                                                                const HoramaisLimpeza = horaF + horaLimpeza 
                                                                                //console.log("Horas final mais limpeza", HoramaisLimpeza)

                                                                                const MinutosmaisLimpeza = minutosF + minutoLimpeza 
                                                                                //console.log("Minutos final mais limpeza", MinutosmaisLimpeza)

                                                                                if(MinutosmaisLimpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                                                                    let resto = Math.trunc(MinutosmaisLimpeza / 60 )
                                                                                    //console.log("Resto:", resto)

                                                                                    let diferenca = MinutosmaisLimpeza - 60 //Vamos buscar a diferenca
                                                                                    //console.log("Diferenca:", diferenca)

                                                                                    var novosminutos_fim_Reserva = diferenca
                                                                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                                                    var novashoras_fim_Reserva = HoramaisLimpeza + resto
                                                                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                                                }else{
                                                                                    novosminutos_fim_Reserva = MinutosmaisLimpeza 
                                                                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                                                                    novashoras_fim_Reserva = HoramaisLimpeza
                                                                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                                                                }

                                                                                //console.log("Hora Reserva a Comparar")

                                                                                var hora_reserva_inicio_string = horaI.toString()
                                                                                //console.log("Hora Inicio",hora_reserva_inicio_string)

                                                                                var minutos_reserva_inicio_string = minutosI.toString()
                                                                                //console.log("Minutos Inicio",minutos_reserva_inicio_string)

                                                                                if(minutos_reserva_inicio_string.length === 1){
                                                                                    var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                                                                    //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                                                                }

                                                                                var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                                                                //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                                                                var hora_reserva_fim_string = novashoras_fim_Reserva.toString()
                                                                                //console.log("Hora Fim",hora_reserva_fim_string)

                                                                                var minutos_reserva_fim_string = novosminutos_fim_Reserva.toString()
                                                                                //console.log("Minutos Fim",minutos_reserva_fim_string)

                                                                                if(minutos_reserva_fim_string.length === 1){
                                                                                    var minutos_reserva_fim_string = "0" + minutos_reserva_fim_string
                                                                                   // console.log("Minutos Iniciais em String:",minutos_reserva_fim_string)
                                                                                }

                                                                                var horas_reserva_fim_numero = Number(hora_reserva_fim_string+minutos_reserva_fim_string)
                                                                                //console.log("Horas Fim em numero",horas_reserva_fim_numero)

                                                                                /*
                                                                                ***********************Variaveis***********************
                                                                                *******************Reserva a adicionar*****************
                                                                                Hora Inicio : horas_inicio_numero

                                                                                Hora Fim mais limpeza: horas_fim_numero

                                                                                ********************Reserva a comparar****************
                                                                                Hora Inicio :horas_reserva_inicio_numero

                                                                                Hora Fim mais limpeza: horas_reserva_fim_numero
                                                                                */

                                                                                //Se comecar antes e acabar durante a reserva
                                                                                if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) && (horas_reserva_fim_numero <= horas_fim_numero)){
                                                                                    //console.log('Passei aqui 1')
                                                                                    Disponivel = false
                                                                                    break
                                                                                }else{
                                                                                    //Se comecar durante a reserva e acabar depois
                                                                                    if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                                        //console.log('Passei aqui 2')
                                                                                        Disponivel = false
                                                                                        break
                                                                                    }else{
                                                                                        //Se a reserva comecar antes e acabar depois
                                                                                        if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                                                                            //console.log('Passei aqui 3')
                                                                                            Disponivel = false
                                                                                            break
                                                                                        }else{
                                                                                            //Se a reserva comecar depois e acabar antes
                                                                                            if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) &&(horas_reserva_fim_numero <= horas_fim_numero)){
                                                                                                //console.log('Passei aqui 4')
                                                                                                Disponivel = false
                                                                                                break
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }else
                                                                                continue;
                                                                        }
                                                                        //Nao sobrepoem a reserva logo pode ser adicionada
                                                                        if(Disponivel){
                                                                                const data = await reserva.update({
                                                                                    NomeReserva: NomeReserva,
                                                                                    DataReserva: DataReserva,
                                                                                    NumeroParticipantes: participantesLimp,
                                                                                    HoraInicio: HoraInicio,
                                                                                    HoraFim: HoraFim,
                                                                                    EstadoId: 1,
                                                                                    SalaId: Sala,
                                                                                    UtilizadoreId: Utilizador
                                                                                },{
                                                                                    where: {id: reservaData.id},
                                                                                })
                                                                                .then(function(data){return data;})
                                                                                .catch(error => {
                                                                                    console.log('Error:'+error)
                                                                                    return error;
                                                                                }) 
                                                                                if(data)
                                                                                    res.status(200).json({sucesso: true,data: data, message: 'Reserva editada com sucesso'});
                                                                                else
                                                                                    res.json({sucesso:false, message: 'Não foi possível editar a reserva'})
                                                                        }else{
                                                                            res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva'})
                                                                        }
                                                                    }else{
                                                                        //Nao existem reservas com essa data entao pode-se adicionar
                                                                        const data = await reserva.update({
                                                                            NomeReserva: NomeReserva,
                                                                            DataReserva: DataReserva,
                                                                            NumeroParticipantes: participantesLimp,
                                                                            HoraInicio: HoraInicio,
                                                                            HoraFim: HoraFim,
                                                                            EstadoId: 1,
                                                                            SalaId: Sala,
                                                                            UtilizadoreId: Utilizador
                                                                        },{
                                                                            where: {id: reservaData.id},
                                                                        })
                                                                        .then(function(data){return data;})
                                                                        .catch(error => {
                                                                            console.log('Error:'+error)
                                                                            return error;
                                                                        }) 
                                                                        if(data)
                                                                            res.status(200).json({sucesso: true,data: data, message: 'Reserva editada com sucesso'});
                                                                        else
                                                                            res.json({sucesso:false, message: 'Não foi possível editar a reserva'})
                                                                    }
                                                                }
                                                            }else{
                                                                res.json({sucesso:false, message:'O centro está desativado'})
                                                            }
                                                        }else{
                                                            res.json({sucesso:false, message:'O centro não existe'})
                                                        }
                                                    }
                                                }else{
                                                    res.json({sucesso:false, message:'A hora final necessita ser superior à hora inicio'})
                                                }
                                            }
                                        }
                                    }
                                }
                            }else{
                                res.json({sucesso:false, message:'A sala está desativada'})
                            }
                        }else{
                            res.json({sucesso:false, message:'A sala não existe'})
                        }
                    }else{
                        res.json({sucesso:false, message:'O utilizador está desativado'})
                    }
                }else{
                    res.json({sucesso:false, message:'O utilizador não existe'})
                }
            }else
                res.json({sucesso:false, message:'A reserva está desativada'})
        }else{
                res.json({sucesso:false, message:'A reserva não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Eliminar reserva
controllers.delete = async (req, res) =>{
    const {id} = req.params;
    if(id!=null){
        const reservadata = await reserva.findOne({
            where:{id:id}
        })
        if(reservadata){
            var limpezadestroy = await historicoLimpeza.destroy({
                where:{ReservaId: id}
            })
            var adiamentosdestroy = await historicoAdiamentos.destroy({
                where:{ReservaId: id}
            })
            var data = await reserva.destroy({
                where: {id: id},
            })
            res.status(200).json({
                sucesso: true,
                message: "Reserva eliminada com sucesso",
                deleted: data + '   ' + limpezadestroy + '   ' + adiamentosdestroy
            });
        }else{
            res.json({sucesso:false, message:"A reserva não existe"});
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Ativar Reserva
controllers.ativar = async (req, res) =>{ 
    const {id} = req.params;
    var Disponivel = true
    if(id!=null){
        var reservaData = await reserva.findOne({
            where:{id:id}
        })
        if(reservaData){
            const Saladata = await sala.findOne({
                where:{id: reservaData.SalaId}
            })
            if(Saladata.EstadoId == 1){
                //Tempo de Limpeza
                var TempLimpSala = Saladata.Tempo_Limpeza
                var tempoLimpezaArray = TempLimpSala.split(':')

                var horaLimpeza = Number(tempoLimpezaArray[0])
                //console.log("Horas Limpeza", horaLimpeza)

                var minutoLimpeza = Number(tempoLimpezaArray[1])
                //console.log("Minutos Limpeza", minutoLimpeza)

                if(reservaData.EstadoId == 2){

                    //Verificar se a reserva esta em adamento
                    var data_atual = new Date() 
                    //console.log('Data atual: '+data_atual)
                    var AnoAtual = (data_atual.getFullYear()).toString()
                    var MesAtual = (data_atual.getMonth() + 1).toString()
                    var DiaAtual = (data_atual.getDate()).toString()
                    var DataAtualString = (AnoAtual + MesAtual + DiaAtual)
                    /* console.log('Ano atual: ' + AnoAtual)
                    console.log('Mes atual: ' + MesAtual)
                    console.log('Dia atual: ' + DiaAtual)
                    console.log('Data Atual final: ' + DataAtualString) */
                    var dateReserva = new Date(reservaData.DataReserva) 
                    //console.log('Data da reserva: '+dateReserva)
                    var AnoReserva = (dateReserva.getFullYear()).toString()
                    var MesReserva = (dateReserva.getMonth() + 1).toString()
                    var DiaReserva = (dateReserva.getDate()).toString()
                    var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                    /* console.log('Ano atual: ' + AnoReserva)
                    console.log('Mes atual: ' + MesReserva)
                    console.log('Dia atual: ' + DiaReserva)
                    console.log('Data Atual final: ' + DataReservaString) */
                    //Verificar se ja passou
                    if(DataAtualString > DataReservaString)
                        res.json({sucesso: false, message:'Impossível ativar uma reserva que ja terminou'})
                    else{
                        //Primeiramente temos que ir buscar todas as reservas com a mesma data, depois temos que percorrer o array das reservase verificar se existe alguma reserva que possui a mesma hora que a data da reserva a ativar, podemos pegar nas horas eminutos e se estiver na mesma hora entao fazemos um numero com essa hora e os minutos e fazemos o mesmo para a reserva aativar se a hora inicio mais o tempo limpeza da sala for igual ou superior a hora inicio da reserva entao nao e possivelse nao ativa a reserva
                        const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${reservaData.DataReserva}' and "Reservas"."SalaId" = ${Saladata.id} and "Reservas"."id" != ${id} order by "Reservas"."HoraInicio"`
                        const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                        console.log(reservas)
                        if(reservas.length != 0){
                            //Obter informacao da reserva que queremos ativar
                                //Tempo da reserva
                                var hora_fim_array =  (reservaData.HoraFim).split(':')

                                var horas_fim = Number(hora_fim_array[0])
                                //console.log("Hora fim", horas_fim)

                                var minutos_fim = Number(hora_fim_array[1])
                                //console.log("Minutos fim", minutos_fim)

                                var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                                //console.log('Hora + minutos fim: '+ hora_fim_numero)

                                var horas_fim_limpeza_numero = horas_fim + horaLimpeza
                                //console.log('Horas fim mais limpeza: '+horas_fim_limpeza_numero)

                                var minutos_fim_limpeza_numero = minutos_fim + minutoLimpeza
                                //console.log('Minutos fim mais limpeza: '+ minutos_fim_limpeza_numero)

                                var hora_inicio_array =  (reservaData.HoraInicio).split(':')

                                var hora_inicio = Number(hora_inicio_array[0])
                                //console.log("Horas Inicio: ", hora_inicio)

                                var minutos_inicio = Number(hora_inicio_array[1])
                                //console.log("Minutos Inicio: ", minutos_inicio)

                                var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                                //console.log('Horas + minutos Inicio: ' + hora_incio_numero);

                                if(minutos_fim_limpeza_numero >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                let resto = Math.trunc(minutos_fim_limpeza_numero / 60 )
                                //console.log("Resto:", resto)

                                let diferenca = minutos_fim_limpeza_numero - 60 //Vamos buscar a diferenca
                                //console.log("Diferenca:", diferenca)

                                var novosminutos_fim = diferenca
                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                var novashoras_fim = horas_fim_limpeza_numero + resto
                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                            }else{
                                novosminutos_fim = minutos_fim_limpeza_numero
                                //console.log("Novos minutos mais limpeza", novosminutos_fim)

                                novashoras_fim = horas_fim_limpeza_numero
                                //console.log("Novos Horas mais limpeza", novashoras_fim)
                            }

                            //console.log("Hora Reserva a ativar")

                            //Inicio

                            var hora_inicio_string = hora_inicio.toString()
                            //console.log("Hora Inicio",hora_inicio_string)

                            var minutos_inicio_string = minutos_inicio.toString()
                            //console.log("Minutos Inicio",minutos_inicio_string)

                            if(minutos_inicio_string.length === 1){
                                var minutos_inicio_string = "0" + minutos_inicio_string
                                //console.log("Minutos Iniciais em String:",minutos_inicio_string)
                            }

                            var horas_inicio_numero = Number(hora_inicio_string+minutos_inicio_string)
                           // console.log("Horas Inicio em numero",horas_inicio_numero)

                           //Fim

                            var hora_fim_string = novashoras_fim.toString()
                            //console.log("Hora Fim",hora_fim_string)

                            var minutos_fim_string = novosminutos_fim.toString()
                            //console.log("Minutos Fim",minutos_fim_string)

                            if(minutos_fim_string.length === 1){
                                var minutos_fim_string = "0" + minutos_fim_string
                                //console.log("Minutos Iniciais em String:",minutos_fim_string)
                            }

                            var horas_fim_numero = Number(hora_fim_string+minutos_fim_string)
                            //console.log("Horas Fim em numero",horas_fim_numero)

                            for(let i = 0; i < reservas.length; i++){
                                //Hora inicio
                                //console.log("Reserva para comparar nº",i)

                                const horasInicio = reservas[i].HoraInicio;
                                const horasInicio_Array = horasInicio.split(':')

                                const horaI = Number(horasInicio_Array[0])
                                //console.log('Hora Inicio:' + horaI)

                                const minutosI = Number(horasInicio_Array[1])
                                //console.log('Minutos Inicio:' + minutosI)

                                //Hora Fim
                                const horasFim = reservas[i].HoraFim;
                                const horasFim_Array = horasFim.split(':')

                                const horaF = Number(horasFim_Array[0])
                                //console.log('Hora Fim:' + horaF)

                                const minutosF = Number(horasFim_Array[1])
                                //console.log('Minutos Fim:' + minutosF)

                                const HoramaisLimpeza = horaF + horaLimpeza 
                                //console.log("Horas final mais limpeza", HoramaisLimpeza)

                                const MinutosmaisLimpeza = minutosF + minutoLimpeza 
                                //console.log("Minutos final mais limpeza", MinutosmaisLimpeza)

                                if(MinutosmaisLimpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                    let resto = Math.trunc(MinutosmaisLimpeza / 60 )
                                    //console.log("Resto:", resto)

                                    let diferenca = MinutosmaisLimpeza - 60 //Vamos buscar a diferenca
                                    //console.log("Diferenca:", diferenca)

                                    var novosminutos_fim_Reserva = diferenca
                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                    var novashoras_fim_Reserva = HoramaisLimpeza + resto
                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                }else{
                                    novosminutos_fim_Reserva = MinutosmaisLimpeza 
                                    //console.log("Novos minutos mais limpeza", novosminutos_fim_Reserva)

                                    novashoras_fim_Reserva = HoramaisLimpeza
                                    //console.log("Novos Horas mais limpeza", novashoras_fim_Reserva)
                                }

                                //console.log("Hora Reserva a Comparar")

                                var hora_reserva_inicio_string = horaI.toString()
                                //console.log("Hora Inicio",hora_reserva_inicio_string)

                                var minutos_reserva_inicio_string = minutosI.toString()
                                //console.log("Minutos Inicio",minutos_reserva_inicio_string)

                                if(minutos_reserva_inicio_string.length === 1){
                                    var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                    //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                }

                                var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                var hora_reserva_fim_string = novashoras_fim_Reserva.toString()
                                //console.log("Hora Fim",hora_reserva_fim_string)

                                var minutos_reserva_fim_string = novosminutos_fim_Reserva.toString()
                                //console.log("Minutos Fim",minutos_reserva_fim_string)

                                if(minutos_reserva_fim_string.length === 1){
                                    var minutos_reserva_fim_string = "0" + minutos_reserva_fim_string
                                    //console.log("Minutos Iniciais em String:",minutos_reserva_fim_string)
                                }

                                var horas_reserva_fim_numero = Number(hora_reserva_fim_string+minutos_reserva_fim_string)
                                //console.log("Horas Fim em numero",horas_reserva_fim_numero)
                                //Se comecar antes e acabar durante a reserva
                                if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) && (horas_reserva_fim_numero <= horas_fim_numero)){
                                    //console.log('Passei aqui 1')
                                    Disponivel = false
                                    break
                                }else{
                                    //Se comecar durante a reserva e acabar depois
                                    if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                        //console.log('Passei aqui 2')
                                        Disponivel = false
                                        break
                                    }else{
                                        //Se a reserva comecar antes e acabar depois
                                        if((horas_reserva_inicio_numero <= horas_inicio_numero) && (horas_reserva_fim_numero >= horas_fim_numero)){
                                            //console.log('Passei aqui 3')
                                            Disponivel = false
                                            break
                                        }else{
                                            //Se a reserva comecar depois e acabar antes
                                            if((horas_reserva_inicio_numero >= horas_inicio_numero) && (horas_reserva_inicio_numero <= horas_fim_numero) && (horas_reserva_fim_numero >= horas_inicio_numero) &&(horas_reserva_fim_numero <= horas_fim_numero)){
                                                //console.log('Passei aqui 4')
                                                Disponivel = false
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                            //Nao sobrepoem a reserva logo pode ser ativada
                            if(Disponivel){
                                const reservasdata = await reserva.update({
                                    EstadoId: 1
                                },{where:{id:id}})
                                .then(function(data){return data;})
                                .catch(err=>console.log(err))
                                if(reservasdata)
                                    res.json({sucesso: true, message: 'Reserva ativada com sucesso'})
                                else
                                    res.json({sucesso: false, message: 'Impossível ativar a reserva'})
                            }else{
                                res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva'})
                            }
                        }else{
                            //Nao existem reservas com essa data entao pode-se ativar 
                            const reservasdata = await reserva.update({
                                EstadoId: 1
                            },{where:{id:id}})
                            .then(function(data){return data;})
                            .catch(err=>console.log(err))
                            if(reservasdata)
                                res.json({sucesso: true, message: 'Reserva ativada com sucesso'})
                            else
                                res.json({sucesso: false, message: 'Impossível ativar a reserva'})
                        }
                    }
                }else{
                    res.json({sucesso:false, message:'A reserva já se encontra ativa'})
                }
            }else{
                res.json({sucesso: false, message:'Sala encontra-se desativada'})
            }
        }else
            res.json({sucesso: false, message:'Impossível encontrar a reserva'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Desativar Reserva
controllers.desativar = async (req, res) =>{ 
    const {id} = req.params;
    var data
    if(id!=null){
        var reservaData = await reserva.findOne({
            where:{id:id}
        })
        if(reservaData){
            if(reservaData.EstadoId == 1){
                //Verificar se a reserva esta em adamento
                var data_atual = new Date()
                var dateReserva = new Date(reservaData.DataReserva)
                if(date.isSameDay(data_atual,dateReserva)){
                    var horas_atuais = (data_atual.getHours()).toString()
                    //console.log('Horas atuas: ' + horas_atuais)
                    var minutos_atuais = (data_atual.getMinutes()).toString()
                    //console.log('Minutos atuais: ' + minutos_atuais)
                    var hora_atual_numero = Number(horas_atuais + minutos_atuais)
                    //console.log('Data atual em numero: '+hora_atual_numero)
                    var hora_fim_array =  reservaData.HoraFim.split(':')
                    var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                    //console.log('Hora fim: '+ hora_fim_numero)
                    var hora_inicio_array =  reservaData.HoraInicio.split(':')
                    var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                    //console.log('Hora Inicio: ' + hora_incio_numero);
                    if(hora_incio_numero < hora_atual_numero && hora_fim_numero > hora_atual_numero){
                        //Esta a decorrer logo nao pode desativar
                        res.json({sucesso: false, message:'Impossível cancelar uma reserva em andamento'})
                    }else{
                        if(hora_incio_numero < hora_atual_numero && hora_fim_numero < hora_atual_numero)
                            res.json({sucesso: false, message:'Impossível cancelar uma reserva que ja terminou'})
                        else{
                            //esta para acontecer, logo desativa se
                            data = await reserva.update({
                                EstadoId: 2
                            },{where:{id:id}})
                            .then(function(data){return data;})
                            .catch(err=>console.log(err))
                            if(data)
                                res.json({sucesso:true, message:'A reserva foi cancelada', data:data})
                            else
                                res.json({sucesso:false, message:'Impossível cancelar a reserva'})
                        }
                    }
                }else{
                    //Verificar se ja passou
                    if(data_atual.getTime() > dateReserva.getTime())
                        res.json({sucesso: false, message:'Nao e possivel desativar uma reserva que ja passou'})
                    else{
                        //Se nao passou entao inativa nas tabelas que precisa e depois nas resevas
                            data = await reserva.update({
                                EstadoId: 2
                            },{where:{id:id}})
                            .then(function(data){return data;})
                            .catch(err=>console.log(err))
                            if(data)
                                res.json({sucesso:true, message:'A reserva foi cancelada', data:data})
                            else
                                res.json({sucesso:false, message:'Impossível cancelar a reserva'})
                    }
                }
            }else{
                res.json({sucesso:false, message:'A reserva já se encontra desativada'})
            }
        }else
            res.json({sucesso: false, message:'Impossível encontrar a reserva'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Listar Reservas passadas com base no id do utilizador, e data atual
controllers.reservasPassadasdeUtilizador = async (req, res) =>{ 
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            const query = `select * from public."Reservas" where "Reservas"."UtilizadoreId" = ${id} and "Reservas"."DataReserva" < CURRENT_DATE`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Impossível obter as reservas do utilizador'})
        }else{
            res.json({sucesso:false, message:'O utilizador não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Listar todas as reservas com base no id do utilizador
controllers.reservasdoUtilizador = async (req, res) =>{ 
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            const data = await reserva.findAll({
                where:{UtilizadoreId:id},
                include: {all: true}
            })
            /* const query = `select * from public."Reservas" where "Reservas"."UtilizadoreId" = ${id}`
            const data = await bd.query(query,{ type: QueryTypes.SELECT }) */
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Impossível obter as reservas desse utilizador'})
        }else{
            res.json({sucesso:false, message:'O utilizador não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Listar todas as reservas ativas com base no id do utilizador
controllers.reservasativasdoUtilizador = async (req, res) =>{ 
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        .then(function(data){return data})
        .catch(err=>{
            console.log(err)
        })
        if(utilizadorData){
            const data = await reserva.findAll({
                where:{UtilizadoreId:id,EstadoId:1},
                include: {all: true}
            })
            /* const query = `select * from public."Reservas" where "Reservas"."UtilizadoreId" = ${id}`
            const data = await bd.query(query,{ type: QueryTypes.SELECT }) */
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Não foi possível obter as reservas desse utilizador'})
        }else{
            res.json({sucesso:false, message:'O utilizador nao existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Listar Reservas futuras com base no id do utilizador, e data e ativas 
controllers.reservasfuturasdoUtilizador = async (req, res) =>{
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            const query = `select * from public."Reservas" where "Reservas"."UtilizadoreId" = ${id} and "Reservas"."DataReserva" >= CURRENT_DATE and "Reservas"."EstadoId" = 1`
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(err=>console.log(err))
            if(data)
                res.status(200).json({sucesso: true, data: data})
            else
                res.json({sucesso: false, message:'Impossível obter as reservas desse utilizador'})
        }else{
            res.json({sucesso:false, message:'O utilizador não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Adiar reserva muda hora fim.
controllers.adiar = async(req,res) =>{
    const {id} = req.params;
    const {ValorHora} = req.body;
    var Disponivel = false

    if(id!=null){
        if(ValorHora == ""){
            res.json({sucesso: false, message:"Insira uma hora válida"});
        }else{

            var reservaData = await reserva.findOne({
                where:{id:id}
            })
            if(reservaData){

                const Saladata = await sala.findOne({
                    where:{id: reservaData.SalaId}
                })

                //Tempo de Limpeza
                var TempLimpSala = Saladata.Tempo_Limpeza
                var tempoLimpezaArray = TempLimpSala.split(':')

                var horaLimpeza = Number(tempoLimpezaArray[0])
                //console.log("Horas Limpeza", horaLimpeza)

                var minutoLimpeza = Number(tempoLimpezaArray[1])
                //console.log("Minutos Limpeza", minutoLimpeza)

                if(Saladata.EstadoId == 1){

                    const CentroData = await centro.findOne({
                        where:{id:Saladata.CentroId}
                    })
                    if(CentroData){
                        if(CentroData.EstadoId ==1){
                            if(reservaData.EstadoId == 1){

                                //Verificar se a reserva esta em adamento
                                var data_atual = new Date() 
                                //console.log('Data atual: '+data_atual)
                                var AnoAtual = (data_atual.getFullYear()).toString()
                                var MesAtual = (data_atual.getMonth() + 1).toString()
                                var DiaAtual = (data_atual.getDate()).toString()
                                var DataAtualString = (AnoAtual + MesAtual + DiaAtual)
                                /* console.log('Ano atual: ' + AnoAtual)
                                console.log('Mes atual: ' + MesAtual)
                                console.log('Dia atual: ' + DiaAtual)
                                console.log('Data Atual final: ' + DataAtualString) */
                                var dateReserva = new Date(reservaData.DataReserva) 
                                //console.log('Data da reserva: '+dateReserva)
                                var AnoReserva = (dateReserva.getFullYear()).toString()
                                var MesReserva = (dateReserva.getMonth() + 1).toString()
                                var DiaReserva = (dateReserva.getDate()).toString()
                                var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                                /* console.log('Ano atual: ' + AnoReserva)
                                console.log('Mes atual: ' + MesReserva)
                                console.log('Dia atual: ' + DiaReserva)
                                console.log('Data Atual final: ' + DataReservaString) */
                                //Verificar se ja passou
                                if(DataAtualString < DataReservaString || DataAtualString > DataReservaString){
                                    //console.log('Esta reserva nao e de hoje')
                                    res.json({sucesso: false, message:'Impossível adiar uma reserva que não está a decorrer'})
                                }else{
                                    
                                    var horaInicioCentro = CentroData.Hora_abertura
                                    var horaInicioCentroArray = horaInicioCentro.split(':')
                                    var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                    //console.log('Hora de abertura: ' + horaInicioCentroNumber
                                    var horaFimCentro = CentroData.Hora_fecho
                                    var horaFimCentroArray = horaFimCentro.split(':')
                                    var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])

                                    //Tempo da reserva

                                    //Fim
                                    var hora_fim_array =  (reservaData.HoraFim).split(':')

                                    var horas_fim = Number(hora_fim_array[0])
                                    //console.log("Hora fim", horas_fim)

                                    var minutos_fim = Number(hora_fim_array[1])
                                    //console.log("Minutos fim", minutos_fim)

                                    var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                                    //console.log('Hora + minutos fim: '+ hora_fim_numero)

                                    //Hora pedida

                                    var HoraFimPedida_Array = ValorHora.split(':')

                                    var horaFimPedida = Number(HoraFimPedida_Array[0])
                                    console.log('Hora pretendida:' + horaFimPedida)

                                    var minutosFimPedida = Number(HoraFimPedida_Array[1])
                                    console.log('Minutos pretendidos:' + minutosFimPedida)

                                    var horasfinaispedidas = Number(HoraFimPedida_Array[0] + HoraFimPedida_Array[1])
                                    console.log("Horas pedidas sem limpeza", horasfinaispedidas)

                                    var horafimpedida_limpeza = horaFimPedida + horaLimpeza
                                    console.log('Horas finais pretendidos mais limpeza:' + horafimpedida_limpeza)

                                    var minutosfimpedida_limpeza = minutosFimPedida + minutoLimpeza
                                    console.log('Minutos finais pretendidos mais limpeza:' + minutosfimpedida_limpeza)

                                    if(minutosfimpedida_limpeza >= 60){  //Se for maior ou igual a 60 entao passa de 1 hora

                                        let resto = Math.trunc(minutosfimpedida_limpeza / 60 )  
                                        console.log("Resto:", resto)

                                        let diferenca = minutosfimpedida_limpeza - 60 //Vamos buscar a diferenca
                                        console.log("Diferenca:", diferenca)

                                        var novosminutos_fim = diferenca
                                        console.log("Novos minutos mais limpeza", novosminutos_fim)

                                        var novashoras_fim = horafimpedida_limpeza + resto
                                        console.log("Novos Horas mais limpeza", novashoras_fim)
                                    }else{
                                            novosminutos_fim = minutosfimpedida_limpeza
                                            console.log("Novos minutos mais limpeza", novosminutos_fim)

                                            novashoras_fim = horafimpedida_limpeza
                                            console.log("Novos Horas mais limpeza", novashoras_fim)
                                    }

                                    var horafimstring = novashoras_fim.toString()
                                    console.log("Novos Horas mais limpeza em string", novashoras_fim)

                                    var minutosfimstring = novosminutos_fim.toString()
                                    console.log("Novos minutos mais limpeza em string", novosminutos_fim)

                                    if(minutosfimstring.length === 1){
                                        var minutosfimstring = "0" + minutosfimstring
                                        //console.log("Minutos finais pedidos em String:",minutosfimstring)
                                    }

                                    var horaspedidasNumero = Number(horafimstring + minutosfimstring)
                                    console.log("Novas horas finais pretendidas em numero", horaspedidasNumero)

                                    const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${reservaData.DataReserva}' and "Reservas"."SalaId" = ${Saladata.id} and "Reservas"."id" != ${id} and "Reservas"."HoraInicio" > '${reservaData.HoraFim}' order by "Reservas"."HoraInicio"`
                                    const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                    //console.log(reservas.length)
                                    if(reservas.length != 0){

                                        if((horaspedidasNumero < horaInicioCentroNumber) || (horaspedidasNumero > horaFimCentroNumber)){
                                            res.json({sucesso: false, message: 'O horário do centro é entre as '+CentroData.Hora_abertura+' e as ' + CentroData.Hora_fecho+ ' !'});
                                        }else{
                                            if(horasfinaispedidas < hora_fim_numero){
                                                res.json({sucesso: false, message:'Insira uma hora superior a ' + reservaData.HoraFim})
                                            }else{
                                                if(horasfinaispedidas === hora_fim_numero){
                                                    res.json({sucesso:false, message:'Hora Final não pode ser igual a hora final anterior'})
                                                }else{

                                                    for(let i = 0; i < reservas.length; i++){
                                                        //Hora inicio
                                                        //console.log("Reserva para comparar nº",i)

                                                        const horasInicio = reservas[i].HoraInicio;
                                                        const horasInicio_Array = horasInicio.split(':')

                                                        const horaI = Number(horasInicio_Array[0])
                                                        //console.log('Hora Inicio:' + horaI)

                                                        const minutosI = Number(horasInicio_Array[1])
                                                        //console.log('Minutos Inicio:' + minutosI)

                                                        var hora_reserva_inicio_string = horaI.toString()
                                                        //console.log("Hora Inicio em string",hora_reserva_inicio_string)

                                                        var minutos_reserva_inicio_string = minutosI.toString()
                                                        //console.log("Minutos Inicio em string",minutos_reserva_inicio_string)

                                                        if(minutos_reserva_inicio_string.length === 1){
                                                            var minutos_reserva_inicio_string = "0" + minutos_reserva_inicio_string
                                                            //console.log("Minutos Iniciais em String:",minutos_reserva_inicio_string)
                                                        }

                                                        var horas_reserva_inicio_numero = Number(hora_reserva_inicio_string+minutos_reserva_inicio_string)
                                                        //console.log("Horas Inicio em numero",horas_reserva_inicio_numero)

                                                        if(horaspedidasNumero < horas_reserva_inicio_numero){
                                                            //console.log('Passei aqui ')
                                                            Disponivel = true;
                                                            break
                                                        }
                                                    }
                                                    
                                                    //Nao sobrepoem a reserva logo pode ser prolongada
                                                    if(Disponivel){
                                                        const reservasdata = await reserva.update({
                                                            HoraFim:ValorHora 
                                                        },{where:{id:id}})
                                                        .then(function(data){return data;})
                                                        .catch(err=>console.log(err))
                                                        const pertenceData = await historicoAdiamentos.create({
                                                            HoraAntiga:reservaData.HoraFim,
                                                            HoraAdiada:ValorHora,
                                                            ReservaId:id
                                                        })
                                                        .then(function(pertenceData){return pertenceData;})
                                                        .catch(err=>console.log(err))
                                                        if(reservasdata && pertenceData)
                                                            res.json({sucesso: true, message: 'Reserva adiada com sucesso'})
                                                        else
                                                            res.json({sucesso: false, message: 'Impossível adiar a reserva'})
                                                    }else{
                                                        res.json({sucesso: false, message: 'A reserva sobrepõem outra reserva.'})
                                                    }
                                                }
                                            }
                                        }
                                    }else{
                                        if((horaspedidasNumero < horaInicioCentroNumber) || (horaspedidasNumero > horaFimCentroNumber)){
                                            res.json({sucesso: false, message: 'O horário do centro é entre as '+CentroData.Hora_abertura+' e as ' + CentroData.Hora_fecho+ ' !'});
                                        }else{
                                            if(horasfinaispedidas < hora_fim_numero){
                                                res.json({sucesso: false, message:'Insira uma hora superior a ' + reservaData.HoraFim})
                                            }else{
                                                if(horasfinaispedidas == hora_fim_numero){
                                                    res.json({sucesso:false, message:'Hora Final não pode ser igual a hora final anterior'})
                                                }else{
                                                //Nao existem reservas com essa data entao pode-se adiar a vontade 
                                                const reservasdata = await reserva.update({
                                                        HoraFim:ValorHora 
                                                },{where:{id:id}})
                                                .then(function(data){return data;})
                                                .catch(err=>console.log(err))
                                                const pertenceData = await historicoAdiamentos.create({
                                                    HoraAntiga:reservaData.HoraFim,
                                                    HoraAdiada:ValorHora,
                                                    ReservaId:id
                                                })
                                                .then(function(pertenceData){return pertenceData;})
                                                .catch(err=>console.log(err))
                                                if(reservasdata && pertenceData)
                                                    res.json({sucesso: true, message: 'Reserva adiada com sucesso'})
                                                else
                                                    res.json({sucesso: false, message: 'Impossível adiar a reserva'})
                                                }
                                            }
                                        }
                                    }
                                }
                            }else{
                                res.json({sucesso:false, message:'A reserva encontra-se desativada'})
                            }
                        }else{
                            res.json({sucesso:false, message:'O centro está desativado'})
                        }
                    }else{
                        res.json({sucesso:false, message:'O centro não existe'})
                    }
                }else{
                    res.json({sucesso: false, message:'Sala encontra-se desativada'})
                }
            }else
                res.json({sucesso: false, message:'Impossível encontrar a reserva'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Terminar mais cedo
controllers.terminarCedo = async(req,res) =>{
    const {id} = req.params;
    var Disponivel = false
    if(id!=null){
        var reservaData = await reserva.findOne({
            where: {id:id}
        })
        if(reservaData){
            const Saladata = await sala.findOne({
                where:{id: reservaData.SalaId}
            })
            if(Saladata){
                if(Saladata.EstadoId == 1){
                    const CentroData = await centro.findOne({
                        where:{id:Saladata.CentroId}
                    })
                    if(CentroData){
                        if(CentroData.EstadoId ==1){
                            if(reservaData.EstadoId == 1){
                                //Verificar se a reserva esta em adamento
                                var data_atual = new Date() 
                                var AnoAtual = (data_atual.getFullYear()).toString()
                                var MesAtual = (data_atual.getMonth() + 1).toString()
                                var DiaAtual = (data_atual.getDate()).toString()
                                var DataAtualString = (AnoAtual + MesAtual + DiaAtual)

                                var Hora_atual = Number((data_atual.getHours()).toString())
                                var minutos_atual = Number((data_atual.getMinutes()).toString())
                                var HoraAtualString = Hora_atual + ':' + minutos_atual

                                /* console.log("Horas atuais:",Hora_atual)
                                console.log("Minutos atuais:",minutos_atual)
                                console.log('Hora atual: ' + HoraAtualString) 

                                console.log('Ano atual: ' + AnoAtual)
                                console.log('Mes atual: ' + MesAtual)
                                console.log('Dia atual: ' + DiaAtual)
                                console.log('Data atual: ' + DataAtualString) */

                                var dateReserva = new Date(reservaData.DataReserva) 
                                var AnoReserva = (dateReserva.getFullYear()).toString()
                                var MesReserva = (dateReserva.getMonth() + 1).toString()
                                var DiaReserva = (dateReserva.getDate()).toString()
                                var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                                
                                const horasFim = reservaData.HoraFim;
                                const horasFim_Array = horasFim.split(':')
                                const horaF = Number(horasFim_Array[0])
                                const minutosF = Number(horasFim_Array[1])

                                /* console.log('Hora fim da reserva',horaF)
                                console.log('Minutos fim da reserva',minutosF)

                                console.log('Ano Reserva: ' + AnoReserva)
                                console.log('Mes Reserva: ' + MesReserva)
                                console.log('Dia Reserva: ' + DiaReserva)
                                console.log('Data Reserva: ' + DataReservaString) */
                                //Verificar se ja passou
                                if(DataAtualString < DataReservaString || DataAtualString > DataReservaString){
                                    //console.log('Esta reserva nao e de hoje')
                                    res.json({sucesso: false, message:'Impossível acabar uma reserva que não está a decorrer'})
                                }else{
                                    if(horaF < Hora_atual ){
                                            return;
                                    }else{
                                        if(Hora_atual == horaF){
                                            if(minutos_atual < minutosF){
                                                Disponivel = true
                                            }
                                        }else
                                            Disponivel = true
                                    }
                                        if(Disponivel){
                                            const reservasdata = await reserva.update({
                                                HoraFim:HoraAtualString
                                            },{where:{id:id}})
                                            .then(function(data){return data;})
                                            .catch(err=>console.log(err))
                                            if(reservasdata)
                                                res.json({sucesso: true, message: 'Reserva terminada com sucesso'})
                                            else
                                                res.json({sucesso: false, message: 'Impossível terminar a reserva'})
                                        }else{
                                            res.json({sucesso: false, message: 'Impossível terminar a reserva'})
                                        }
                                }
                            }else{
                                res.json({sucesso:false, message:'A reserva encontra-se desativada'})
                            }
                        }else{
                            res.json({sucesso:false, message:'O centro está desativado'})
                        }
                    }else{
                        res.json({sucesso:false, message:'O centro não existe'})
                    }
                }else{
                    res.json({sucesso: false, message:'Sala encontra-se desativada'})
                }
            }else{
                res.json({sucesso:false, message:'A sala não existe'})
            }
        }else{
            res.json({sucesso: false, message:'Impossível encontrar a reserva'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Proxima reserva
controllers.proximareserva = async(req,res) =>{
    const {id} = req.params
    //console.log(id)
    const {HoraFim, Data, CentroId} = req.body
    /* console.log(HoraFim)
    console.log(Data)
    console.log(CentroId) */
    if(id!=null){
        if(HoraFim != null && Data != null && CentroId != null){
            if(HoraFim != "" && Data != "" && CentroId != ""){
                //console.log('Passei aqui')
                const query = `select "Reservas"."HoraInicio", "Salas"."Tempo_Limpeza"
                from "Reservas" inner join "Salas" on "Reservas"."SalaId" = "Salas"."id"
                where "Reservas"."DataReserva" = '${Data}' and "Reservas"."HoraInicio" > '${HoraFim}' and "Reservas"."EstadoId" = 1 and "Salas"."EstadoId" = 1 
                and "Salas"."CentroId" = ${CentroId} and "Salas"."id" = ${id}
                order by "Reservas"."HoraInicio"`
                const data = await bd.query(query,{ type: QueryTypes.SELECT })
                .then(function(data){return data;})
                .catch(err=>console.log(err))
                //console.log(data)
                if(data)
                    res.json({sucesso: true, data: data, message:'Reunião adiada com sucesso'})
                else
                    res.json({sucesso: true, message:'Impossível obter as reservas do utilizador', data: data})
            }else
                res.json({sucesso: false, message:'Valores em branco'})
        }else
            res.json({sucesso: false, message: 'Valores inseridos são null'})
    }else
        res.json({sucesso: false, message:'Forneça um id'})
}

//Dashboard

//# de Reservas entre datas
controllers.entredatas = async(req,res) =>{
    const {id} = req.params
    const {DataInicio, DataFim} = req.body
    /* console.log(req.body)
    console.log(DataInicio)
    console.log(DataFim)  */
    var numeroreservas = 0
    if(id!=null){
        if(DataInicio != "" && DataFim != ""){
            var datainicio = new Date(DataInicio)
            var datafim = new Date(DataFim)
            /* console.log(datainicio)
            console.log(datafim) */
            if(datainicio < datafim){
                const salasdata = await sala.findAll({
                    where:{CentroId: id,EstadoId:1}
                }) 
                if(salasdata){
                    if(salasdata.length!=0){
                        console.log(salasdata)
                        for(let i=0;i<salasdata.length;i++){
                            const query = `select * from public."Reservas" where "Reservas"."SalaId" = ${salasdata[i].id} and "Reservas"."DataReserva" >= '${DataInicio}' and "Reservas"."DataReserva" <= '${DataFim}' and "Reservas"."EstadoId" = 1`
                            const data = await bd.query(query,{ type: QueryTypes.SELECT })
                            .then(function(data){return data;})
                            .catch(err=>console.log(err))
                            //console.log(data)
                            if(data!=null){
                                if(data.length!=0)
                                    numeroreservas = numeroreservas + data.length
                            }   
                        }
                        //console.log(numeroreservas)
                        res.status(200).json({sucesso: true, data: numeroreservas})
                    }else{
                        res.json({sucesso:true, data: 0, message:'Não existem reservas'})
                    }
                }else{
                    res.json({sucesso:false, message:'Impossível obter as salas do centro'})
                }
            }else{
                res.json({sucesso: false, message: 'A data fim não pode ser inferior à data inicio'})
            }
        }else{
            res.json({sucesso:true, data: 0, message:'Datas vazias'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

module.exports = controllers
