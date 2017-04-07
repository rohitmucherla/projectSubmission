const express = require('express'),
	path = require('path'),
	//favicon = require('serve-favicon'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	flash = require('express-flash'),
	passport = require('passport');

/*
* Load Routes
*/

var index = require('./routes/index');
var createProject = require('./routes/create-project');
var project = require('./routes/project');
var auth = require('./routes/auth');
var profile = require('./routes/profile');
var admin = require('./routes/admin');

//Create express app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

/*
* Middleware
*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
//parses forms
app.use(bodyParser.urlencoded({ extended: false }));
//parses cookies
app.use(cookieParser());
//Display flash messages
app.use(flash());
//Everything in the public folder can be requested directly
app.use(express.static(path.join(__dirname, 'public')));

//Express session handling
app.use(session({secret:"WhyNot",saveUninitialized:false,resave:false}));
//Use passport
app.use(passport.initialize());
//Passport session manager
app.use(passport.session());

/*
* Routes
*/

app.use('/', index);
app.use('/create-project', createProject);
app.use('/project', project);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/admin', admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;