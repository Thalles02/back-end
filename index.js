const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

//inicializando aplicação
const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);

client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok");
});

app.get("/item", (req, res) => {
  try {
    client.query("SELECT * from cardapio", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a query.", err);
      }
      res.send(result.rows);
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/item/:id", (req, res) => {
  try {
    console.log("Chamou /:id " + req.params.id);

    client.query(
      "SELECT * from cardapio WHERE id = $1",
      [req.params.id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a query.", err);
        }
        console.log("chamou get usuários");
        res.send(result.rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete("/item/:id", (req, res) => {
  try {
    console.log("Chamou /:id " + req.params.id);
    const id = req.params.id;
    client.query(
      "DELETE FROM cardapio WHERE id = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a query.", err);
        } else if (result.rowCount == 0) {
          res.status(400).json({ info: "Registro não encontrado" });
        } else {
          res.status(200).json({ info: `Registro excluido com sucesso. Código: ${id}` });
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/item", (req, res) => {
  try {
    console.log("Chamou post " + req.body);
    const {nome, sabor, preco} = req.body;
    client.query(
      "INSERT INTO cardapio (nome, sabor, preco) VALUES ($1, $2, $3) RETURNING * ",
      [nome, sabor, preco],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a query.", err);
        } 
        const {id} = result.rows[0];
        res.setHeader("id", `${id}`)
        res.status(201).json(result.rows[0] )
        console.log(result)
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.put("/item/:id", (req, res) => {
  try {
    console.log("Chamou update " + req.body);
    const id = req.params.id
    const {nome, sabor, preco} = req.body;
    client.query(
      "UPDATE cardapio SET nome=$1, sabor=$2, preco=$3 WHERE id=$4",
      [nome, sabor, preco, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a query.", err);
        }else{
          res.setHeader("id", `${id}`)
          res.status(202).json({id: `${id}`})
        }
        console.log(result)
      }
    );
  } catch (error) {
    console.log(error);
    console.log("testando_git");
  }
});


app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);