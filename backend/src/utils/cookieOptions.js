import dotenv from "dotenv"; // issue
dotenv.config(); // i dont know why i have to config this dotenv again 

const options = {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", //CSRF attacks cross-sites request forgery attacks
  };


  export {options}