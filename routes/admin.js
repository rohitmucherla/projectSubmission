/*
* Admin Routes - URIs used for administration
*/

const express = require('express'),
	console = require('tracer').colorConsole(),
	router = express.Router(),
	config = require('../config'), //Global Configuration
	User = require(`../${config.db.path}/user`), //User Database Schema
	Apps = require(`../${config.db.path}/application`);

let projectRoute = require('./admin/project'),
	applicationRoute = require('./admin/application'),
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
router.use('/project',projectRoute);

router.get('/',function(req, res)
{
	res.render('admin-index');
});

router.get('/projects',function(req,res)
{
	res.send('Project for loop');
});

router.get('/project/:id',function(req,res)
{
	res.send('Single project info page');
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
				res.locals.admin = true;
				//render the projects
				res.render('project-listing');
			});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/projects/assigner',function(req,res)
{
	Apps.find()
		.lean()
		.limit(config.LIMIT)
		.exec()
		.then(function(app)
	{
		app.forEach(function(a,b,c)
		{
			console.warn(a,b,c);
		});
		res.render('admin-project-assigner',{apps:app});
	});
});

module.exports = router;