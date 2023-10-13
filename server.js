const dotenv = require("dotenv");
dotenv.config();
const http = require("http");
const mongodb = require("mongodb");

const connectionString = process.env.MONGO_URL;
mongodb.connect(
    connectionString,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, client) => {
        if (err) console.log("Error on connection MongoDB");
        else {
            console.log("MongoDB connection succeed");
            module.exports = client;

            const app = require("./app");
            const server = http.createServer(app);
            let PORT = process.env.PORT || 5500;
            server.listen(PORT, function () {
                console.log(
                    `This server is running succesfully on port: ${PORT}, http://localhost:${PORT}`
                );
            });
        }
    }
);
