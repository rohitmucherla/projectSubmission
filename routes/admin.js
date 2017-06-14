/*
* Admin Routes - URIs used for administration
*/

const express = require('express'),
	router = express.Router(),
	config = require('../config'), //Global Configuration
	mongoose = require('mongoose'), //Database
	User = require('../user'), //User Database Schema
	Apps = require('../application');


router.use(checkYoSelf); //Ensure user is logged in and can be in the admin area before doing anything

router.get('/',function(req, res)
{
	res.send('You can be here.');
});

//List all users
router.get('/users',function(req,res)
{
	User.find({},'gid pic name email approved').then(function(users)
	{
		res.render('admin-users',{users:users});
	});
});

//List users who have created an account but have not been approved by admins
router.get('/users/unverified',function(req,res)
{
	User.find()
		.lean()
		.where('approved').is(false)
		.select('gid pic name email approved')
		.exec()
		.then(function(users)
	{
		res.render('admin-users',{users:users,type:"Unverified"});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Display the profile of user `id`; the `:` denotes a variable (stored in req.params)
router.get('/user/:id/',function(req,res)
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
router.get('/user/:id/projects',function(req,res)
{
	res.render('index');
});

//Approve user `id`
router.get('/user/:id/approve',function(req,res)
{
	User.findOne().where('gid').in(req.params.id).lean().exec().then(function(user)
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
				}).catch((error)=>{res.status(500).render('error',{error:error})});
			}
		}
		else
		{
			res.render("error",{error:{status:404,message:"User not found."}})
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

//Delete user `id`
router.get('/user/:id/delete',function(req,res)
{
	User.findOne({'gid':req.params.id}).remove(function(error,b)
	{
		//@todo: Error checking
		req.flash('success','Deleted User');
		res.render('index');
	})
});

router.get('/projects',function(req,res)
{
	res.send('Project for loop');
});

router.get('/project/:id',function(req,res)
{
	res.send('Single project info page');
});

router.get('/projects/unapproved',function(req,res)
{
	res.send('Projects that people submit but aren\'t approved');
});

router.get('/projects/assigner',function(req,res)
{
	Apps.find({}).limit(10).then(function(app)
	{
		app.forEach(function(a,b,c)
		{
			console.warn(a,b,c);
		});
		res.render('admin-project-assigner',{apps:app});
	});
});

function checkYoSelf(req,res,next)
{
	//Passport middleware adds user to the req object. If it doesn't exist, the client isn't logged in
	if(!req.user)
	{
		//Set redirect URL to the requested url
		req.session.redirectTo = req.originalUrl;
		//Redirect to the Google Authentication page
		res.redirect('/auth/google');
	}
	else
	{
		//Admins have access > 10
		if(req.user.access < 10)
			res.render('admin-block');
		//Move on
		else
			next();
	}
}

module.exports = router;