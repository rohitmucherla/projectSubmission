var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ProjectSubmission' });
});

router.get('/:id-:name',function(req,res){
	let toSend = `Requested project named ${req.params.name} with id ${req.params.id}`
	res.status(200).render('default',{content:toSend})
})

module.exports = router;
