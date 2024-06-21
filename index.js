const express = require('express');
const dotenv = require('dotenv');
const { Client } = require('pg');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '192.168.1.29';

// Cadena de conexión a la base de datos PostgreSQL
const connectionString = process.env.POSTGRES_URL;

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Conectado a la base de datos'))
  .catch(err => console.error('Error de conexión a la base de datos', err.stack));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + "/public/"));

// Ruta para obtener todos los registros de la tabla dni
app.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM dni');
    const registros = result.rows;
    res.render('home', { registros });
  } catch (err) {
    console.error('Error al obtener los registros', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para agregar un nuevo registro a la tabla dni
app.post('/agregar', async (req, res) => {
  const { nombre, dni, identificador } = req.body;
  try {
    await client.query('INSERT INTO dni (nombre, dni, identificador) VALUES ($1, $2, $3)', [nombre, dni, identificador]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al agregar el registro', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para eliminar un registro de la tabla dni
app.post('/eliminar/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await client.query('DELETE FROM dni WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al eliminar el registro', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para actualizar un registro de la tabla dni
app.post('/modificar/:id', async (req, res) => {
  const id = req.params.id;
  const { nombre, dni, identificador } = req.body;
  try {
    await client.query('UPDATE dni SET nombre = $1, dni = $2, identificador = $3 WHERE id = $4', [nombre, dni, identificador, id]);
    res.redirect('/');
  } catch (err) {
    console.error('Error al modificar el registro', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
