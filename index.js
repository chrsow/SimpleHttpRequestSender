"use strict";
// =============== Module import and configuration ============ //
var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'),()=>{
  console.log('Node app is running on port', app.get('port'));
});
var io = require('socket.io').listen(server); //Socket io
var request = require('request');

app.use(express.static(__dirname + '/public'));

//Directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// ================================== Define Functions ================================ //

//Success Function
let successFunction = (sucessResponse,callback)=>{
	console.log("Success!! \n"+JSON.stringify(sucessResponse));
	callback(sucessResponse);
}

//Error function
let errorFunction = (errorReponse,callback)=>{
	console.log("Error!! \n"+errorReponse);
	callback(errorReponse);
}

//Complete Function
let completeFunction = (completeResponse)=>{
	console.log("Complete!! \n"+JSON.stringify(completeResponse));
}


// ------------------ Requirement Function -------------------- //
var WizeNetFunction = (url,method,successFunction,errorFunction,completeFunction)=>{

}

// ===================================== REST API ======================================== //

app.get('/', (req, res)=>{
  res.render('pages/index');
});

// Socket IO
let userMessage = "";
let retryTime = 4;
let requestCount = 0; //For managing connection rate
io.on('connection', (socket)=>{
	console.log('a user connected');
	socket.on('userRequest',(userRequest)=>{
		console.log("Your request is "+userRequest);
		
		// ====== Should be in our function later ===== //
		let userURL = userRequest['userURL']; //User's URL
		let userMethod = userRequest['userMethod']; //User's Method
		let requestStatus = "Queuing";
		
		//Message to render at Client side
		userMessage = "Your URL : "+userURL+
		"\n Your Method : "+userMethod+" ";
		
		request({//Send User's Request
			url: userURL, //URL to hit
			method: userMethod //Method use
		}, (error, resURL, body)=>{
			requestCount += 1;
			requestStatus = "Finish";
			if(!error) {// Request Success
				// ===== Success Function ===== //
				successFunction(resURL,completeFunction);
				
				let statusCode = resURL.statusCode; // Response Status Code
				userMessage +="\n Status Code : "+statusCode+
				"\n Request Status : "+requestStatus+
				"\n Connection rate : "+requestCount;
				
				
				if(statusCode !== 200){//Status Code is not 200
					retryTime -= 1;
					if(retryTime<=0){
						// ===== Invoke Error Function ===== //
						errorFunction("There is no retry your request anymore",completeFunction);
						//Refresh site
						retryTime = 4;
					}else{
						// Warning with remain retryTime
						userMessage += "\n Number of retry left : "+retryTime;
					}
				}else{ //Status Code 200
					retryTime = 4;
				}
				
			}else{//Request Error
				errorFunction(error,completeFunction);//Error function appear
				userMessage += "\n There is something wrong with your URL. Please try again \n";
			
			}
			//Send Message to Client Side
			io.emit('userRequest',userMessage);
			
			
		});
	});

});


// === Run Server === //
server



