var mysql = require("mysql");
var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var path = require("path");
const { response } = require("express");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodelogin"
});

var app = express();
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true
    })
);

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get("/login", function(req,res){
    response.sendFile(path.join(__dirname + "login.html"));
});

app.post("/auth", function(req,res){
    var username = req.body.username;
    var password = req.body.password;

    if(username && password){
        connection.query(
            "SELECT * FROM accounts WHERE username = ? and password = ?",[username,passowrd],
            function(error,results,fields){
                if(results.length > 0){
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.redirect("/webboard");
                }else{
                    res.send("Incorrect Username or password!");
                }
                res.end();
            }
        );
    }else{
        res.send("please enter username and password!");
        res.end();
    }
});

app.get("/home", function(req,res){
    if(req.session.loggedin){
        response.send("Welcome back, " + req.session.username + "!");

    }else{
        res.send("Please login to view this page");
    }
    res.end();
});


app.get("/signout", function(req,res){
    req.session.destroy(function(err){
        res.send("Signed out");
        res.end();
    });
});

app.get("/webboard",function(req,res){
    if(req.session.loggedin){
        connection.query("SELECT * FROM accounts",function(err,results){
            res.render("index.ejs",{
                posts: results
            });
            console.log(results);
        });
    }else{
        res.send("You must login first");
        console.log("PLease login first");
    }

    res.end();
});

app.listen(9000);
console.log("Listingi on port 9000")