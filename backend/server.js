require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const incomeRoute = require('./routes/incomeRoute')
const expenseRoute = require('./routes/expenseRoute')
const dashboardRoute = require('./routes/dashboardRoute')
const investRoute = require('./routes/investRoute')
const insightRoute = require('./routes/insightRoute')
const AichatRoute= require('./routes/AichatRoute');

const app = express();

app.use(
	cors({
		origin:process.env.CLIENT_URL || "*",
		methods:["GET","POST","PUT","DELETE"],
		allowedHeaders:["Content-Type","Authorization"],
	})
	);
	app.use(express.json());
	app.use("/api/v1/auth",authRoutes);
	app.use("/api/v1/income",incomeRoute);
	app.use("/api/v1/expense",expenseRoute);
	app.use("/api/v1/dashboard",dashboardRoute);
	app.use('/api/v1/portfolio', investRoute);
	app.use('/api/v1/insights',insightRoute);
	app.use('/api/v1/Mrfin',AichatRoute);
	
	connectDB();
	const port=process.env.PORT || 3000;
	app.listen(port,()=>console.log(`server running on port ${port}`));