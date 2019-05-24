
'use strict';


const express = require('express');
const http = require('http');
const ws = require('websocket').server;

const path = require('path');
const bodyParser = require('body-parser');
const cfenv = require('cfenv');

const cookieParser = require('cookie-parser');
const sessionSecret = {};
const appEnv = cfenv.getAppEnv();
const app = express();
const busboy = require('connect-busboy');
app.use(busboy());

app.use(cookieParser(sessionSecret));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('appName', 'patent-contract-app');
process.title = 'Z2B-C12';
app.set('port', appEnv.port);

app.set('views', path.join(__dirname + '/HTML'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/HTML'));
app.use(bodyParser.json());

app.use('/', require('./controller/restapi/router'));

let server = http.createServer();
let clients = [];
app.locals.index=-1;

app.locals.wsServer = new ws({httpServer: server});
app.locals.wsServer.on('request', function(request)
{
    app.locals.connection = request.accept(null, request.origin);
    app.locals.index = clients.push(app.locals.connection) - 1;
    console.log((new Date()) + ' Connection accepted.');
    app.locals.connection.on('message', function(message)
    {   let obj ={ime: (new Date()).getTime(),text: message.utf8Data};
        let json = JSON.stringify({ type:'Message', data: obj });
        app.locals.processMessages(json);
    });

    app.locals.connection.on('close', function(_conn) {
        console.log((new Date()) + ' Peer '+ app.locals.connection.socket._peername.address+':'+app.locals.connection.socket._peername.port+' disconnected with reason code: "'+_conn+'".');
        for (let each in clients)
            {(function(_idx, _arr)
                {if ((_arr[_idx].socket._peername.address === app.locals.connection.socket._peername.address) && (_arr[_idx].socket._peername.port === app.locals.connection.socket._peername.port))
                    {clients.splice(_idx, 1);}
            })(each, clients);}
    });
});

function processMessages (_jsonMsg)
{
    for (let i=0; i < clients.length; i++) {clients[i].send(JSON.stringify(_jsonMsg));}
}
app.locals.processMessages = processMessages;
server.on( 'request', app );
server.listen(appEnv.port, function() {console.log('Listening locally on port %d', server.address().port);});