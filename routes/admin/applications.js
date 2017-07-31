const express = require('express'),
	console = require('tracer').colorConsole(),
	loop = require('../../bin/application-loop')
	router = express.Router(),
	config = require('../../config');

router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	loop(1,config.LIMIT).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.title = "Applications";
		res.locals.header = "All";
		res.locals.active = {all:true};
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});
router.get('/approved',function(req,res)
{
	loop(1,config.LIMIT,1).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.active = {approved:true};
		res.locals.title = "Approved Applications";
		res.locals.header = "Approved";
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});
router.get('/approved/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		//assume the input was meant for application and move on with life
		res.redirect(`/admin/application/${req.params.offset}`);
		return;
	}
	loop(req.params.offset,config.LIMIT).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.active = {approved:true};
		res.locals.title = `Page ${req.params.offset} - Approved Applications (Page ${req.params.offset})`;
		res.locals.header = `Approved`;
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});
router.get('/unapproved',function(req,res)
{
	loop(1,config.LIMIT).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.active = {unapproved:true};
		res.locals.title = "Unapproved Applications";
		res.locals.header = "Unapproved";
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});
router.get('/unapproved/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		//assume the input was meant for application and move on with life
		res.redirect(`/admin/application/${req.params.offset}`);
		return;
	}
	loop(req.params.offset,config.LIMIT,0).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.active = {unapproved:true};
		res.locals.title = `Page ${req.params.offset} - Unapproved Applications`;
		res.locals.header = "Unapproved";
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});
//@todo: normalize query (see / logic)
router.get('/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		//assume the input was meant for application and move on with life
		res.redirect(`/admin/application/${req.params.offset}`);
		return;
	}

	loop(req.params.offset,config.LIMIT).then(function(applicationData)
	{
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.active = {all:true};
		res.locals.title = `Page ${req.params.offset} - Applications`;
		res.locals.header = `All`
		res.render('profile-application-list');
	}).catch(function(error)
	{
		if(error == 'NO_APPLICATIONS_FOUND')
		{
			res.render('application-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});

module.exports = router;