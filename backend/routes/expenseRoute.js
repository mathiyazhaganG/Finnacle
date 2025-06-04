const express = require('express');
const {addExpense,getAllExpense,deleteExpense,downloadExpense,userId}=require('../controllers/ExpenseController');
const Authadmin = require('../middleware/authadmin');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post("/add",Authadmin,addExpense);
router.get("/get",Authadmin,getAllExpense);
router.get("/download",Authadmin,downloadExpense);
router.delete("/delete/:id",Authadmin,deleteExpense);
router.get("/uid",Authadmin,userId);



module.exports= router;
