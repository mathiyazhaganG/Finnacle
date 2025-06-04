const express = require('express');
const router = express.Router();
const {gemini}= require('../controllers/InsightsController')
const Authadmin = require('../middleware/authadmin')

router.post('/',Authadmin,gemini);
module.exports = router;
