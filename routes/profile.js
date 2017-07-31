/*
* Profile Page
*/
const express = require('express'),
	console = require('tracer').colorConsole(),
	router = express.Router(),
	config = require('../config');

Application = require(`../${config.db.path}/application`);
Project = require(`../${config.db.path}/project`);

router.use(config.functions.requireLogin);

router.get('/',function(req, res)
{
	res.locals.userData = res.locals.user;
	res.render('profile');
});

router.get('/edit',function(req,res)
{
	res.render('profile-edit');
});

router.post('/edit',function(req,res)
{
	let params = ['headline','github','slack','website','company'],
		broken = false;
	params.forEach(function(param)
	{
		if(!req.body[param])
		{
			broken = true;
			res.redirect('/profile/edit');
			return;
		}
	});
	if(broken) return;
	let validationSchema = {
		"headline": {
			optional: {
				options: [{ checkFalsy: true }]
			},
			isLength: {
				options:[{min:10,max:120}],
				errorMessage: "If you're going to have a headline, please keep it between 10 and 120 characters"
			}
		},
		"github": {
			optional: {
				options: [{ checkFalsy: true }]
			},
			matches: {
				options: User.schema.tree.github.match,
				errorMessage: 'Something\'s funky with your GitHub username'
			}
		},
		"slack": {
			optional: {
				options: [{ checkFalsy: true }]
			},
			matches: {
				options: User.schema.tree.slack.match,
				errorMessage: 'Something\'s funky with your Slack username'
			}
		},
		"website": {
			optional: {
				options: [{ checkFalsy: true }]
			},
			matches: {
				options: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
				errorMessage: 'Your website isn\'t valid'
			}
		}
	}
	req.checkBody(validationSchema);
	req.getValidationResult().then(function(result)
	{
		if(result.isEmpty())
		{
			User.findOne()
				.where('gid').equals(req.user.gid)
				.exec()
				.then(function(user)
			{
				if(user)
				{
					user.headline = req.sanitize('headline').escapeAndTrim();
					user.github   = req.sanitize('github').escapeAndTrim();
					user.slack    = req.sanitize('slack').escapeAndTrim();
					user.website  = req.sanitize('website').trim(); //@todo hack this
					user.company  = req.sanitize('company').escapeAndTrim();
					user.save().then(function(use)
					{
						console.log(use);
						res.redirect('/profile');
					}).catch((e)=>{res.status(500).render('error',{error:e})});
				}
				else
				{
					res.locals.errorHeader = "Catastrophic Error Occurred";
					res.locals.errorMessage = "<p class=\"flow-text\">Our mind was just blown and we're questioning the meaning of life. Somehow we can't find your profile</p>";
					res.status(500).render('custom-error')
				}
			}).catch((E)=>{res.status(500).render('error',{error:E})});
		}
		else
		{
			res.locals.errors = result.mapped();
			params.forEach(function(item)
			{
				if(!res.locals.errors[item])
				{
					res.locals.errors[item] = {
						'param' : item,
						'msg': undefined,
						'value': req.body[item]
					};
				}
			});
			res.render('profile-edit');
		}
	}).catch((e)=>{req.status(500).render('error',{error:e})});
});

router.get('/applications',function(req,res)
{
	Application.find()
		.where("user-id").equals(req.user.gid)
		.limit(config.LIMIT)
		.populate('project-id','name')
		.lean()
		.exec()
		.then(function(applications)
	{
		if(applications)
		{
			if(res.locals.back && (res.locals.back.name == "Your Applications"))
			{
				delete req.session.back;
				delete res.locals.back;
			}
			else
			{
				req.session.back = {name:"Your Applications",url:"/profile/applications"};
			}
			res.locals.applications = applications;
			Application.count()
				.where('user-id').equals(req.user.gid)
				.lean()
				.exec()
				.then(function(number)
			{
				res.locals.pagination = (number > config.LIMIT) ?
					{needed:true, number: Math.ceil(number / config.LIMIT), current:1} :
					{needed:false};
				res.render('profile-application-list')
			}).catch((error)=>{res.status(500).render('error',{error:error});});
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
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('application-404');
		return;
	}
	Application.findById(id)
		.where('user-id').equals(req.user.gid)
		.lean()
		.exec()
		.then(function(application)
	{
		if(application)
		{
			Project.findById(application['project-id'])
				.select('name')
				.lean()
				.exec()
				.then(function(project)
			{
				if(project)
				{
					application.projectName = project.name;
					res.locals.pagination = {needed:false};
					res.locals.applications = [application];
					res.render('profile-application-list');
				}
				else
				{
					res.locals.errorHeader = "Unexpected Error Occurred";
					res.locals.errorMessage = `<p class="flow-text">We were able to find your application, but are unable to find the project linked to it. Please <a href="mailto:${config.email.adminEmail}?subject=Trouble%20viewing%20application%20${application._id}" target="_blank">Email us</a> so we can fix it! Be sure to include the application identifier <strong>${application._id}</strong></p>`;
					res.render('custom-error');
				}
			});
		}
		else
		{
			res.locals.single = true;
			res.render('application-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/application/:id/edit',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('application-404');
		return;
	}
	Application.findById(id)
		.where('user-id').in(req.user.gid)
		.lean()
		.exec()
		.then(function(application)
	{
		if(application)
		{
			res.send('ok');
		}
		else
		{
			res.locals.single = true;
			res.render('application-404')
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/projects',function(req,res)
{
	Project.find()
		.where('_id').in(req.user.owner)
		.lean()
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
	}).catch((err)=>{res.status(500).render('error',{error:err})});
});

router.get('/submitted',function(req,res)
{
	User.findOne()
		.where('gid').equals(req.user.gid)
		.populate('owner')
		.select('name owner')
		.lean()
		.exec()
		.then(function(user)
	{
		res.locals.headerTitle = `Your submitted projects`;
		res.locals.projects = user.owner;
		res.render('project-listing');
	}).catch((err)=>{res.status(500).render('error',{error:err})});
});

router.get('/:id/projects',function(req,res)
{
	res.redirect(`/profile/${req.params.id}/`);
})

router.get('/:id/projects/submitted',function(req,res)
{
	if(req.params.id == req.user.gid)
	{
		res.redirect('/profile/submitted');
		return;
	}
	User.findOne()
		.where('gid').equals(req.params.id)
		.lean()
		.exec()
		.then(function(user)
		{
			if(user.isPublic)
			{
				res.locals.errorHeader = "This feature is not available";
				res.locals.errorMessage = "We would love to show you projects this user has submitted, but the logistics are the works! This might show up in the future!";
				res.render('custom-error');
			}
			else
			{
				res.locals.userData = user;
				res.render('profile');
			}
		}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.get('/:id',function(req,res)
{
	if(req.params.id == req.user.gid)
	{
		res.redirect('/profile');
		return;
	}
	User.findOne()
		.where('gid').equals(req.params.id)
		.lean()
		.exec()
		.then(function(user)
	{
		if(user)
		{
			res.locals.userData = user;
			res.render('profile');
		}
		else
		{
			res.render('user-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

module.exports = router;