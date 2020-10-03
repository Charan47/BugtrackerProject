	//jshint esversion:6

	const express = require("express");
	const bodyParser = require("body-parser");
	//const router 		= require(__dirname + "/routes/index");

	const mongoose = require("mongoose");
	const session = require("express-session");
	const passport = require("passport");
	const passportLocalMongoose = require("passport-local-mongoose");
	const bcrypt = require("bcrypt");
	const flash = require("connect-flash")
	const app = express();

	//connecting to the database user and also contain bug db
	mongoose.connect("mongodb://localhost:27017/userdb", {
	  useNewUrlParser: true,
	  useUnifiedTopology: true,
	  useCreateIndex: true
	});

	// EJS
	app.use(express.static("public"));
	app.set("view engine", "ejs");

	//Bodyparser
	app.use(bodyParser.urlencoded({
	  extended: true
	}));

	// Express Session
	app.use(session({
		secret : "secretnumber",
		resave :true,
		saveUninitialized :true
	}));

	//connect flash
	app.use(flash());

	//Global Var
	app.use(function(req,res,next){
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		next();
	});

	// app.use(passport.initialize());
	// app.use(passport.session());





	// userSchema
	const userSchema = new mongoose.Schema({
	  name: {
	    type: String,
	    required: true
	  },
	  email: {
	    type: String,
	    required: true
	  },
	  password: {
	    type: String,
	    required: true
	  },
	  designation: {
	    type: String,
	    required: true,
	    enum: ['developer', 'admin', 'tester']
	  }
	});

	// userSchema.plugin(passportLocalMongoose);
	const usermodel = new mongoose.model("user", userSchema);
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
	  nameofthebug: String,
	  Description: String,
	  Assignee: userSchema,
	  statusofthebug: String, // not valid (closed), valid to the user, to do ( is only developer) , done , in progress
	}); //valid to notvalid dev had to update.
	const bugmodel = mongoose.model("bug", bugSchema);

	//adding somebugs to the database


	app.get("/", function(req, res) {
	  res.render("home");
	});
	app.get("/register", function(req, res) {
	  res.render("register", {
	    display: "none"
	  });
	});

	app.post("/register", function(req, res) {
	  console.log(req.body);
	  const {
	    name,
	    designation,
	    email,
	    password
	  } = req.body;
	  console.log(email);
	  let errors = [];

	  //check required fields
	  if (!name || !designation || !email || !password) {
	    errors.push({
	      msg: 'Please fill in all fields'
	    });

	    console.log(errors);
	    res.render("register", {
	      errors,
	      name,
	      designation,
	      email
	    });
	  } else {
	    console.log("checking");
	    usermodel.findOne({
	      email: email
	    }, (function(err, user) {
	      console.log(email + user);
	      if (user) {
	        errors.push({
	          msg: " email already exits"
	        })
	        console.log(errors);
	        res.render('register', {
	          errors,
	          name,
	          designation,
	          email
	        })
	      } else {
	        const newuser = new usermodel({
	          name,
	          designation,
	          email,
	          password,
	        });
	        bcrypt.hash(newuser.password, 10, function(err, hash) {
	          // Store hash in your password DB.
	          if (err) throw err;
	          //set password to hashed
	          newuser.password = hash;
	          //save user
						console.log(newuser);
	          newuser.save(function(err) {
	            if (err) {
	              console.log(err);
	            }else{
								req.flash('success_msg','You are now registered and login' );
								res.redirect('/login');
							}
	          });

	        });
	      }
	    }));
	  }

	  //newuser.save();
	  //res.redirect("/listbugs");
	});




	app.get("/login", function(req, res) {
	  res.render("login");
	});


	// userlist

	app.get("/userlist", function(req, res) {
	  //	res.send("HI");
	  usermodel.find({}, function(err, userlist) {
	    if (err) {
	      console.log("error while finding users");
	    } else {
	      res.render("userlist", {
	        usernameobj: userlist
	      });
	      //res.render("test",{username : currentvalue.name});
	    };
	  })
	})
	app.post("/adduser", function(req, res) {
	  const user = new usermodel({
	    name: req.body.inputusername,
	    designation: req.body.inputdesignation
	  });
	  user.save();
	  res.redirect("/userlist");
	});
	app.get('/deleteuser/:userid', function(req, res) {
	  console.log(req.params.userid);
	  usermodel.findByIdAndRemove(req.params.userid, function(err) {
	    if (!err) {
	      console.log("Successfully deleted user by id");
	    }
	  })
	  res.redirect("/userlist");
	});

	// bug list
	app.get('/listbugs', function(req, res) {
	  bugmodel.find({}, function(err, buglist) {
	    if (!err) {
	      res.render("buglist", {
	        buglistobj: buglist
	      });
	    }
	  })
	});
	app.get('/showbug/:bugid', function(req, res) {
	  bug.findById(req.params.bugid, function(err, bugobj) {
	    console.log(bugobj[1]);
	  });

	  //res.render('/showbug',{})
	})
	app.post("/addbug", function(req, res) {
	  const bug = new bugmodel({
	    nameofthebug: req.body.inputnameofthebug,
	    description: req.body.inputdescription,
	    assignee: req.body.inputdesignation,
	    statusofthebug: req.body.inputstatusofthebug,
	  });
	  bug.save(function(err, savedbug) {
	    console.log("Bug Info saved and id is " + savedbug._id);
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
	app.listen(4000, function() {
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
