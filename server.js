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



	// EJS
	app.use(express.static("public"));
	app.set("view engine", "ejs");

	//Bodyparser
	app.use(bodyParser.urlencoded({
	  extended: true
	}));

	// Express Session
	app.use(session({
	  secret: "secretnumber",
	  resave: true,
	  saveUninitialized: true
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	//connecting to the database user and also contain bug db
	mongoose.connect("mongodb://localhost:27017/userdb", {
	  useNewUrlParser: true,
	  useUnifiedTopology: true,
	  useCreateIndex: true
	});
	//connect flash
	app.use(flash());
	//Global Var for "flash"
	app.use(function(req, res, next) {
	  res.locals.success_msg = req.flash('success_msg');
	  res.locals.error_msg = req.flash('error_msg');
	  res.locals.updated_msg = req.flash('updated_msg');
	  next();
	});
	// userSchema
	const userSchema = new mongoose.Schema({
	  name: String,
	  email: String,
	  designation: {
	    tester: Boolean,
	    developer: Boolean,
	    admin: Boolean,
	  },
	  bugsassingedto: [{
	    type: mongoose.SchemaTypes.ObjectId,
	    ref: 'bugmodel'
	  }],
	});
	//pluging in local mongoose for hashing salt and save users
	userSchema.plugin(passportLocalMongoose, {
	  usernameField: 'email'
	});


	// 	if i had been using passport and passport local
	//	we had been defining serial and deserialing as
	//	in passport documentation
	{
	  // 	passport.serializeUser(function(user, done) {
	  //   done(null, user.id);
	  // });
	  //
	  // passport.deserializeUser(function(id, done) {
	  //   User.findById(id, function (err, user) {
	  //     done(err, user);
	  //   });
	  // });
	}
	const usermodel = new mongoose.model("user", userSchema);
	// creates local strategy from createstrategy
	// and  also usgin local mongoose to take care of beloew three lines
	passport.use(usermodel.createStrategy());
	passport.serializeUser(usermodel.serializeUser());
	passport.deserializeUser(usermodel.deserializeUser());
	//adding somebugs to the database


	//bugSchema
	const bugSchema = new mongoose.Schema({
	  nameofthebug: String,
	  description: String,
	  assignee: [{
	    type: mongoose.SchemaTypes.ObjectId,
	    ref: 'usermodel'
	  }],
	  statusofthebug: String, // not valid (closed), valid to the user, to do ( is only developer) , done , in progress
	});

	//valid to notvalid dev had to update.
	const bugmodel = new mongoose.model("bug", bugSchema);


	app.get("/", function(req, res) {
	  res.render("home");
	});
	app.get("/register", function(req, res) {
	  res.render("register");
	});


	{ // register method without local-mongoose
	  //  app.post("/register", function(req, res) {
	  //   console.log(req.body);
	  //   const {
	  //     name,
	  //     designation,
	  //     email,
	  //     password
	  //   } = req.body;
	  //   console.log(email);
	  //   let errors = [];
	  //
	  //   //check required fields
	  //   if (!name || !designation || !email || !password) {
	  //     errors.push({
	  //       msg: 'Please fill in all fields'
	  //     });
	  //
	  //     console.log(errors);
	  //     res.render("register", {
	  //       errors,
	  //       name,
	  //       designation,
	  //       email
	  //     });
	  //   } else {
	  //     console.log("checking");
	  //     usermodel.findOne({
	  //       email: email
	  //     }, (function(err, user) {
	  //       console.log(email + user);
	  //       if (user) {
	  //         errors.push({
	  //           msg: " Email already exists !!"
	  //         })
	  //         console.log(errors);
	  //         res.render('register', {
	  //           errors,
	  //           name,
	  //           designation,
	  //           email
	  //         })
	  //       } else {
	  //         const newuser = new usermodel({
	  //           name,
	  //           designation,
	  //           email,
	  //           password,
	  //         });
	  //         bcrypt.hash(newuser.password, 10, function(err, hash) {
	  //           // Store hash in your password DB.
	  //           if (err) throw err;
	  //           //set password to hashed
	  //           newuser.password = hash;
	  //           //save user
	  // 					console.log(newuser);
	  //           newuser.save(function(err) {
	  //             if (err) {
	  //               console.log(err);
	  //             }else{
	  // 							req.flash('success_msg','You are now registered and login now !!' );
	  // 							res.redirect('/login');
	  // 						}
	  //           });
	  //
	  //         });
	  //       }
	  //     }));
	  //   }
	  //
	  //   //newuser.save();
	  //   //res.redirect("/listbugs");
	  // });
	}


	app.post("/register", function(req, res) {
	  const {
	    name,
	    designation,
	    email,
	    password
	  } = req.body;
	  let errors = [];

	  if (!name || !designation || !email || !password) {
	    errors.push({
	      msg: 'Please fill in all fields'
	    });
	    res.render("register", {
	      errors,
	      name,
	      designation,
	      email
	    });
	  } else {

	    //type of authentication we performing is local mentioned in the brackets
	    const user = new usermodel({
	      name: req.body.name,
	      email: req.body.email,
	      designation: {
	        tester: req.body.designation == 'tester' ? true : false,
	        developer: req.body.designation == 'developer' ? true : false,
	        admin: req.body.designation == 'admin' ? true : false
	      }
	    });
	    console.log(user);

	    usermodel.register(user, req.body.password, function(err, user) {
	      if (err) {
	        console.log(err);
	        req.flash('error_msg', 'User already exits !!')
	        res.redirect("/register");
	      } else {

	        passport.authenticate("local")(req, res, function() {
	          res.redirect("/listbugs")
	        });
	      }
	    });

	  }
	});


	//method from passportlocalmongoose
	// why and how from https://www.geeksforgeeks.org/nodejs-authentication-using-passportjs-and-passport-local-mongoose/




	app.get("/login", function(req, res) {
	  if (req.isAuthenticated()) {
	    res.redirect("/listbugs")
	  } else {
	    res.render("login");
	  }
	});

	app.post("/login", function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
	    if (err) {
	      return next(err);
	    }
	    if (!user) {
	      req.flash('error_msg', 'Wrong Credintials Entered !!');
	      return res.redirect('/login');
	    }

	    req.logIn(user, function(err) {
	      if (err) {
	        return next(err);
	      }
	      return res.redirect('/listbugs');
	    });
	  })(req, res, next);
	});

	app.get("/logout", function(req, res) {
	  req.logout();
	  res.redirect('/');
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
	  // here isAuthenticated method depends on
	  //1.passport,
	  //2.passport local ,
	  //3.passport local mongoose ,
	  //4.session
	  if (req.isAuthenticated()) {
	    bugmodel.find({}, function(err, buglist) {
	      if (!err) {
	        res.render("buglist", {
	          buglistobj: buglist
	        });
	      }
	    })
	  } else {
	    res.redirect('/login');
	  }


	});
	// showing bug in detail version
	app.get('/showbug/:bugid', function(req, res) {
	  usermodel.find({}, (function(err, users) {
	          bugmodel.findById(req.params.bugid, function(err, bugobj) {
	            res.render("showbug", {
	              bugobj,
	              devs: users
	            });
	          });
	      }));
	  });


	//from the button beside to home button
	app.get("/addbug", function(req, res) {
	  res.render("showbug", {
	    bugobj: ''
	  });
	})

	//saving and updating bug
	app.post('/editbug/:bugid', function(req, res) {
	  console.log(req.body);

	  if (req.body.action == 'save') {
	    const bug = new bugmodel({
	      nameofthebug: req.body.bugname,
	      description: req.body.description,
	      statusofthebug: "tobe" //new bug status is always to be
	    });
	    bug.save(function(err, savedbug) {
	      console.log(savedbug._id);
	      req.flash('success_msg', 'Saved as New Bug');
	      res.redirect("/showbug/" + savedbug._id);
	    })
	    //updating with findByIdAndUpdate
	  } else if (req.body.action == 'update') {
	    //console.log(req.params.bugid);
			console.log(req.body);
	    bugmodel.findByIdAndUpdate(req.params.bugid, {
	      nameofthebug: req.body.bugname,
	      description: req.body.description,
	    }, function(err, updatedbug) {
	      if (!err) {
	        console.log(updatedbug);
	        req.flash('updated_msg', 'Updated the Bug');
	        console.log("updated Bug" + updatedbug._id);
	        res.redirect("/showbug/" + updatedbug._id);
	      }
	    })
	  };
	});

	// app.post("/savebug", function(req, res) {
	// 	console.log(req.body);
	// 	const{bugname,description,action} = req.body;
	//
	//
	// 	if(action == 'save'){
	//
	// 		const bug = new bugmodel({
	// 			nameofthebug : bugname,
	// 			description : description,
	// 			Assignee : user,
	// 			statusofthebug : "tobe"
	// 		});
	// 		console.log(bug.Assignee);
	// 		bug.save(function(err,savedbug){
	// 				console.log(savedbug._id);
	// 		})
	// 	}


	//const {nameofthebug, description}= req.body;
	// bug.save(function(err, savedbug) {
	//   console.log("Bug Info saved and id is " + savedbug._id);
	// 	res.redirect('/listbugs');
	// });

	// });
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
