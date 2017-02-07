var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clk = require('chalk');
var bodyParser = require('body-parser');
var readline = require('readline');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.sqlite');
var bcrypt = require('bcrypt-nodejs');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({	extended: true })); // support encoded bodies
var questions = [];
var connections = [];
var timetable = [];
var timerTarget = 1;
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


io.on('connection', function(socket) {
    connections.push(socket);
    socket.user = null;
    console.log(clk.green('An user connected, waiting for authentification'));
    socket.on('disconnect', function() {
        if (connections.indexOf(socket) != -1) {
            connections.splice(connections.indexOf(socket), 1);
            console.log(clk.red('User ') + clk.red.bold(socket.user) + clk.red(' disconnected'));
        }
    });
    socket.on('authenticate', function(creds) {
        db.get('SELECT * FROM users WHERE username = ?', [creds.username], function (err, result) {
            if (result) {
                if (bcrypt.compareSync(creds.password, result.password)) {
                    socket.user = creds.username;
                    connections.push(socket);
                    console.log(clk.green('User ') + clk.green.bold(creds.username) + clk.green(' has been successfully authenticated'));
                    socket.emit('authenticate', {success: true, user: socket.user});
                } else {
                    console.log(clk.red('User ') + clk.red.bold(creds.username) + clk.red(' failed to authenticate: Wrong password'));
                    socket.emit('authenticate', {success: false, user: null});
                }
            } else {
                console.log(clk.red('User ') + clk.red.bold(creds.username) + clk.red(' failed to authenticate: No such user'));
                socket.emit('authenticate', {success: false, user: null});
            }
        });

    });
    socket.on('timer.get', function () {
        if (socket.user) {
            socket.emit('timer', timerTarget);
        }
    });
    socket.on('timer.set', function (target) {
        if (socket.user) {
            timerTarget = target;
            console.log(clk.blue.bold(socket.user) + clk.blue(' has updated countdown timer'));
            broadcastToAuthed('timer', target);
        }
    });
    socket.on('timetable.get', function () {
        if(socket.user) {
            console.log(clk.blue.bold(socket.user) + clk.blue(' requested updated timetable'));
            socket.emit('timetable', {timetable: timetable});
        }
    });
    socket.on('timetable.add', function (event) {
        console.log(clk.blue.bold(socket.user) + clk.blue(' attempting to add a timetable event'));
        if (socket.user) {
            timetable.push(event);
            db.run('INSERT INTO timetable (event, startTime) VALUES (?, ?)', [event.event, event.startTime], function () {
                broadcastToAuthed('timetable', {timetable: timetable});
                console.log(clk.green.underline(event.event) + clk.green(' added'));
            });

        }
    });
    socket.on('timetable.delete', function (event) {
        if (socket.user && timetable.indexOf(event) != -1) {
            timetable.splice(timetable.indexOf(event), 1);
            db.run('DELETE FROM timetable WHERE event = ? AND startTime = ?', [event.event, event.startTime], function () {
                broadcastToAuthed('timetable', {timetable: timetable});
            });
        }
    });
    socket.on('questions.get', function () {
        if (socket.user) {
            socket.emit('questions.list', {questions: questions});
        }
    });
});

function broadcastToAuthed(channel, message) {
    Object.keys(io.sockets.sockets).forEach(function(id) {
        io.sockets.sockets[id].emit(channel, message);
    });
}

function addUser(username, password) {
    console.log(clk.blue('Attempting to add user ') + clk.blue.bold(username));
    try {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, bcrypt.hashSync(password));
        console.log(clk.green('User ') + clk.green.bold(username) + clk.green(' has been successfully added!'))
    } catch (err) {
        console.log(clk.red('Failed to add user ') + clk.red.bold(username));
    }
}

app.post('/question', function (request, response) {
    console.log(request.body.question);
    questions.push(request.body.question);
    broadcastToAuthed('questions', request.body.question);
    response.send("true");
});

app.get('/timetable', function (request, response) {
    db.get('SELECT * FROM timetable', function (err, result) {
        response.send(result);
    });
});
db.all('SELECT * FROM timetable', function (err, rows) {
    timetable = rows;
    db.all('SELECT * FROM questions', function (err, rows) {
        questions = rows;
        console.log(clk.green('Reloaded data from database'));
        http.listen(3000, function () {
            console.log(clk.green('Listening on port 3000'));
        });
    });
});

rl.on('line', function (input) {
    var input_args = input.split(' ');
    switch (input_args[0]){
        case 'adduser':
            addUser(input_args[1], input_args[2]);
            break;
        default:
            console.log(clk.red('Unknown command!'));
    }
});

console.log(clk.green.bold.underline('Starting up...'));