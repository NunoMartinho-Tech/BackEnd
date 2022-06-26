var Sequelize = require('sequelize');
var bd = require('../config/basedados');
var Estado = require('./Estado');
var TipoGestor = require('./TipoGestor');
var Cargo =  require('./Cargos');
const bcrypt = require('bcrypt'); //encripta a pass a guardar na BD

var Utilizador = bd.define('Utilizadores',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Pnome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Unome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    PalavraPasse: {
        type: Sequelize.STRING,
        allowNull: false
    },
    Foto: {
        type: Sequelize.STRING,
        allowNull: false
    },
    PrimeiroLogin: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
    ,
    EstadoId: {
        type: Sequelize.INTEGER,
        references:{
            model: Estado,
            key: 'id' 
        }
    },
    TiposGestorId: {
        type: Sequelize.INTEGER,
        references:{
            model: TipoGestor,
            key: 'id' 
        }
    },
    CargoId: {
        type: Sequelize.INTEGER,
        references:{
            model: Cargo,
            key: 'id' 
        }
    }
    },{
    timestamps: false,
    tableName: 'Utilizadores'
})

Utilizador.beforeCreate((Utilizadores, options) => {
    return bcrypt.hash(Utilizadores.PalavraPasse, 10)
    .then(hash => {
        Utilizadores.PalavraPasse = hash;
    })
    .catch(err => {
        throw new Error();
    });
});


Utilizador.belongsTo(Estado);

Utilizador.belongsTo(TipoGestor);

Utilizador.belongsTo(Cargo)

module.exports = Utilizador;