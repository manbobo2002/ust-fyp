var Product = require("../models/product");
var Comment = require("../models/comment");
// all the middleware goes here
var middlewareObj = {};

middlewareObj.checkProductOwnership = function (req,res,next){
	if (req.isAuthenticated()){
		// does user own the product?
		Product.findById(req.params.id, function(err,foundProduct){
		if(err){
			res.redirect("/product");
		}
		else {
			// does user own the product?

			if (foundProduct.author.id.equals(req.user._id)){
				next();
			} else{
				req.flash("error", "You don't have permission to do that");
				res.redirect("back");
			}
		}
	});
	} else {
			req.flash("error", "You need to be logged in to do that");
			res.redirect("back");
		}
}

middlewareObj.checkCommentOwnership = function (req,res,next){
	if (req.isAuthenticated()){
		// does user own the product?
		Comment.findById(req.params.comment_id, function(err,foundComment){
		if(err){
			req.flash("error", "Product not found");
			res.redirect("back");
		}
		else {
			// does user own the comment?

			if (foundComment.author.id.equals(req.user._id)){
				next();
			} else{
				req.flash("error", "You don't have permission to do that");
				res.redirect("back");
			}
		}
	});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

//middleware
middlewareObj.isLoggedIn = function isLoggedIn(req,res,next){
	if (req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

module.exports = middlewareObj;