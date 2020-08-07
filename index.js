
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const mysql = require('mysql'); //mysql connection

var bcrypt = require("bcryptjs"); //password

const config = require("./config/auth.config");
var jwt = require("jsonwebtoken"); //for json web-token


// parse application/json
app.use(bodyParser.json());
 
//create database connection
const conn = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'saas'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
//show all comments
app.get('/api/comments',(req, res) => {
  let sql = "SELECT * FROM comment ORDER BY comment.depth,comment.parent_id";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 

//add new registration
app.post('/api/registration',(req, res) => {
  let data = {username: req.body.username, password: bcrypt.hashSync(req.body.password,8)};
  let sql = "INSERT INTO users SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results,"message": "New Registration"}));
  });
});


//login
app.post('/api/login',(req, res) => {
  let data = {username: req.body.username, password: req.body.password};
    let sql = "SELECT user_id FROM users  WHERE username="+req.body.username;

  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    //check if password match
       var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        sql.password
      );

      if (!passwordIsValid) { //password does not match
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });


      }

  var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours -> short lived token
      });

        res.status(200).send({ //password matched
          id: user.id,
          username: user.username,
          accessToken: token
        });
      });

});
 
//Marking a user as spammer
app.put('/api/users/:id',(req, res) => {
  let sql = "UPDATE users SET spammer='"+req.body.spammer+"', WHERE user_id="+req.params.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Marking a user as TOP/FEATURED COMMENTER
app.delete('/api/users/top-commenter/:id',(req, res) => {
  let sql = "UPDATE users SET featured='"+req.body.featured+"', WHERE user_id="+req.params.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});
 
//Server listening
app.listen(4000,() =>{
  console.log('Server started on port 4000...');
});