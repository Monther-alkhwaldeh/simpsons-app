'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
app.set('view engine','ejs');
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}));
// Specify a directory for static resources
app.use(express.static('public'));

// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating

// Use app cors


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',renderQuote);
app.post('saveQuote',saveQuote);
app.get('/savedquote',renderSaved);
app.get('details/:id',quoteDetails);
app.delete('/delete/:id',deleteQuote);

// callback functions
function renderQuote(req,res){
    const num=10;
    const url=`https://thesimpsonsquoteapi.glitch.me/quotes?count=${num}`;
    superagent.get(url).then((results)=>{
    // console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',results.body);
    const quotes= results.body.map(object => new Quote(object));
    res.render('index',{quotes:quotes})
}).catch(error =>{
    console.log(error);
});
}
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function saveQuote(req,res){
    const {quote,character,image,characterDirection}=req.body;
    const safeValues=[quote,character,image,characterDirection];
    const sqlQuery='INSERT INTO qou (quote,character,image,characterDirection) VALUES ($1,$2,$3,$4);';
    client.query(sqlQuery,safeValues).then(()=>{
        res.redirect('index');
    })
}

function renderSaved(req,res){
    const sqlQuery='SELECT * FROM qou;'
    client.query(sqlQuery).then((results)=>{
        res.render('savedquote',{results:results.rows});
    })
}


function quoteDetails(req,res){
    const id=req.params.id;
    const sqlQuery=`SELECT * FROM qou WHERE id=${id};`;
    client.query(sqlQuery).then((results)=>{
        res.render('detail',{results:results.rows[0]});
    })
}

function deleteQuote(req,res){
    const id=req.params.id;
    const sqlQuery=`DELETE FROM qou WHERE id=${id};`;
    client.query(sqlQuery).then(()=>{
        res.redirect('index')
    })
}

// helper functions
function Quote(data){
    this.quote=data.quote;
    this.character=data.character;
    this.image=data.image;
    this.characterDirection=data.characterDirection;
    console.log(this);
}

// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
