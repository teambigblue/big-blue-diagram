rectLocX = 0;
rectLocY = 0;



$(window).ready(function() {
    $("#crtRect").click(function() {
	$("#mainCanvas").append("<rect width='100px' height='200px' stroke='black' x="+rectLocX.toString()+"px y="+rectLocY.toString()+"px></rect>");
	rectLocX = rectLocX + 10;
	rectLocY = rectLocY + 10;
	});
});
