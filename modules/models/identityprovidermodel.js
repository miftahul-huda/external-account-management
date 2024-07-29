const { Model, DataTypes } = require('sequelize');

class IdentityProviderModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            name: DataTypes.STRING,
            logo: DataTypes.TEXT,
            clientID: DataTypes.STRING,
            secretKey: DataTypes.TEXT,
            redirectUrl: DataTypes.TEXT,
            providerID: 
            {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }
            ,
            website: DataTypes.STRING
        }, 
        { sequelize, modelName: 'identity_provider', tableName: 'identity_provider', force: force });
    }
}

module.exports = IdentityProviderModel;