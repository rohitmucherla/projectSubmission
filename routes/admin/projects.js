const express = require('express'),
	config = require('../../config'),
	loop = require('../../bin/project-loop'),
	router = express.Router();

	router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	status = req.query.noFilter == '1' ? null:{$gte:-1}
	loop(1,config.LIMIT,null,false,true,status).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {all:true};
		res.locals.header = "Projects";
		res.locals.title = "Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/approved',function(req,res)
{
	loop(1,config.LIMIT,null,false,false,1).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {approved:true};
		res.locals.header = "Approved Projects";
		res.locals.title = "Approved Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/approved/:offset',function(req,res)
{
	if(!req.params.offset.match(/^\d+$/))
	{
		res.locals.projects = [];
		res.locals.title = "Error";
		res.status(404).render('project-listing');
		return;
	}

	loop(req.params.offset,config.LIMIT,null,false,false,1).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {approved:true};
		res.locals.header = "Approved Projects";
		res.locals.title = "Approved Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/unapproved',function(req,res)
{
	loop(1,config.LIMIT,null,false,false,0).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {unapproved:true};
		res.locals.header = "Unapproved Projects";
		res.locals.title = "Unapproved Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/unapproved/:offset',function(req,res)
{
	if(!req.params.offset.match(/^\d+$/))
	{
		res.locals.projects = [];
		res.locals.title = "Error";
		res.status(404).render('project-listing');
		return;
	}

	loop(req.params.offset,config.LIMIT,null,false,false,0).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {unapproved:true};
		res.locals.header = "Unapproved Projects";
		res.locals.title = "Unapproved Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/:offset',function(req,res)
{
	if(!req.params.offset.match(/^\d+$/))
	{
		res.locals.projects = [];
		res.locals.title = "Error";
		res.status(404).render('project-listing');
		return;
	}

	status = req.query.noFilter == '1' ? null:{$gte:-1}
	loop(req.params.offset,config.LIMIT,null,false,true,status).then(function(projectData)
	{
		for(key in projectData)
		{
			res.locals[key] = projectData[key];
		}
		res.locals.active = {all:true};
		res.locals.title = "Projects";
		res.locals.header = "Projects";
		res.render('project-listing');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

module.exports = router;