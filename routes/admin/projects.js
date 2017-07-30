const express = require('express'),
	config = require('../../config'),
	loop = require('../../bin/project-loop'),
	router = express.Router();

router.get('/',function(req, res)
{
	loop(1,config.LIMIT).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
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

router.get('/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		res.status(404).render('404');
		return;
	}

	loop(1,config.LIMIT).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
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

module.exports = router;