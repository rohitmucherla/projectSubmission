const mongoose = require('mongoose');
require('mongoose-type-url');
mongoose.Promise = require('bluebird');

let userSchema = mongoose.Schema(
{
	gid: String, //GoogleID
	token: String,
	name:
	{
		first: String,
		last: String,
		full: String
	},
	company: String,
	isPublic:
	{
		type:Boolean,
		default:true,
		required:true
	},
	github:
	{
		type: String,
		lowercase: true,
		default: undefined,
		maxlength:39,
		match: /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i //from https://github.com/shinnn/github-username-regex
	},
	slack:
	{
		type: String,
		lowercase: true,
		default: undefined,
		match: /[a-zA-Z0-9.-_]/i, //from https://get.slack.help/hc/en-us/articles/216360827-Change-your-username
		maxlength: 21
	},
	website:
	{
		type: mongoose.SchemaTypes.Url,
		default: undefined
	},
	headline:
	{
		type:String,
		default:undefined,
		minlength:10,
		maxlength:120
	},
	access: {required:true, type:Number, default: 0},
	email: String,
	workingOn:{
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'Project'
	},
	owner:
	{
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'Project'
	},
	approved: {type:Boolean,required:true,default:false},
	profileComplete:{required:true,type:Boolean,default:false},
	pic:{required:true,type:String}
});

module.exports = mongoose.model('User',userSchema);