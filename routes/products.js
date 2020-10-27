var express = require("express");
var router  = express.Router();
var Product = require("../models/product");
var middleware = require("../middleware");
var gcsMiddlewares = require("../middleware/google-cloud-storage");
var request = require("request");
const bodyParser = require('body-parser');
// Imports the Google Cloud client libraries
const vision = require('@google-cloud/vision');
const fs = require('fs');
var url = require('url');
var https = require('https');
var sizeOf = require('image-size');
const Multer = require('multer');
keys = require('../config/keys');
process.env.GOOGLE_APPLICATION_CREDENTIALS="./config/gcp-key.json";
//process.env.GOOGLE_APPLICATION_CREDENTIALS=keys.GOOGLE_APPLICATION_CREDENTIALS;
const multer = Multer({
    storage: Multer.MemoryStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // Maximum file size is 10MB
    },
  });
var resultarray = [];
var objectarray = [];
var objectlocationx=[];
var objectlocationy=[];
var objectlocationx=[];
var objectlocationy=[];
var width=0;
var height=0;



async function GCPAPI(postfilename) {
height=0;
 width=0;
	resultarray=[];
	objectarray=[];
	objectlocationx=[];
	objectlocationy=[];
	
// Creates a client
const client = new vision.ImageAnnotatorClient();
const bucketName = keys.DEFAULT_BUCKET_NAME;
const fileName = postfilename;

// Performs label detection on the gcs file
const [result] = await client.labelDetection(
  `gs://${bucketName}/${fileName}`
);
const labels = result.labelAnnotations;
labels.forEach(label => resultarray.push(label.description));
	
	//object detection
const [result_object] = await client.objectLocalization(`gs://${bucketName}/${fileName}`);
const objects = result_object.localizedObjectAnnotations;
objects.forEach(object => {
  objectarray.push(object.name);
  const vertices = object.boundingPoly.normalizedVertices;
  vertices.forEach(v => {
	  objectlocationx.push(`${v.x}`);
	  objectlocationy.push(`${v.y}`);
				   });
});
}

//INDEX - show all products
router.get("/", function(req, res){
    // Get all products from DB
    Product.find({}, function(err, allProducts){
       if(err){
           console.log(err);
       } else {

                res.render("products/index",{products:allProducts});

       }
    });
});

//CREATE - add new product to DB
router.post("/", middleware.isLoggedIn, multer.single('image'), gcsMiddlewares.sendUploadToGCS,function(req, res){
    // get data from form and add to products array
    var name = req.body.name;
	var price = req.body.price;
    var postfilename = req.file.gcsUrl;
	var image = keys.image_path+req.file.gcsUrl;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
	
// obtain the size of an image
var options = url.parse(image);
https.get(options, function (response) {
  var chunks = [];
  response.on('data', function (chunk) {
    chunks.push(chunk);
  }).on('end', function() {
    var buffer = Buffer.concat(chunks);
    console.log(sizeOf(buffer));
	console.log(Object.values(sizeOf(buffer)));
	console.log(sizeOf(buffer)["height"]);
	console.log(sizeOf(buffer)["width"]);
height=sizeOf(buffer)["height"];
	  width=sizeOf(buffer)["width"];
  });
});

	
	GCPAPI(postfilename).then(v => {
  		console.log("resultarray:"+resultarray);
		console.log("objectname:"+objectarray);
		if (!(typeof objectarray !== 'undefined' && objectarray.length > 0)) {
   		  	objectlocationx=["0","0","0","0", "0","0","0","0", "0","0","0","0"];
			objectlocationy=["0","0","0","0", "0","0","0","0", "0","0","0","0"];
			objectarray.fill("N/A");
		}
			
		console.log("objectarray:"+objectarray);
		console.log("objectlocationx:"+objectlocationx);
		console.log("objectlocationy:"+objectlocationy);
		for(var i=0; i<objectlocationx.length; i++) {
		//Let's take the constant factor
			objectlocationx[i] = objectlocationx[i] * width;
			objectlocationy[i] = objectlocationy[i] * height;
		}
		console.log("objectlocationx:"+objectlocationx);
		console.log("objectlocationy:"+objectlocationy);
		console.log("x length:"+objectlocationx.length);
		console.log("y length:"+objectlocationy.length);
		var min = 0, max=0;
		minx = Math.min.apply(null, objectlocationx.slice(0, 4));
		miny = Math.min.apply(null, objectlocationy.slice(0, 4));
		ptx=minx;
		pty=miny;
		minx = Math.min.apply(null, objectlocationx.slice(4, 8));
		miny = Math.min.apply(null, objectlocationy.slice(4, 8));
		ptx2=minx;
		pty2=miny;
		minx = Math.min.apply(null, objectlocationx.slice(8, 12));
		miny = Math.min.apply(null, objectlocationy.slice(8, 12));
		ptx3=minx;
		pty3=miny;
		extendwidth=Math.abs(objectlocationx[2]-objectlocationx[3]);
		extendheight=Math.abs(objectlocationy[3]-objectlocationy[0]);
		extendwidth2=Math.abs(objectlocationx[6]-objectlocationx[7]);
		extendheight2=Math.abs(objectlocationy[7]-objectlocationy[4]);
		extendwidth3=Math.abs(objectlocationx[10]-objectlocationx[11]);
		extendheight3=Math.abs(objectlocationy[11]-objectlocationy[8]);
		var label=resultarray.toString();
		var objectname="Red/Gree/Blue objects are:"+objectarray.slice(0, 3).toString();
		var newProduct = {name: name, price:price,image: image, description: desc, author:author, label:label, objectname:objectname, width:width,height:height, ptx:ptx, pty:pty, extendwidth:extendwidth, extendheight:extendheight, ptx2:ptx2, pty2:pty2, extendwidth2:extendwidth2, extendheight2:extendheight2, ptx3:ptx3, pty3:pty3, extendwidth3:extendwidth3, extendheight3:extendheight3}
    // Create a new product and save to DB
    Product.create(newProduct, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to products page
            console.log(newlyCreated);
            res.redirect("/products");
        }
    });
});


	
});


