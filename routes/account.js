const CrudRouter = require("./crudrouter");

class AccountRouter extends CrudRouter{

    static getRouter(logic)
    {
        let router = super.getRouter(logic)
        let me  = this;
        const path = require('path');


        router.get("/auth", function(req, res){
            let providerID = req.query.provider;
            let sessionID = req.query.sessionID;
            req.session.authSession = sessionID;
            logic.session = req.session;

            logic.auth(providerID).then((response)=>{
                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "oauth2");
                res.render(p, { config: response.payload.url } )
            }).catch((err)=>{
                console.log(err)
                res.send(err)
            })
        });

        router.get("/find-by-session", function(req, res){
            let sessionID = req.query.session;
            logic.findBySession(sessionID).then((response)=>{
                res.send(response);
            }).catch((err)=>{
                console.log(err)
                res.send(err)
            })
        });

        router.get("/callback", function(req, res){
            let code = req.query.code;
            logic.session = req.session;
            logic.callback(code).then((response)=>{

                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "oauth2-callback");
                res.render(p );
            }).catch((err)=>{
                res.send(err)
            })
        });

        return router;

    }

}

module.exports = AccountRouter;