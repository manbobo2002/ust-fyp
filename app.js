var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
	flash		= require("connect-flash"),
	passport	= require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
    Product  = require("./models/product"),
    Comment     = require("./models/comment"),
	User		= require("./models/user"),
    seedDB      = require("./seeds");
	keys = require('./config/keys');
    
//requiring routes
var commentRoutes=require("./routes/comments"),
	productRoutes = require("./routes/products"),
	indexRoutes  = require("./routes/index");

//mongoose.connect(process.env.DATABASEURL);
mongoose.connect(keys.mongoURI, { useFindAndModify:false, useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }).then(()=>{ console.log('Connected to DB!'); }).catch(err=>{ console.log('ERROR:', err.message); });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());

//seedDB(); //seed the database

// Passport configuration
app.use(require("express-session")({
	secret: "Once again Rusty wins cuts dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/products",productRoutes);
app.use("/products/:id/comments",commentRoutes);

app.listen(process.env.PORT||8080, process.env.IP, function(){
	console.log("The UST e-shop Server Has Started at port 8080!");
});
