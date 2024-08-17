import express from 'express';
import bodyParser from 'body-parser';
import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import dotenv from "dotenv";
import session from "express-session";
import bcrypt from "bcrypt";
import path from "path";
import { dirname } from 'path';
import  pg  from 'pg';

dotenv.config();

const app=express();
const port=3000;

app.use(session({
    secret:'my-secret',
    resave:false,
    saveUninitialized:true,
}));

app.use(bodyParser.urlencoded({extended:true}));

const users=[
    {
        email:"hello@gmail.com",
        password:"pass"
    }
];

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(
    {usernameField:"email",passwordField:"password"},
    async (email,password,done)=>{
        const user=users.find(u=>u.email===email);
        if(!user){
            return done(null,false,{
                message:'invalid username'
            });
        }
        if(user.password!=password){
            return done(null,false,{
                message:'invalid password'
            })
        }
        return done(null,user);
    }
));

passport.serializeUser((user,done)=>{
    done(null,user.email);
});

passport.deserializeUser((email,done)=>{
    const user=users.find(u=>u.email===email);
    done (null,user);
})


function isVerified(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.get('/',(req,res)=>{
    res.render("index.ejs");
})


app.get('/login',(req,res)=>{
    res.render("login.ejs");
});

app.post('/postLogin',passport.authenticate('local',{
    successRedirect:'/final',
    failureRedirect:'/login',
})
);
app.get('/final',isVerified,(req,res)=>{
   // res.redirect('/final');
    res.send("hello");
});

app.listen(port,()=>{
    console.log(`listening on http://localhost:${port}`);
});
