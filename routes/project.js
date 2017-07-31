const express = require('express'),
	console = require('tracer').colorConsole(),
	router = express.Router(),
	getSlug = require('speakingurl'),
	config = require('../config');

let Project = require(`../${config.db.path}/project`),
	Application = require(`../${config.db.path}/application`);

router.use(config.functions.requireLogin);

router.get('/',function(req, res)
{
	res.redirect('../projects');
});

//User wants to create a project
router.get('/create',function(req,res)
{
	Project.find()
		.where('owners').in([req.user._id])
		.where('status').equals(0)
		.lean()
		.count()
		.exec()
		.then(function(numProjects)
	{
		if(req.user.limit < 0 || req.user.limit > numProjects)
		{
			res.locals.title = "Create a project";
			res.render('project-create');
		}
		else
		{
			res.locals.content = `<h1 class='center'>Access Denied</h1><p class='flow-text center'>You've exceeded the maximum number of projects you can create. If you want to increase this limit, please <a href='mailto:${config.email.adminEmail}?subject=Increase%20project%20submission%20limit'>email us</a> with an explanation of why you believe your limit should be increased. You can also delete (or edit) some projects</p>`;
			res.render('card');
		}
	}).catch((err)=>{res.status(500).render('error',{error:err})})
})

//User has submitted form with project details
router.post('/create',function(req,res)
{
	Project.find()
		.where('owners').in([req.user._id])
		.where('status').equals(0)
		.lean()
		.count()
		.exec()
		.then(function(numProjects)
	{
		if(req.user.limit < 0 || req.user.limit > numProjects)
		{
			res.status(403).render('admin-block');
		}
		else
		{
			//Validate name
			req.checkBody('name','Name is required')
				.notEmpty()
				.len(2,30).withMessage('Project name must be between 2 and 30 characters');
			//Validate abstract
			req.checkBody('abstract','Abstract is required')
				.notEmpty()
				.len(100,1000).withMessage('Abstract must be between 100 and 1000 characters');
			//Validate description
			req.checkBody('description','Description is required')
				.notEmpty()
				.len(100,100000000).withMessage('Your description is too short');
			//Validate number of people
			req.checkBody('number-of-people','Number of people is required')
				.notEmpty()
				.isInt()
				.between(1,10).withMessage('Number of people must be between 0 and 10');

			req.getValidationResult().then(function(result)
			{
				//There are errors
				if(!result.isEmpty())
				{
					res.locals.errors = result.mapped();
					res.locals.langs = req.body.langs;//@todo: Update chips in project-create w/ langs value
					res.render('project-create');
				}
				else
				{
					langs = req.sanitize('langs').escapeAndTrim().split(',');
					//Create new project
					let project = new Project();

					//Set project data
					project.name = req.sanitize('name').escapeAndTrim();
					project.description = req.sanitize('description').escapeAndTrim();
					project.abstract = req.sanitize('abstract').escapeAndTrim();
					project.owners = [config.functions.mongooseId(req.user._id)]; //As array
					project.created = Date.now() + 15; //Add 15ms for execution time
					project.languages =  (langs == "") ? [] : langs;
					project.status = 0; //Unapproved
					project.paid = req.body.paid == "on" ? 1 : 0;
					project.numberOfPeople = req.sanitize('number-of-people').toInt();
					project.save().then(function()
					{
						User.findOne()
							.where('gid').equals(req.user.gid)
							.exec()
							.then(function(user)
						{
							if(user)
							{
								user.owner.push(config.functions.mongooseId(project._id));
								user.save().then(function()
								{
										res.redirect(`/project/${project.id}`);
								}).catch((err)=>{res.status(500).render('error',{error:err})})
							}
							else
							{
								console.error('***CRITICAL ERROR***:','Nonexistant user created a project! User:',req.user,'Project:',project);
								res.status(500).render('admin-block');
							}
						})
					}).catch((err)=>{res.status(500).render('error',{error:err})})
				}
			});
		}
	}).catch((err)=>{res.status(500).render('error',{error:err})})
});

