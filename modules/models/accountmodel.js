const { Model, DataTypes } = require('sequelize');

class AccountModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            profilePicture: DataTypes.TEXT,
            email: DataTypes.STRING,
            providerID: DataTypes.STRING,
            accessToken: DataTypes.TEXT,
            refreshToken: DataTypes.STRING,
            isActive: DataTypes.INTEGER,
            authSession: DataTypes.STRING
        }, 
        { sequelize, modelName: 'account', tableName: 'account', force: force });
    }
}

module.exports = AccountModel;