const express = require('express'),
	config = require('../../config'),
	loop = require('../../bin/project-loop'),
	router = express.Router();

router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	res.redirect('/admin/projects');
});

router.get('/:id',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.locals.projects = [];
		res.render('project-listing');
		return;
	}
	res.redirect(`/project/${id}`);
});

module.exports = router;