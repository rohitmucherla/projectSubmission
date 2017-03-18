const express = require('express'),
 router = express.Router();

router.get('/',function(req, res)
{
	res.render('index', { title: 'ProjectSubmission' });
});

//Learning param operator
router.get('/:id-:name',function(req,res)
{
	let toSend = `Requested project named ${req.params.name} with id ${req.params.id}`
	res.status(200).render('default',{content:toSend})
});

module.exports = router;