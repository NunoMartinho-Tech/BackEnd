var Sequelize = require('sequelize');

const sequelize = new Sequelize(
'd9fgecosu3kiua',
'tjcxotrkmjkhfv',
'e4d4c868fe95bdc147333ecad8d8099dcc2705b58431a21d98cad03f9c0925cd',
{
host: 'ec2-34-242-84-130.eu-west-1.compute.amazonaws.com',
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