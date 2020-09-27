	//jshint esversion:6

	const express 		= require("express");
	const bodyParser 	= require("body-parser");
	const router 		= require(__dirname + "/routes/index");
	const app		= express ();
	
	let  redirecter	= express.Router(); 

	app.use("/user",router); 
	
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

