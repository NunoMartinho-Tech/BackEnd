var Sequelize = require('sequelize');

const sequelize = new Sequelize(
'daskeroo10fjie',
'hxppuvdhkodysm',
'bb7f8d54157530357864aada0b67877a290300433aa6a4f352572c36a8ef7671',
{
host: 'ec2-52-208-164-5.eu-west-1.compute.amazonaws.com',
port: '5432',
dialect: 'postgres',
dialectOptions: {
    ssl: {
        rejectUnauthorized: false
    }
}
}
);

module.exports = sequelize;