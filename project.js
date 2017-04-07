const mongoose = require('mongoose');
require('mongoose-type-url'); //Adds URL to available `type`

var projectSchema = mongoose.Schema(
{
	id: {type: String, unique: true},
	name: String,
	description:
	{
		type:String,
		min:[100,'Your description is too short'],
		required:[true,'A description is required']
	},
	abstract:
	{
		type:String,
		min:[100,'Your abstract is too short'],
		max:[1000,'Your abstract is too long'],
		required:[true,'An abstract is required']
	},
	owners:
	{
		type:Array,
		required: true
	},
	managers:
	{
		type: Array,
		required: false
	},
	developers:
	{
		type: Array,
		required: false
	},
	created
	{
		type: Date,
		required: true,
		min: Date.now
	},
	end
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
	github-url
	{
		type: mongoose.SchemaTypes.Url,
		required: false
	},
	status:
	{
		required: true,
		defaullt: 0,
		type: Number,
		min:-1,
		max: 1
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