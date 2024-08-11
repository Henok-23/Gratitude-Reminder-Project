import express from "express"
import bodyParser from "body-parser";
import pg from "pg";
import nodemailer from "nodemailer";
import schedule from "node-schedule";

const app=express();
const port=3000;


//This is the conenction to our gratitude database
const db=new pg.Client({
    user:"ubuntu", 
    host:"localhost", 
    database:"postgres", 
    password:"asbhen",
    port:5432, 
});
db.connect()


//This is the body parse we got 
app.use(bodyParser.urlencoded({ extended: true }));
//This links to the public folder we got
app.use(express.static("public"));


//This will hold the ID our current User 
var currentUser;

//this render the home page we got
app.get("/", (req, res)=>{
    res.render("home.ejs");
});

//We have basically attached it to Our login we already got
app.get("/login", (req, res)=>{
    res.render("login.ejs")
});
app.get("/register", (req, res)=>{
    res.render("register.ejs");
})

/


//this the the code for the post login
app.post("/login", async(req, res)=>{

    //use var where ever you would like to chaneg something about the web app
    var email=req.body.email.trim()
    email=email.toLowerCase();
    const password=req.body.password.trim();


    //We are getting rid of spaces here with .trim()
    try{
        const result =await db.query("SELECT * FROM userslogin WHERE email=$1", [email]);
        if (result.rows.length>0){
            const temp=result.rows[0];

            const dataPassword=temp.password;
            currentUser=temp.id;
            //console.log("This is the current user:", currentUser);
            if (password==dataPassword){
                
                //This two lines are what renders the main page with a list visiable
                const uidLog=await getDatafunc();
                res.render("main.ejs", {userdataImport:uidLog});
            }
            else{
                res.send("Incorrect password, To reset the password please contact gratitude1reminder@gmail.com")
            }
            
        }
        else{
            res.send("Please, register or insert correct email adress. For any other help or question contact gratitude1reminder@gmail.com")
        }
    }
    catch(err){
        console.log(err);
    }

});









//This is the global data we are going to insert
var Name, Password, Email, Passcode;
app.post("/register", async(req, res)=>{
    //we don't need ; after trim() function, we got down there
    var name=req.body.name.trim();
    var password=req.body.password.trim();
    var email=req.body.email.trim();

    Name=name;
    Password=password;
    Email=email.toLowerCase();


    if (password.length!=5){
        return res.send("You password length isn't equal five, please try again and insert password with 5 characters only, you can cotact gratitude1reminder@gmail.com")
    }
    

        try{
            const result=await db.query("SELECT * FROM userslogin WHERE email=$1", [Email])
            if (result.rows.length==0){
                //This is the passcode we will send to the user that we got
                var passcode =  String(password)+ String(Math.ceil((Math.random()*100000+1)));
                Passcode=passcode;

                //since everything is good, we have to send confirmation email to the user or client
                //we don't need to require
                var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gratitude1reminder@gmail.com',
                    pass: 'tbre avzg uane mdsk'
                }
                });

                var mailOptions = {
                from: 'gratitude1reminder@gmail.com',
                to: email,
                subject: 'Gratitude Email Confirmation',
                html:`<p> Hello  ${name} </p>
                     <br/>
                    <p> Your confirmation code is : ${passcode}</p>
                    <br/>
                    <p>Thank You, <p>
                    <p> Gratitude over worries <p>
                    `,
                    
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                });


                res.render("confirmation.ejs");
            }
            else{
                res.send("Email address already exist in your database, please try to sign in or contact gratitude1reminder@gmail.com")
            }
        }
        catch(err){
            console.log(err);
        }
        
     

        }); 





//This is the code for confirmation page
app.post("/confirm", async(req, res)=>{
  if (req.body.pascode.trim()==Passcode){
    
    try{
        await db.query("INSERT INTO userslogin (name, email, password) VALUES($1, $2, $3)",
        [Name, Email, Password]);
    }
   
    catch(err){
        console.log(err);
    }

    var temp4 = await db.query("SELECT id FROM userslogin WHERE email = $1", [Email]);
    temp4=temp4.rows[0];
    currentUser=temp4.id;
    //console.log("current user:", currentUser);

    //This two lines are what renders the main page with a list visiable
    const uidLog=await getDatafunc();
    res.render("main.ejs", {userdataImport:uidLog});
  }
  else{
    res.send("Incorrect Passcode please make sure you got the correct confrimation code or contact us gratitude1")
  }

});

//This function returns list of gratitude the current user has got and returns it as a list
//we actaully need to combine this one to one relationship, we have got from the two tables
async function getDatafunc() {
                // Query to fetch 'infr' values from usersData for the specified user_id
                const res = await db.query("SELECT infr FROM usersdata WHERE user_id = $1;", [currentUser]);
        
                // Log the result to check the fetched data
                //console.log("Before the Array output", res.rows);

                //we turning everything into an array now 
                let userGratitude = [];
                res.rows.forEach((gratitude) => {
                    userGratitude.push(gratitude.infr);
                });
                //userGratitude has all the datas that we have and got
               // console.log("After the Array:", userGratitude)
                // Return the result
                return userGratitude;
        }
            
        
        
        
