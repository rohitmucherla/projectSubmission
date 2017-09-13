const express = require('express'),
	router = express.Router(),
	config = require('../../config');


User = require(`../../${config.db.path}/user.js`);
Project = require(`../../${config.db.path}/project.js`);

router.use(config.functions.requireAdminLogin);

//Display the profile of user `id`; the `:` denotes a variable (stored in req.params)
router.get('/:id',function(req,res)
{
	let location = config.functions.mongooseId(req.params.id) ? '_id' : 'gid',
		query = {[location]:req.params.id}
	User.findOne(query)
		.populate('owner')
		.populate('manager')
		.populate('developer')
		.lean()
		.exec()
		.then(function(user)
	{
		res.locals.userData = user;
		res.render('admin-user-single');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Approve user `id`
router.get('/:id/approve',function(req,res)
{
	res.locals.item = {lower:'user',upper:'User'};
	res.render('wait-csrf');
});

router.post('/:id/approve',function(req,res)
{
	User.findOne()
		.where('gid').in(req.params.id)
		.exec()
		.then(function(user)
	{
		if(!user)
		{
			res.locals.user = [];
			res.render('admin-users');
			return;
		}
		if(user.approved)
		{
			req.flash('error',`${user.name.full} is already approved!`)
			res.redirect('/admin/users');
			return;
		}
		else
		{
			user.approved = true;
			user.limit = config.LIMIT || 10;
			user.save().then(function()
			{
				req.flash('success',`User ${user.name.full} approved!`);
				res.redirect('/admin/users');
			}).catch((error)=>{res.status(500).render('error',{error:error})});
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Delete user `id`
router.get('/:id/delete',function(req,res)
{
	let location = config.functions.mongooseId(req.params.id) ? '_id' : 'gid',
		query = {[location]:req.params.id};
	User.findOne(query)
		.lean()
		.select('name')
		.exec()
		.then(function(user)
		{
			res.locals.userData = user ? user : null;
			res.render('user-delete');
		}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.post('/:id/delete',function(req,res)
{
	let location = config.functions.mongooseId(req.params.id) ? '_id' : 'gid',
		query = {[location]:req.params.id}
	//@todo add csrf token
	User.findOne(query)
		.populate('workingOn')
		.populate('owner')
		.exec()
		.then(function(user)
	{
		if(!user)
		{
			res.locals.user = null;
			res.render('admin-users');
			return;
		}
		//@todo: Error checking
		user.status = -1;
		user.token = '';
		user.name = {first:'',last:'',full:''};
		user.company = '';
		user.isPublic = false;
		user.github = null;
		user.slack = null;
		user.website = 'https://tamu.edu';
		user.headline = null;
		user.access = -1;
		user.approved = false;
		user.pic = '/img/transparent.png';
		user.limit = 0;

		user.workingOn.forEach(function(project)
		{
			let index = project.managers.indexOf(user._id);
			if(index > -1)
				project.managers.splice(index,1);
			index = project.developers.indexOf(user._id);
			if(index > -1)
				project.developers.splice(index,1);
			project.save().catch((e)=>{res.status(500).render('error',{error:e})});
		});
		user.owner.forEach(function(project)
		{
			if(project.owners.length <= 1)
				Project.findById(project._id).remove().exec().catch((e)=>{res.status(500).render('error',{error:e})});
		});
		user.owner = user.workingOn = [];
		user.save().then(function()
		{
			req.flash('success','Deleted User');
			res.redirect('/admin/users');
		}).catch((e)=>{res.status(500).render('error',{error:e})})
	}).catch((error)=>{res.status(500).render('error',{error:error})});
})

router.get('/:id/applications',function(req,res)
{
	let location = config.functions.mongooseId(req.params.id) ? '_id' : 'gid',
		query = {[location]:req.params.id}
	User.findOne(query)
		.select('name')
		.lean()
		.exec()
		.then(function(user)
	{
		if(!user)
		{
			res.locals.applications = [];
			res.render('profile-application-list');
		}
		Application.find()
			.lean()
			.where("user-id").equals(user._id)
			.populate('project-id','name')
			.exec()
			.then(function(applications)
		{
			//@todo: add pagination
			res.locals.id = user.gid;
			res.locals.applications = applications ? applications : null;
			res.locals.header = user.name.full + "'s";
			res.render('profile-application-list');
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
})

module.exports = router;