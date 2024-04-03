const express = require("express");
const urlRoute = require("./routes/url")
const {connectToMongoDB}  = require('./connection')
const path = require("path");
const URL = require("./models/url")
const staticRouter = require("./routes/staticRouter")
const userRoute = require("./routes/user")
const cookieParser = require("cookie-parser")
const {restrictToLoggedinUserOnly} = require("./middlewares/auth")
const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(()=> console.log("MongoDb connected.."));


app.set("view engine", "ejs");
app.set("views",path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({extended:false }))
app.use(cookieParser());

app.use("/url",restrictToLoggedinUserOnly,urlRoute);
app.use("/user", userRoute);
app.use("/",staticRouter)


app.get("/url/:shortId",async (req,res)=>{
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    },{$push:{
        visitHistory:{
            timeStamp: Date.now()
        }
    }})

    return res.redirect(entry.redirectURL);
})
app.listen(PORT, ()=> console.log(`Server Started at ${PORT}`)); 