//the big issue was the fact that the login does call the post insert data functiong we got 

app.get("/main", async(req, res)=>{
       
        
         // Fetch user data
         const uiD = await getDatafunc();
        // Render the page and pass data to the template
        res.render("main.ejs");
   

    });


//The code below is basically for the main page that we have got
app.post("/insertData", async(req, res)=>{

    //Here we are simply inserting the data that we have got
    const insertData=req.body.insertD;
    const userId = parseInt(currentUser, 10);

    


    try{

        await db.query("INSERT INTO usersdata (infr, user_id) VALUES($1, $2)", 
        [insertData, userId]);

        //We getting the new data
        const uiD = await getDatafunc();
        // console.log(uiD)
    }
    catch(err){
        console.log(err);
    }

    //This two lines are what renders the main page with a list visiable
    const uidLog=await getDatafunc();
    res.render("main.ejs", {userdataImport:uidLog});;


//after inserting gratitude to our database, we simply 

});














//This function basically gets the current user gratitude we have got
async function getCurUser(curUser) {
    // Query to fetch 'infr' values from usersData for the specified user_id
    const res = await db.query("SELECT infr FROM usersdata WHERE user_id = $1;", [curUser]);

    // Log the result to check the fetched data
    //console.log("Before the Array output", res.rows);

    //we turning everything into an array now 
    let userGratitude = [];
    res.rows.forEach((gratitude) => {
        userGratitude.push(gratitude.infr);
    });
    //userGratitude has all the datas that we have and got
    //console.log("After the Array:", userGratitude)
    // Return the result
    return userGratitude;
}


//This is part sends email for each client we got on a weekly basis

async function sendEmails(userr, d1, d2, allU) {


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'gratitude1reminder@gmail.com',
            pass: 'tbre avzg uane mdsk'
        }
        });
        


        var mailOptions = {
        from: 'gratitude1reminder@gmail.com',
        to: allU[userr][1],
        subject: 'Gratitude Email Weekly Reminder',
        html:`<p> Hello  ${allU[userr][2]} </p>
             <br/>
            <p> You are thankful for   : ${d1} and ${d2}</p>
            <br/>
            <p>Thank You, <p>
            <p> Gratitude over worries <p>
            `,
            
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });




}




//This is read db Query
async function fetchData() {
    let data;
    try {
        const res = await db.query("SELECT * FROM userslogin");
        data=res;
    } catch (err) {
        console.error("Error executing query", err.stack);
    }
    return data
}
async function realBackend(){
//#we can declare rows on the function 
let temp4=await fetchData();
//Here we are creating the data for each people that we currently do have
let allUsers = [];
    temp4.rows.forEach((ppl) => {
        allUsers.push([ppl.id, ppl.email, ppl.name]);
    });
    //console.log(allUsers);

//now we go through each user and send a random gratitude email 
for(var i=0;i<allUsers.length;++i){
    var allGrat= await getCurUser(allUsers[i][0])
    var rand=Math.floor(Math.random()*allGrat.length);
    
    var rand2=Math.floor(Math.random()*allGrat.length);
    while (rand==rand2 & allGrat.length>1){
        rand2=Math.floor(Math.random()*allGrat.length);
    }
    //console.log("no 1", allGrat[rand]);
   // console.log("no 2", allGrat[rand2]);
    //console.log("all data gratit", allGrat);
    //here we are sending emails for each users we have got
   await sendEmails(i, allGrat[rand], allGrat[rand2], allUsers);

}

var totalUsers=temp4.rows.length
//console.log(temp4.rows.length) ;

return 
}



//This is the logout page for the main function that we have got 
app.get("/logout", (req, res)=>{
    res.render("home.ejs");
});



//This is how we schedule jobs


//This basically sends an email to all the clients once a week by choosing the date randomly
const mainjob = schedule.scheduleJob('0 0 * * 0', function(){
   const day= Math.floor(Math.random()*5)+1;
   /*  if the selceted data is eqaul to one of this vairable it will send it to all of them*/
   if (day==1){
    const job = schedule.scheduleJob('0 9 * * 1', function(){
     realBackend();
     job.cancel()

    });
   }
   else if (day==2){
    const job = schedule.scheduleJob('0 9 * * 2', function(){
        realBackend();
        job.cancel();

    });}
  
   
   else if (day==3){
    const job = schedule.scheduleJob('0 9 * * 3', function(){
        realBackend();
        job.cancel();

    });}
    else if (day==4){
        const job = schedule.scheduleJob('0 9 * * 4', function(){
            realBackend();
            job.cancel();
    
        });}
    else if (day==5){
            const job = schedule.scheduleJob('0 9 * * 5', function(){
                realBackend()
                job.cancel();
        
            });}
    /*This is the end of our function simply*/
     });


app.listen(3000, ()=>{
    console.log("Server running n port 3000");
});