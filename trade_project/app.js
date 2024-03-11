// require modules
// Importing the modules into app.js
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

const methodOverride = require('method-override');
const tradeRoutes = require('./routes/tradeRoutes');
const sourceRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');

// create app
const app = express();

// configure app
// configurations
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to the database setup
// useNewUrlParser: true , useUnifiedTopology: true depericiation warnings will be gone
mongoose.connect('mongodb://localhost:27017/vintage', 
                {useNewUrlParser: true, 
                useUnifiedTopology: true})
.then(() => {
    // port 
    app.listen(port, host, () => {
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));


app.use(
    session({
        secret: "dnndcndsncdncdscdscnddns",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/vintage'}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use(flash());
app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

//mount middlewares
//static middleware (serves static files)
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//set up routes
app.use('/', sourceRoutes);

app.use('/trades', tradeRoutes);

app.use('/users',userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if(!err.status){
        console.log("err",err);
        err.status = 500;
        err.message = ("Internal Server Error")
    }
    res.status(err.status);
    res.render('error',{error:err});
});
