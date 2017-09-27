const express = require('express'),
	config = require('../../config'),
	router = express.Router();

let Application = require(`../../${config.db.path}/application`),
	User = require(`../../${config.db.path}/user`);

router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	res.send('ok');
});

router.get('/:id',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}
	res.redirect(`/admin/application/${req.params.id}/view`);
});

router.get('/:id/view',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}
	Application.findById(req.params.id)
		.populate('project-id')
		.populate('user-id')
		.lean()
		.exec()
		.then(function(application)
	{
		res.locals.applications = application ? [application] : [];
		res.render('profile-application-list');
	})
});

router.get('/:id/approve',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}
	res.locals.title = "Approve Application";
	res.render('wait-csrf');

});

router.get('/:id/reject',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}
	res.locals.title = "Reject Application";
	res.render('wait-csrf-reject');
});

router.post('/:id/approve',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}

});

router.post('/:id/reject',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	res.locals.single = true;
	if(!(id))
	{
		res.locals.applications = []
		res.render('profile-application-list');
		return;
	}

});
module.exports = router;