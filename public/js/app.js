var spinner = new Spinner(opts).spin($("#spinner"));

function send() {
    spinner.start();
    $.post("localhost:8080",
        {
            Name: $("#name").val(),
            Question: $("#question").val()
        }
    ).done(function (data) {
        spinner.stop();
    }.fail(function () {
        spinner.stop();
        alert("Alo is dickbutt");
        })
    );

}