'use strict';


// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require('axios');

const { Client } = require('pg');

const client = new Client({
	user: 'postgres',
	host: 'postgres1',
	database: 'macphone',
	password: 'admin',
	port: 5432,

});

client.connect();
const http = require('http');

const PORT = 8080;
const HOST = '0.0.0.0';

//twilio requirements
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client2 = require('twilio')("AC9d36c599937bbb9e1cdaf980bcf4a2c1", "80fa2bc5fafe049cebc9ddcce9e04c3c");


app.get('/', ( req, res ) => {
  res.sendFile(`${__dirname}/MainMenu.html`)
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//COFFEE SHOP FUNCTIONS:
app.get('/employeeConnect', ( req, res ) => {
	res.sendFile(`${__dirname}/empMenu.html`)
});

app.get('/createMenus', (req, res) => {
	
	const menuQuery = `CREATE TABLE menu(item varchar, price float);`;
	
	client.query(menuQuery, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('Table Created');
	});
	
	const orderQuery = `CREATE TABLE orders(item varchar, customer varchar, ready varchar, time varchar);`;
	
	
	client.query(orderQuery, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('Table Created');
	});
             
	const storage = `CREATE TABLE storage(item varchar, customer varchar, time varchar);`;
	
	
	client.query(storage, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('Table Created');
	});

            
      res.sendFile(`${__dirname}/menuCreated.html`);
 });



app.get('/viewMenu', (req, res) => {

              const query = `SELECT * FROM menu;`;
			  
			  client.query(query, function (err, result, fields) {
				  if (err){
					  console.error(err);
					  return;
				  };
				  res.json(result.rows);
			  });
       
    });

app.get('/viewOrders', (req, res) => {
	
              const query = `SELECT * FROM orders;`;
			  
			  client.query(query, function (err, result, fields) {
				  if (err){
					  console.error(err);
					  return;
				  };
				  res.json(result.rows);
			  });
    });


app.post('/orderReady', (req, res) => {
	
	var nameReady = req.body.name;
	
	var query =`UPDATE orders SET ready = 'yes' WHERE customer = '`;
	query = query +nameReady;
	query = query +`';`;
	
	client.query(query, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('data updated');
	});
	
	res.sendFile(`${__dirname}/empMenu.html`)
	
});

app.post('/orderDone', (req, res) => {
	var nameDone = req.body.done;
	
	var query =`DELETE FROM orders WHERE customer = '`;
	query = query +nameDone;
	query = query +`';`;
	
	client.query(query, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('data deleted');
	});
	
	res.sendFile(`${__dirname}/empMenu.html`)
	
});

app.get('/customerConnect', ( req, res ) => {
	res.sendFile(`${__dirname}/custMenu.html`);
});


app.post('/placeOrder', (req,res) => {
	var name = req.body.name;
	var order = req.body.order;
	
	var query =`INSERT INTO orders (item, customer, ready, time) VALUES ('`;
	query = query +order;
	query = query + `', '`;
	query = query +name;
	query = query +`', 'no', current_timestamp);`;

	client.query(query, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('item added');
	});
	
	var storquery =`INSERT INTO storage (item, customer, ready, time) VALUES ('`;
	storquery = storquery +order;
	storquery = storquery + `', '`;
	storquery = storquery +name;
	storquery = storquery +`', current_timestamp);`;
	
	client.query(storquery, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('item added');
	});
	
	res.sendFile(`${__dirname}/custMenu.html`);
	
});


app.post('/addItem', (req, res) => {
	var item = req.body.item;
	var price = req.body.price;
	
	var query = `INSERT INTO menu (Item, Price) VALUES ('`;
	query= query +item
	query = query +`', '`;
	query = query +price
	query = query +`');`;
	
	client.query(query, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('item added');
	});
	res.sendFile(`${__dirname}/empMenu.html`);

});


