const Trade = require('../models/tradeModel');
const ObjectId = require('mongoose').Types.ObjectId;

exports.index = (req, res, next) => {
    //console.log("In Index Page//")
    Trade.find().sort('title')
    .then(trades => {
        Trade.distinct("category").then(categories => {
            res.render('./trade/index', {trades, categories});
        })
        .catch(err=>next(err));
     })
        
    .catch(err=>next(err));
};

exports.new = (req, res) => {
    res.render('./trade/new');
};

exports.create = (req, res, next) => {
    let trade = new Trade(req.body);
    trade.host = req.session.user;
    trade.status = "Available";
  //  console.log("in create  ", trade);
    trade.save()
    .then(trade => {
        req.flash('success', 'You have successfully created new trade');
        res.redirect('/trades')
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            res.redirect('back');
           // err.status = 400;
        } else {
         next(err);
        }
    })
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    //console.log("In Show Page//")
    // This is a hex string and 24 bit length
        Trade.findById(id).populate('host', 'firstName lastName')
        .then(trade=>{
            if(trade) {
                let canWatch = true;
                if (trade.watchList.includes(req.session.user)) {
                  canWatch = false;
                }
              //  console.log("trade", trade);
                return res.render('./trade/show', {trade,canWatch});
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    if (ObjectId.isValid(id)) {
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid connection id');
            err.status = 404;
            return next(err);
        }

        Trade.findById(id)
        .then(trade=>{
            if(trade) {
             //console.log("In edit....connection is ", trade);
                return res.render('./trade/edit', {trade});
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=>next(err)); 
    } else {
        let err = new Error('Route parameter is not a valid object id :' + id);
        err.status = 400;
        next(err); 
    }
};

exports.update = (req, res, next) => {
    let id = req.params.id;
    let trade = req.body;
    //console.log("In update....connection is ", trade);
    if (ObjectId.isValid(id)) {
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid trade id');
            err.status = 404;
            return next(err);
        }

        Trade.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
        .then(trade=>{
            if(trade) {
           // console.log("In update....connection is ", trade);
                req.flash('success', 'Trade is successfully updated');
                res.redirect('/trades/'+id);
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err=> {
            if(err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('back');
              //  err.status = 400;
            } else {
                next(err);
            }
        });
    } else {
        let err = new Error('Route parameter is not valid Object id :' + id);
        err.status = 400;
        next(err); 
    }
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (ObjectId.isValid(id)) {
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            let err = new Error('Invalid connection id');
            err.status = 404;
            return next(err);
        }

        Trade.findByIdAndDelete(id, {useFindAndModify: false})
        .then(trade =>{
            if(trade) {
            // console.log("in delete....");
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find trade with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err=>next(err));
    } else {
        let err = new Error('Route parameter is not valid Object id :' + id);
        err.status = 400;
        next(err);
    }
};


exports.watch = (req, res, next) => {
   // console.log("In watch....");
    let id = req.params.id;
    let userId = req.session.user;
    Trade
      .findByIdAndUpdate(
        id,
        { $addToSet: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
      //  console.log(trade);
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  };

  exports.unwatch = (req, res, next) => {
    //console.log("In unwatch....");
    let id = req.params.id;
    let userId = req.session.user;
    Trade
      .findByIdAndUpdate(
        id,
        { $pull: { watchList: userId } },
        { useFindAndModify: false, runValidators: true }
      )
      .then((trade) => {
      //  console.log(trade);
        return res.redirect("/users/profile");
      })
      .catch((err) => {
        next(err);
      });
  };

  exports.getAvailable = (req, res, next) => {
  //  console.log("In get avaialble....");
    let id = req.params.id;
    let user=req.session
    Promise.all([
        Trade.findById(id),
        Trade.find({host: req.session.user, status: "Available" }),
    ])
      .then((results) => {
        const [trade, vintageitems] = results;
        if (trade) {
           // console.log("user id", id, "vintage items", vintageitems);
          res.render("./trade/offerTrade", { user,id, vintageitems });
        } else {
          let err = new Error("Invalid trade id");
          err.status = 400;
          req.flash("error", err.message);
          return res.redirect("back");
        }
      })
      .catch((err) => next(err));
  };


  exports.makeOffer = (req, res, next) => {
    let id = req.params.id;
    let tradeItem = req.body.tradeItem;
    Trade
      .findByIdAndUpdate(
        tradeItem,
        { $set: { status: "Pending" } },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .then((trade) => {
        if (trade) {
        } else {
          console.log("update failed");
        }
      })
      .catch((err) => next(err));
      Trade
      .findByIdAndUpdate(
        id,
        {
          $set: {
            offerItemId: tradeItem,
            offerItemOwner: req.session.user,
            status: "Pending",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
    return res.redirect("/users/profile");
  };


  exports.rejectOffer = (req, res, next) => {
   // console.log("In reject offer....");
    let tradeItem = req.params.tradeItemId;
    let itemId = req.params.itemId;
  
    Trade
      .findByIdAndUpdate(
        tradeItem,
        {
          $set: {
            offerItemId: null,
            offerItemOwner: null,
            status: "Available",
          },
        },
        {
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .catch((err) => next(err));
      Trade
      .findByIdAndUpdate(
        itemId,
        {
          $set: {
            status: "Available",
            offerItemId: null,
            offerItemOwner: null,
          },
        },
        { useFindAndModify: false, runValidators: true }
      )
      .catch((err) => next(err));
  
    return res.redirect("/users/profile");
  };
  
  exports.manageOffer = (req, res, next) => {
   // console.log("In manage offer....");
    let id = req.params.id;
    Trade
      .findById(id)
      .populate("offerItemId", "id title category")
      .then((trade) => {
        if (trade) {
          res.render("./trade/viewOffer", { trade });
        }
      })
      .catch((err) => next(err));
  };
  
  exports.acceptOffer = (req, res, next) => {
  //console.log("In accept offer....");
  let itemId = req.params.itemId;
  let tradeItemId = req.params.tradeItemId;
  Trade
    .findByIdAndUpdate(itemId, { $set: { status: "Traded" } })
    .then((trade) => {
      if (trade) {
        itemId = trade.offerItemId;
      }
    })
    .catch((err) => next(err));
    Trade
    .findByIdAndUpdate(tradeItemId, {
      $set: {
        status: "Traded",
        offerItemId: itemId,
        offerItemOwner: req.session.user,
      },
    })
    .then((item) => {
      if (item) {
       return res.redirect("/users/profile")
      }
    })
    .catch((err) => next(err));
};