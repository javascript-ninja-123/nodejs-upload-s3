const express = require("express");
const bodyParser = require("body-parser");
const bb = require('express-busboy');
const path = require("path")
const AWS = require('aws-sdk'); 
var fs = require('fs')
var fs = require('fs-extra')
const uuid = require("uuid")
const streamingS3 = require('streaming-s3');
const {AWS_ACCESS_KEY, AWS_SECRET_KEY,BUCKET_NAME} = require("./key")
const app = express();
bb.extend(app,{
    upload: true,
    path: path.join(__dirname, 'img'),
    allowedPath: /./
})

app.use(bodyParser.json())




app.post("/upload", (req,res) => {
   if(Object.values(req.files).length === 0){
       return res.status(404).send({message:"you have not upload any file you fucker"})
   }
   try{
    const file = Object.values(req.files)[0]
    const src = fs.createReadStream(path.join(__dirname, "img",file.uuid, file.filename));
    var uploader = new streamingS3(src, {accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY},
    {
        Bucket: BUCKET_NAME, 
        Key: `${uuid()}-${file.filename}`, 
        ContentType: 'image/jpeg',
        ACL:"public-read"
    },  function (e, resp, stats) {
    if (e) return res.status(404).send({message:"was not able to upload your file to s3 succesfully"})
        fs.remove(path.join(__dirname, 'img', `${file.uuid}`), () => {
            res.status(200).send({message:"it is working really well"})
        });
    }
    );
   }
   catch(err){
       console.log(err)
       res.status(404).send({message:"server error", error:err})
   }
})


app.listen("5000", () => console.log("it is listening"))