app.post('/deleteItem', (req, res) => {
	var item = req.body.item;
	
	var query =`DELETE FROM menu WHERE item='`;
	query = query +item;
	query = query +`';`;
	
	client.query(query, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('item deleted');
	});
	
	res.sendFile(`${__dirname}/empMenu.html`);
	
});
//COFFEE SHOP FUNCTIONS END


//MAC FUNCTIONS HERE
//ENTER MAIN MAC MENU
app.get('/MACEnter',(req, res) => {
	console.log('ENTERING MAC')
	
	const orderQuery = `CREATE TABLE numstocall(num bigint);`;
	
	
	client.query(orderQuery, (err, result) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('Table Created');
	});
	
	var query = `TRUNCATE numstocall`;
	
	client.query(query, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('numbers cleared');
	});
	
	res.sendFile(`${__dirname}/enterNumbers.html`);
	
});



//ADD PHONE NUMBER
app.post('/addNumber', (req, res) => {
	var num = req.body.num;
	
	var query = `INSERT INTO numstocall (nums) VALUES ('`;
	query= query +num
	query = query +`');`;
	
	client.query(query, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('number added');
	});
	res.sendFile(`${__dirname}/enterNumbers.html`);

});


app.get('/makeCallTest', (req, res) =>{
	
	const query = `SELECT * FROM numstocall;`;
			  
	client.query(query, function (err, result, fields) {
		if (err){
			console.error(err);
			return;
			};
		console.log(result.rows);
		for (let i=0; i<result.rows.length; i++){
			console.log(result.rows[i].nums);
		}
		});

	res.sendFile(`${__dirname}/enterNumbers.html`);
	
	
});

app.get('/clearNumbers', (req, res) => {
	var query = `TRUNCATE numstocall`;
	
	client.query(query, (err, res) => {
		if (err) {
			console.error(err);
			return;
		};
		console.log('numbers cleared');
	});
	res.sendFile(`${__dirname}/enterNumbers.html`);
	});


app.get('/viewNumbers', (req, res) => {

              const query = `SELECT * FROM numstocall;`;
			  
			  client.query(query, function (err, result, fields) {
				  if (err){
					  console.error(err);
					  return;
				  };
				  res.json(result.rows);
			  });
       
    });
	
