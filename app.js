const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const md5 = require('md5');
const app = express();

/*****************MONGO DB  *****************************/
const MongoClient = require('mongodb').MongoClient;
const urlDB = 'mongodb://admin:aunion67@ds129936.mlab.com:29936/blog';
let objectId = require('mongodb').ObjectID;
/**MONGO END**/


const ADMIN = {
	login: 'admin',
	password: '8134b84030cca5285ed0e0b31ba06f10'
}
// 8134b84030cca5285ed0e0b31ba06f10


//don't forget change to FALSE!!!!!!
let isAdmin = true;

// View engine setup
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');

// Static folder
app.use('/',express.static(path.join(__dirname, 'public')));

//Body parser Middleware
app.use(bodyParser.urlencoded({ 
	extended: true 
}));

app.get('/', function (req, res) {
  	MongoClient.connect(urlDB, (err, db) =>{
		db.collection('posts').find({}).toArray((err, posts) =>{
			res.render('index', {
				posts
			});
		});
		db.close();
	});
});

app.get('/index', function (req, res) {
	MongoClient.connect(urlDB, (err, db) =>{
		db.collection('posts').find({}).toArray((err, posts) =>{
			res.render('index', {
				posts
			});
		});
		db.close();
	});
});

app.get('/single/:id', (req, res) => {

	let id = new objectId(req.params.id);

	MongoClient.connect(urlDB, (err, db) => {
		db.collection("posts").findOne({_id: id}, (err, post) =>{
			if(err) {
				console.log(err);
				return res.status(400).send();
			}
			db.close();
			res.render('single', {
				post
			});
		});
	});
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.get('/contact', function (req, res) {
  res.render('contact',{
        	msg: ' '
    });
});

app.get('/work', function (req, res) {
  res.render('work');
});

app.post('/subscribe', (req, res) => {
	
	MongoClient.connect( urlDB, (err, db) => {
		if(err) {
			return console.log(err);
		}
		var subscriber = {
			email: req.body.subscriberEmail
		};
		db.collection('contacts').find(subscriber).toArray((err, result) =>{
			if(err) {
				console.log(err);
				res.sendStatus(500);
			} 
			if( result != [] ){
				res.render('subscribe', {
					msg: `${subscriber.email}`,
					status: false
				});
				db.close();
			}else if(result == []){
				db.collection('contacts').insert(subscriber, (err, result) => {
				if(err) {
					console.log(err);
					res.sendStatus(500);
				} 
				res.render('subscribe', {
					msg: `${subscriber.email}`,
					status: true
					});
				db.close();
				});
			}else {
				res.render('subscribe', {
					msg: false,
					status: false
					});
				db.close();
			}
		});
	});
});

app.post('/send', (req, res) => {
	const output = `
		<p> Yuo have new a new contact request</p>
		<h3> Contact details </h3>
		<ul>
			<li>Name: ${req.body.senderName}</li>
			<li>E-mail: ${req.body.senderEmail}</li>
			<li>Site: ${req.body.senderSite}</li>
			<li>Address: ${req.body.senderAddress}</li>
			<li>Subject: ${req.body.senderSubject}</li>
		</ul>
		<h3>Message</h3>
		<p>Name: ${req.body.senderMessage}</p>
	`;

	// NODEMAILER-----------------------------------------------------------------//

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
        	// якщо не входить, то сгенерувати новий акаунт на сайті
            user: 'y3qumluwy2owbddh@ethereal.email', // generated ethereal user
            pass: 'msy3mGCeXmyUb4P7t7'  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: `${req.body.senderEmail}`, // sender address
        to: 'yurchuk.dev@gmail.com', // list of receivers
        subject: 'Hire in you', // Subject line
        text: 'You have new message', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('contact', {
        	msg: 'Send is succesfull !'
        });

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

       
    });
});
// NODEMAILER-----------------------END--------------------------------------//

//-------- POST EDITION & ADMIN PANEL  START------//

