const express = require("express");
const app = express();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const cors = require("cors");

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const cookieParser = require("cookie-parser");
const session = require("cookie-session");
const jwt = require("jsonwebtoken");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());

app.use(
  cors({
    origin: ["https://thriving-gnome-8f51ab.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(cookieParser());

app.use(
  session({
    key: "userId",
    secret: "tacocat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 60 * 24,
    },
  })
);

app.post("/payment", cors(), async (req, res) => {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Membership",
      payment_method: id,
      confirm: true,
    });
    console.log("Payment", payment);
    res.json({
      message: "Payment successful",
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment failed",
      success: false,
    });
  }
});

// const db = mysql.createConnection({
//   user: "bbf33f876880c8",
//   host: "us-cdbr-east-05.cleardb.net",
//   password: "441049df",
//   database: "heroku_298f9947cf6ee96",
// });

var db = mysql.createPool({
  connectionLimit: 10,
  host: "us-cdbr-east-05.cleardb.net",
  user: "bbf33f876880c8",
  password: "441049df",
  database: "heroku_298f9947cf6ee96",
});

// const db = mysql.createConnection({
//   user: "root",
//   host: "localhost",
//   password: "tnwls12!",
//   database: "LoginSystem",
// });

db.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
  if (error) throw error;
  console.log("This is a TEST ", results[0].solution);
});

mysql: app.post("/signup", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO users (username, email, password) VALUES (?,?,?)",
      [username, email, hash],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
      }
    );
  });
});

app.post("/employersignup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const phone = req.body.phone;
  const position = req.body.position;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO employers (username, password, firstname, lastname, email, phone, position ) VALUES (?,?,?,?,?,?,?)",
      [username, hash, firstname, lastname, email, phone, position],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          res.send(result);
        }
      }
    );
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/employerlogin", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/companies", (req, res) => {
  db.query("SELECT * FROM companies_data", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/workexperiences", (req, res) => {
  db.query("SELECT * FROM work_experiences", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/likedjobs", (req, res) => {
  db.query("SELECT * FROM liked_jobs", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/employers", (req, res) => {
  db.query("SELECT * FROM employers", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/onetimejobsdata", (req, res) => {
  db.query("SELECT * FROM one_time_jobs", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/parttimejobs", (req, res) => {
  db.query("SELECT * FROM part_time_jobs", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/search", (req, res) => {
  const occupation = req.body.jobTitle;
  const city = req.body.city;

  db.query(
    `SELECT * FROM companies_data WHERE occupation = ? LIKE "%occupation%" AND city =?;`,
    [occupation, city],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/liked", (req, res) => {
  const id = req.body.id;
  const user_id = req.body.userid;
  const company_name = req.body.companyname;
  const occupation = req.body.occupation;

  db.query(
    "INSERT INTO liked_jobs (id, user_id, company_name, occupation) VALUES (?,?,?,?)",
    [id, user_id, company_name, occupation],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM users WHERE email = ?;", email, (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (response) {
          req.session.user = result;

          const id = result[0].id;
          const token = jwt.sign(
            {
              id: result[0].id,
              username: result[0].username,
              email: result[0].email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: 3600,
            }
          );
          req.session.user = result;

          res.json({ auth: true, token: token, result: result });
        } else {
          res.send({
            auth: false,
            message: "Invalid email or password",
          });
        }
      });
    } else {
      res.json({ auth: false, message: "User doesn't exist" });
    }
  });
});

app.put("/editresume", (req, res) => {
  const id = req.body.id;

  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phonenumber = req.body.phonenumber;
  const headline = req.body.headline;
  const summary = req.body.summary;
  const city = req.body.city;
  const state = req.body.state;
  const zipcode = req.body.zipcode;
  const inputFields = req.body.inputFields;

  db.query(
    "UPDATE users SET firstname = ?,lastname = ?, phonenumber = ?, headline = ?, summary = ?, city = ?, state = ?, zipcode =? WHERE id = ? ;",
    [
      firstname,
      lastname,
      phonenumber,
      headline,
      summary,
      city,
      state,
      zipcode,
      id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        let promises = inputFields.map((e) => {
          db.query(
            "INSERT INTO work_experiences (user_id, jobtitle, company, description, start, end) VALUES (?, ?, ?, ?, ?, ?)",
            [id, e.jobtitle, e.company, e.description, e.start, e.end]
          );
        });
        Promise.all(promises).then((finished) => {
          res.send(result);
        });
      }
    }
  );
});

app.post("/applied_jobs", (req, res) => {
  const user_id = req.body.user_id;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const phone = req.body.phone;
  const company_name = req.body.company_name;
  const occupation = req.body.occupation;

  db.query(
    "INSERT INTO applied_jobs (user_id, firstname, lastname, phone, company_name, occupation) VALUE (?, ?, ?, ?, ?, ?)",
    [user_id, firstname, lastname, phone, company_name, occupation],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// ************************* Employer page *******************************

app.post("/employerlogin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.query("SELECT * FROM employers WHERE email = ?;", email, (err, result) => {
    if (err) {
      res.send({ err: err });
    }

    if (result.length > 0) {
      bcrypt.compare(password, result[0].password, (error, response) => {
        if (response) {
          req.session.user = result;

          const id = result[0].id;
          const employerToken = jwt.sign(
            {
              id: result[0].id,
              username: result[0].username,
              email: result[0].email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: 3600,
            }
          );
          req.session.user = result;

          res.json({
            auth: true,
            employerToken: employerToken,
            result: result,
          });
        } else {
          res.send({
            auth: false,
            message: "Invalid email or password",
          });
        }
      });
    } else {
      res.json({ auth: false, message: "User doesn't exist" });
    }
  });
});