//FINISH THESE
app.get('/makeCallCold', (req, res) => {
	console.log('Sending Call');
	
	const query = `SELECT * FROM numstocall;`;
			  
	client.query(query, function (err, result, fields) {
		if (err){
			console.error(err);
			return;
			};
		console.log(result.rows);
		for (let i=0; i<result.rows.length; i++){
			console.log(result.rows[i].nums);
			client2.calls.create({
		to:result.rows[i].nums,
		from:'13065176306',
		url:'https://handler.twilio.com/twiml/EH72e3448151da658aa4232d0d6e429bfd'
		//url:'https://handler.twilio.com/twiml/EH10f23877305e0e00ca8134d735874beb'
	}, function(error, message) {
		// The HTTP request to Twilio will run asynchronously. This callback
		// function will be called when a response is received from Twilio
		// The "error" variable will contain error information, if any.
		// If the request was successful, this value will be "falsy"
		if (!error) {
			// The second argument to the callback will contain the information
			// sent back by Twilio for the request. In this case, it is the
			// information about the text messsage you just sent:
			console.log('Success! The SID for this SMS message is:');
			console.log(message.sid);

			console.log('Message sent on:');
			console.log(message.dateCreated);
		} else {
			console.log('Oops! There was an error.');
		}
		});
		res.sendFile(`${__dirname}/MainMenu.html`)
		console.log('Done');
			}
			});
});
//FINISH THESE
app.get('/makeCallThunder', (req, res) => {
	console.log('Sending Call');
	
	const query = `SELECT * FROM numstocall;`;
			  
	client.query(query, function (err, result, fields) {
		if (err){
			console.error(err);
			return;
			};
		console.log(result.rows);
		for (let i=0; i<result.rows.length; i++){
			console.log(result.rows[i].nums);
			client2.calls.create({
		to:result.rows[i].nums,
		from:'13065176306',
		url:'https://handler.twilio.com/twiml/EHffeec41e5ba2f48a26ba59b54d3c4bb6'
		//url:'https://handler.twilio.com/twiml/EH10f23877305e0e00ca8134d735874beb'
	}, function(error, message) {
		// The HTTP request to Twilio will run asynchronously. This callback
		// function will be called when a response is received from Twilio
		// The "error" variable will contain error information, if any.
		// If the request was successful, this value will be "falsy"
		if (!error) {
			// The second argument to the callback will contain the information
			// sent back by Twilio for the request. In this case, it is the
			// information about the text messsage you just sent:
			console.log('Success! The SID for this SMS message is:');
			console.log(message.sid);

			console.log('Message sent on:');
			console.log(message.dateCreated);
		} else {
			console.log('Oops! There was an error.');
		}
		});
		res.sendFile(`${__dirname}/MainMenu.html`)
		console.log('Done');
			}
			});
});
//FINISH THESE	
app.get('/makeCallBroke', (req, res) => {
	console.log('Sending Call');
	
	const query = `SELECT * FROM numstocall;`;
			  
	client.query(query, function (err, result, fields) {
		if (err){
			console.error(err);
			return;
			};
		console.log(result.rows);
		for (let i=0; i<result.rows.length; i++){
			console.log(result.rows[i].nums);
			client2.calls.create({
		to:result.rows[i].nums,
		from:'13065176306',
		url:'https://handler.twilio.com/twiml/EH13622b99d2c54d361081f49338e34709'
		//url:'https://handler.twilio.com/twiml/EH10f23877305e0e00ca8134d735874beb'
	}, function(error, message) {
		// The HTTP request to Twilio will run asynchronously. This callback
		// function will be called when a response is received from Twilio
		// The "error" variable will contain error information, if any.
		// If the request was successful, this value will be "falsy"
		if (!error) {
			// The second argument to the callback will contain the information
			// sent back by Twilio for the request. In this case, it is the
			// information about the text messsage you just sent:
			console.log('Success! The SID for this SMS message is:');
			console.log(message.sid);

			console.log('Message sent on:');
			console.log(message.dateCreated);
		} else {
			console.log('Oops! There was an error.');
		}
		});
		res.sendFile(`${__dirname}/MainMenu.html`)
		console.log('Done');
			}
			});
});

//MAC FUNCTIONS END

//TESTING PHONE FUNCTIONS


app.get('/testPhone', (req, res) => {
	console.log('Sending text');
	
	client2.calls.create({
    to:'+13062819843',
    from:'13065176306',
    url:'https://handler.twilio.com/twiml/EH10f23877305e0e00ca8134d735874beb'
}, function(error, message) {
    // The HTTP request to Twilio will run asynchronously. This callback
    // function will be called when a response is received from Twilio
    // The "error" variable will contain error information, if any.
    // If the request was successful, this value will be "falsy"
    if (!error) {
        // The second argument to the callback will contain the information
        // sent back by Twilio for the request. In this case, it is the
        // information about the text messsage you just sent:
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);

        console.log('Message sent on:');
        console.log(message.dateCreated);
    } else {
        console.log('Oops! There was an error.');
    }
	});
	res.sendFile(`${__dirname}/MainMenu.html`)
	console.log('Done');
	
	
});


//SOUND FILES

app.get('/THUNDERSOUND', (req, res) =>{
	
	res.sendFile(`${__dirname}/TEST_THUNDER.mp3`);
	
	
});

app.get('/COLDSOUND', (req, res) =>{
	
	res.sendFile(`${__dirname}/TEST_COLD.mp3`);
	
	
});

app.get('/BROKESOUND', (req, res) =>{
	
	res.sendFile(`${__dirname}/TEST_BROKE.mp3`);
	
	
});
//


app.use('/', express.static('pages'));
console.log('up and running');


app.listen(PORT,HOST); 


