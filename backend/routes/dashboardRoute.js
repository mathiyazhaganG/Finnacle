const express = require('express');
const {getDashboardData}=require('../controllers/dashboardController');
const Authadmin = require('../middleware/authadmin');
const router = express.Router();

router.get("/",Authadmin,getDashboardData);

module.exports= router;