import bodyParser from "body-parser";
import express from "express";
import pg from "pg";
import bcrypt from "bcrypt"; 
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";


const port = 3000 ; 
const app = express();

const saltRounds = 0 ; 

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "secrets",
    password: "Acer31415161", 
    port: "5432" 
});

db.connect() ; 

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true})); 

app.use(session({
    secret: "TOPSECRETWORD", 
    resave: false, 
    saveUninitialized: true, // store into server memory 
    cookie:{
        maxAge: 1000 * 60 
    }
}));

app.use(passport.initialize()); 
app.use(passport.session()); 


app.get("/", (req, res)=>{
    res.render("home.ejs"); 
})

app.get("/login", (req, res)=>{
    res.render("login.ejs"); 
});

app.get("/register", (req, res)=>{
    res.render("register.ejs"); 
});

app.get("/secrets", (req, res)=>{
    //console.log(req.user);
    if(req.isAuthenticated()){
        res.render("secrets.ejs"); 
    }else {
        res.redirect("/login"); 
    }

});

app.post("/register", async (req, res)=>{
    const username = req.body.username; 
    const password = req.body.password; 

    const result = await db.query("SELECT * FROM users WHERE email = $1", [username]); 
    
    if (result.rows.length === 0 ) {
        bcrypt.hash(password, saltRounds, async (err, hash)=> {
            if (err)
                console.log(err); 
            else {
                const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;", [username, hash], (errDatabase ,result)=>{
                    if(errDatabase)
                        console.log("could not insert user info", errDatabase); 
                    else{
                        console.log("user info is inserted successfully"); 
                        const user = result.rows[0]; 
                        req.login(user, (err)=> {
                            console.log(err);
                            res.redirect("/secrets"); 
                        });
                    }
                }); 

            }   
        }); 
        
    } else {
        res.redirect("/login"); 
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/secrets", 
    failureRedirect: "/login" 
})); 

passport.use(new Strategy(async function verify(username, password, cb){

    console.log(username) ;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [username]); 

        if (result.rows.length > 0) {
            const user = result.rows[0];
            bcrypt.compare(password, user.password, (err, result)=> {
                if (err) {
                    return cb(err); 
                } else {
                    if(result) {
                        return cb(null, user); 
                    } else {
                        return cb(null, false); 
                    }
                }
            });
            
        } else {
            return cb("User not found");  
        }

    } catch(err){
            console.log(err);  
        }
})); 

passport.serializeUser((user, cb)=> {
    cb(null, user); 
}); 

passport.deserializeUser((user, cb)=> {
    cb(null, user); 
}); 

app.listen(port , ()=>{
    console.log(`Start running the server at localhost${port}`)
}); 

