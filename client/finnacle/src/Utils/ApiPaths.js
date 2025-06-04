export const BASE_URL="http://localhost:3000/api/v1/";
export const API_PATHS={
	AUTH:{
		LOGIN:"auth/login",
		REGISTER:"auth/register",
		GETUSER:"auth/getuser"
	},
	DASHBOARD:"dashboard/",
	INCOME:{
		ADD_INCOME:"income/add",
		GET_ALL_INCOME:"income/get",
		DELETE_INCOME:(income)=>`income/delete/${income}`,
		DOWNLOAD_INCOME:"income/download"
		
	},
	EXPENSE:{
		ADD_EXPENSE:"expense/add",
		GET_ALL_EXPENSE:"expense/get",
		DELETE_EXPENSE:(expense)=>`expense/delete/${expense}`,
		DOWNLOAD_EXPENSE:"expense/download",
		OCR_SCAN:"http://127.0.0.1:5000/ocrres",
		UID:"expense/uid"
	},
	PORTFOLIO:{
	    PORTFOLIO:"portfolio/",
		ADD_STOCKS:"portfolio/add",
		DELETE_STOCKS:(stock)=>`portfolio/delete/${stock}`,
		HISTORY: 'portfolio/history'
		
	},
	MRFIN:{
		CHAT:"Mrfin/chat"
	}
	
	
}