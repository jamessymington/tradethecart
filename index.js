const mysql = require('mysql2');
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


const connection = require("./connection.js");
const path = require("path");

const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const oneHour = 1000 * 60 * 60 * 1;

app.use(cookieParser());

app.use(sessions({
  secret: "myshows14385899",
  saveUninitialized: true,
  cookie: { maxAge: oneHour },
  resave: false
}));

//middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/cards", (req, res) => {
  let showid = req.query.pokeid;
  let readsql = "SELECT * FROM poke_card WHERE CardID = ? ";

  connection.query(readsql, [showid], (err, rows) => {
    if (err) throw err;
    res.send(`<h2>My Pokemon</h2><code>${rows[0].Name}</code> , <code>${rows[0].Type}</code> , <code>${rows[0].Rarity}</code> , <code>${rows[0].HP}</code> <br> <img src='${rows[0].image_url}'>`);


  });

});

app.get("/select", (req, res) => {
  const readsql = "SELECT * FROM poke_card";

  connection.query(readsql, (err, rows) => {
    if (err) throw err;
    res.render('cards', { title: 'List of cards', rowdata: rows });
  });
});

app.get('/filter', (req, res) => {
  let filter = req.query.sort;

  let defaultSortColumn = 'CardID';

  let filterSQL;
  if (filter === 'SetID') {
    filterSQL = 'SELECT CardID, Name, Rarity, SetID FROM poke_card ORDER BY SetID';
  } else {
    filterSQL = `SELECT CardID, Name, Rarity, SetID FROM poke_card ORDER BY ${filter || defaultSortColumn}`;
  }

  connection.query(filterSQL, (err, result) => {
    if (err) throw err;
    res.render('account', { filterlist: result });
  });
});



app.get('/admin/add', (req, res) => {
  const sessionobj = req.session;


  if (sessionobj.authen) {
    res.render('add');

  } else {
    res.send("please log in");
  }
});

app.post('/admin/add', (req, res) => {
  const pokemonN = req.body.pokemonname;
  const typeP = req.body.type;
  const rarityP = req.body.rarity;
  const hpP = req.body.hp;
  const imageP = req.body.image;

  const InsertPokemonSQL = 'INSERT INTO poke_card (Name, Type, Rarity, HP, image_url) VALUES (?, ?, ?, ?, ?)';

  connection.query(
    InsertPokemonSQL,
    [pokemonN, typeP, rarityP, hpP, imageP],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
});



app.get('/admin/delete/:Name', (req, res) => {
  const pokemonDelete = req.params.Name;
  res.render('delete', { Name: pokemonDelete });
});

app.post('/admin/delete/', (req, res) => {
  const pokemonDelete = req.body.Name;

  const deletePokemonSQL = 'DELETE FROM poke_card WHERE Name = ?';

  connection.query(deletePokemonSQL, [pokemonDelete], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});




app.get('/cards', (req, res) => {
  res.render('cards');
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/account', (req, res) => {
  const sessionobj = req.session;
  if (sessionobj.authen) {
      const uid = sessionobj.authen;

      const user = `SELECT * FROM poke_member WHERE MemberID = "${uid}" `;
      connection.query(user, (err, row) => {
          if (err) {
              return res.send('Error fetching user data');
          }

          const firstrow = row[0];

          const filterlistSQL = 'SELECT CardID, Name, Rarity, Type FROM poke_card';
          connection.query(filterlistSQL, (err, filterlist) => {
              if (err) {
                  return res.send('Error fetching filterlist data');
              }

              res.render('account', { userdata: firstrow, filterlist });
          });
      });
  } else {
      res.send("Please log in");
  }
});


app.get('/login', (req, res) => {
  res.render('login');
});


app.post('/', (req, res) => {
  const useremail = req.body.emailField;
  const userpassword = req.body.passwordField;
  const checkuser = ` SELECT * FROM poke_member WHERE email = "${useremail}" AND password = "${userpassword}" `;

  connection.query(checkuser, (err, rows) => {
    if (err) throw err;
    const numRows = rows.length;

    if (numRows > 0) {
      const sessionobj = req.session;
      sessionobj.authen = rows[0].MemberID;

      res.redirect('/account');
    } else {
      res.redirect('/');

    }
  });
});





app.listen(3000, () => {
  console.log('Server is listening on localhost:3000');
});

