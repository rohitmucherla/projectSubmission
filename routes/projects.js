const express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose');
const LIMIT = 10;

var Project = require('../project'),
	Applicaton = require('../application');

router.use(checkLogin);

router.get('/',function(req, res)
{
	Application.find().where('user-id').in(req.user.gid).select('project-id identifier').lean().exec().then(function(e)
	{
		applied = [];
		e.forEach(function(app)
		{
			applied[app["project-id"]] = app["identifier"];
		});
		//Get the number of projects in the db
		//note: this is not an expensive calculation
		Project.count().lean().exec().then(function(number)
		{
			//No projects found
			if(number <= 0)
			{
				res.render('project-404');
			}
			else
			{
				//Get the first LIMIT projects
				Project.find().limit(LIMIT).lean().exec().then(function(projects)
				{
					projects.forEach(function(project,index)
					{
						console.log(applied[project.id]);
						if(applied[project.id])
							project.applied = applied[project.id];
						projects[index] = project;
					});
					//Figure out if we need to paginate, and update pagination info
					res.locals.pagination = (number > LIMIT) ?
						{needed:true, number: Math.ceil(number / LIMIT), current:1} :
						{needed:false};
					//set the projects
					res.locals.projects = projects;
					//render the projects
					res.render('project-listing');
				}).catch((error)=>{res.status(500).render('error',{error:error})});
			}
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	});
});

router.get('/:offset',function(req,res)
{
	Application.find().where('user-id').in(req.user.gid).select('project-id identifier').lean().exec().then(function(e)
	{
		applied = [];
		e.forEach(function(app)
		{
			applied[app["project-id"]] = app["identifier"];
		});
		//First get the number
		Project.count().lean().exec().then(function(err,number)
		{
			//See if there are any projects in this offset
			maxNumPages = Math.ceil(number / LIMIT);
			if(offset > maxNumPages)
				res.render('project-404');
			//there are!
			else
			{
				//We don't want the previous page projects.
				Project.skip(LIMIT * req.params.offset)
					.limit(LIMIT)
					.find()
					.lean()
					.exec()
					.then(function(errr,projects)
				{
					projects.forEach(function(project,index)
					{
						console.log(applied[project.id]);
						if(applied[project.id])
							project.applied = applied[project.id];
						projects[index] = project;
					});
					//We're definitely going to need pagination!
					//@todo: implement pagination
					res.locals.pagination =
					{
						needed:true,
						number: Math.ceil(number / LIMIT),
						current: req.params.offset // already known
					};
					res.locals.projects = projects;
					res.render('project-listing');
				}).catch((error)=>{res.status(500).render('error',{error:error})});
			}
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

function checkLogin(req,res,next)
{
	console.log('checklogin');
	//Passport middleware adds user to the req object. If it doesn't exist, the client isn't logged in
	if(!req.user)
	{
		//Set redirect URL to the requested url
		req.session.redirectTo = req.originalUrl;
		//Redirect to the Google Authentication page
		res.redirect('/auth/google');
	}
	else
	{
		if(!req.user.approved)
			res.render('approval-needed',{path:req.originalUrl});
		else
			next();
	}
}

module.exports = router;