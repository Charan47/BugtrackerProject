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
	const joi = require("joi");
	const basicAuth = require('express-basic-auth');


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

	// function authenticate(req, res, next) {
	//   if (!req.isAuthenticated()) {
	//     res.render("login");
	//   };
	//   next();
	// }
	//connecting to the database user and also contain bug db
	mongoose.connect("mongodb://localhost:27017/userdb", {
	  useNewUrlParser: true,
	  useUnifiedTopology: true,
	  useCreateIndex: true,
	  useFindAndModify: false
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
	    manager: Boolean,
	  },
	  bugsreported: [{
	    type: mongoose.SchemaTypes.ObjectId,
	    ref: 'bugmodel'
	  }],
	  bugsassigned: [{
	    type: mongoose.SchemaTypes.ObjectId,
	    ref: 'bugmodel'
	  }],
	});
	//pluging in local mongoose for hashing salt and save users
	userSchema.plugin(passportLocalMongoose, {
	  usernameField: 'email'
	});


	const usermodel = new mongoose.model("user", userSchema);
	// creates local strategy from createstrategy
	// and  also usgin local mongoose to take care of beloew three lines
	passport.use(usermodel.createStrategy());
	passport.serializeUser(usermodel.serializeUser());
	passport.deserializeUser(usermodel.deserializeUser());

	//bugSchema
	const bugSchema = new mongoose.Schema({
	  nameofthebug: String,
	  description: String,
	  assignee: [{
	    type: mongoose.SchemaTypes.ObjectId,
	    ref: 'usermodel'
	  }],
	  statusofthebug: String,
	});
	const bugmodel = new mongoose.model("bug", bugSchema);
	app.get("/", function(req, res) {
	  res.render("postlogingregister");
	});
	app.get("/register", function(req, res) {
	  res.render("register");
	});
	app.post("/register", function(req, res) {
	  console.log(req.body);
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
	        manager: req.body.designation == 'manager' ? true : false
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

		if (!req.body.email || !req.body.password) {
			req.flash('error_msg', 'Fill all Fields to login');
			res.redirect('/login');

	  } else {
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
	  })(req, res, next);}
	});
	app.get("/logout", function(req, res) {
	  req.logout();
	  res.redirect('/');
	});
	app.get("/api/bugs/",(req,res)=>{
		app.use(basicAuth({
				users: {
						'admin': 'admin'
				}
		}),express.json());
		bugmodel.find({},{__v:0,assignee:0}, function(err, buglist) {
	    if (err) {
				res.send(err)
			}else{
				res.send(buglist);
			}
	  })

	});
	app.get("/api/bugs/:bugid",(req,res)=>{
		app.use(basicAuth({
				users: {
						'admin': 'admin'
				}
		}),express.json());
		bugmodel.find({_id:req.params.bugid},{_id:0,__v:0,assignee:0}, function(err, buglist) {
	    if (err) {
				res.send(err)
			}else{
				res.send(buglist);
			}
	  })

	});
	// authenticate all routes from below
	app.use((req, res, next) => {
	  if (req.isAuthenticated()) {

	    next();
	  } else {
	    res.status(401),
	      res.render('login');
	  }
	});

	// userlist
	app.get("/userlist", function(req, res) {
	  //	res.send("HI");
	  if (req.user.designation.manager) {
	    usermodel.find({}, function(err, userlist) {
	      if (err) {
	        console.log("error while finding users");
	      } else {
	        res.render("userlist", {
	          userobj: userlist
	        });

	        //res.render("test",{username : currentvalue.name});
	      };
	    })
	  } else {
	    req.flash('error_msg', 'No manager Privileges !!');
	    res.redirect('/listbugs');
	  }
	})
	app.post("/adduser", function(req, res) {
	  const user = new usermodel({
	    name: req.body.inputusername,
	  });
	  designation: req.body.inputdesignation
	  user.save();
	  res.redirect("/userlist");
	});
	app.post('/updatedesignation/:userid', (req, res) => {
	  console.log(req.body);
	  switch (req.body.action) {
	    case "revokemanager":
	      console.log("revokemanager");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.manager": false
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    case "revokedeveloper":
	      // code block
	      console.log("revokedeveloper");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.developer": false
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    case "revoketester":
	      // code block
	      console.log("revoketester");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.tester": false
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    case "invokemanager":
	      // code block
	      console.log("invokemanager");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.manager": true
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    case "invokedeveloper":
	      // code block
	      console.log("revokedeveloper");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.developer": true
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    case "invoketester":
	      // code block
	      console.log("revoketester");
	      usermodel.findByIdAndUpdate(req.params.userid, {
	          $set: {
	            "designation.tester": true
	          }
	        },
	        (err, doc) => {
	          console.log(doc);
	          res.redirect("/settings")
	        });
	      console.log(req.params.userid);
	      break;
	    default:
	      // code block
	  }

	})


	app.post('/deleteaccount/:userid', function(req, res) {
	  console.log(req.params.userid);
	  usermodel.findByIdAndRemove(req.params.userid, function(err) {
	    if (!err) {
	      console.log("Successfully deleted user by id");
	    }
	  })
	  res.redirect("/settings");
	});
	// bug list
	app.get('/listbugs', function(req, res) {

	  bugmodel.find({}, function(err, buglist) {
	    if (!err) {
	      res.render("home", {
	        buglistobj: buglist,
	        currentuser: req.user,
	        color: null
	      });
	    }
	  })
	});

	app.get('/listbugs/:tab', (req, res) => {
	  let changetab = function(tab) {
	    bugmodel.find({
	      statusofthebug: tab
	    }, (err, bugobjlist) => {
	      res.render("home", {
	        currentuser: req.user,
	        buglistobj: bugobjlist,
	      })
	    })
	  }
	  changetab(req.params.tab);
	})
	app.get('/settings', (req, res) => {
	  if (req.user.designation.manager) {
	    usermodel.find({}, function(err, userlist) {
	      console.log(userlist);
	      console.log(req.user);
	      res.render("settingspage", {
	        currentuser: req.user,
	        userlistobj: userlist
	      });
	    })
	  } else {
	    res.render("settingspage", {
	      currentuser: req.user,
	      userlistobj: null
	    });
	  }
	});

	// showing bug in detail version
	app.get('/showbug/:bugid', function(req, res) {
		//find all the developers
	  usermodel.find({
	    "designation.developer": true
	  }, (err, users) => {
	    bugmodel.findById(req.params.bugid, function(err, bugobj) { //find the requested the bug
	      usermodel.find({
	        '_id': {
	          $in: bugobj.assignee
	        }
	      }, function(err, assignees) {
	        // console.log(assignees);
	        const assigneddev = [];
	        assignees.forEach((assingee, i) => {
	          assigneddev.push({
	            name: assingee.name,
	            _id: assingee._id
	          });
	        });
	        // console.log(assigneddev);
	        res.render("showbug", {
	          bugobj,
	          devs: users,
	          assigneddev,
	          currentuser: req.user,
	        })
	      });
	    });
	  });
	});
	//from the button beside to home button
	app.get("/addbug", function(req, res) {
	  console.log(req.user);
	  if (req.user.designation.tester || req.user.designation.manager) {
	    usermodel.find({
		    "designation.developer": true
		  }, (function(err, users) {
	      res.render("showbug", {
	        bugobj: {},
	        devs: users,
	        assigneddev: '',
	        currentuser: req.user,
	      });

	    }));
	  } else {
	    req.flash("error_msg", "Need escalation to Tester to access that page!!")
	    res.redirect("/listbugs")
	  }

	});
	//saving and updating and deleting bug
	app.post('/editbug/:bugid', function(req, res) {
	  //validation
	  if (req.body.action == 'save') {
	    const bug = new bugmodel({
	      nameofthebug: req.body.bugname,
	      description: req.body.description,
	      statusofthebug: "Awaiting validation" //new bug status is always to be
	    });
	    bug.save(function(err, savedbug) {
	      console.log(savedbug);
	      if (!err) {
	        usermodel.findByIdAndUpdate(req.user._id, {
	          $push: {
	            bugsreported: savedbug._id
	          }
	        }, function(err, userreported) {
	          req.flash('success_msg', 'Saved as New Bug');
	          res.redirect("/showbug/" + savedbug._id);
	        });
	      }

	    })
	    //updating with findByIdAndUpdate
	  } else if (req.body.action == 'update') {
	    console.log("req.body");
	    console.log(req.body);
	    console.log("updating bug")

	    bugmodel.findByIdAndUpdate(req.params.bugid, {
	      nameofthebug: req.body.bugname,
	      description: req.body.description,
	      statusofthebug: req.body.statusofthebug
	      // $push:{
	      // 	assignee: req.body.assignee== '' ? null : req.body.assignee
	      // },
	    }, function(err, updatedbug) {
	      if (err) {
	        console.log(err);
	      } else { //add assignee
	        console.log(updatedbug);
	        if (req.body.assignee != '') {
	          console.log("assigning ");
	          console.log("updatedbug._id =" + updatedbug._id);
	          console.log("req.body.assignee =" + req.body.assignee);
	          bugmodel.findByIdAndUpdate(updatedbug._id, {
	            $push: {
	              assignee: req.body.assignee,
	            }
	          }, function(err, updateddbug) {
	            usermodel.findByIdAndUpdate(req.body.assignee, {
	              $push: {
	                bugsassigned: updatedbug._id,
	              }
	            }, function(err, updatedduser) {
	              bugmodel.findById(req.params.bugid, (err, bug) => {
	                console.log(bug);
	              });
	              usermodel.findById(req.body.assignee, (err, user) => {
	                console.log(user);
	              })
	            });
	          })
	        }

	        req.flash('updated_msg', 'Updated the Changes');
	        console.log("updated Bug" + updatedbug._id);
	        res.redirect("/showbug/" + updatedbug._id);
	      }
	    })

	  } else if (req.body.action == 'delete') {
	    bugmodel.findByIdAndDelete(req.params.bugid, function(err) {});
	    res.redirect("/listbugs");
	  };
	})
	app.get("/aboutus", (req, res) => {
	  res.render("aboutus", {
	    currentuser: req.user,
	  });
	});
	app.get('/account/', (req, res) => {
	  res.render("accountpage", {
	    currentuser: req.user,
	    buglistobj: req.user.bugsreported,
	  });
	})
	app.get('/account/:tab', (req, res) => {

	  if (req.params.tab == "bugsreported") {
	    // req.user.bugsreported.forEach((bugid, i) => {
	    // 	let	bugsreportedarr = [];
	    // 	bugmodel.findById
	    // });
	    console.log("here");
	    console.log(req.user.bugsreported);
	    bugmodel.find({
	      _id: {
	        $in: req.user.bugsreported
	      }
	    }, (err, bugsreported) => {
	      res.render("accountpage", {
	        currentuser: req.user,
	        buglistobj: bugsreported,
	        title: "Bugs Reported",
	        color: ["#99c6ff", "#fff", "#fff"]
	      })
	    });
	  } else if (req.params.tab == "bugsassigned") {
	    bugmodel.find({
	      _id: {
	        $in: req.user.bugsassigned
	      }
	    }, (err, bugsassigned) => {
	      console.log(bugsassigned);
	      res.render("accountpage", {
	        currentuser: req.user,
	        buglistobj: bugsassigned,
	        color: ["#fff", "#99c6ff", "#fff"]
	      })
	    })
	  } else if (req.params.tab == "bugsunassigned") {
	    bugmodel.find({
	      assignee: []
	    }, (err, bugsunassigned) => {
				console.log(bugsunassigned);
	      res.render("accountpage", {
	        currentuser: req.user,
	        buglistobj: bugsunassigned,
	        color: ["#fff", "#fff", "#99c6ff"]
	      })
	    })
	  }
	});

	app.get('*', function(req, res) {
	  res.status(404).send('notfound');
	});
	app.listen(4000, function() {
	  console.log("Server has started at 4000");
	});
