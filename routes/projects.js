const express = require('express'),
	console = require('tracer').colorConsole(),
	loop = require('../bin/project-loop')
	router = express.Router(),
	config = require('../config');

let Project = require(`../${config.db.path}/project`),
	Applicaton = require(`../${config.db.path}/application`);

router.use(config.functions.requireLogin);

router.get('/',function(req, res)
{
	loop(1,config.LIMIT,req.user._id,true,false).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.title = "Projects";
		res.render('project-listing');
	}).catch((error) =>
	{
		if(error == 'NO_PROJECTS_FOUND')
		{
			res.render('project-404');
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
		//assume the input was meant for project and move on with life
		res.redirect(`/project/${req.params.offset}`);
		return;
	}

	loop(req.params.offset,config.LIMIT,req.user._id,true,false).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.title = `Page ${req.params.offset} - Projects`;
		res.render('project-listing');
	}).catch(function(error)
	{
		if(error == 'NO_PROJECTS_FOUND')
		{
			res.render('project-404');
		}
		else
		{
			res.status(500).render('error',{error:error});
		}
	});
});

module.exports = router;