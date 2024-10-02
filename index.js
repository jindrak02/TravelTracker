import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// db query
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: process.env.password,
  port: 5432
});

db.connect();
let countries = [];

// Route handlers
app.get("/", async (req, res) => {
  const result = await db.query("SELECT vc.country_code FROM visited_countries vc");
  countries = result.rows.map(row => row.country_code);
  console.log(countries);

  res.render("index.ejs", { countries: countries, total: countries.length });
});

app.post("/add", async (req, res) => {
  try {

    const country = req.body.country;
    console.log(country);

    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' LIMIT 1",
      [country.toLowerCase()]);

    if (result.rows.length === 0) {
      console.error(`Country code not found for country: ${country}`);
      return res.redirect("/?error=The%20country%20doesnt%20exist");
    }

    const country_code = result.rows.map(row => row.country_code);
    console.log(country_code[0]);

    try {
      await db.query("INSERT INTO visited_countries(country_code) VALUES ($1)", [country_code[0]]);
      res.redirect("/");
    } catch (error) {
      console.error(`Country already added.`);
      return res.redirect("/?error=The%20country%20already%20added");
    }

  } catch (error) {

    console.error("Error occurred", error);
    return res.redirect("/?error=Error%20occured,%20try%20again");

  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
