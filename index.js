require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models  = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path') 
const WebSocket = require('ws');
const http = require('http');
const RewiewsController = require('./controllers/rewiewsController')

const PORT = process.env.PORT || 5000

const app = express()
const server = http.createServer(app);
app.use(cors())
app.use(express.json())
app.use(fileUpload({}))
app.use('/api/', express.static(path.resolve(__dirname,'static')))
app.use('/api/',router)

app.use(errorHandler)


const wss = new WebSocket.Server({ server });

wss.on('connection', async function connection(ws) {
    ws.on('message', async function incoming(message) {
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send('mesNew');
            }
          });
    });
  });

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, () => console.log(`SERVER STARTED ON PORT ${PORT}`))
    } catch (e) {
        console.log(e);
    }
}

start()
