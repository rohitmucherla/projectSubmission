/*
* Admin Routes - URIs used for administration
*/

const express = require('express'),
	console = require('tracer').colorConsole(),
	router = express.Router(),
	mailer = require('../bin/mailer'),
	config = require('../config'), //Global Configuration
	util = require('util'),
	User = require(`../${config.db.path}/user`), //User Database Schema
	Application = require(`../${config.db.path}/application`);

let projectRoute = require('./admin/project'),
	projectsRoute = require('./admin/projects'),
	applicationRoute = require('./admin/application'),
	applicationsRoute = require('./admin/applications'),
	singleUserRoute = require('./admin/singleUser')
	userRoute = require('./admin/user');

router.use(config.functions.requireLogin); //Ensure user is logged in and can be in the admin area before doing anything
router.use(function(req,res,next)
{
	res.locals.admin = true;
	next();
});
router.use('/user',singleUserRoute);
router.use('/users',userRoute);
router.use('/application',applicationRoute);
router.use('/applications',applicationsRoute);
router.use('/project',projectRoute);
router.use('/projects',projectsRoute);

router.get('/',function(req, res)
{
	res.locals.adminStats = {};
	User.find()
		.where('approved').equals('false')
		.lean()
		.count()
		.exec()
		.then(function(unapprovedUsers)
	{
		res.locals.adminStats.unapprovedUsers = unapprovedUsers;
		Project.find()
			.where('status').equals(0)
			.lean()
			.count()
			.exec()
			.then(function(unapprovedProjects)
		{
			res.locals.adminStats.unapprovedProjects = unapprovedProjects;
			Application.find()
				.where()
				.lean()
				.count()
				.exec()
				.then(function(pendingApplications)
			{
				res.locals.adminStats.pendingApplications = pendingApplications
				res.render('admin-index');
			}).catch((e)=>{res.status(500).render('error',{error:e})});
		}).catch((e)=>{res.status(500).render('error',{error:e})});
	}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.get('/send-test-email',function(req,res)
{
	mailer(req.user.email,config.email.default.subject,'<strong><center>Test email 1 from Project Submission!</center></strong>').then(function(info)
	{
		res.locals.content = `<h1 class='center'>First Email - <a class='green-text'>Success</a>!</h1><p class='flow-text center'>Details:</p><pre>${util.inspect(info)}</pre><br/>`;
		mailer({to:req.user.email,body:'<strong><center>Test email 2 from Project Submission!</center></strong>'}).then(function(moreInfo)
		{
			res.locals.content += `<h1 class='center'>Second Email - <a class='green-text'>Success</a>!</h1><p class='flow-text center'>Details:</p><pre>${util.inspect(moreInfo)}</pre>`;
			res.render('card');
		}).catch(function(error)
		{
			res.locals.content += `<h1 class='center'>Second Email - <a class='red-text'>Error</a></h1>: <pre>${error}</pre>`;
			res.render('card');
		})
	}).catch(function(error)
	{
		res.locals.content = `<h1 class='center'>First Email - <a class='red-text'>Error</a></h1>: <pre>${error}</pre>`;
		res.render('card');
	});
});

router.get('/projects',function(req,res)
{
	res.send('Project for loop');
});

router.get('/projects/unapproved',function(req,res)
{
	Project.find().where('status').equals(0).count().lean().exec().then(function(number)
	{
		//No projects found
		if(number <= 0)
		{
			res.render('project-404');
		}
		else
		{
			//Get the first LIMIT projects
			Project.find().where('status').equals(0).limit(config.LIMIT).lean().exec().then(function(projects)
			{
				//Figure out if we need to paginate, and update pagination info
				res.locals.pagination = (number > config.LIMIT) ?
					{needed:true, number: Math.ceil(number / config.LIMIT), current:1} :
					{needed:false};
				//set the projects
				res.locals.projects = projects;
				//render the projects
				res.render('project-listing');
			});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/projects/assigner',function(req,res)
{
	Application.find()
		.lean()
		.limit(config.LIMIT)
		.exec()
		.then(function(app)
	{
		app.forEach(function(a,b,c)
		{
			console.warn(a,b,c);
		});
		res.locals.Application = [app];
		res.render('admin-project-assigner');
	});
});

module.exports = router;