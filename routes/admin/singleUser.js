const express = require('express'),
	router = express.Router(),
	config = require('../../config');

User = require(`../../${config.db.path}/user.js`);
Project = require(`../../${config.db.path}/project.js`);

router.use(config.functions.requireLogin);

//Display the profile of user `id`; the `:` denotes a variable (stored in req.params)
router.get('/:id',function(req,res)
{
	User.findOne()
		.lean()
		.where('gid').in(req.params.id)
		.exec()
		.then(function(user)
	{
		res.render('admin-user-single',{user:user});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Display projects of user `id`
router.get('/:id/projects',function(req,res)
{
	Project.find()
		.where('owners').in([req.params.id])
		.lean()
		.exec()
		.then(function(results)
	{
		res.send('Query executed. Check back later');
	}).catch((error)=>{res.render('error',{error:error})});
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
		if(user)
		{
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
				})
			}
		}
		else
		{
			res.render("error",{error:{status:404,message:"User not found."}})
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Delete user `id`
router.get('/:id/delete',function(req,res)
{
	User.findOne()
		.where('gid').is(req.params.id)
		.remove()
		.exec()
		.then(function(b)
	{
		//@todo: Error checking
		req.flash('success','Deleted User');
		res.render('index');
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

module.exports = router;