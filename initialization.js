const IdentityProviderModel  = require( './modules/models/identityprovidermodel')
const AccountModel  = require( './modules/models/accountmodel')

const { Sequelize, Model, DataTypes } = require('sequelize');
const process = require('process');


const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
    host: process.env.DBHOST,
    dialect: process.env.DBENGINE,
    logging: false
});


class Initialization {
    static async initializeDatabase(){

        let force = false;
        IdentityProviderModel.initialize(sequelize, force);
        AccountModel.initialize(sequelize, force);

        await sequelize.sync();
    }
}

module.exports = Initialization



