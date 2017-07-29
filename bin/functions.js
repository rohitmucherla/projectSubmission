const mongoose = require('mongoose');
functions = {
	sanitize: function(what)
	{
		//escape code
		what = what.replace(/&/g, '&amp;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#x27;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/\//g, '&#x2F;')
				.replace(/\\/g, '&#x5C;')
				.replace(/`/g, '&#96;');
		let idx = what.length - 1, pattern = new RegExp("/\s/");
		while (idx >= 0 && pattern.test(what[idx]))
		{
			idx--;
		}

		what = idx < what.length ? what.substr(0, idx + 1) : what;
		return what.replace(/^\s+/g, '');
	},
	isAdmin: function(user)
	{
		return user.access >= 10;
	},
	requireAdminLogin: function(req,res,next)
	{
		//Passport middleware adds user to the req object. If it doesn't exist, the client isn't logged in
		if(!req.user)
		{
			//Set redirect URL to the requested url
			req.session.redirectTo = req.originalUrl;
			if(req.method.toLowerCase() == "post" && req.body)
			{
				formData = '';
				blacklist = ['csrf']; //@todo: update
				for(el in req.body)
				{
					if(blacklist.indexOf(el) < 0)
						formData += `${functions.sanitize(el)}: ${functions.sanitize(req.body[el]) || '[no value]'}<br/>\n`;
				}
				res.locals.content = `<h1 class='center'>You've been logged out</h1><p class='flow-text'>It looks like you were trying to save some data. We didn't save the data (because we don't know who you are), so if it's important to you, take a second to save it.</p><p class="flow-text center">Done? <a class="btn waves-effect" href="/auth/google">Login!</a></p><p>Here is the raw form data that was received:</p><blockquote>${formData}</blockquote></p>`;
				res.render('card');
			}
			else
			{
				//Redirect to the Google Authentication page
				res.redirect('/auth/google');
			}
		}
		else
		{
			//Admins have access > 10
			if(!isAdmin(req.user))
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

			if(req.method.toLowerCase() == "post" && req.body)
			{
				formData = '';
				blacklist = ['csrf']; //@todo: update
				for(el in req.body)
				{
					if(blacklist.indexOf(el) < 0)
						formData += `${functions.sanitize(el)}: ${functions.sanitize(req.body[el]) || '[no value]'}<br/>\n`;
				}
				res.locals.content = `<h1 class='center'>You've been logged out</h1><p class='flow-text'>It looks like you were trying to save some data. We didn't save the data (because we don't know who you are), so if it's important to you, take a second to save it.</p><p class="flow-text center">Done? <a class="btn waves-effect" href="/auth/google">Login!</a></p><p>Here is the raw form data that was received:</p><blockquote>${formData}</blockquote></p>`;
				res.render('card');
			}
			else
			{
				//Redirect to the Google Authentication page
				res.redirect('/auth/google');
			}
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
	},
	canRenderProject: function(project,user)
	{
		//@todo - check what .map returns - maybe we don't need to allocate an extra array for it.
		/*
		* @todo: figure out if we can improve efficiency here
		*  - user._id is a mongoose ObejctID
		*  - project.[owners,managers,developers] are [ObjectID]s,
		*  - project.owners[{{userIndex}}] != user._id
		*/
		allowed = [];
		project.owners
			.concat(project.managers)
			.concat(project.developers)
			.map(function(user)
		{
			allowed.push(user.toString());
		});
		//@endtodo
		userAccess = allowed.includes(user._id.toString());
		return userAccess || (project.status == 0 && functions.isAdmin(user));// || user.access >= 10;
	}
}
module.exports = functions;