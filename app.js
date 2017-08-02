const express = require('express'),
	console = require('tracer').colorConsole(),
	csurf = require('csurf'),
	config = require('./config'),
	getSlug = require('speakingurl'),
	hbs = require('hbs'),
	path = require('path'),
	//favicon = require('serve-favicon'),
	logger = require('morgan'),
	mongoose = require('mongoose'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	flash = require('express-flash'),
	expressValidator = require('express-validator'),
	passport = require('passport');

/*
* Connect to the database
*/

mongoose.connect(config.db.conn,config.db.options) //connect to db in the config file

/*
* Register helpers
*/

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('get_slug',function(unslug)
{
	return getSlug(unslug);
});

hbs.registerHelper('json',function(obj)
{
	return JSON.stringify(obj);
});

hbs.registerHelper('status',function(value)
{
	switch(value)
	{
		case 0:
			return "Submitted";
			break;
		default:
			return "An error occurred retrieving the status of this application";
			break;
	}
});

hbs.registerHelper('canRenderProject',config.functions.canRenderProject);

hbs.registerHelper('user-nav',function(userAccess)
{
	switch(userAccess)
	{
		case 0:
			return[{"name":"Projects",link:"/profile/projects"},
				{"name":"Applications",link:"/profile/applications"}]
			break;
		case 10:
			return[{"name":"Explore",link:"/projects"},
					{"name":"Projects",link:"/profile/projects"},
					{"name":"Applications",link:"/profile/applications"},
					{"name":"Admin Panel",link:"/admin"}];
			break;
		default:
			return[];
	}
});

hbs.registerHelper('sameUser',function(userA,userB)
{
	return userA.gid == userB.gid;
});

hbs.registerHelper('projectStatus',function(status = '0', what = 'name')
{
	status = status.toString();
	let statusList =
	{
		"-2":
		{
			name: 'Rejected',
			color: 'red'
		},
		"-1":
		{
			name: 'Complete',
			color: 'green'
		},
		"0":
		{
			name: 'Unapproved',
			color: 'red'
		},
		"1":
		{
			name: 'Approved',
			color: 'green'
		},
		"2":
		{
			name: 'Full',
			color: 'green'
		}
	}
	if(!statusList[status])
	{
		console.error(`Project status ${status} does not exist`);
		statusList[status] = {name:'Status Unknown',color:'red'};
	}
	return statusList[status][what] || 'Status';

});

hbs.registerHelper('renderProjectApproval',function(isAdmin,project)
{
	return isAdmin && (project.status == 0)
});

hbs.registerHelper('public',function(project)
{
	return project.status != 0;
});

hbs.registerHelper('canRenderUser',function(user,currentUser)
{
	return (user.gid == currentUser.gid) || user.isPublic;
});

hbs.registerHelper('profile-checkbox',function(error,user)
{
	compare = true;
	if(error != undefined)
		compare &= error;
	else compare &= user.isPublic
	return compare ? 'checked' : '';
})

/*
* Load Routes
*/

let index = require('./routes/index'),
	lang = require('./routes/lang'),
	project = require('./routes/project'),
	projects = require('./routes/projects'),
	auth = require('./routes/auth'),
	profile = require('./routes/profile'),
	admin = require('./routes/admin');
	faq = require('./routes/faq');

//Create express app
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.enable('view cache');
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
//Form Validation
app.use(expressValidator(
{
	customValidators: {
		isArray: function(value)
		{
			return Array.isArray(value);
		},
		between(value,min,max)
		{
			return (parseInt(value) >= min && parseInt(value) <= max);
		}
	},
	customSanitizers: {
		escapeAndTrim(what)
		{
			//escape code
			what = what.replace(/&/g, '&amp;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&#x27;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/\//g, '&#x2F;')
					.replace(/\\/g, '&#x5C;')
					.replace(/`/g, '&#96;');
			let idx = what.length - 1, pattern = new RegExp("/\s/");
			while (idx >= 0 && pattern.test(what[idx]))
			{
				idx--;
			}

			what = idx < what.length ? what.substr(0, idx + 1) : what;
			return what.replace(/^\s+/g, '');
		}
	}
}));
//Express session handling
app.use(session(
{
	secret:"WhyNot",
	saveUninitialized:false,
	resave:false,
	signed:true,
	//cookie: {secure:true} //@todo: Uncomment when in production
	//@todo: set store (in-memory store is for development only)
}));
//CSRF Protection
app.use(csurf({ignoreMethods: ['GET','HEAD','OPTIONS']}));
//Use passport
app.use(passport.initialize());
//Passport session manager
app.use(passport.session());

app.use(function(req, res, next)
{
	if(req.user && req.user.access < 0)
	{
		res.locals.content="<h1 class='center'>Access Denied</h1><p class='flow-text center'>An admin has deleted your account</p>"
		res.status(403).render('card');
	}
	res.locals.user = req.user;
	res.locals.back = req.session.back || undefined;
	delete req.session.back;
	delete res.locals.back; //@todo implement this everywhere or get rid of it
	res.locals.config =
	{
		slack: config.slack
	};
	res.locals.token = req.csrfToken();
	next();
});

/*
* Routes
*/

app.use('/', index);
app.use('/lang', lang);
app.use('/project', project);
app.use('/projects', projects);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/admin', admin);
app.use('/faq', faq);
app.get('/login', function(req,res)
{
	if(req.user)
		res.redirect('/profile');
	else
		res.redirect('/auth/google');
});
app.get('/logout',function(req,res)
{
	res.redirect('/auth/logout');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {

	if(err.code === 'EBADCSRFTOKEN')
	{
		res.locals.title = "Access Denied";
		res.status(403).render('csrf-block');
		return;
	}

	if(err.status == 404)
	{
		res.locals.page = req.originalUrl;
		res.status(404).render('404');
		return;
	}
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;