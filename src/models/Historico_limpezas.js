var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Reserva = require('./Reservas');
var Utilizador =  require('./Utilizador');


var HistoricoLimpeza = bd.define('HistoricosLimpezas',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    DataLimpeza:{
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    HoraInicio: {
        type: Sequelize.TIME,
        allowNull: false
    },
    HoraFim: {
        type: Sequelize.TIME,
        allowNull: false
    },
    ReservaId: {
        type: Sequelize.INTEGER,
        references:{
            model: Reserva,
            key: 'id'
        }
    },
    UtilizadoresId: {
        type: Sequelize.INTEGER,
        references: {
            model: Utilizador,
            key: 'id'
        }
    }
    },{
    timestamps: false,
    tableName: 'HistoricoLimpezas'
})

HistoricoLimpeza.belongsTo(Reserva);

HistoricoLimpeza.belongsTo(Utilizador);

module.exports = HistoricoLimpeza;