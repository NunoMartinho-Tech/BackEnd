var Sequelize = require('sequelize');
var bd = require('../config/basedados');

//Criar as tabelas

const Cargos = require('./Cargos');
const Estados = require('./Estado');
const EstadoLimpezas = require('./EstadoLimpeza');
const TipoGestores = require('./TipoGestor'); 
const Centros = require('./Centros');
const Salas = require('./Salas');
const Utilizadores = require('./Utilizador');
const Pertence = require('./Pertence');
const Reservas = require('./Reservas');
const HistoricoAdiamentos = require('./Historico_adiamentos');
const HistoricoLimpezaas = require('./Historico_limpezas');


//Criar as instancias associadas aos models


Cargos.create({descricao: 'Requisitante'}) 
Cargos.create({descricao: 'Administrador'}) 

Estados.create({descricao: 'Ativo'})
Estados.create({descricao: 'Desativo'})

EstadoLimpezas.create({descricao: 'Limpo'})
EstadoLimpezas.create({descricao: 'Por Limpar'})

TipoGestores.create({descricao: 'Administrador Geral'})
TipoGestores.create({descricao: 'Administrador de Centro'})  



