/*
* Profile Page
*/
const express = require('express'),
	router = express.Router();

router.get('/',function(req, res)
{
	//If the user is login, render the profile; otherwise have them login
	if(req.user)
		res.render('profile',{user:req.user})
	else
		res.redirect('/auth/google')
});

module.exports = router;