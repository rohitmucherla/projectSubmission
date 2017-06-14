const express = require('express'),
	router = express.Router();

router.get('/',function(req, res)
{
	res.render('search')
});

router.get('/:term',function(req,res)
{
	res.render('search');
})
module.exports = router;