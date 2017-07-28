const express = require('express'),
	console = require('tracer').colorConsole(),
	router = express.Router();

router.get('/',function(req, res)
{
	res.render('faq');
});

module.exports = router;