var express = require('express');
var router = express.Router();
var parser = require('body-parser');
var util = require('util')

formParse = parser.urlencoded({extended:false});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('create', { title: 'ProjectSubmission' });
});

router.post('/',formParse,function(req,res) {
	if (!req.body) return res.sendStatus(400)
	res.status(200).send('Received ' + req.body);
});

module.exports = router;
