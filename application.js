const mongoose = require('mongoose');

var appSchema = mongoose.Schema(
{
	identifier: {type: mongoose.SchemaTypes.ObjectId, unique: true},
	"project-id": {type:String,required:true},
	"user-id": {type:String,required:true},
	"level-of-interest":{type:Number, min:1,max:10,required:true},
	skills: {type: Number, min:1, max:100, required:true},
	time: {type:Number, min: 0, max:20, required:true},
	notes: {type:String, required:false, },
	status:{type:Number, required:true},
	statusNotes:{type:String, required:true},
	projectName: {type:String, required:true}
});

module.exports = mongoose.model('Application',appSchema);