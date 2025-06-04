const express = require('express');
const {addIncome,getAllIncome,deleteIncome,downloadIncome}=require('../controllers/incomeController');
const Authadmin = require('../middleware/authadmin');
const router = express.Router();

router.post("/add",Authadmin,addIncome);
router.get("/get",Authadmin,getAllIncome);
router.get("/download",Authadmin,downloadIncome);
router.delete("/delete/:id",Authadmin,deleteIncome);

module.exports= router;
