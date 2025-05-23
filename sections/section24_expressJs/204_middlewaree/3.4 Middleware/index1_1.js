import { dir } from "console";
import express from "express" 
import {dirname} from "path" 
import {fileURLToPath} from "url"
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url)) ; 

const app = express() ;
const port = 3000 ; 

app.use(bodyParser.urlencoded({extended: false}));



app.get("/" , (req, res)=>{
    res.sendFile(__dirname + "/public/index.html") ; 

});


app.post("/submit", (req, res)=> {
    console.log(req.body.street) ; 
    
  });

app.listen(port , ()=>{
    console.log(`the server is running on port ${port} successfully`);
});