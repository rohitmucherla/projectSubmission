const express = require('express'),
	router = express.Router(),
	config = require('../../config.js');

User = require(`../../${config.db.path}/user.js`);

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
		res.render('admin-users',{users:users});
	}).catch(config.db.onError);
});

//List users who have created an account but have not been approved by admins
router.get('/unverified',function(req,res)
{
	User.find()
		.lean()
		.where('approved').is(0)
		.select('gid pic name email approved')
		.limit(config.LIMIT)
		.exec()
		.then(function(users)
	{
		res.render('admin-users',{users:users,type:"Unverified"});
	}).catch((error)=>{res.status(500).render('error',{error:error})});
});

module.exports = router;