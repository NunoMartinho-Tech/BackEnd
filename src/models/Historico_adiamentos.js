var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Reserva = require('./Reservas');


var HistoricoAdiamento = bd.define('historicoadiamentos',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    HoraAntiga: {
        type: Sequelize.TIME,
        allowNull: false
    },
    HoraAdiada: {
        type: Sequelize.TIME,
        allowNull: false
    },
    ReservaId: {
        type: Sequelize.INTEGER,
        references:{
            model: Reserva,
            key: 'id'
        }
    }
    },{
    timestamps: false,
    tableName: 'HistoricoAdiamentos'
})

HistoricoAdiamento.belongsTo(Reserva);

module.exports = HistoricoAdiamento;