const express = require('express'),
	router = express.Router(),
	config = require('../config');

let Project = require(`../${config.db.path}/project`),
	Applicaton = require(`../${config.db.path}/application`);

router.use(config.functions.requireLogin);

router.get('/',function(req, res)
{
	Application.find()
		.where('user-id').equals(req.user.gid)
		.select('project-id identifier')
		.lean()
		.exec()
		.then(function(e)
	{
		applied = [];
		e.forEach(function(app)
		{
			applied[app["project-id"]] = app["identifier"];
		});
		//Get the number of projects in the db
		//note: this is not an expensive calculation
		Project.count()
			.where('status').equals(1)
			.lean()
			.exec()
			.then(function(number)
		{
			//No projects found
			if(number <= 0)
			{
				res.render('project-404');
			}
			else
			{
				//Get the first config.LIMIT projects
				Project.find()
					.limit(config.LIMIT)
					.lean()
					.exec()
					.then(function(projects)
				{
					projects.forEach(function(project,index)
					{
						if(applied[project.id])
							project.applied = applied[project.id];
						projects[index] = project;
					});
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
		});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		//assume the input was meant for project and move on with life
		res.redirect(`/project/${req.params.offset}`);
	}
	else
	{
		Application.find()
			.where('user-id').equals(req.user.gid)
			.select('project-id identifier')
			.lean()
			.exec()
			.then(function(e)
		{
			applied = [];
			e.forEach(function(app)
			{
				applied[app["project-id"]] = app["identifier"];
			});
			//First get the number
			Project.count()
				.lean()
				.exec()
				.then(function(err,number)
			{
				//See if there are any projects in this offset
				maxNumPages = Math.ceil(number / config.LIMIT);
				if(offset > maxNumPages)
					res.render('project-404');
				//there are!
				else
				{
					//We don't want the previous page projects.
					Project.skip(config.LIMIT * req.params.offset)
						.limit(config.LIMIT)
						.find()
						.lean()
						.exec()
						.then(function(errr,projects)
					{
						projects.forEach(function(project,index)
						{
							if(applied[project.id])
								project.applied = applied[project.id];
							projects[index] = project;
						});
						//We're definitely going to need pagination!
						//@todo: implement pagination
						res.locals.pagination =
						{
							needed:true,
							number: Math.ceil(number / config.LIMIT),
							current: req.params.offset // already known
						};
						res.locals.projects = projects;
						res.render('project-listing');
					});
				}
			});
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}
});

module.exports = router;