var bd = require('../config/basedados');
var utilizador = require('../models/Utilizador');
var pertence =  require('../models/Pertence');
var sala = require('../models/Salas');
var reserva = require('../models/Reservas');
var historicoLimpeza = require('../models/Historico_limpezas');
var historicoAdiamentos = require('../models/Historico_adiamentos');
var centros = require('../models/Centros');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcrypt'); //encripta a pass a guardar na BD
const date = require('date-and-time');
var validator = require("email-validator");
var passwordValidator = require('password-validator');
var schema = new passwordValidator();
var nodemailer = require('nodemailer');
const controllers = {};
bd.sync()

schema
    .is().min(8)
    .is().max(100)
    .has().not().spaces()
    .has().uppercase()                              
    .has().lowercase()                             
    .has().digits(2);

//Dados para enviar email
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'softinsaprojetofinalestgv@gmail.com',
        pass: 'yikuljposxhrqziy'
    }
});

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
        res.json({sucesso: false, message:'Impossível listar os utilizadores', data: data})
}

//Listar Utilizadores com base no centro
controllers.listUtilizadores = async (req, res) =>{
    const {id} = req.params
    const users = []
    if(id!=null){
        const perte = await pertence.findAll({
            where:{CentroId:id}
        })
        if(perte){
            for(let i = 0; i<perte.length;i++){
                const data = await utilizador.findOne({
                    where:{id:perte[i].UtilizadoreId},
                    include: {all: true}
                })
                .then(function(data){return data;})
                .catch(error => {
                    console.log('Error:'+error)
                    return error;
                }) 
                if(data)
                    users.push(data)
                else
                    continue;
            }
            if(users)
                res.status(200).json({sucesso:true, data: users});
            else
                res.json({sucesso: false, message:'Impossível listar os utilizadores', data: data})
        }
    }else
        res.json({sucesso: false, message:'Forneça um id'})
}

