const express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	getSlug = require('speakingurl');

var Project = require('../project'),
	Application = require('../application'),
	projectSchema = require('mongoose').model('Project').schema;

router.use(checkLogin);

router.get('/',function(req, res)
{
	res.redirect('../projects');
});

//User wants to create a project
router.get('/create',function(req,res)
{
	res.render('project-create',{user:req.user});
})

//User has submitted form with project details
router.post('/create',function(req,res)
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
			res.render('project-create',
			{
				errors:result.mapped(),
				langs:req.body.langs //@todo: Update chips in project-create w/ langs value
			});
		}
		else
		{
			//Create new project
			var project = new Project();

			//Set project data
			project.id = mongoose.Types.ObjectId();
			project.name = req.sanitize('name').escapeAndTrim();
			project.description = req.sanitize('description').escapeAndTrim();
			project.abstract = req.sanitize('abstract').escapeAndTrim();
			project.owners = [req.user.gid]; //As array
			project.created = Date.now() + 15; //Add 15ms for execution time
			project.languages = req.sanitize('langs').escapeAndTrim().split(',') || [];
			project.status = 0; //Unapproved
			project.paid = req.body.paid == "on" ? 1 : 0;
			project.numberOfPeople = req.sanitize('number-of-people').toInt();
			project.save(function(err)
			{
				if(err)
					res.status(500).render('error',{error:err}); //@todo: Create error page for saving
				else
					res.redirect(`/project/${project.id}`);
			});
		}
	});
});

router.get('/:id',function(req,res)
{
	Project.findOne({id:req.params.id}).lean().exec().then(function(project)
	{
		res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/view`);
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id-:name/view',function(req,res)
{
	Project.findOne({id:req.params.id}).lean().exec().then(function(project)
	{
		if(req.params.name == getSlug(project.name))
		{
			Application.findOne()
				.where('project-id').in(req.params.id)
				.where('user-id').in(req.user.gid)
				.lean()
				.exec()
				.then(function(app)
			{
				if(app)
					project.applied = app.identifier;
				req.session.back = {name:project.name,url:`/project/${req.params.id}-${getSlug(project.name)}/view`};
				res.render('project-listing',{projects:[project]});
			}).catch((error)=>{res.status(500).render('error',{error:error})});
		}
		else
		{
			res.redirect('/project/${req.params.id}-${getSlug(project.name)}/view');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id/view',function(req,res)
{
	Project.findOne({id:req.params.id}).lean().exec().then(function(project)
	{
		res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/view`);
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id-:name/apply',function(req,res)
{
	Application.findOne({"user-id":req.user.gid,"project-id":req.params.id}).lean().exec().then(function(results)
	{
		if(results)
		{
			res.redirect(`/profile/application/${req.params.id}/edit`);
		}
		else
		{
			Project.findOne().where('id').in(req.params.id).lean().exec().then(function(project)
			{
				res.render('project-apply',{project:project});
			}).catch((error)=>{res.status(500).render('error',{error:error})});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:id/apply',function(req,res)
{
	Project.findOne({id:req.params.id}).lean().exec().then(function(project)
	{
		res.redirect(`/project/${req.params.id}-${getSlug(project.name)}/apply`);
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.post('/:id-:name/apply',function(req,res)
{
	Application.findOne({"user-id":req.user.gid,"project-id":req.params.id}).lean().exec().then(function(results)
	{
		if(results)
		{
			res.redirect(`/profile/application/${req.params.id}/edit`);
		}
		else
		{
			Project.find().limit(1).lean().exec().then(function(data)
			{
				if(data.length)
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
							res.render('project-apply',
							{
								errors:result.mapped(),
							});
						}
						else
						{
							//Create new app
							var application = new Application();

							//Set app data
							application["identifier"] = mongoose.Types.ObjectId();
							application["project-id"] = req.params.id; //We already know the project exists
							application["user-id"] = req.user.gid;
							application["level-of-interest"] = req.sanitize('level-of-interest').toInt();
							application["skills"] = req.sanitize('ranking').toInt();
							application["time"] = req.sanitize('availability').toInt();
							application["notes"] = req.sanitize('notes').escapeAndTrim();
							application["status"] = 0;
							application["statusNotes"] = "Waiting for review";
							application.save(function(err)
							{
								if(err)
									res.status(500).render('error',{error:err}); //@todo: Create error page for saving
								else
									res.redirect(`/profile/application/${application.identifier}`);
							});
						}
					});
				}
				else
				{
					req.render('project-404');
				}
			}).catch((error)=>{res.status(500).render('error',{error:error})})
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

function checkLogin(req,res,next)
{
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