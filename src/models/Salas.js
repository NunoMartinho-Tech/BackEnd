var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Estado = require('./Estado');
var Estado_Limpeza = require('./EstadoLimpeza');
var Centros = require('./Centros');

var Sala = bd.define('Sala',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Capacidade: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        default: 1
    },
    Alocacao: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        default: 1
    },
    Tempo_Limpeza: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        default: 0
    },
    Motivo_Bloqueio: {
        type: Sequelize.STRING,
    },
    EstadoId: {
        type: Sequelize.INTEGER,
        references:{
            model: Estado,
            key: 'id' 
        }
    },
    CentroId: {
        type: Sequelize.INTEGER,
        references:{
            model: Centros,
            key: 'id' 
        }
    },
    EstadosLimpezaId: {
        type: Sequelize.INTEGER,
        references:{
            model: Estado_Limpeza,
            key: 'id' 
        }
    }
    },{
    timestamps: false
})

Sala.belongsTo(Centros);

Sala.belongsTo(Estado);

Sala.belongsTo(Estado_Limpeza);

module.exports = Sala;