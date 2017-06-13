/*
* Profile Page
*/
const express = require('express'),
	router = express.Router(),
	LIMIT = 10;

Application = require('../application');
Project = require('../project');

router.use(checkLogin)

router.get('/',function(req, res)
{
	res.render('profile',{user:req.user})
});

router.get('/applications',function(req,res)
{
	Application.count().lean().exec().then(function(number)
	{
		if(number > 0)
		{
			Application.find({"user-id":req.user.gid})
				.limit(LIMIT)
				.lean() //returns as Object instead of Instance
				.exec()
				.then(function(applications)
			{
				var projects = [];
				applications.forEach(function(app)
				{
					console.log(app);
					projects.push(app["project-id"]);
				});
				Project.find().lean().where('id').in(projects).select('name id').exec().then(function(project)
				{
					_projects = {};
					sendApp = [];
					project.forEach(function(info)
					{
						_projects[info.id] = info.name;
					});
					applications.forEach(function(app,index)
					{
						app.projectName = _projects[app["project-id"]];
					});
					res.locals.applications = applications;
					res.locals.pagination = (number > LIMIT) ?
						{needed:true, number: Math.ceil(number / LIMIT), current:1} :
						{needed:false};
					res.render('profile-application-list')
				}).catch((error)=>{res.status(500).render('error',{error:error})});
			}).catch((error)=>{res.status(500).render('error',{error:error})});
		}
		else
		{
			res.render('application-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error});});
});

router.get('/application/:id',function(req,res)
{
	res.redirect(`/profile/application/${req.params.id}/view`);
});

router.get('/application/:id/view',function(req,res)
{
	Application.findOne()
		.lean()
		.where('identifier').in(req.params.id)
		.where('user-id').in(req.user.gid)
		.exec()
		.then(function(application)
	{
		console.log(application);
		if(application)
		{
			Project.findOne()
				.lean()
				.where('id')
				.in(application["project-id"])
				.select('name')
				.exec()
				.then(function(project)
			{
				application.projectName = project.name;
				res.locals.pagination = {needed:false};
				res.locals.applications = [application];
				res.render('profile-application-list');
			}).catch((error)=>{res.status(500).render('error',{error:error})});
		}
		else
		{
			res.render('application-404',{single:true});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/application/:id/edit',function(req,res)
{
	Application.findOne()
		.lean()
		.where('identifier').in(req.params.id)
		.where('user-id').in(req.user.gid)
		.exec()
		.then(function(application)
	{
		if(application)
		{
			res.send('ok');
		}
		else
		{
			res.render('application-404',{single:true})
		}
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
		//Admins have access > 10
		if(!req.user.approved)
			res.render('approval-needed',{path:req.originalUrl});
		else
			next();
	}
}

module.exports = router;