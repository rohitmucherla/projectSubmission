const mongoose = require('mongoose');


var appSchema = mongoose.Schema(
{
	identifier: {type:Number,unique:true,required:true},
	"project-id": {type:String,required:true},
	"user-id": {type:String,required:true},
	"level-of-interest":{type:Number, min:1,max:10,required:true},
	skills: Array,
	time: String,
});

module.exports = mongoose.model('Application',appSchema);