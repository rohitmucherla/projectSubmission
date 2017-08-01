const config = require('../config'),
	Promise = require('bluebird');
let Application = require(`../${config.db.path}/application`),
	Project = require(`../${config.db.path}/project`);

//Not setting defaults because the ONLY function that will call this already does
function queryApplication(page, limit, status)
{
	let offset = page-1;
	return new Promise(function(resolve,reject)
	{
		//Query: SELECT * FROM `Project` WHERE (status=`1`) OR (status=`0` AND [User in owners OR managers OR developers])
		//Get the number of projects in the db
		//note: this is not an expensive calculation
		let orParams;
		if(status != null)
			orParams = [{'status':status}];
		else
			orParams = [{'status':{$gte:-100}}] //-100 is arbitrary; 0 is probably fine
		Application.count()
			.or(orParams)
			.lean()
			.exec()
			.then(function(number)
		{
			//Make sure querying will return a project
			if(number <= 0 || (offset * limit > number))
			{
				reject({applications:[]});
			}
			else
			{
				Application.find()
					.skip(limit * offset)
					.limit(limit)
					.or(orParams)
					.lean()
					.exec()
					.then(function(applications)
				{
					//Figure out if we need to paginate, and update pagination info
					let pagination = (number > limit) ?
						{needed:true, number: Math.ceil(number / limit), current:offset} :
						{needed:false};
					resolve({applications,pagination});
				}).catch(reject);
			}
		}).catch(reject);
	});
}

module.exports = function(page = 1, limit = config.LIMIT, status = null)
{
	return new Promise(function(resolve,reject)
	{
		queryApplication(page,limit,status).then(function(applicationData)
		{
			let applications = applicationData.applications,
				pagination = applicationData.pagination;
					resolve({applications,pagination});
		}).catch(reject);
	});
}