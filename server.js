const express = require("express");
const app = express();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { join } = require("node:path");

// parse application/json, för att hantera att man POSTar med JSON
const bodyParser = require("body-parser");

// Inställningar av servern.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// User registration
const register = async (req, res) => {
  const { name, username, password } = req.body;
  const salt = await bcrypt.genSalt(10); // genererar ett salt till hashning
  const hashedPassword = await bcrypt.hash(password, salt); //hashar lösenordet
  const tempObj = { name, email, password: hashedPassword };
  // Store the user object in the database
  // …
  res.status(201).json({ message: "Registration successful" });
};

// Skapa användaren i databasen med hashedPassword i lösenordskolumnen
// Returnera användaren med id.

async function getDBConnnection() {
  // Här skapas ett databaskopplings-objekt med inställningar för att ansluta till servern och databasen.
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "users",
  });
}

app.get("/", (req, res) => {
  res.send(`welcom <br> 
  ruts: <br> 
  GET /users <br> 
  GET /users/[id] <br>
  POST /users (username, full name and email are requried) <br>
  GET /signup`);
});

app.get("/users", async function (req, res) {
  let connection = await getDBConnnection();
  let sql = `SELECT * FROM users`;
  let [results] = await connection.execute(sql);

  //res.json() skickar resultat som JSON till klienten
  res.json(results);
});

app.get("/users/:id", async function (req, res) {
  //kod här för att hantera anrop…
  let connection = await getDBConnnection();

  let sql = "SELECT * FROM users WHERE id = ?";
  let [results] = await connection.execute(sql, [req.params.id]);
  res.json(results[0]); //returnerar första objektet i arrayen
});

app.post("/users", async function (req, res) {
  console.log(req.body);
  if (req.body && req.body.username && req.body.name && req.body.email) {
    //skriv till databas
  } else {
    //returnera med felkod 422 Unprocessable entity.
    //eller 400 Bad Request.
    res.sendStatus(422);
  }

  let connection = await getDBConnnection();
  let sql = `INSERT INTO users (username, name, email)
  VALUES (?, ?, ?)`;

  let [results] = await connection.execute(sql, [
    req.body.username,
    req.body.name,
    req.body.password,
  ]);
  console.log("What");

  //results innehåller metadata om vad som skapades i databasen
  console.log(results);
  res.json(results);
});

app.put("/users/:id", async function (req, res) {
  //kod här för att hantera anrop…
  let sql = `UPDATE users
    SET username = ?, name = ?, email = ?
    WHERE id = ?`;
  let connection = await getDBConnnection();
  let [results] = await connection.execute(sql, [
    req.body.username,
    req.body.name,
    req.body.password,
    req.params.id,
  ]);
  res.json(results);
});

app.post("/login", async function (req, res) {
  //kod här för att hantera anrop…
  let sql = "SELECT * FROM users WHERE username = ?";
  let [results] = await connection.execute(sql, [req.body.username]);

  // Kontrollera att det fanns en user med det username i results
});

app.post("/logincheck", async function (req, res) {
  console.log(req.body.first_name);
});

app.get("/signup", async function (req, res) {
  res.sendFile(join(__dirname, "signup.html"));
});

app.post("/signup", async function (req, res) {
  console.log(req.body.name);

  try {
    const { name, username, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let connection = await getDBConnnection();
    let sql = `INSERT INTO users (username, name, password)
                  VALUES (?, ?, ?)`;

    let [results] = await connection.execute(sql, [
      username,
      name,
      hashedPassword, // Use hashedPassword here, not req.body.password
    ]);

    console.log(results);
    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Your request could not be handled - error occured :(" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
