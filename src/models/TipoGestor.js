var Sequelize = require('sequelize');
var bd = require('../config/basedados');


var TipoGestores = bd.define('TiposGestor', {
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
    tableName: 'TiposGestor'
});
    
module.exports = TipoGestores;