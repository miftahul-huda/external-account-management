const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");
const { google, oauth2_v2 } = require('googleapis');
const axios = require('axios');



const CrudLogic = require("./crudlogic");
const IdentityProviderModel = require('../models/identityprovidermodel');
const AccountModel = require('../models/accountmodel');

class AccountLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/accountmodel");
        return model;
    }

    static getPk(){
        return "id";
    }

    static getWhere(search)
    {
        let where = {
            [Op.or] :
            [
                {firstName : {
                    [Op.iLike] : "%" + search + "%"
                }}
                ,
                {lastName : {
                    [Op.iLike] : "%" + search + "%"
                }}
            ]

        }
        return where;
    }

    static getOrder()
    {
        let order = [['createdAt', 'DESC']];
        return order;
    }

    static async auth(providerID)
    {
        try
        {
            console.log("identituy Provider")

            let identityProvider = await IdentityProviderModel.findOne({ where:{
                providerID: {
                    [Op.iLike] :providerID
                } 
            } })

            if(identityProvider == null)
                throw { success: false, error: {}, message: "Identity provider is not available" };

            console.log("Identity Provider")
            console.log(identityProvider)

            this.session.identityProvider = identityProvider;
            
            const oAuth2Client = new google.auth.OAuth2(identityProvider.cliendID, identityProvider.secretKey, identityProvider.redirectUrl);

            const GMAIL_SCOPES = [ 'https://www.googleapis.com/auth/userinfo.email', 
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/gmail.send',
            'https://mail.google.com'];

            let url = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                prompt: 'consent',
                scope: GMAIL_SCOPES,
            });
            
            url = url.replace("client_id=&", "client_id=" + identityProvider.clientID + "&")
            console.log('Authorize this app by visiting this url:', url);

            return { success: true, payload: {
                identityProvider: identityProvider.providerID,
                url: url
            } }

        }
        catch(err)
        {
            console.log("ERRROR")
            console.log(err)
            throw { success: false, error: err, message: err.message }

        }
    }

    
    

    static async callback(code)
    {
        try
        {
            console.log("Callback code: " + code)

            let identityProvider = this.session.identityProvider;
            let sessionID = this.session.authSession;
            
            console.log("Callback Identity Provider")
            console.log(identityProvider)

            console.log("Callback Auth Session")
            console.log(sessionID)

            const oAuth2Client = new google.auth.OAuth2(identityProvider.clientID, identityProvider.secretKey, identityProvider.redirectUrl);
            let result = await oAuth2Client.getToken(code);

            let profile = await this.getProfile(result.tokens);

            let newProfile = {};
            newProfile.firstName =  profile.given_name;
            newProfile.lastName = profile.family_name;
            newProfile.email = profile.email;
            newProfile.profilePicture = profile.picture;
            newProfile.providerID = identityProvider.providerID;
            newProfile.accessToken = result.tokens.access_token;
            newProfile.refreshToken = result.tokens.refresh_token;
            newProfile.isActive = 0;
            newProfile.authSession = sessionID;

            
            AccountLogic.getModel().create(newProfile);

            return { success: true, payload: newProfile }

        }
        catch(err)
        {
            console.log("ERRROR")
            console.log(err)
            throw { success: false, error: err, message: err.message }

        }
    }

    static async getProfile(tokens)
    {
        let url = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + tokens.access_token;
        console.log(url)

        let profile = await axios.get(url);
        console.log(profile.data)
        return profile.data;
    }

    static async findBySession(sessionID)
    {
        try
        {
            let user = await AccountModel.findOne({
                where: {
                    authSession : sessionID
                }
            });

            if(user == null)
                throw ({ success: false, message: "Account Not found"});
            
            return { success: true, payload: user}
        }
        catch(e)
        {
            throw ({ success: false, error: e, message: e.message})

        }
    }

    static async findByEmail(email)
    {
        try
        {
            let user = await AccountModel.findOne({
                where: {
                    email : email
                }
            });

            if(user == null)
                throw ({ success: false, message: "Account Not found"});
            
            return { success: true, payload: user}
        }
        catch(e)
        {
            throw ({ success: false, error: e, message: e.message})

        }
    }

    static getDefaultWhere()
    {
        console.log(this.session)
        let where = {
            
                [Op.and]: [{isActive: 1}, { user: this.session.user.username }]
            
        }

        return where;
    }

    static getModelIncludes()
    {
        return [ {model: IdentityProviderModel, as: "provider"} ];
    }
}

module.exports = AccountLogic;