const express = require('express');
const router = express.Router();
const Authadmin = require('../middleware/authadmin');
const {Aichat} = require('../controllers/AiChatControlller');

router.post("/chat",Authadmin,Aichat);

module.exports=router;

