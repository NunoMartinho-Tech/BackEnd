//Criar o Server
const express = require('express');

const app = express();
app.use(express.json());
//const port = 4000;

app.listen(process.env.PORT, () => {
    console.log(`App iniciada`);
})

//Ligar à Base de Dados
const bd = require('./src/config/basedados');

bd.authenticate()
.then(console.log('Connection has been established successfully.'))
.catch(error => console.log('Error: '+error))

// Configurar CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type,Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
}); 

//Forçar atualização das tabelas
/* bd.sync({
    force: true
});  */

//Criar Tabelas

/* const indexmodels = require('./src/models/index'); */

//Importar MiddleWare
const middleware = require('./src/middleware');

// Rotas
const rota = require('./src/routes/RotasTestData');
const rotasCentro = require('./src/routes/RotasCentro');
const rotasSala = require('./src/routes/RotasSala');
const rotasUtilizador = require('./src/routes/RotasUtilizador'); 
const rotasReservas = require('./src/routes/RotasReserva');

app.use('/centros', rotasCentro);
app.use('/utilizadores', rotasUtilizador);
app.use('/salas', rotasSala); 
app.use('/testdata', middleware.checkToken, rota);
app.use('/reservas',middleware.checkToken, rotasReservas);  

