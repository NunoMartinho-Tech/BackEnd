var Sequelize = require('sequelize');
var bd = require('../config/basedados');

var Estados = bd.define('Estado',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    }
    }, {
    timestamps: false
});

module.exports = Estados;