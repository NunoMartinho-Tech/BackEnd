var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Centro = require('./Centros');
var Utilizador =  require('./Utilizador');


var Pertence = bd.define('Utilizador_Centros',{
    CentroId: {
        type: Sequelize.INTEGER,
        references:{
            model: Centro,
            key: 'id' 
        }
    },
    UtilizadoreId: {
        type: Sequelize.INTEGER,
        references: {
            model: Utilizador,
            key: 'id'
        }
    }
    },{
    timestamps: false,
    tableName: 'Utilizador_Centros'
})

Centro.belongsToMany(Utilizador, {through: Pertence});

Utilizador.belongsToMany(Centro, {through: Pertence});

module.exports = Pertence;