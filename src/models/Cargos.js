var Sequelize = require('sequelize');
var bd = require('../config/basedados');


var Cargos = bd.define('Cargo', {
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
});
    
module.exports = Cargos;
