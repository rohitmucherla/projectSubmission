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
	User.findOne()
		.where('gid').in(req.params.id)
		.lean()
		.exec()
		.then(function(user)
	{
		if(!user)
		{
			res.render("error",{error:{status:404,message:"User not found."}})
			return;
		}
		if(user.approved)
		{
			req.flash('error',`${user.name} is already approved!`)
			res.render('index');
		}
		else
		{
			user.approved = true;
			user.save().then(function()
			{
				req.flash('success',`User ${user.name} approved!`);
				res.render('index');
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
			if(user)
			{
				res.locals.userData = user;
				res.render('user-delete');
			}
			else
			{
				res.render('user-404');
			}
		}).catch((e)=>{res.status(500).render('error',{error:e})});
});

router.post('/:id/delete',function(req,res)
{
	let location = config.functions.mongooseId(req.params.id) ? '_id' : 'gid',
		query = {[location]:req.params.id}
	//@todo add csrf token
	User.findOne(query)
		.remove()
		.exec()
		.then(function(b)
	{
		//@todo: Error checking
		req.flash('success','Deleted User');
		res.render('index');
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
		Application.find()
			.lean()
			.where("user-id").equals(user._id)
			.populate('project-id','name')
			.exec()
			.then(function(applications)
		{
			if(!applications.length)
			{
				res.render('application-404');
				return;
			}
			//@todo: add pagination
			res.locals.applications = applications;
			res.locals.header = user.name.full + "'s";
			res.render('profile-application-list');
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
})

module.exports = router;