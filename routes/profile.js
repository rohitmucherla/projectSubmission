/*
* Profile Page
*/
const express = require('express'),
	router = express.Router(),
	config = require('../config');

Application = require(`../${config.db.path}/application`);
Project = require(`../${config.db.path}/project`);

router.use(config.functions.requireLogin);

router.get('/',function(req, res)
{
	res.render('profile');
});

router.get('/applications',function(req,res)
{
	Application.count().lean().exec().then(function(number)
	{
		if(number > 0)
		{
			Application.find()
				.lean() //returns as Object instead of Instance
				.limit(config.LIMIT)
				.where("user-id").equals(req.user.gid)
				.exec()
				.then(function(applications)
			{
				let projects = [];
				applications.forEach(function(app)
				{
					projects.push(app["project-id"]);
				});
				Project.find()
					.lean()
					.where('_id').in(projects)
					.select('name')
					.exec()
					.then(function(project)
				{
					_projects = {};
					sendApp = [];
					project.forEach(function(info)
					{
						_projects[info._id] = info.name;
					});
					applications.forEach(function(app,index)
					{
						app.projectName = _projects[app["project-id"]];
					});
					if(res.locals.back && (res.locals.back.name == "Your Applications"))
					{
						delete req.session.back;
						delete res.locals.back;
					}
					else
						req.session.back = {name:"Your Applications",url:"/profile/applications"};
					res.locals.applications = applications;
					res.locals.pagination = (number > config.LIMIT) ?
						{needed:true, number: Math.ceil(number / config.LIMIT), current:1} :
						{needed:false};
					res.render('profile-application-list')
				});
			});
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
		.where('_id').in(req.params.id)
		.where('user-id').in(req.user.gid)
		.exec()
		.then(function(application)
	{
		if(application)
		{
			Project.findOne()
				.lean()
				.where('_id')
				.in(application["project-id"])
				.select('name')
				.exec()
				.then(function(project)
			{
				application.projectName = project.name;
				res.locals.pagination = {needed:false};
				res.locals.applications = [application];
				res.render('profile-application-list');
			});
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
		.where('_id').in(req.params.id)
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

router.get('/projects',function(req,res)
{
	Project.find()
		.lean()
		.where('_id').in(req.user.owner)
		.exec()
		.then(function(projects)
	{
		if(projects)
		{
			res.locals.projects = projects;
			res.locals.headerTitle = "Your Projects";
			res.render('project-listing');
		}
		else
		{
			res.render('project-404');
		}
	}).catch((err)=>{res.status(500).render('error',{error:err})})
});

module.exports = router;