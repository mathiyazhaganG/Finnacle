const express = require("express");

const {
	register,
	login,
	getUser,
}=require('../controllers/authController');
const Authadmin = require('../middleware/authadmin')

const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/getuser",Authadmin,getUser);

module.exports=router;

