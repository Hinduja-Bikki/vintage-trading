const express = require('express');
const router = express.Router();
const controller = require('../controllers/tradeController');
const { isLoggedIn, isHost, isAuthor,isNotAuthor,canCancel,canAccept } = require('../middlewares/auth');
const {validateId,validateTrade,validateResult} = require('../middlewares/validator');


router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.post('/', isLoggedIn, controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/edit', validateId, isLoggedIn, isHost, controller.edit);

router.put('/:id', validateId, isLoggedIn, isHost, controller.update);

router.delete('/:id',  validateId, isLoggedIn, isHost, controller.delete);


router.put("/watch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.watch);

router.put("/unwatch/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.unwatch);

router.get("/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.getAvailable);

router.post("/offer/:id",validateId,isLoggedIn,isNotAuthor,validateResult,controller.makeOffer);

router.post("/offer/reject/:tradeItemId/:itemId",isLoggedIn,canCancel,validateResult,controller.rejectOffer);

router.get("/offer/manage/:id",validateId,validateResult,controller.manageOffer);

router.post("/offer/:tradeItemId/:itemId/accept",isLoggedIn,canAccept,validateResult,controller.acceptOffer);

module.exports=router;