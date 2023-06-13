const { Sequelize, Model, DataTypes } = require('sequelize');
const { Op } = require("sequelize");
const axios = require('axios');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;



const CrudLogic = require("./crudlogic");
const IdentityProviderModel = require('../models/identityprovidermodel');
const AccountModel = require('../models/accountmodel');

class EmailLogic extends CrudLogic {

    static getModel()
    {
        const model = require("../models/emailmodel");
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
                    [Op.like] : "%" + search + "%"
                }}
                ,
                {lastName : {
                    [Op.like] : "%" + search + "%"
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

    static getDefaultWhere()
    {
        let where = {
            isActive: 1
        }

        return where;
    }

    static sendAllEmails()
    {
        let promise = new Promise(async (resolve, reject)=>{
            let model = this.getModel();
            let emails = await model.findAll({ where: { isSent: 0}});
            emails.map((email)=>{
                try
                {
                    console.log("update email sent status to 2. ID : " + email.id)
                    model.update({ isSent:2 }, {
                        where: {
                            id: email.id
                        }
                    }).then(()=>{
                        console.log("Sending email. ID : " + email.id)
                        this.sendMail(email).then((resEmail)=>{
                            console.log("sendMail Done")
                            try
                            {
                                console.log("update email sent status to 1. ID : " + resEmail.id)
                                model.update({ isSent:1, sentDate: Date.now() }, {
                                    where: {
                                        id: resEmail.id
                                    }
                                });
                            }
                            catch(e)
                            {
                                console.log("Error update email sent")
                                console.log(e)
                            }
                        }).catch((err)=>{
                            console.log("Error send email")
                            console.log(err);
                        })

                    })
                }
                catch(e)
                {
                    console.log("Error processing email. ID : " + email.id)
                    console.log(e)
                }
                
            })

            resolve({ success: true });

        });

        return promise;
    }

    static async sendMail(email)
    {
        let promise = new Promise(async (resolve, reject)=>{

            try
            {
                let mailAddress = email.from;
                let mailAccount = await AccountModel.findOne({ where: { email: mailAddress  }});
                let providerID = mailAccount.providerID;
                let provider = await IdentityProviderModel.findOne({ where: { providerID: providerID } })
                let msg = this.composeEmail(email);
                await this.sendOauthEmail(msg, provider, mailAccount);
                resolve(email)
            }
            catch(e)
            {
                reject(e)
            }
        });

        return promise;       
    }

    static composeEmail(email)
    {
        let msg = {
            from: email.from,
            to: email.to,
            bcc: email.bcc,
            cc: email.cc,
            subject: email.subject,
            html: email.html
        }

        return msg;
    }

    static async sendOauthEmail(email, provider, mailAccount)
    {
        let promise = new Promise(async (resolve, reject)=>{

            try
            {
                let gmailTransporter = await this.setupTransporter(provider.clientID, provider.secretKey, provider.redirectUrl, mailAccount.refreshToken, mailAccount.email);
                await gmailTransporter.sendMail(email);
                resolve();
            }
            catch(e)
            {
                reject(e);
            }
        });

        return promise;           
    }

    static async setupTransporter(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, EMAIL_ADDRESS) 
    {
        // Creating OAuth Client
        const oauth2Client = new OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );

        console.log("refresh token")
        console.log(CLIENT_ID)
        console.log(CLIENT_SECRET)
        console.log(REDIRECT_URI)
        console.log(REFRESH_TOKEN)
        console.log(EMAIL_ADDRESS)


      
      
        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN
        });
      
      
        // Generate access token using OAuth Client
        const accessToken = await new Promise((resolve, reject) => {
          oauth2Client.getAccessToken((err, token) => {
            if (err) {
                console.log("Error get Access token")
                console.log(err)
              reject("error", err);
            }
            resolve(token);
          });
        });
      
      
        // Create a transporter object
        const nodeTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: EMAIL_ADDRESS,
            accessToken: accessToken,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN
          }
        });
      
      
        // Return transporter object
        return nodeTransporter;
    }

}

module.exports = EmailLogic;