const express = require('express'),
	console = require('tracer').colorConsole(),
	loop = require('../../bin/application-loop')
	router = express.Router(),
	config = require('../../config');

let Project = require(`../../${config.db.path}/project`),
	Applicaton = require(`../../${config.db.path}/application`);

router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	loop(1,config.LIMIT).then(function(applicationData)
	{
		console.log(applicationData);
		for(key in applicationData)
		{
			res.locals[key] = applicationData[key];
		}
		res.locals.title = "Applications";
		res.locals.header = "Applications";
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
		res.locals.title = `Page ${req.params.offset} - Applications`;
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