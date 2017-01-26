var app = require('express')();
var http = require('http').Server(app);

app.get('/hello', function (request, response) {
    console.log("hello");
    response.send("hello nigger");
});

http.listen(3000, function () {
    console.log('Listening on port 3000');
});