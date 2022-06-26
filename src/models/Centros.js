var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Estado = require('./Estado');

var Centro = bd.define('Centro',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Endereco: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Hora_abertura: {
        type: Sequelize.TIME,
        allowNull: false
    },
    Hora_fecho: {
        type: Sequelize.TIME,
        allowNull: false
    },
    Telefone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    EstadoId: {
        type: Sequelize.INTEGER,
        references:{
            model: Estado,
            key: 'id' 
        }
    }
    },{
    timestamps: false
});

Centro.belongsTo(Estado);


module.exports = Centro;