const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy, //Allows us to authenticate with Google
config = require('../config'), //Loads global settings
mongoose = require('mongoose'), //Database library
User = require(`../${config.db.path}/user`); //User model for database

mongoose.connect(config.db.conn,config.db.options) //connect to db in the config file

module.exports = function(passport) // make modifications to the passport object
{

	// passport session setup. Required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done)
	{
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done)
	{
		//Purposefully not thenning
		User.findById(id).lean().exec(function(err, user)
		{
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
							//update name
							user.name.first = profile.name.givenName;
							user.name.last = profile.name.familyName;
							user.name.full = profile.displayName
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
						let newUser = new User(); //Create new user

						newUser.gid    = profile.id; //set Google id
						newUser.token = token; //Access token
						newUser.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
						newUser.name.first = profile.name.givenName;
						newUser.name.last = profile.name.familyName;
						newUser.name.full = profile.displayName;

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
				let user = req.user; // pull the user out of the session

				user.id    = profile.gid; //Set Google ID
				user.token = token; //Access token
				user.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
				user.name.first = profile.name.givenName;
				user.name.last = profile.name.familyName;
				user.name.full = profile.displayName;
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