//NEW - show form to create new product
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("products/new"); 
});

// SHOW - shows more info about one product
router.get("/:id", function(req, res){
    //find the product with provided ID
    Product.findById(req.params.id).populate("comments").exec(function(err, foundProduct){
        if(err){
            console.log(err);
        } else {
            console.log(foundProduct);
            //render show template with that product
            res.render("products/show", {product: foundProduct});
        }
    });
});

//edit product route
router.get("/:id/edit", middleware.checkProductOwnership,function(req,res){
		Product.findById(req.params.id, function(err,foundProduct){
			res.render("products/edit", {product: foundProduct});
	});
});

//update product route
router.put("/:id",middleware.checkProductOwnership,multer.single('image'), gcsMiddlewares.sendUploadToGCS, function(req,res){
	//find and update the correct product
    req.body.product.image = keys.image_path+req.file.gcsUrl;
	var postfilename = req.file.gcsUrl;
	// obtain the size of an image
var options = url.parse(req.body.product.image);
https.get(options, function (response) {
  var chunks = [];
  response.on('data', function (chunk) {
    chunks.push(chunk);
  }).on('end', function() {
    var buffer = Buffer.concat(chunks);
    console.log(sizeOf(buffer));
	console.log(Object.values(sizeOf(buffer)));
	console.log(sizeOf(buffer)["height"]);
	console.log(sizeOf(buffer)["width"]);
	height=sizeOf(buffer)["height"];
	  width=sizeOf(buffer)["width"];
  });
});
		GCPAPI(postfilename).then(v => {
  		console.log("resultarray:"+resultarray);
		console.log("objectarray:"+objectarray);
		
		if (!(typeof objectarray !== 'undefined' && objectarray.length > 0)) {
   		  	objectlocationx=["0","0","0","0","0","0","0","0","0","0","0","0"];
			objectlocationy=["0","0","0","0","0","0","0","0","0","0","0","0"];
			objectarray.fill("N/A");
		}
			
		console.log("objectarray:"+objectarray);
		console.log("objectlocationx:"+objectlocationx);
		console.log("objectlocationy:"+objectlocationy);
		for(var i=0; i<objectlocationx.length; i++) {
		//Let's take the constant factor
			objectlocationx[i] = objectlocationx[i] * width;
			objectlocationy[i] = objectlocationy[i] * height;
		}
		console.log("objectlocationx:"+objectlocationx);
		console.log("objectlocationy:"+objectlocationy);
		console.log("x length:"+objectlocationx.length);
		console.log("y length:"+objectlocationy.length);
			console.log("width:"+width);
			console.log("height:"+height);
		var min = 0, max=0;
        req.body.product.width= width;
        req.body.product.height= height;
		minx = Math.min.apply(null, objectlocationx.slice(0, 4));
		miny = Math.min.apply(null, objectlocationy.slice(0, 4));
		req.body.product.ptx= minx;
		req.body.product.pty= miny;
		req.body.product.extendwidth= Math.abs(objectlocationx[2]-objectlocationx[3]);
		req.body.product.extendheight= Math.abs(objectlocationy[3]-objectlocationy[0]);
		minx = Math.min.apply(null, objectlocationx.slice(4, 8));
		miny = Math.min.apply(null, objectlocationy.slice(4, 8));
		req.body.product.ptx2= minx;
		req.body.product.pty2= miny;
		req.body.product.extendwidth2= Math.abs(objectlocationx[6]-objectlocationx[7]);
		req.body.product.extendheight2= Math.abs(objectlocationy[7]-objectlocationy[4]);
		minx = Math.min.apply(null, objectlocationx.slice(8, 12));
		miny = Math.min.apply(null, objectlocationy.slice(8, 12));
		req.body.product.ptx3= minx;
		req.body.product.pty3= miny;
		req.body.product.extendwidth3= Math.abs(objectlocationx[10]-objectlocationx[11]);
		req.body.product.extendheight3= Math.abs(objectlocationy[11]-objectlocationy[8]);
		req.body.product.objectname="Red/Gree/Blue objects are:"+objectarray.slice(0, 3).toString();
		req.body.product.label=resultarray.toString();
		

	Product.findByIdAndUpdate(req.params.id,req.body.product, function(err, updatedProduct){
		if(err){
			res.redirect("/products");
		}
		else {
			res.redirect("/products/"+req.params.id);
		}
	});
	//redirect somewhere(show page)
});
	});

//Destroy product route
router.delete("/:id",middleware.checkProductOwnership, function(req,res){
	Product.findByIdAndRemove(req.params.id, function(err){
		if (err){
			res.redirect("/products");
		}
		else {
			res.redirect("/products");
		}
	});
});



module.exports = router;

