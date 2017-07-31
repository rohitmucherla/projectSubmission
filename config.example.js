let config =
{
	db:
	{
		conn: "mongodb://user:pass@ds119250.mlab.com:19250/project-submission",
		//mLab + mongoose suggested options
		options :
		{
			useMongoClient:true,
			keepAlive: 30000,
			socketTimeoutMS: 300000,
			promiseLibrary: require('bluebird')
		},
		path: './schemas',
	},
	google:
	{
		'clientID'      : '{id}.apps.googleusercontent.com',
		'clientSecret'  : 'secret',
		'callbackURL'   : 'http://localhost/auth/google/callback'
	},
	base: "",
	port: 4539,
	functions: require('./bin/functions'),
	LIMIT: 10,
	limits:
	{
		unverifiedProjects: 5,
		unapprovedUnverifiedProjects:0
	},
	slack: 'aggie-coding-club',
	email:
	{
		address:'project-submission@projects.hexr.org',
		namedAddress: '"Project Submission" <project-submission@projects.hexr.org>',
		replyTo: '"Project Support" <support@projects.hexr.org>',
		default:
		{
			subject: 'Message from Project Submission',
			body: '<strong><center>This is a test email from Project Submission!</center></strong>'
		}
		transport:
		{
			host: 'smtp.example.com',
			port: 465,
			secure: true,
			auth:
			{
				user: 'user@example.com',
				pass: 'password'
			}
		}
	},
}

module.exports = config