/*
* Admin Routes - URIs used for administration
*/

const express = require('express'),
	router = express.Router(),
	config = require('../config'), //Global Configuration
	mongoose = require('mongoose'), //Database
	User = require('../user'); //User Database Schema


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
	User.find({approved:false},'gid pic name email approved').then(function(users)
	{
		res.render('admin-users',{users:users,type:"Unverified"});
	});
});

//Display the profile of user `id`; the `:` denotes a variable (stored in req.params)
router.get('/user/:id/',function(req,res)
{
	res.render('index');
});

//Display projects of user `id`
router.get('/user/:id/projects',function(req,res)
{
	res.render('index');
});

//Approve user `id`
router.get('/user/:id/approve',function(req,res)
{
	User.findOne({'gid':req.params.id},function(err, user)
	{
		if(err)
			res.render('error',{error:err});
		if(user)
		{
			if(user.approved)
			{
				res.render('index',{flash:`${user.name} is already approved!`});
			}
			else
			{
				user.approved = true;
				user.save();
				res.render('index',{flash:`User ${user.name} approved!`});
			}
		}
		else
		{
			res.status(404).render("error",{error:{status:404,message:"User not found."}})
		}
	});
});

//Delete user `id`
router.get('/user/:id/delete',function(req,res)
{
	User.findOne({'gid':req.params.id}).remove(function(error,b)
	{
		//@todo: Error checking
		res.render('index',{flash:"Deleted User."});
	})
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