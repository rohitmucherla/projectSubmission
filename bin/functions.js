const mongoose = require('mongoose');
functions = {
	requireAdminLogin: function(req,res,next)
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
	},
	requireLogin: function(req,res,next)
	{
		//Passport middleware adds user to the req object. If it doesn't exist, the client isn't logged in
		if(!req.user)
		{
			//Set redirect URL to the requested url
			req.session.redirectTo = req.originalUrl;
			//Redirect to the Google Authentication page
			res.redirect('/auth/google');
		}
		else next();
	},
	mongooseId: function(attempt)
	{
		let ret;
		try
		{
			ret = mongoose.Types.ObjectId(attempt)
		}
		catch(E)
		{
			ret = undefined;
		}
		return ret;
	}
}
module.exports = functions;