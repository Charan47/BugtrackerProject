	//jshint esversion:6

	const express 		= require("express");
	const bodyParser 	= require("body-parser");
	//const router 		= require(__dirname + "/routes/index");
	const app					= express ();
	const mongoose 		= require("mongoose");
	const session 		= require("express-session");
	const passport 		= require("passport");
	const passportLocalMongoose 		= require("passport-local-mongoose");
	var md5 = require('md5');



	//const mangoose	= require
	app.use(express.static("public"));
	app.set("view engine", "ejs");
	app.use(bodyParser.urlencoded({extended :true }));
	//
	// app.use(session({
	// 	secret : "secretnumber",
	// 	resave :false,
	// 	saveUninitialized :false
	// }));
	// app.use(passport.initialize());
	// app.use(passport.session());

//connecting to the database user and also contain bug db
	mongoose.connect("mongodb://localhost:27017/userdb",{ useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex :true });



// userSchema
	const userSchema = new mongoose.Schema({
	name : {
		type :String,
		required : [true , "names is required"]
	},
	email : String,
	password : String,
	designation: {
		type: String,
		enum: ['developer','admin','tester']
	}
	});

	// userSchema.plugin(passportLocalMongoose);
	const usermodel = new mongoose.model("user",userSchema);
// 	// passport.use(usermodel.createStrategy());
// 	// passport.serializeUser(function(user, done) {
//   // done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function (err, user) {
//     done(err, user);
//   });
// });
//bugSchema
	const bugSchema = new mongoose.Schema({
		nameofthebug: String ,
		Description: String,
		Assignee : userSchema,
		statusofthebug : String,    // not valid (closed), valid to the user, to do ( is only developer) , done , in progress
	}); 													//valid to notvalid dev had to update.
	const bugmodel = mongoose.model("bug",bugSchema);

	//adding somebugs to the database


	app.get("/",function(req,res){
		res.render("home");
	});
	app.get("/register",function(req,res){
		res.render("register",{display:"none"});
	});
	app.post("/register",function(req,res){
		newuser = new usermodel({
			name: req.body.inputnameoftheuser,
			email: req.body.inputusername,
			password:md5(req.body.inputpassword),
			designation:req.body.designation,
		});
		if(req.body.inputusername == {} ){ res.redirect("/register")};
		usermodel.findOne({email:req.body.inputusername},function(err,foundone){

			if(foundone){
				res.render("register",{display: "flex"});
			}else{

				newuser.save();
				res.redirect("/listbugs");
			}
	})
});




	app.get("/login",function(req,res){
		res.render("login");
	});




	app.get("/userlist",function(req,res){
	//	res.send("HI");
		usermodel.find({},function(err,userlist){
			if(err){
				console.log("error while finding users");
			}else{
				res.render("userlist",{usernameobj:userlist});
					//res.render("test",{username : currentvalue.name});
				};
			})
		})
	app.post("/adduser", function(req,res){
			const user = new usermodel ({
				name : req.body.inputusername,
				designation: req.body.inputdesignation
			});
			user.save();
			res.redirect("/userlist");
	});
	app.get('/deleteuser/:userid', function(req,res){
 console.log(req.params.userid);
			usermodel.findByIdAndRemove(req.params.userid, function(err){
				if(!err){
					console.log("Successfully deleted user by id");
				}
			})
		 res.redirect("/userlist");
	});
 	app.get('/listbugs',function(req,res){
		bugmodel.find({},function(err,buglist){
		 if(!err){
			 res.render("buglist",{buglistobj:buglist});
		 }
	 })
	 });
	app.get('/showbug/:bugid',function(req,res){
			bug.findById(req.params.bugid,function(err,bugobj){
				console.log(bugobj[1]);
			});

		//res.render('/showbug',{})
	})
	app.post("/addbug",function(req,res){
			const bug = new bugmodel ({
				nameofthebug : req.body.inputnameofthebug,
				description : req.body.inputdescription,
				assignee :req.body.inputdesignation,
				statusofthebug :req.body.inputstatusofthebug,
			});
			bug.save(function(err,savedbug){
				console.log("Bug Info saved and id is "+ savedbug._id);
			});

	});
	// bug.find({},function(err,bugs)){
	// 	if(err){
	// 		console.log("logged error finding bugs");
	// 	}else{
	// 	}
	// }
// app.get('/showbug/:bugid'.function(res,req){
// bug.findById(req.params.bugid,function(err,bugObj)){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		res.render("/showbug",{bugobj:bugObj}) // for adding a new bug user is redirected to this again with blank page
// 	}
// }
// });
// app.post('/savebug'.function(res,req){
//
// });
// app.get('/deletebug'.function(res,req){
//
// });
	app.listen(4000,function(){
		console.log("Server has started at 4000");
	});


//	const app	= express ();
//
//	app.get("/userlist", function(req,res){
//		res.sendFile(__dirname/Homepage.html);
//		console.log("__dirname");
//	});
//
//	app.post("/adduser", function(req,res){
//
//
//	});
//
//	app.listen(3000,function(){
//		console.log("Server has started at 3000");
//	});
//
