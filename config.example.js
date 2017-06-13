var config =
{
	db:
	{
		conn: "mongodb://user:pass@ds119250.mlab.com:19250/project-submission",
		//mLab suggested options
		options :
		{
			server:
			{
				socketOptions:
				{
					keepAlive: 300000,
					connectTimeoutMS: 30000
				}
			},
			replset:
			{
				socketOptions:
				{
					keepAlive: 300000,
					connectTimeoutMS :30000
				}
			}
		},
		promiseLibrary: require('bluebird')
	},
	google:
	{
		'clientID'      : '{id}.apps.googleusercontent.com',
		'clientSecret'  : 'secret',
		'callbackURL'   : 'http://localhost/auth/google/callback'
	},
	base: ""
}

module.exports = config