var express=require("express");
var router = express.Router({mergeParams:true});
var Product = require("../models/product");
var Comment = require("../models/comment");
var middleware=require("../middleware");
var moment = require('moment');

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find product by id
    Product.findById(req.params.id, function(err, product){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {product: product});
        }
    })
});

//Comments Create
router.post("/",middleware.isLoggedIn, function(req, res){
   //lookup product using ID
   Product.findById(req.params.id, function(err, product){
       if(err){
           console.log(err);
           res.redirect("/products");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
			   req.flash("error", "Something went wrong!");
               console.log(err);
           } else {
			   //add username and id to comment
			   comment.author.id = req.user._id;
			   comment.author.username = req.user.username;
			   var today = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Hong_Kong'});
			   comment.comment_date=moment(today).format('DD-MM-YYYY')
			   //save comment
			   comment.save();
               product.comments.push(comment);
               product.save();
			   req.flash("success", "Successfully added comment");
               res.redirect('/products/' + product._id);
           }
        });
       }
   });
   //create new comment
   //connect new comment to product
   //redirect product show page
});

//comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		}else{
			res.render("comments/edit", {product_id:req.params.id, comment:foundComment});
		}
	});
});

//comment update
router.put("/:comment_id",middleware.checkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if (err){
			res.redirect("back");
		} else {
			res.redirect("/products/"+ req.params.id);
		}
	});
});

//Comment destroy route
router.delete("/:comment_id",middleware.checkCommentOwnership, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if (err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("/products/"+req.params.id);
		}
	});
});




module.exports = router;
