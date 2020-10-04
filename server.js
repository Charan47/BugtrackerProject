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
		secret : "secretnumber",
		resave :true,
		saveUninitialized :true
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
	{app.use(flash());
	//Global Var for "flash"
	app.use(function(req,res,next){
		res.locals.success_msg = req.flash('success_msg');
		res.locals.error_msg = req.flash('error_msg');
		next();
	});}

// userSchema
	const userSchema = new mongoose.Schema({
	  name: String,
	  email: String,
	  password: String,
	  designation: {
	    type: String,
	    enum: ['developer', 'admin', 'tester']
	  }
	});
//pluging in local mongoose for hashing salt and save users
	userSchema.plugin(passportLocalMongoose,{usernameField :'email'});

	const usermodel = new mongoose.model("user", userSchema);
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

// creates local strategy from createstrategy
// and  also usgin local mongoose to take care of beloew three lines
	passport.use(usermodel.createStrategy());
	passport.serializeUser(usermodel.serializeUser());
	passport.deserializeUser(usermodel.deserializeUser());

	//bugSchema
	const bugSchema = new mongoose.Schema({
	  nameofthebug: String,
	  Description: String,
	  Assignee: userSchema,
	  statusofthebug: String, // not valid (closed), valid to the user, to do ( is only developer) , done , in progress
	});

	//valid to notvalid dev had to update.
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

	// register method without local-mongoose
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

	app.post("/register",function(req,res){
			//method from passportlocalmongoose
			// why and how from https://www.geeksforgeeks.org/nodejs-authentication-using-passportjs-and-passport-local-mongoose/
			console.log(req.body);
			const user = new usermodel(req.body)
			console.log(user);
			usermodel.register(user,req.body.password,function(err,user){
				if(err){
					console.log(err);
					res.redirect("/register");
				}else{
					//type of authentication we performing is local mentioned in the brackets
					//call back function is called only if the authentication is successful
					passport.authenticate("local")(req,res,function(){
						res.redirect("/listbugs")
					});
				}
			});
	})

	app.get("/login", function(req, res) {
	  res.render("login");
	});
	app.post("/login", function(req, res) {
		const user = new usermodel({
			// fields cant be empty while calling or assigning
			name: {},
			description :{},
			email : req.body.email,
			password : req.body.password
		});

		//method from passport
		req.login(user,function(err){
			if(err){
				console.log(err);
				//include flash message here
				res.redirect('/login');
			}else{
				// tells browser to hold on the cookie when this is called after login or register
				passport.authenticate("local")(req,res,function(){

					res.redirect("/listbugs")
				});
			}
		});
	});

	app.get("/logout",function(res,req){
		req.logut();
		req.redirect("/");
	})


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
		if(req.isAuthenticated()){
			bugmodel.find({}, function(err, buglist) {
		    if (!err) {
		      res.render("buglist", {
		        buglistobj: buglist
		      });
		    }
		  })
		}else{
			res.redirect('/login');
		}


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
