const express = require('express'),
	config = require('../../config'),
	loop = require('../../bin/project-loop'),
	router = express.Router();

router.use(config.functions.requireAdminLogin);

router.get('/',function(req, res)
{
	res.locals.page = '/admin/project';
	res.status(404).render('404');
});

router.get('/:id',function(req,res)
{
	let id = config.functions.mongooseId(req.params.id);
	if(!id)
	{
		res.locals.single = true;
		res.render('project-404');
		return;
	}
	res.redirect(`/project/${id}`);
});

module.exports = router;