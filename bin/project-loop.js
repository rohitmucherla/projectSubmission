const config = require('../config'),
	Promise = require('bluebird');
let Application = require(`../${config.db.path}/application`),
	Project = require(`../${config.db.path}/project`);

function queryProject(page = 1,limit = config.LIMIT)
{
	let offset = page -1;
	return new Promise(function(resolve,reject)
	{
		//Query: SELECT * FROM `Project` WHERE (status=`1`) OR (status=`0` AND [User in owners OR managers OR developers])
		//Get the number of projects in the db
		//note: this is not an expensive calculation
		Project.count()
			.or([
				{'status':1},
				{$and:[{'status':0},{'owners':req.user._id.toString()}]},
				{$and:[{'status':0},{'managers':req.user._id.toString()}]},
				{$and:[{'status':0},{'developers':req.user._id.toString()}]}
			])
			.lean()
			.exec()
			.then(function(number)
		{
			//Make sure querying will return a project
			if(number <= 0 || (offset * limit > number))
			{
				reject('NO_PROJECTS_FOUND');
			}
			else
			{
				//Get the first config.LIMIT projects
				Project.find()
					.skip(limit * offset)
					.limit(config.LIMIT)
					.or([
						{'status':1},
						{$and:[{'status':0},{'owners':req.user._id.toString()}]},
						{$and:[{'status':0},{'managers':req.user._id.toString()}]},
						{$and:[{'status':0},{'developers':req.user._id.toString()}]}
					])
					.lean()
					.exec()
					.then(function(projects)
				{
					//Figure out if we need to paginate, and update pagination info
					let pagination = (number > LIMIT) ?
						{needed:true, number: Math.ceil(number / LIMIT), current:offset} :
						{needed:false};
					resolve({projects,pagination});
				}).catch(reject);
			}
		}).catch(reject);
	});
}

module.exports = function(page = 1, limit = config.LIMIT, user = false)
{
	return new Promise(function(resolve,reject)
	{
		queryProject(page,limit).then(function(projectData)
		{
			let projects = projectData.projects,
				pagination = projectData.pagination;
			if(user)
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