const express = require('express'),
	router = express.Router(),
	parser = require('body-parser');

formParse = parser.urlencoded({extended:false});

router.get('/',function(req, res)
{
	res.render('create', { title: 'ProjectSubmission' });
});

router.post('/',formParse,function(req,res)
{
	if (!req.body) return res.sendStatus(400)
	res.status(200).send('Received ' + req.body);
});

module.exports = router;