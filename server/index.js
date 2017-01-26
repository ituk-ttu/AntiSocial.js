var app = require('express')();
var http = require('http').Server(app);
app.get("/", function(req, res) {
    res.send("yello");
    console.log("someone hacked us!!!!")
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

