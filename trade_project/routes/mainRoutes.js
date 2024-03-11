const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

// GET /: send all trades to user
router.get('/', controller.index);

//GET /contact: contact page redirection
router.get('/contact', controller.contact);

//GET /about: rabout page redirection
router.get('/about', controller.about);

module.exports=router;  