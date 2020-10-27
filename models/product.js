var mongoose = require("mongoose");

//Scheme Setup
var campgroundSchema = new mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	label: String,
	author: {
		id: {
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username: String
	},
	objectname: String,
	width: String,
    height: String,
	ptx: String,
	pty: String,
	extendwidth: String,
	extendheight: String,
	ptx2: String,
	pty2: String,
	extendwidth2: String,
	extendheight2: String,
	ptx3: String,
	pty3: String,
	extendwidth3: String,
	extendheight3: String,
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ]
});

module.exports = mongoose.model("Product", campgroundSchema);