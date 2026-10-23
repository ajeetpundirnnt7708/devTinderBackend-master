// app.get(/^\/us(e)?r$/,(req,res,next)=>{//     console.log("HI there")
//      next();
//      e.log("Yeah Baby again !!!!")
//     //res.send({message:"get User Data"});
 
// },(req,res,next)=>{
//     console.log("Second")
//     next();
//     console.log("Yeah Baby");
//     //res.send({message:"get User Data From second Route Handling"});

// },(req,res)=>{
//     res.send({message:"This is Third level Bro"})
// })


// app.post("/user/post",(req,res)=>{
//     res.send({message:"Save User Data"})
// })
// app.use("/get",(req,res)=>{
//     res.send({message:"Hello From Server"})
// })

//Its Also Work Like this We can define Like this 

// app.use("/",(req,res,next)=>{
//     next();
//     console.log("Waps mai a Gaya !!!")
//     //res.send("Hello Bro");
// })

// app.get("/user",(req,res,next)=>{
//     console.log("First Route");
//     next();
// })

// app.get("/user",(req,res,next)=>{
//     console.log("Seconnd Route");
//     res.send({message:"2nd Route Handler"});
//     next();//there is No route After This is returning back So its Not do anythings
// })

//handle Validate before if user is Authorized Then goes other req;
app.use("/admin",adminAuth);

app.get("/admin/getAllData",(req,res)=>{

    //We have to check If the request Is Autorized then Send Data other Wise we dont't allowed Them
    throw new Error ("something");
    res.status(200).send({message:"All Data send To User"})
    
})

app.get("/admin/deleteUser",(req,res)=>{
    res.send({message:"User Delete SuccessFully"})
})

app.get("/user/getdata",userAuth,(req,res)=>{
    console.log("Hehee");
    res.status(200).send({message:"User Auth successfully"});
})

app.post("/user/login",(req,res)=>{
    res.send({message:"User Login SuccessFully"})
})

app.use("/",(err,req,res,next)=>{
    if(err){
        res.status(500).send({message:"Something Went wrong"});
    }
})