app.put("/editonetimejob", (req, res) => {
  const user_id = req.body.userId;
  const company_name = req.body.name;
  const occupation = req.body.occupation;
  const salary = req.body.salary;
  const phone = req.body.phone;
  const starting_date = req.body.startDate;
  const starting_time = req.body.startTime;
  const ending_date = req.body.endDate;
  const ending_time = req.body.endTime;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zipcode;

  db.query(
    "UPDATE one_time_jobs SET user_id = ?, company_name = ?, occupation = ?, salary = ?, phone = ?, starting_date = ?, starting_time = ?, ending_date = ?, ending_time = ?, street = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ? ;",
    [
      user_id,
      company_name,
      occupation,
      salary,
      phone,
      starting_date,
      starting_time,
      ending_date,
      ending_time,
      street,
      city,
      state,
      zip_code,
      user_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "UPDATE one_time_jobs SET user_id = ?, company_name = ?, occupation = ?, salary = ?, phone = ?, street = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ? ;",
          [
            user_id,
            company_name,
            occupation,
            salary,
            phone,
            street,
            city,
            state,
            zip_code,
            user_id,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.put("/editparttimejob", (req, res) => {
  const user_id = req.body.userId;
  const company_name = req.body.companyName;
  const occupation = req.body.occupation;
  const salary = req.body.salary;
  const phone = req.body.phone;
  const schedule = req.body.schedule;
  const period = req.body.period;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zipcode;

  db.query(
    "UPDATE part_time_jobs SET user_id = ?, company_name = ?, occupation = ?, salary = ?, phone =?, schedule = ?, period = ?, street = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ? ;",
    [
      user_id,
      company_name,
      occupation,
      salary,
      phone,
      schedule,
      period,
      street,
      city,
      state,
      zip_code,
      user_id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "UPDATE part_time_jobs SET user_id = ?, company_name = ?, occupation = ?, salary = ?, phone = ?,  schedule = ?, period = ?, street = ?, city = ?, state = ?, zip_code = ? WHERE user_id = ?;",
          [
            user_id,
            company_name,
            occupation,
            salary,
            phone,
            schedule,
            period,
            street,
            city,
            state,
            zip_code,
            user_id,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/parttimejobs", (req, res) => {
  const user_id = req.body.userId;
  const company_name = req.body.companyName;
  const occupation = req.body.occupation;
  const salary = req.body.salary;
  const phone = req.body.phone;
  const schedule = req.body.schedule;
  const period = req.body.period;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zipcode;

  db.query(
    "INSERT INTO part_time_jobs (user_id, company_name, occupation, salary, phone, schedule, period, street, city, state, zip_code) VALUE (?,?,?,?,?,?,?,?,?,?,?)",
    [
      user_id,
      company_name,
      occupation,
      salary,
      phone,
      schedule,
      period,
      street,
      city,
      state,
      zip_code,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "INSERT INTO companies_data (user_id, company_name, occupation, salary, phone, schedule, period, street, city, state, zip_code) VALUE (?,?,?,?,?,?,?,?,?,?,?)",
          [
            user_id,
            company_name,
            occupation,
            salary,
            phone,
            schedule,
            period,
            street,
            city,
            state,
            zip_code,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/onetimejobs", (req, res) => {
  const user_id = req.body.userId;
  const company_name = req.body.name;
  const occupation = req.body.occupation;
  const salary = req.body.salary;
  const phone = req.body.phone;
  const starting_date = req.body.startDate;
  const starting_time = req.body.startTime;
  const ending_date = req.body.endDate;
  const ending_time = req.body.endTime;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zipcode;

  db.query(
    "INSERT INTO one_time_jobs (user_id, company_name, occupation, salary, phone, starting_date, starting_time, ending_date, ending_time, street, city, state, zip_code) VALUE (?, ?, ?,?,?,?,?,?,?,?,?,?,?)",
    [
      user_id,
      company_name,
      occupation,
      salary,
      phone,
      starting_date,
      starting_time,
      ending_date,
      ending_time,
      street,
      city,
      state,
      zip_code,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        db.query(
          "INSERT INTO one_time_jobs (user_id, company_name, occupation, salary, phone, street, city, state, zip_code) VALUE (?,?,?,?,?,?,?,?,?)",
          [
            user_id,
            company_name,
            occupation,
            salary,
            phone,
            street,
            city,
            state,
            zip_code,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.send(result);
            }
          }
        );
      }
    }
  );
});

app.post("/paymentInfo", (req, res) => {
  const user_id = req.body.userId;
  const name = req.body.name;
  const street = req.body.street;
  const city = req.body.city;
  const state = req.body.state;
  const zip_code = req.body.zipcode;

  db.query(
    "INSERT INTO payment_info (user_id, name, street, city, state, zip_code) VALUE (?, ?, ?, ?, ?, ?)",
    [user_id, name, street, city, state, zip_code],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.delete("/remove/:company_name", (req, res) => {
  const company_name = req.params.company_name;

  db.query(
    "DELETE FROM liked_jobs WHERE company_name = ?",
    company_name,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

const PORT = 3001;

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${PORT}`);
});
