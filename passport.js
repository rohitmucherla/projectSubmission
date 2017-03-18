const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy, //Allows us to authenticate with Google
config = require('./config'), //Loads global settings
mongoose = require('mongoose'), //Database library
User = require('./user'); //User model for database

mongoose.connect(config.db.conn,config.db.options) //connect to db in the config file

module.exports = function(passport) // make modifications to the passport object
{

	// passport session setup. Required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done)
	{
		console.log('serialize()');
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done)
	{
		User.findById(id, function(err, user)
		{
			console.log('deserialize');
			done(err, user);
		});
	});

	//Actual action of using Google to authenticate
	passport.use(new GoogleStrategy({

		clientID        : config.google.clientID,
		clientSecret    : config.google.clientSecret,
		callbackURL     : config.google.callbackURL,
		passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

	},
	//Save info to database
	function(req, token, refreshToken, profile, done)
	{
		// asynchronous
		process.nextTick(function()
		{
			// check if the user is already logged in
			if (!req.user)
			{
				User.findOne({'gid':profile.id}, function(err, user)
				{
					if (err)
						return done(err);
					if (user)
					{
						// if there is a user id already but no token (user was linked at one point and then removed)
						if (!user.token)
						{
							user.token = token; //update token
							user.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
							user.name  = profile.displayName; //update name
							user.pic  = profile.photos[0].value; //update pic

							user.save(function(err) //save
							{
								if (err)
									return done(err);
								return done(null, user);
							});
						}
						return done(null, user);
					}
					else
					{
						var newUser = new User(); //Create new user

						newUser.gid    = profile.id; //set Google id
						newUser.token = token; //Access token
						newUser.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
						newUser.name  = profile.displayName; //Full name
						newUser.pic  = profile.photos[0].value; //Profile picture

						newUser.save(function(err) //save the user
						{
							if (err)
								return done(err);
							return done(null, newUser);
						});
					}
				});
			}
			else
			{
				// user already exists and is logged in, we have to link accounts
				var user = req.user; // pull the user out of the session

				user.id    = profile.gid; //Set Google ID
				user.token = token; //Access token
				user.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
				user.name  = profile.displayName; //Full name
				user.pic  = profile.photos[0].value; //Profile picture

				user.save(function(err) //save
				{
					if (err)
						return done(err);
					return done(null, user);
				});
			}
		});
	}));
};