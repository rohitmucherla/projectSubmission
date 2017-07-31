const express = require('express'),
	config = require('../../config'),
	loop = require('../../bin/project-loop'),
	router = express.Router();

router.get('/',function(req, res)
{
	loop(1,config.LIMIT,null,false,true).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			all:true
		};
		res.locals.headerTitle = "Projects";
		res.locals.title = "Projects";
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

router.get('/approved',function(req,res)
{
	loop(1,config.LIMIT,null,false,false,1).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			approved:true
		};
		res.locals.headerTitle = "Approved Projects";
		res.locals.title = "Approved Projects";
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

router.get('/approved/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		res.status(404).render('404');
		return;
	}

	loop(req.params.offset,config.LIMIT,null,false,false,1).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			approved:true
		};
		res.locals.headerTitle = "Approved Projects";
		res.locals.title = "Approved Projects";
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

router.get('/unapproved',function(req,res)
{
	loop(1,config.LIMIT,null,false,false,0).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			unapproved:true
		};
		res.locals.headerTitle = "Unapproved Projects";
		res.locals.title = "Unapproved Projects";
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

router.get('/unapproved/:offset',function(req,res)
{
	if(!parseInt(req.params.offset))
	{
		res.status(404).render('404');
		return;
	}

	loop(req.params.offset,config.LIMIT,null,false,false,0).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			unapproved:true
		};
		res.locals.headerTitle = "Unapproved Projects";
		res.locals.title = "Unapproved Projects";
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

	loop(req.params.offset,config.LIMIT,null,false,true).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {
			all:true
		};
		res.locals.title = "Projects";
		res.locals.headerTitle = "Projects";
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