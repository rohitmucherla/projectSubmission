const express = require('express'),
	router = express.Router(),
	config = require('../../config.js');

User = require(`../../${config.db.path}/user.js`);

router.use(config.functions.requireAdminLogin);

//List all users
router.get('/',function(req,res)
{
	User.find()
		.lean()
		.limit(config.LIMIT)
		.select('gid pic name email approved')
		.exec()
		.then(function(users)
	{
		res.locals.users = users;
		res.render('admin-users');
	}).catch((e)=>{res.status(500).render('error',{error:e})});
});

//List users who have created an account but have not been approved by admins
router.get('/unapproved',function(req,res)
{
	User.find()
		.where('approved').equals(0)
		.lean()
		.select('gid pic name email approved')
		.exec()
		.then(function(users)
	{
		if(users.length)
		{
			res.locals.users = users;
			res.locals.type = "Unapproved";
			res.render('admin-users');
		}
		else
		{
			res.render('user-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/approved',function(req,res)
{
	User.find()
		.where('approved').equals(1)
		.lean()
		.select('gid pic name email approved')
		.exec()
		.then(function(users)
	{
		if(users.length)
		{
			res.locals.users = users;
			res.locals.type = "Approved";
			res.render('admin-users');
		}
		else
		{
			res.render('user-404');
		}
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

router.get('/search',function(req,res)
{
	if(!req.query.query)
	{
		res.locals.type = 'Search for'
		res.render('admin-users');
	}
	else
	{
		search = new RegExp(req.query.query, "i");
		User.find()
		.or([{'name.first':search},{'name.last':search},{'name.full':search}])
		.lean()
		.select('gid pic name email approved')
		.exec()
		.then(function(users)
		{
			if(users.length)
			{
				res.locals.users = users;
				res.locals.type = "Search for";
				res.locals.search = req.query.query;
				res.render('admin-users');
			}
			else
			{
				res.render('user-404');
			}
		}).catch((error)=>{res.status(500).render('error',{error:error})});
	}
})

module.exports = router;