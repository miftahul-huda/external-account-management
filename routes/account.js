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

            logic.auth(providerID, sessionID).then((response)=>{
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
            let state = req.query.state;

            logic.session = req.session;
            logic.callback(code, state).then((response)=>{

                let data = { session: response.payload.authSession};
                console.log("dataa=-================")
                console.log(data)

                var dir = __dirname;
                var p = path.resolve( dir, "../public/pages/", "oauth2-callback");
                res.render(p, data );
            }).catch((err)=>{
                res.send(err)
            })
        });

        return router;

    }

    static init(req,res)
    {
        if(req.headers.user != null)
            req.session.user = JSON.parse(req.headers.user);
    }

}

module.exports = AccountRouter;