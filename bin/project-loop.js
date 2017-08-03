const config = require('../config'),
	Promise = require('bluebird');
let Application = require(`../${config.db.path}/application`),
	Project = require(`../${config.db.path}/project`);

//Not setting defaults because the ONLY function that will call this already does
function queryProject(page, limit, user, admin, status)
{
	let offset = page -1;
	return new Promise(function(resolve,reject)
	{
		//Query: SELECT * FROM `Project` WHERE (status=`1`) OR (status=`0` AND [User in owners OR managers OR developers])
		//Get the number of projects in the db
		//note: this is not an expensive calculation
		let orParams;
		if(admin && status == null)
			orParams = [{'status':{$gte:-100}}] //-100 is arbitrary; 0 is probably fine
		else if(status != null) //status can be 0
			orParams = [{'status':status}];
		else
		{
			orParams = [
				{'status':1},
				{$and:[{'status':0},{'owners':user.toString()}]},
				{$and:[{'status':0},{'managers':user.toString()}]},
				{$and:[{'status':0},{'developers':user.toString()}]}
			];
		}
		Project.count()
			.or(orParams)
			.lean()
			.exec()
			.then(function(number)
		{
			//Make sure querying will return a project
			if(number <= 0 || (offset * limit > number))
			{
				resolve({"projects":[]});
			}
			else
			{
				Project.find()
					.skip(limit * offset)
					.limit(limit)
					.or(orParams)
					.lean()
					.exec()
					.then(function(projects)
				{
					//Figure out if we need to paginate, and update pagination info
					let pagination = (number > limit) ?
						{needed:true, number: Math.ceil(number / limit), current:offset} :
						{needed:false};
					resolve({projects,pagination});
				}).catch(reject);
			}
		}).catch(reject);
	});
}

module.exports = function(page = 1, limit = config.LIMIT, user, application = false, admin = false, status = null)
{
	return new Promise(function(resolve,reject)
	{
		if(!(user || admin || status != null))
		{
			reject('USER_ADMIN_STATUS_REQUIRED');
			return;
		}
		queryProject(page,limit,user,admin,status).then(function(projectData)
		{
			let projects = projectData.projects,
				pagination = projectData.pagination;
			if(application)
			{
				Application.find()
					.where('user-id').equals(user)
					.select('project-id')
					.lean()
					.exec()
					.then(function(applications)
				{
					applied = [];
					applications.forEach(function(app)
					{
						applied[app["project-id"]] = app["_id"];
					});
					projects.forEach(function(project,index)
					{
						if(applied[project._id])
							project.applied = applied[project._id];
						projects[index] = project;
					});
					resolve({projects,pagination});
				}).catch(reject);
			}
			else
			{
				resolve(projectData);
			}
		}).catch(reject);
	});
}