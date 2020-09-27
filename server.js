	//jshint esversion:6

	const express 		= require("express");
	const bodyParser 	= require("body-parser");
	//const router 		= require(__dirname + "/routes/index");
	const app		= express ();
	const mongoose 		= require("mongoose");


	//const mangoose	= require
	app.set("view engine", "ejs");
	app.use(bodyParser.urlencoded({extended :true }));
	app.use(express.static("public"));
//connecting to the database user and also contain bug db
		mongoose.connect("mongodb://localhost:27017/userdb",{ useNewUrlParser: true, useUnifiedTopology: true });



// userSchema
	const userSchema = new mongoose.Schema({
	name : {
		type :String,
		required : [true , "names is required"]
	},
	designation: {
		type: String,
		enum: ['developer','admin','tester']
	}
	});

//creating MODEL connecting the schema to the Collections in DB and assinged it to a database
// singular version of collection as 1st parameter.
	const User = mongoose.model("User",userSchema);

// adding new user following the schema of the user
	const userDev = new User({
		name : "mrcow",
		designation : "developer"
	});

//saving the user data to the database
//userDev.save();




//Bugschema
	const bugSchema = new mongoose.Schema({
		nameofthebug: String ,
		Description: String,
		Assignee : userSchema,
		statusofthebug : String,
	});
//Bug model , first parameter is singular from of collections , second prm is shcema
	const Bug = mongoose.model("bug",bugSchema);

//Foring new bugs
 	const bug1 = new Bug ({
		nameofthebug: "unloading Bug",
		Description : " wakakaka very slow and dies",
		Assignee : userDev,
		statusofthebug : "todo"
	});

	const bug2 = new Bug ({
		nameofthebug: "Saving Bug",
		Description : " Saving very slow and dies",
		Assignee : "dev2",
		statusofthebug : "todo"
	});

	const bug3 = new Bug ({
		nameofthebug: "Buffering Bug",
		Description : " Buffering very slow and dies",
		Assignee : "dev1",
		statusofthebug : "todo"
	});
//save them to the database

// 	bug1.save();

//
//	Bug.insertMany([bug1,bug2,bug3],function(err){
//	if (err){
//		console.log("logged error");
//	}else{
//		console.log("Successfully save the bugs to bugs collections");
//	}
//
//	});

//Read the DB->Collections->documents Objects

//Read Bugs
//	Bug.find(function(err,bugs){
//		if(err){
//			console.log("logged error at finding");
//		}else{
//			bugs.forEach(function(currentvalue){
//				console.log(currentvalue.nameofthebug);
//			});
//		};
//	});
// closing the connection

//	mongoose.connection.close()



	app.get("/",function(req,res){
		res.send("HI");
	});

	app.get("/userlist",function(req,res){
	//	res.send("HI");
		User.find({},function(err,userlist){
			if(err){
				console.log("error while finding users");
			}else{
				res.render("test",{usernameobj:userlist});
					//res.render("test",{username : currentvalue.name});
				};
			})
		})
		//	res.render("test",{username: });;
	app.post("/adduser", function(req,res){
			const user = new User ({
				name : req.body.inputusername,
				designation: req.body.inputdesignation
			});
			user.save();
			res.redirect("/userlist");
	});

	app.get('/deleteuser/:userid', function(req,res){
 console.log(req.params.userid);
			User.findByIdAndRemove(req.params.userid, function(err){
				if(!err){
					console.log("Successfully deleted user by id");
				}
			})
		 res.redirect("/userlist");
	});

	app.listen(3000,function(){
		console.log("Server has started at 3000");
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
