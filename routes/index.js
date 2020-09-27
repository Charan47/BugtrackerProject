const express 			= require("express");
const router 			= express.Router();
const crudusercontroller 	= require("../controllers/usermanagementcontroller");
//const displayuserscontroller	= require("displayusercontroller")


// adding or deleting user 
router.post("/edituser",crudusercontroller.edituser);

//display userlist
//router.get("/userlist",displayusercontroller);


