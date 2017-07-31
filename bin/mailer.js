const Promise = require('bluebird'),
	console = require('tracer').colorConsole()
	nodemailer = require('nodemailer'),
	strip = require('striptags');
	config = require('../config');

let emailAddress = config.email.namedAddress || config.email.address;

function sendMail(to,subject,body,from)
{
	let original =
	{
		to: config.email.address,
		subject: config.email.default.subject,
		body: config.email.default.body,
		from: emailAddress
	}, params = {};
	if(typeof to == 'object')
	{
		params = original;
		for(key in original)
		{
			params[key] = to[key] ? to[key] : params[key]
		}
	}
	else
	{
		params.to = to || original.to
		params.subject = subject || original.subject
		params.body = body || original.body
		params.from = from || original.from
	}
	return new Promise(function(resolve,reject)
	{
		let transporter = nodemailer.createTransport(config.email.transport || 'direct');
		options =
		{
			from: params.from,
			to: params.to,
			subject: params.subject,
			html: params.body,
			text: strip(params.body),
			replyTo: config.email.replyTo
		}
		transporter.sendMail(options,function(error,info)
		{
			if(error)
			{
				reject(error);
				console.error(error);
			}
			else
			{
				resolve(info);
				console.log('[Email Sent]:',info);
			}
		});
	});
}

module.exports = sendMail;