router.get('/:id',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!id)
	{
		res.render('project-404');
	}
	else
	{
		Project.findById(id)
			.lean()
			.exec()
			.then(function(project)
		{
			if(project)
			{
				res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/view`);
			}
			else
			{
				res.render('project-404');
			}
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}
});

router.get('/:id-:name/view',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!id)
	{
		res.render('project-404');
		return;
	}
	Project.findById(id)
		.lean()
		.exec()
		.then(function(project)
	{
		if(!project)
		{
			res.render('project-404');
			return;
		}
		if(!config.functions.canRenderProject(project,req.user))
		{
			res.locals.content="<h1 class='center'>Access Denied</h1><p class='flow-text'>You don't have permission to view this project</p>"
			res.status(403).render('card');
		}
		if(req.params.name == getSlug(project.name))
		{
			res.locals.title = `${project.name} project details`;
			Application.findOne()
				.lean()
				.where('project-id').equals(config.functions.mongooseId(req.params.id))
				.where('user-id').equals(req.user.gid)
				.exec()
				.then(function(app)
			{
				if(app)
					project.applied = app._id;
				if(res.locals.back && (res.locals.back.name == project.name))
				{
					delete req.session.back;
					delete res.locals.back;
				}
				else
					req.session.back = {name:project.name,url:`/project/${req.params.id}-${getSlug(project.name)}/view`};
				res.locals.projects = [project];
				res.locals.single = true;
				res.render('project-listing');
			});
		}
		else
		{
			res.redirect('/project/${req.params.id}-${getSlug(project.name)}/view');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id/view',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('project-404');
		return;
	}
	Project.findById(id)
		.lean()
		.exec()
		.then(function(project)
	{
		if(project)
			res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/view`);
		else
		{
			res.locals.sinlge = true;
			res.render('project-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id-:name/apply',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('project-404');
		return;
	}
	Application.findOne()
		.lean()
		.where('project-id').equals(config.functions.mongooseId(req.params.id))
		.where('user-id').equals(req.user.gid)
		.exec()
		.then(function(results)
	{
		if(results)
		{
			res.redirect(`/profile/application/${req.params.id}/edit`);
		}
		else
		{
			Project.findById(id)
				.lean()
				.exec()
				.then(function(project)
			{
				if(!config.functions.canRenderProject(project,req.user))
				{
					res.locals.content="<h1 class='center'>Access Denied</h1><p class='flow-text'>You don't have permission to apply to this project</p>"
					res.status(403).render('card');
				}
				if(project)
				{
					res.locals.title = `Apply to work on ${project.name}`;
					res.locals.project = project;
					res.render('project-apply');
				}
				else
				{
					res.locals.single = true;
					res.render('project-404');
				}
			});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id/apply',function(req,res)
{
	id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('project-404');
		return;
	}
	Project.findById(id)
		.lean()
		.exec()
		.then(function(project)
	{
		if(project)
		{
			res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/apply`);
		}
		else
		{
			res.locals.single = true;
			res.render('project-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.post('/:id-:name/apply',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('project-404');
		return;
	}
	Application.findOne()
		.where("project-id").equals(id)
		.where("user-id").equals(req.user.gid)
		.populate('project-id')
		.lean()
		.exec()
		.then(function(results)
	{
		if(results)
		{
			req.session.applicationData = req.body;
			req.flash('warning',`You have already applied to <strong>${results.project}</strong>.`)
			res.redirect(`/profile/application/${req.params.id}/edit?containsData=1`);
		}
		else
		{
			Project
				.findById(id)
				.lean()
				.exec()
				.then(function(project)
			{
				if(!config.functions.canRenderProject(project,req.user))
				{
					res.locals.content="<h1 class='center'>Access Denied</h1><p class='flow-text'>You don't have permission to apply to this project</p>"
					res.status(403).render('card');
					return;
				}
				if(project)
				{
					req.checkBody('level-of-interest','Level of Interest is required')
						.notEmpty()
						.isInt()
						.between(1,10).withMessage('Level of interest is on a scale of 1-10');
					req.checkBody('availability','availability is required')
						.notEmpty()
						.isInt()
						.between(0,20).withMessage('You must be available between 0 and 20 hours a week');
					req.checkBody('ranking',"Ranking the frameworks and languages is required")
						.notEmpty()
						.isInt()
						.between(1,100).withMessage('Ranking the frameworks and languages is on a scale of 1-100');
					req.getValidationResult().then(function(result)
					{
						//There are errors
						if(!result.isEmpty())
						{
							res.locals.errors = result.mapped(); //@todo check if submitted data is persistant for the user
							res.render('project-apply');
						}
						else
						{
							//Create new app
							let application = new Application();

							//Set app data
							application["project-id"] = req.params.id; //We already know the project exists
							application["user-id"] = req.user._id;
							application["level-of-interest"] = req.sanitize('level-of-interest').toInt();
							application["skills"] = req.sanitize('ranking').toInt();
							application["time"] = req.sanitize('availability').toInt();
							application["notes"] = req.sanitize('notes').escapeAndTrim();
							application["status"] = 0;
							application["statusNotes"] = "Waiting for review";
							application.save().then(function()
							{
								res.redirect(`/profile/application/${application._id}`);
							}).catch((err)=>{res.status(500).render('error',{error:err})});
						}
					});
				}
				else
				{
					console.warn(`Could not find project ${id}`)
					res.locals.single = true;
					res.render('project-404');
				}
			});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

module.exports = router;