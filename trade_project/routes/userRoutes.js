const express = require('express');
const controller = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const {logInLimiter}= require("../middlewares/rateLimiters");
const {validateLogIn} = require("../middlewares/validator");

const router = express.Router();

router.get('/new', isGuest, controller.new);

router.post('/', isGuest, controller.create);

router.get('/login', isGuest, controller.getUserLogin);

router.post('/login', isGuest, logInLimiter,validateLogIn,controller.login);

router.get('/profile', isLoggedIn, controller.profile);

router.get('/logout', isLoggedIn, controller.logout);

module.exports = router;