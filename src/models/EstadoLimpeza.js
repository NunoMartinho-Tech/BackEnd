var Sequelize = require('sequelize');
var bd = require('../config/basedados');

var EstadoLimpezas = bd.define('EstadosLimpeza', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    }
    },{
    timestamps: false,
    tableName: 'EstadosLimpeza'
});
    
module.exports = EstadoLimpezas;