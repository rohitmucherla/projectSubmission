const express = require('express'),
	config = require('../../config'),
	router = express.Router();

let Project = require(`../../${config.db.path}/project.js`),
	mailer = require('../../bin/mailer');

router.use(config.functions.requireAdminLogin);
router.use(function(req,res,next)
{
	res.locals.single = true;
	next();
});

router.get('/',function(req, res)
{
	res.redirect('/admin/projects');
});

router.get('/:id',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.locals.projects = [];
		res.render('project-listing');
		return;
	}
	Project.findById(id)
		.lean()
		.exec()
		.then(function(project)
	{
		res.locals.projects = [project];
		res.render('project-listing');
	}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.get('/:id/approve',function(req,res)
{
	res.locals.item = {lower:'project',upper:'Project'};
	res.render('wait-csrf');
});

router.post('/:id/approve',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.locals.projects = [];
		res.render('project-listing');
		return;
	}
	Project.findById(id)
		.populate('owners','name email slack')
		.exec()
		.then(function(project)
	{
		if(!project || project.status > 0)
		{
			res.locals.project = [];
			res.render('project-listing');
			return;
		}
		project.owners.forEach(function(user)
		{
			let options = {
				to: `"${user.name.full.replace(/"/g,'"')}" <${user.email}>`,
				subject: `Your Project "${project.name}" has been approved`,
				body: `Hey ${user.name.first},<br/><br/> We just wanted to let you know that your project "${project.name}" has been approved. The project is now public, and anyone can apply to it. Admins will approve / reject applications to work on this project based on a variety of criteria, and if necessary, DM you on slack (<a href='${config.slack}.slack.com/team/${user.slack}'>@${user.slack})</a>.<br/><br/>- The Project Submission Bot`
			}
			mailer(options).catch((e)=>{console.error(`Failed to send email to ${user.email} (${user._id}) - project approval - ${project._id}`)});
		});
		project.status = 1;
		project.save().then(function()
		{
			req.flash('success',`Project "${project.name}" Approved!`);
			res.redirect('/admin/projects');
		}).catch((e)=>res.status(500).render('error',{error:e}));

	}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.get('/:id/reject',function(req,res)
{
	res.locals.item = {lower:'project',upper:'Project'};
	res.render('wait-csrf-reject');
});

router.post('/:id/reject',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.locals.projects = [];
		res.render('project-listing');
		return;
	}
	Project.findById(id)
		.populate('owners','name email slack')
		.exec()
		.then(function(project)
	{
		let notes = false;
		if(req.body.why)
		{
			notes = config.functions.sanitize(req.body.why);
			project.statusNotes = notes;
		}
		if(!project || project.status > 0)
		{
			res.locals.project = [];
			res.render('project-listing');
			return;
		}
		project.owners.forEach(function(user)
		{
			let options = {
				to: `"${user.name.full.replace(/"/g,'"')}" <${user.email}>`,
				subject: `Your Project "${project.name}" has been rejected`,
				body: `Hey ${user.name.first},<br/><br/> We just wanted to let you know that your project "${project.name}" has been rejected. The admin that rejected this project said the following:<br/> ${notes || '[nothing]'}<br/><br/>- The Project Submission Bot`
			}
			mailer(options).catch((e)=>{console.error(`Failed to send email to ${user.email} (${user._id}) - project approval - ${project._id}`)});
		});
		project.status = -2;
		project.save().then(function()
		{
			req.flash('success',`Project "${project.name}" Rejected!`);
			res.redirect('/admin/projects');
		}).catch((e)=>res.status(500).render('error',{error:e}));

	}).catch((e)=>{res.status(500).render('error',{error:e})});
});

module.exports = router;