app.get('/login', (req, res) => {
	if(isAdmin == true){
		res.render('login', {
			msg: 'You are autorized how ADMIN',
			status: true
		});
	}else {
		res.render('login', {
			msg: 'You are not autorization!',
			status: false
		});
	}
});
		
app.post('/login', (req, res) => {
	let user = {
		login: `${req.body.login}`,
		password: `${req.body.password}`
	};
	console.log("user:" + user.login + ' ' + user.password);

	if(	user.login == ADMIN.login && md5(user.password) == ADMIN.password){
		isAdmin = true;
		res.render('login', {
			msg: 'Autorization is successfull',
			status: true
		});
	}else if(user.login != ADMIN.login || md5(user.password) != ADMIN.password){
		isAdmin = false;
		res.render('login', {
			msg: 'You are not admin! Go away!',
			status: false
		});
	}else {
		isAdmin = false;
		res.render('login', {
			msg: 'Error, try again later',
			status: false
		});
	}
});

app.get('/create', (req, res) => {
	if(isAdmin == true){
		res.render('create');
	}else {
		res.render('login', {
			msg: 'You are not autorization!',
			status: false
		});
	}
});

app.post('/create', (req, res) => {
   const {postTitle, postDescription, postKeyWords, postContent} = req.body;
   console.log(postTitle, postDescription, postKeyWords, postContent);

   const onePost = {
      postTitle,
      postDescription,
      postKeyWords,
      postContent
   }; 

   MongoClient.connect(urlDB, function(err, db){
        db.collection("posts").insertOne(onePost, function(err, result){
             
            if(err) {
            	return res.status(400).send();
            } 
            db.close();
            res.redirect('/posts');
        });
    });
});

app.get('/posts', (req, res) => {
	if(isAdmin == true){
		MongoClient.connect(urlDB, (err, db) =>{
			db.collection('posts').find({}).toArray((err, posts) =>{
				res.render('posts', {
					msg: 'Вивод всіх постів',
					posts
				});
			});
			db.close();
		});

	}else {
		res.render('login', {
			msg: 'You are not autorization!',
			status: false
		});
	}
});

app.get('/edit', (req, res) => {
	if(isAdmin == true){
		res.render('posts');
	}else {
		res.render('login', {
			msg: 'You are not autorization!',
			status: false
		});
	}
});

app.get('/edit/:id', (req, res) => {

	let id = new objectId(req.params.id);

	MongoClient.connect(urlDB, (err, db) => {
		db.collection("posts").findOne({_id: id}, (err, post) =>{
			if(err) {
				console.log(err);
				return res.status(400).send();
			}
			db.close();
			res.render('edit', {
				msg: 'Post Editor',
				post
			});
		});
	});
});

app.post('/edit/:id', (req, res) => {
  if(!req.body) return res.sendStatus(400);

  	let id = new objectId(req.params.id);

	const {postTitle, postDescription, postKeyWords, postContent} = req.body;

	const onePost = {
		postTitle,
		postDescription,
		postKeyWords,
		postContent
	}; 
    MongoClient.connect(urlDB, (err, db) => {
        db.collection("posts").findOneAndUpdate({_id: id}, { $set: onePost},
             {returnOriginal: false }, (err, result) => {

            	if(err) return res.status(400).send();            
            	 let user = result.value;
            	db.close();
            	res.redirect('/posts');
        });
    });

});





app.get('/delete', (req, res) => {
	if(isAdmin == true){
		res.render('delete');
	}else {
		res.render('login', {
			msg: 'You are not autorization!',
			status: false
		});
	}
});

app.get('/logout', (req, res) => {
	isAdmin = false;
	res.render('login', {
			msg: 'You left on admin panel!',
			status: false
	});
})
//------- POST EDITION & ADMIN PANEL  END--------//

app.use((req, res, next) => {
	res.send('ERROR 404');
	next();
}); 

app.use((error, req, res, next) => {
	console.log(error);
	res.send('ERROR 500, server not found');
	next();
});

app.listen(3000 , function(){
	console.log("APP started");
});