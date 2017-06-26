const mongoose = require('mongoose');

let appSchema = mongoose.Schema(
{
	"project-id": {type:mongoose.Schema.Types.ObjectId,required:true,ref:'Project'},
	"user-id": {type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
	"level-of-interest":{type:Number, min:1,max:10,required:true},
	skills: {type: Number, min:1, max:100, required:true},
	time: {type:Number, min: 0, max:20, required:true},
	notes: {type:String, required:false, },
	status:{type:Number, required:true},
	statusNotes:{type:String, required:true}
});

module.exports = mongoose.model('Application',appSchema);