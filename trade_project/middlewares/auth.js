const Trade = require('../models/tradeModel');

exports.isLoggedIn = (req, res, next)=>{
    //console.log("is logged in....");
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to log in first');
        return res.redirect('/users/login');
    }
};

exports.isGuest = (req, res, next)=>{
    //console.log("Is guest...");
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};

exports.isHost = (req, res, next)=>{
   // console.log("Is host...");
    let id = req.params.id;
    Trade.findById(id)
    .then(trade => {
        if(trade){
            if(trade.host == req.session.user){
                return next();
            } else {
                let err = new Error('Unauthorized to access the resource');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};

exports.isNotAuthor = (req, res, next) => {
   // console.log("Is not author...");
    let id = req.params.id;
    Trade.findById(id)
      .then((trade) => {
        if (trade) {
          if (trade.host == req.session.user) {
            let err = new Error("Invalid request you cannot trade your own item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
          } else {
            return next();
          }
        }
      })
      .catch((err) => next(err));
  };

  exports.canCancel=(req,res,next)=>{
   // console.log("can cancel..");
    let tradeItemId = req.params.tradeItemId;
    let itemId = req.params.itemId;
    Promise.all([
        Trade.findById(tradeItemId),
        Trade.findById(itemId)
      ]).then((results) => {
        const [tradeItem, item] = results;
        if(tradeItem.host==req.session.user || item.host==req.session.user){
           return next();
        }else{
            let err = new Error("Invalid request you cannot trade your own item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
        }
      })
      .catch(err=>next(err));
  }

  exports.canAccept=(req,res,next)=>{
   // console.log("can accept...");
    let itemId=req.params.itemId;
    Trade.findById(itemId)
      .then((trade) => {
        if(trade.host==req.session.user){
           return next();
        }else{
            let err = new Error("Invalid request you cannot accept others item");
            err.status = 401;
            req.flash("error", err.message);
            return res.redirect("/users/profile");
        }
      })
      .catch(err=>next(err));
  }
