const mongoose = require('mongoose');
require('mongoose-type-url'); //Adds URL to available `type`
mongoose.Promise = require('bluebird');

let projectSchema = mongoose.Schema(
{
	name:
	{
		type: String,
		min : [2, "I can make a better name than that"],
		max: [30, "Leave the indepthness to the description"],
		required: true
	},
	description:
	{
		type:String,
		required:[true,'A description is required']
	},
	abstract:
	{
		type:String,
		max:[1000,'Your abstract is too long'],
		required:[true,'An abstract is required']
	},
	owners:
	[
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
			default: []
		}
	],
	managers:
	[
		{
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'User',
			default: []
		}
	],
	developers:
	[
		{
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'User',
			default: []
		}
	],
	created:
	{
		type: Date,
		required: true,
		max: Date.now
	},
	end:
	{
		type: Date,
		required: false,
		min: Date.now
	},
	languages:
	{
		required: false,
		type: Array
	},
	"github-url":
	{
		type: mongoose.SchemaTypes.Url,
		required: false
	},
	status:
	{ //-2 = complete, -1 = rejected, 0 = unapproved, 1 = approved, 2 = filled
		required: true,
		default: 0,
		type: Number,
		min:-2,
		max: 2
	},
	statusNotes:
	{
		type:String,
		required:false
	},
	organization:
	{
		type:String,
		required: false
	},
	paid:
	{
		required: true,
		type: Number,
		min: [0, "Sorry, we don't pay you to do projects"]
	},
	numberOfPeople:
	{
		type:Number,
		min: [1, "Needing 0 people seems counterintuitive"],
		max: [10, "Our current limit is 10 people per project"],
		required:true
	}
});

module.exports = mongoose.model('Project',projectSchema);