//Obter Utilizador
controllers.get = async(req,res) =>{
    const {id} = req.params;
    if(id!=null){
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
            //res.download( __dirname +data.FotoData)
            res.status(200).json({ sucesso: true, data: data});
        }else {
            res.json({sucesso: false, message: 'Utilizador não existe'});
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Registar Utilizador 
controllers.register = async (req, res) =>{
    const {PNome, UNome, Email, PalavraPasse, TipoGestor, Cargos, Centros} = req.body
    /* console.log(req.body)
    console.log(req.file)
    console.log(req.file.path) */
    const utilizadorData = await utilizador.findOne({
        where:{Email: Email}
    })
    //console.log(utilizadorData)
    if(utilizadorData == null){
            if(PNome != '' && UNome !=''){
                if(validator.validate(Email)){
                    if(schema.validate(PalavraPasse)){
                        if(Cargos==1){
                            if(TipoGestor == 0){
                                res.json({sucesso:false, message: "Insira um tipo de gestor"})
                            }else{
                                const data = await utilizador.create({
                                    Pnome: PNome,
                                    Unome: UNome,
                                    Email: Email,
                                    PalavraPasse: PalavraPasse,
                                    FotoNome: "",
                                    FotoData: "", 
                                    PrimeiroLogin: '1',
                                    EstadoId: '1',
                                    TiposGestorId: TipoGestor,
                                    CargoId: '1',
                                    CentroId:Centros 
                                })
                                console.log(data)
                                const util_pertence = await pertence.create({
                                    CentroId: Centros,
                                    UtilizadoreId: data.id
                                })
                                .then(function(data){return data;})
                                .catch(error =>{console.log('Error: '+error);})
                                //Mandar email de registo
                                var mailOptions = {
                                    from: 'softinsaprojetofinalestgv@gmail.com',
                                    to: data.Email,
                                    subject: 'Confirmação do Registo',
                                    text: ` 
                                        É com muito gosto que confirmamos o seu registo.
                                        
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
                                res.status(200).json({sucesso: true, message: 'Utilizador criado com sucesso', data: data})
                            }
                        }else{
                            const data = await utilizador.create({
                                Pnome: PNome,
                                Unome: UNome,
                                Email: Email,
                                PalavraPasse: PalavraPasse,
                                FotoNome: "",
                                FotoData: "", 
                                PrimeiroLogin: '1',
                                EstadoId: '1',
                                TiposGestorId: null,
                                CargoId: Cargos,
                                CentroId:Centros 
                            })
                            console.log(data)
                            const util_pertence = await pertence.create({
                                CentroId: Centros,
                                UtilizadoreId: data.id
                            })
                            .then(function(data){return data;})
                            .catch(error =>{console.log('Error: '+error);})
                            //Mandar email de registo
                            var mailOptions = {
                                from: 'softinsaprojetofinalestgv@gmail.com',
                                to: data.Email,
                                subject: 'Confirmação do Registo',
                                text: ` 
                                    É com muito gosto que confirmamos o seu registo.
                                    
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
                            res.status(200).json({sucesso: true, message: 'Utilizador criado com sucesso', data: data}) 
                        }
                    }else{
                        res.json({sucesso:false, message:'A palavra passe não pode ter espacos, deve ter entre 8 a 100 caracteres, pelo menos uma letra maiscula e minuscula e pelo menos dois digitos'})
                    }
                }else{
                    res.json({sucesso:false, message: 'Insira um email válido'})
                }
            }else
                res.json({sucesso: false, message:'Insira um nome'})
    }else
        res.json({sucesso: false, message:'Utilizador já existe'})
}

//Editar Utilizador lado gestor
controllers.update = async (req, res) =>{ 
    const {id} = req.params;
    const {PNome, UNome, Email, TipoGestor, Cargos, Centros} = req.body
    var palavrapasse_cript
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            if(PNome != '' && UNome !=''){
                if(validator.validate(Email)){
                    //console.log(Cargos)
                        if(Cargos == 1){
                            //console.log(TipoGestor)
                                const data = await utilizador.update({
                                    Pnome: PNome,
                                    Unome: UNome,
                                    Email: Email,
                                    PalavraPasse: palavrapasse_cript,
                                    FotoNome: "",
                                    FotoData: "",
                                    TiposGestorId: TipoGestor,
                                    CargoId: Cargos,
                                    CentroId:Centros 
                                },{
                                    where: {id: id},
                                })
                                .then(function(data){return data;})
                                .catch(error =>{
                                    console.log('Error: '+error);
                                    return error;
                                })
                                const util_pertence = await pertence.update({
                                    CentroId: Centros,
                                },{where:{UtilizadoreId: id}})
                                res.status(200).json({sucesso: true,data: data, message:'Utilizador atualizado com sucesso'})
                            
                        }else{
                            const data = await utilizador.update({
                                Pnome: PNome,
                                Unome: UNome,
                                Email: Email,
                                PalavraPasse: palavrapasse_cript,
                                FotoNome: "",
                                FotoData: "",
                                TiposGestorId: null,
                                CargoId: Cargos,
                                CentroId:Centros 
                            },{
                                where: {id: id},
                            })
                            .then(function(data){return data;})
                            .catch(error =>{
                                console.log('Error: '+error);
                                return error;
                            })
                            const util_pertence = await pertence.update({
                                CentroId: Centros,
                            },{where:{UtilizadoreId: id}})
                            res.status(200).json({sucesso: true,data: data, message:'Utilizador atualizado com sucesso'})
                        }
                }else{
                    res.json({sucesso:false, message: 'Insira um email válido'})
                }
            }else
                res.json({sucesso: false, message:'Insira um nome'})
        }else
            res.json({sucesso: false, message:'Utilizador não existe'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Editar Utilizador lado requesitante
controllers.updateMobile = async (req, res) =>{ 
    const {id} = req.params;
    const {PNome, UNome, Email, imageData, FotoNome} = req.body
    var palavrapasse_cript
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            if(PNome != '' && UNome !=''){
                if(validator.validate(Email)){
                        const data = await utilizador.update({
                            Pnome: PNome,
                            Unome: UNome,
                            Email: Email,
                            FotoNome: "",
                            FotoData: ""
                        },{
                            where: {id: id},
                        })
                        .then(function(data){return data;})
                        .catch(error =>{
                            console.log('Error: '+error);
                            return error;
                        })
                        res.status(200).json({sucesso: true, message:'Utilizador atualizado com sucesso'})
                }else{
                    res.json({sucesso:false, message: 'Insira um email válido'})
                }
            }else
                res.json({sucesso: false, message:'Insira um nome'})
        }else
            res.json({sucesso: false, message:'Utilizador não existe'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Eliminar Utilizador
controllers.delete = async (req, res) =>{
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            const dataReservas = await reserva.findAll({
                where: {UtilizadoreId: id}
            })
            if(dataReservas){
                //console.log(dataReservas)
                //console.log(dataReservas.length)
                if(dataReservas.length != 0){
                    for(let i =0; i <dataReservas.length; i++){
                        //console.log(dataReservas[i])
                        var limpezadestroy = await historicoLimpeza.destroy({
                            where:{ReservaId: dataReservas[i].id}
                        })
                        //console.log(limpezadestroy)
                        var adiamentosdestroy = await historicoAdiamentos.destroy({
                            where:{ReservaId: dataReservas[i].id}
                        })
                        //console.log(adiamentosdestroy)
                        var reservadestroy = await reserva.destroy({
                            where: {id: dataReservas[i].id},
                        })
                        //console.log(reservadestroy)
                    }
                    //Ja eliminou as reservas
                    const query = `delete from public."HistoricoLimpezas" where "UtilizadoresId" = ${id}`
                    const LimpezasData = await bd.query(query,{ type: QueryTypes.DELETE })
                    const query1 = `delete from public."Utilizador_Centros" where "UtilizadoreId" = ${id} `
                    const PertenceData = await bd.query(query1,{ type: QueryTypes.DELETE })
                    const dataUser = await utilizador.destroy({
                        where: {id: id},
                    }) 
                    if(dataUser)
                        res.status(200).json({ sucesso: true, message: "Utilizador eliminado com sucesso"});
                    else
                        res.json({sucesso:false, message:'Impossível eliminar utilizador'})
                }else{
                    //Nao existem reservas logo elimina utilizador
                    const query = `delete from public."HistoricoLimpezas" where "UtilizadoresId" = ${id}`
                    const LimpezasData = await bd.query(query,{ type: QueryTypes.DELETE })
                    const query1 = `delete from public."Utilizador_Centros" where "UtilizadoreId" = ${id} `
                    const PertenceData = await bd.query(query1,{ type: QueryTypes.DELETE })
                    const data = await utilizador.destroy({
                        where: {id: id},
                    }) 
                    if(data)
                        res.status(200).json({ sucesso: true, message: "Utilizador eliminado com sucesso"});
                    else
                        res.json({sucesso:false, message:'Impossível eliminar utilizador'})
                }
            }else{
                res.json({sucesso: false, message:'Impossível eliminar utilizador'})
            }
        }else{
            res.json({sucesso:false, message:'Utilizador não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Insira um id'})
    }
}

//Desativar Utilizador
controllers.inativar = async(req,res) =>{
    const {id} = req.params;
    if(id!=null){
        const dataUtilizador = await utilizador.findOne({
            where:{id:id}
        })
        if(dataUtilizador){
            if(dataUtilizador.EstadoId == 1){
                var data_atual = new Date()
                var horas_atuais = (data_atual.getHours()).toString()
                //console.log('Horas atuas: ' + horas_atuais)
                var minutos_atuais = (data_atual.getMinutes()).toString()
                //console.log('Minutos atuais: ' + minutos_atuais)
                var hora_atual_numero = Number(horas_atuais + minutos_atuais)
                //console.log('Data atual em numero: '+hora_atual_numero)
                var reservaData = await reserva.findAll({
                    where:{UtilizadoreId:id}
                })
                //console.log(reservaData)
                //console.log(reservaData.length)
                if(reservaData.length != 0 ){
                    ///console.log("Entrei")
                    for(let i =0; i < reservaData.length; i++){
                        //Verificar se a reserva esta em adamento
                        var dateReserva = new Date(reservaData[i].DataReserva)
                        if(date.isSameDay(data_atual,dateReserva)){
                            var hora_fim_array =  reservaData[i].HoraFim.split(':')
                            var hora_fim_numero = Number(hora_fim_array[0] + hora_fim_array[1])
                            //console.log('Hora fim: '+ hora_fim_numero)
                            var hora_inicio_array =  reservaData[i].HoraInicio.split(':')
                            var hora_incio_numero = Number(hora_inicio_array[0] + hora_inicio_array[1])
                            //console.log('Hora Inicio: ' + hora_incio_numero);
                            if(hora_incio_numero < hora_atual_numero && hora_fim_numero > hora_atual_numero){
                                //Esta a decorrer logo nao pode desativar
                                res.json({sucesso: false, message:'Impossível desativar um utilizador com uma reserva a decorrer'})
                            }else{
                                if(hora_incio_numero < hora_atual_numero && hora_fim_numero < hora_atual_numero)
                                    break;
                                else{
                                    //esta para acontecer, logo desativa se
                                    const reservaupdated = await reserva.update({
                                        EstadoId: 2
                                    },{where:{id:reservaData[i].id}})
                                }
                            }
                        }else{
                            //Verificar se ja passou
                            if(data_atual.getTime() > dateReserva.getTime())
                                continue;
                            else{
                                //Se nao passou entao inativa nas tabelas que precisa e depois nas resevas
                                const reservaupdated = await reserva.update({
                                    EstadoId: 2
                                },{where:{id:reservaData[i].id}})
                            }
                        }
                    }
                    //Reservas desativadas e so desativar o utilizador
                    const data = await utilizador.update({
                        EstadoId: '2'
                    },{where: {id:id}})
                    .then(function(data){return data;})
                    .catch(error=>{console.log('Error:' + error); return error;})
                    if(data)
                        res.status(200).json({sucesso: true, data: data, message: 'Utilizador desativado com sucesso'})
                    else
                        res.json({sucesso:false, message:'Impossível desativar o utilizador'})
                }else{
                    //Nao existem reservas logo e so desativar
                    const data = await utilizador.update({
                        EstadoId: '2'
                    },{where: {id:id}})
                    .then(function(data){return data;})
                    .catch(error=>{console.log('Error:' + error); return error;})
                    if(data)
                        res.status(200).json({sucesso: true, data: data, message: 'Utilizador desativado com sucesso'})
                    else
                        res.json({sucesso:false, message:'Impossível desativar o utilizador'})
                }
            }else
                res.json({sucesso:false, message:'O utilizador já se encontra desativado'})
        }else
            res.json({sucesso:false, message:'O utilizador não existe'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Ativar Utilizador
controllers.ativar = async(req,res) =>{
    const {id} = req.params;
    var Disponivel = true
    if(id!=null){
        const dataUtilizador = await utilizador.findOne({
            where:{id:id}
        })
        if(dataUtilizador){
            if(dataUtilizador.EstadoId == 2){
                //Vamos buscar as reservas associadas ao utilizador e com data igual ao superior a data atual
                const query = `select * from public."Reservas" where "Reservas"."UtilizadoreId" = ${id} and "Reservas"."DataReserva" >= CURRENT_DATE and "Reservas"."EstadoId" = 2 order by "Reservas"."HoraInicio"`
                const reservaData = await bd.query(query,{ type: QueryTypes.SELECT })
                .then(function(data){return data;})
                .catch(err=>console.log(err))
                //console.log(reservaData)
                if(reservaData){
                    //Se existirem reservas com o id do utilizador
                    if(reservaData.length != 0){
                        //console.log('Entrei no if')
                        //Obtermos a data atual
                        var data_atual = new Date() 
                        //console.log('Data atual: '+data_atual)
                        var AnoAtual = (data_atual.getFullYear()).toString()
                        var MesAtual = (data_atual.getMonth() + 1).toString()
                        var DiaAtual = (data_atual.getDate()).toString()
                        var DataAtualString = (AnoAtual + MesAtual + DiaAtual)
                        /* console.log('Ano atual: ' + AnoAtual)
                        console.log('Mes atual: ' + MesAtual)
                        console.log('Dia atual: ' + DiaAtual) */
                        //console.log('Data Atual final: ' + DataAtualString) 
                        //Vamos percorrer as reservas do utilizador
                        for(let i =0; i < reservaData.length; i++){
                            const reservaid = reservaData[i].id;
                            //Obtemos a data da reserva
                            var dateReserva = new Date(reservaData[i].DataReserva) 
                            //console.log('Data da reserva: '+dateReserva)
                            var AnoReserva = (dateReserva.getFullYear()).toString()
                            var MesReserva = (dateReserva.getMonth() + 1).toString()
                            var DiaReserva = (dateReserva.getDate()).toString()
                            var DataReservaString = (AnoReserva + MesReserva + DiaReserva)
                            /* console.log('Ano atual: ' + AnoReserva)
                            console.log('Mes atual: ' + MesReserva)
                            console.log('Dia atual: ' + DiaReserva) */
                            //console.log('Data Reserva: ' + DataReservaString) 
                            //Obtemos a informacao da sala da reserva
                            const Saladata = await sala.findOne({
                                where:{id: reservaData[i].SalaId}
                            })
                            if(Saladata.EstadoId == 1){ //Se a sala estiver ativada
                                //Vamos buscar informacao do centro
                                const dataCentros = await centros.findOne({
                                    where:{id: Saladata.CentroId}
                                })
                                if(dataCentros){
                                    if(dataCentros.EstadoId == 1){ //Se o centro estiver ativado
                                        //Vamos buscar o horario do centro
                                        var horaInicioCentro = dataCentros.Hora_abertura
                                        var horaInicioCentroArray = horaInicioCentro.split(':')
                                        var horaInicioCentroNumber = Number(horaInicioCentroArray[0] + horaInicioCentroArray[1])
                                        //console.log('Hora de abertura: ' + horaInicioCentroNumber)
                                        var horaFimCentro = dataCentros.Hora_fecho
                                        var horaFimCentroArray = horaFimCentro.split(':')
                                        var horaFimCentroNumber = Number(horaFimCentroArray[0] + horaFimCentroArray[1])
                                        //console.log('Hora de fechar: ' + horaFimCentroNumber)
                                        //Vamos buscar o tempo de limpeza da sala
                                        var HoraLimpezaSala = Saladata.Tempo_Limpeza
                                        var tempoLimpezaArray = HoraLimpezaSala.split(':')
                                        var horaLimpeza = tempoLimpezaArray[0]
                                        var minutoLimpeza = tempoLimpezaArray[1]
                                        var TempoLimp = Number(horaLimpeza+minutoLimpeza);
                                        //console.log('Horas de Limpeza da Sala: '+HoraLimpezaSala)
                                        if(reservaData[i].EstadoId == 2){ // Se a reserva estiver desativada
                                                //Verificar se a reserva esta em adamento
                                                //Verificar se ja passou
                                            if(DataAtualString > DataReservaString)  //Se a resera for no passado continua para a proxima reserva
                                                continue;
                                            else{ //Se nao vamos buscar todas as reservas com o mesmo id da sala e com a data igual a da reserva
                                                const query = `select * from public."Reservas" where "Reservas"."EstadoId" = 1 and "Reservas"."DataReserva" = '${reservaData[i].DataReserva}' and "Reservas"."SalaId" = ${reservaData[i].SalaId} order by "Reservas"."HoraInicio"`
                                                const reservas = await bd.query(query,{ type: QueryTypes.SELECT })
                                                    //console.log(reservas.length)
                                                if(reservas.length != 0){ //Se existirem reservas para a mesma data na mesma sala
                                                        //Obtemos as horas inicio e fim da reserva que queremos ativar
                                                        //console.log(reservas)
                                                        //Hora Inicio
                                                        const horasInicioReserva = reservaData[i].HoraInicio;
                                                        //console.log('Hora da reserva desativa (formato Data): '+ horasInicioReserva)
                                                        const HoraInicio_Array = horasInicioReserva.split(':')
                                                        const horaInicio = HoraInicio_Array[0]
                                                        //console.log('Hora:' + horaInicio)
                                                        const minutosInicio = HoraInicio_Array[1]
                                                        //console.log('Minutos:' + minutosInicio)
                                                        const HorasInicio_desativas = Number(horaInicio+minutosInicio)
                                                        //console.log('Horas da reserva desativa (formato Numero): '+HorasInicio_desativas)
                                                        //Hora Fim
                                                        const horasFimReserva = reservaData[i].HoraFim;
                                                        //console.log('Hora da reserva desativa (formato Data): '+ horasFimReserva)
                                                        const HoraFim_Array = horasFimReserva.split(':')
                                                        const horaFim = HoraFim_Array[0]
                                                        //console.log('Hora:' + horaFim)
                                                        const minutosFim = HoraFim_Array[1]
                                                        //console.log('Minutos:' + minutosFim)
                                                        const Horas_em_Numero = Number(horaFim+minutosFim)
                                                        //console.log('Horas da reserva desativa (formato Numero): '+Horas_em_Numero)
                                                        const HorasFim_MaisLimpeza_Desativas = Horas_em_Numero + TempoLimp
                                                        //console.log('Horas da reserva desativa mais limpeza (formato Numero):' + HorasFim_MaisLimpeza_Desativas)
                                                        //Se as horas da reserva a ativar nao estiverem dentro do horario do centro entao continuamos para a proxima reserva
                                                        if((HorasInicio_desativas < horaInicioCentroNumber) || (HorasFim_MaisLimpeza_Desativas > horaFimCentroNumber )){
                                                            //Nao e possivel ativar uma reserva com a hora for do horario do centro
                                                            //console.log('As horas da reserva nao estao de acordo com o horario do centro')
                                                            continue;
                                                        }else{ //Vamos percorrer as reservas todas da sala e verificar se a reserva a ativar nao se sobrepoem
                                                            for(let i = 0; i < reservas.length; i++){
                                                                //Obtemos a hora inicio e a hora fim da reserva ativada na sala
                                                                //Hora inicio
                                                                const horasInicio = reservas[i].HoraInicio;
                                                                //console.log('Hora da reserva ativa (formato Data): '+ horasInicio)
                                                                const horasInicio_Array = horasInicio.split(':')
                                                                const horaI = horasInicio_Array[0]
                                                                //console.log('Hora:' + horaI)
                                                                const minutosI = horasInicio_Array[1]
                                                                //console.log('Minutos:' + minutosI)
                                                                const HorasAtivasI = Number(horaI+minutosI)
                                                                //console.log('Horas da reserva ativa (formato Numero): '+HorasAtivasI)
                                                                //Hora Fim
                                                                const horasFim = reservas[i].HoraFim;
                                                                //console.log('Hora da reserva ativa (formato Data): '+ horasFim)
                                                                const horasFim_Array = horasFim.split(':')
                                                                const horaF = horasFim_Array[0]
                                                                //console.log('Hora:' + horaF)
                                                                const minutosF = horasFim_Array[1]
                                                                //console.log('Minutos:' + minutosF)
                                                                const HorasAtivasF = Number(horaF+minutosF)
                                                                //console.log('Horas da reserva ativa (formato Numero): '+HorasAtivasF)
                                                                //Se a reserva ativada comecar antes e acabar durante a reserva desativada
                                                                if((HorasAtivasI <= HorasInicio_desativas) && (HorasAtivasF >= HorasInicio_desativas) && (HorasAtivasF <= HorasFim_MaisLimpeza_Desativas)){
                                                                    //console.log('Passei aqui 1')
                                                                    Disponivel = false
                                                                    break
                                                                }else{
                                                                    //Se a reserva ativada comecar durante a reserva e acabar depois da reserva desativada
                                                                    if((HorasAtivasI >= HorasInicio_desativas) && (HorasAtivasI <= HorasFim_MaisLimpeza_Desativas) && (HorasAtivasF >= HorasFim_MaisLimpeza_Desativas)){
                                                                        //console.log('Passei aqui 2')
                                                                        Disponivel = false
                                                                        break
                                                                    }else{
                                                                        //Se a reserva ativada comecar antes e acabar depois da reserva desativada
                                                                        if((HorasAtivasI <= HorasInicio_desativas) && (HorasAtivasF >= HorasFim_MaisLimpeza_Desativas)){
                                                                            //console.log('Passei aqui 3')
                                                                            Disponivel = false
                                                                            break
                                                                        }else{
                                                                            //Se a reserva ativada comecar depois e acabar antes da reserva desativada
                                                                            if((HorasAtivasI >= HorasInicio_desativas) && (HorasAtivasI <= HorasFim_MaisLimpeza_Desativas) && (HorasAtivasF >= HorasInicio_desativas) &&(HorasAtivasF <= HorasFim_MaisLimpeza_Desativas)){
                                                                                //console.log('Passei aqui 4')
                                                                                Disponivel = false
                                                                                break
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                            //Nao sobrepoem a reserva e esta dentro do horario do centro logo pode ser ativada
                                                            if(Disponivel){
                                                                const reservasupdated = await reserva.update({
                                                                    EstadoId: 1
                                                                },{where:{id:reservaid}})
                                                                .then(function(data){return data;})
                                                                .catch(err=>console.log(err))
                                                                console.log(reservasupdated)
                                                            }
                                                        }
                                                }else{
                                                    const horasInicioReserva = reservaData[i].HoraInicio;
                                                    //console.log('Hora da reserva desativa (formato Data): '+ horasInicioReserva)
                                                    const HoraInicio_Array = horasInicioReserva.split(':')
                                                    const horaInicio = HoraInicio_Array[0]
                                                    //console.log('Hora:' + horaInicio)
                                                    const minutosInicio = HoraInicio_Array[1]
                                                    //console.log('Minutos:' + minutosInicio)
                                                    const HorasInicio_desativas = Number(horaInicio+minutosInicio)
                                                    //console.log('Horas da reserva desativa (formato Numero): '+HorasInicio_desativas)
                                                    //Hora Fim
                                                    const horasFimReserva = reservaData[i].HoraFim;
                                                    //console.log('Hora da reserva desativa (formato Data): '+ horasFimReserva)
                                                    const HoraFim_Array = horasFimReserva.split(':')
                                                    const horaFim = HoraFim_Array[0]
                                                    //console.log('Hora:' + horaFim)
                                                    const minutosFim = HoraFim_Array[1]
                                                    //console.log('Minutos:' + minutosFim)
                                                    const Horas_em_Numero = Number(horaFim+minutosFim)
                                                    //console.log('Horas da reserva desativa (formato Numero): '+Horas_em_Numero)
                                                    const HorasFim_MaisLimpeza_Desativas = Horas_em_Numero + HoraLimpezaSala
                                                    //Nao existem reservas com essa data entao pode-se ativar 
                                                    if((HorasInicio_desativas < horaInicioCentroNumber ) || (HorasFim_MaisLimpeza_Desativas > horaFimCentroNumber)){
                                                        //Nao e possivel ativar uma reserva com a hora for do horario do centro
                                                        continue;
                                                    }else{
                                                        const reservasupdated = await reserva.update({
                                                            EstadoId: 1
                                                        },{where:{id:reservaid}})
                                                        .then(function(data){return data;})
                                                        .catch(err=>console.log(err))
                                                        //console.log(reservasupdated)
                                                    }
                                                }
                                                }
                                        }else
                                            continue
                                    }else
                                        continue;
                                }else
                                    continue;
                            }else
                                continue;
                        }
                        //Reservas ativadas e so ativar o utilizador
                        const data = await utilizador.update({
                            EstadoId: '1'
                        },{where: {id:id}})
                        .then(function(data){return data;})
                        .catch(error=>{console.log('Error:' + error); return error;})
                        if(data)
                            res.status(200).json({sucesso: true, data: data, message: 'Utilizador ativado com sucesso'})
                        else
                            res.json({sucesso:false, message:'Impossível ativar o utilizador'})
                    }else{
                        //Nao existem reservas logo e so ativar 
                        const data = await utilizador.update({
                            EstadoId: '1'
                        },{where: {id:id}})
                        .then(function(data){return data;})
                        .catch(error=>{console.log('Error:' + error); return error;})
                        if(data)
                            res.status(200).json({sucesso: true, data: data, message: 'Utilizador ativado com sucesso'})
                        else
                            res.json({sucesso:false, message:'Impossível ativar o utilizador'})
                    }
                }else
                    res.json({sucesso: false, message:'Impossível obter as reservas do utilizador'})
            }else
                res.json({sucesso:false, message:'O utilizador já se encontra ativado'})
        }else
            res.json({sucesso:false, message:'O utilizador não existe'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Atualizar a palavraPasse
controllers.atualizarPalavraPasse = async(req,res) =>{
    const {id} = req.params;
    const {PalavraPasseNova, PalavraPasseAntiga} = req.body
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            if(PalavraPasseNova != "" && PalavraPasseAntiga != ""){
                if(schema.validate(PalavraPasseNova)){
                    const isMatch = bcrypt.compareSync(PalavraPasseAntiga, utilizadorData.PalavraPasse);
                    if(isMatch){
                        bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(PalavraPasseNova, salt, function(err, hash) {
                            const data = utilizador.update({
                                PalavraPasse: hash,
                                PrimeiroLogin: 0
                            },{where: {id: id}})
                            .then(function(data){return data;})
                            .catch(error =>{
                                console.log('Error: '+error);
                                return error;
                            })
                            if(data)
                                res.status(200).json({sucesso: true, message:'Palavra Passe atualizada com sucesso'})
                            else
                                res.json({sucesso: false, message:'Impossível alterar a palavra passe'})
                            });
                        });
                    }else{
                        res.json({sucesso: false, message:'Palavra Passe incorreta'})
                    }
                }else{
                        res.json({sucesso:false, message:'A palavra passe não pode ter espacos, deve ter entre 8 a 100 caracteres, pelo menos uma letra maiscula e minuscula e pelo menos dois digitos'})
                }
            }else{
                res.json({sucesso: false, message:'Insira uma palavra passe'})
            }
        }else{
            res.json({sucesso: false, message:'O utilizador não existe'})
        }
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Listar Centros com base no id do utilizador include tabela pertence
controllers.centros = async(req,res) =>{
    const {id} = req.params;
    if(id!=null){
        const utilizadorData = await utilizador.findOne({
            where:{id:id}
        })
        if(utilizadorData){
            const query = `select "Centros".id, "Centros"."Nome" from public."Centros" inner join public."Utilizador_Centros" on "Centros".id = "Utilizador_Centros"."CentroId"
            WHERE "Utilizador_Centros"."UtilizadoreId" = ${id}` 
            const data = await bd.query(query,{ type: QueryTypes.SELECT })
            .then(function(data){return data;})
            .catch(error=>{console.log(error); return error})
            if(data)
                res.status(200).json({sucesso: true, data: data});
            else
                res.status(403).json({sucesso: false, data: data});
        }else
            res.json({sucesso: false, message: 'O utilizador não existe'})
    }else{
        res.json({sucesso: false, message:'Forneça um id'})
    }
}

//Registar utilizador por ficheiro
controllers.ficheiro = async(req,res)=>{
    const{ficheiro} = req.body
    //console.log(ficheiro)
    if(ficheiro.length != 0){
        const users = await utilizador.bulkCreate(ficheiro)
        //console.log(users)
        if(users){
            for(let i =0; i< users.length; i++){
                const pertencedata = await pertence.create({
                    CentroId: users[i].CentroId,
                    UtilizadoreId: users[i].id,
                })
                //console.log(pertencedata)
            }
        } 
        if(users){
            res.json({sucesso: true, message:'Utilizadores inseridos com sucesso'})
        }else{
            res.json({sucesso: false, message:'Impossível inserir utilizadores'});
        }
    }else{
        res.json({sucesso:false, message: "Ficheiro vazio"})
    }
}

module.exports = controllers
