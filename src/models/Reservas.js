var Sequelize = require('sequelize');
var bd = require('../config/basedados');

var Estado = require('./Estado');
var Sala = require('./Salas');
var Utilizador =  require('./Utilizador');

var Reserva = bd.define('Reserva',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    NomeReserva: {
        type: Sequelize.STRING,
        allowNull: false
    },
    DataReserva: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    NumeroParticipantes: {
        type: Sequelize.SMALLINT,
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
    EstadoId: {
        type: Sequelize.INTEGER,
        references:{
            model: Estado,
            key: 'id' 
        }
    },
    UtilizadoreId: {
        type: Sequelize.INTEGER,
        references: {
            model: Utilizador,
            key: 'id'
        }
    },
    SalaId:{
        type: Sequelize.INTEGER,
        references: {
            model: Sala,
            key: 'id'
        }
    }
    },{
    timestamps: false
});


Reserva.belongsTo(Sala);

Reserva.belongsTo(Utilizador);

Reserva.belongsTo(Estado);

module.exports = Reserva;