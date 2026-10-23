const validator=require("validator");
const validateSignup=(req)=>{

    const { firstName, lastName, emailId, password, age } = req.body;
    if(!firstName || !lastName)throw new Error("Name is Not Valid");
    else if(!validator.isEmail(emailId)) throw new Error("Email is not Valid");
    else if(!validator.isStrongPassword(password)) throw new Error("Please Enter strong Password");


}
module.exports={validateSignup};