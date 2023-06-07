const CrudRouter = require("./crudrouter");

class EmailRouter extends CrudRouter{

    static getRouter(logic)
    {
        let router = super.getRouter(logic)
        let me  = this;
        const path = require('path');


        router.get("/sendall", function(req, res){
            logic.session = req.session;

            logic.sendAllEmails().then((response)=>{
                res.send(response)
            }).catch((err)=>{
                console.log(err)
                res.send(err)
            })
        });


        return router;

    }

}

module.exports = EmailRouter;