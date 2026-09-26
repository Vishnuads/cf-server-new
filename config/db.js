const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        const con = await mongoose.connect(process.env.DATABASE);
        console.log(`Database connected ${con.connection.host}`);
    }
    catch(error){
        console.error(`DB connection failed: `, error.message);
        console.log("error");
        process.exit(1);
    }

};

module.exports = connectDB;
