import express from "express";
import cors from "cors";//CORS tells browsers which frontends may read the server’s responses.
import dotenv from "dotenv"; //Dotenv manages the server’s settings.


dotenv.config(); // Loads variables from your .env file into Node’s environment so the server can access configuration values through process.env.

const app = express();// creates the express application and stores it in the variable app. The variable app is used to configure and run the backend

app.use(cors());//Adds CORS middleware to the application. It adds permission-related headers to responses so browsers can allow requests between the frontend and backend when they have different origins.
app.use(express.json()); //Adds JSON-parsing middleware. It reads incoming request bodies containing JSON and converts them into JavaScript data that the routes can access through req.body.

const PORT = process.env.PORT || 5001;//Use the port provided by the environment. If no port was provided, use port 5001.
/*
process contains information and controls related to the running Node.js program.
process.env is only the part of process that contains environment variables, which are usually configuration values.
*/

app.get("/", (req, res) =>{
    res.json({
        message: "backend is running"     //When someone sends a GET request to the root route, send back a JSON message confirming that the backend is running.
    });
});

app.get("/api/health", (req, res) => { // /api/health is the route’s path.
  res.json({
    status: "ok",
    app: "RepForge API" //identifies which application sent the response.
  });
});

app.listen(PORT, () => {   //is a callback function that runs once the server has successfully started listening.
  console.log(`Server is running on http://localhost:${PORT}`); //Start the backend on the selected port, and once it starts successfully, print its local address in the terminal.
});