const mongoose = require('mongoose');

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