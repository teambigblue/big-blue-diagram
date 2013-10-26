$(document).ready(function() {
    $("#canvas").svg();
    $("#toolbar").draggable();
});

function crtRect(x,y,width,height) {
    var svg = $("#canvas").svg('get');
    var currect = svg.rect(x,y,width,height,4,4);
    $(currect).css('fill','white');
    $(currect).css('stroke','black');
}
