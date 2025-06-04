const express = require('express');
const router = express.Router();
const {  getPortfolio, addStock, deleteStock ,porthistget,porthistpost } = require('../controllers/portfolioController');
const Authadmin = require('../middleware/authadmin')

router.get('/', Authadmin,getPortfolio);
router.post('/add', Authadmin, addStock);
router.delete('/delete/:id', Authadmin,deleteStock);
router.post('/history', Authadmin, porthistpost);
router.get('/history',  Authadmin,porthistget);


module.exports = router;
