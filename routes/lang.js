const express = require('express'),
	router = express.Router();

router.get('/',function(req, res)
{
	res.render('index', { title: 'Page not ready' });
});

router.get('/:term',function(req,res)
{
	res.send(`You searched for "${req.params.term}".`);
})
module.exports = router;