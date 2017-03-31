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
		}
	},
	google:
	{
		'clientID'      : '{id}.apps.googleusercontent.com',
		'clientSecret'  : 'secret',
		'callbackURL'   : 'http://localhost/auth/google/callback'
	},
	passwords:
	{
		approve: 'APPROVE_THEM',
		delete: 'Delete them!'
	}
}

module.exports = config