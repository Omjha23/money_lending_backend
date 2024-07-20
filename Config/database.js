const mongoose = require("mongoose");
const Connectdatabase = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("DB connected Successfully");



    } catch (error) {
        console.error(`Error connecting to DB: ${error.message}`);
        process.exit(1);

    }

}
module.exports = Connectdatabase;