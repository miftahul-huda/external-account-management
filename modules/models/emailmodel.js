const { Model, DataTypes } = require('sequelize');

class EmailModel extends Model {
    static initialize(sequelize, force=false)
    { 
        super.init({
            from: DataTypes.STRING,
            to: DataTypes.TEXT,
            cc: DataTypes.TEXT,
            bcc: DataTypes.TEXT,
            subject: DataTypes.STRING,
            html: DataTypes.TEXT,
            attachments: DataTypes.TEXT,
            sentDate: DataTypes.DATE,
            isSent: DataTypes.INTEGER        
        }, 
        { sequelize, modelName: 'email', tableName: 'email', force: force });
    }
}

module.exports = EmailModel;