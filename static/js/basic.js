var arrowwidth = 7;
var arrowstroke = 2;

$(document).ready(function() {
    $("#canvas").svg();
    $("#toolbar").draggable();
    svg = $("#canvas").svg('get');
});

function crtRect(x,y) {
    var currect = svg.rect(x,y,100,100,4,4);
    $(currect).css('fill','white');
    $(currect).css('stroke','black');
}

function crtArrow(startx,starty,endx,endy,dir,arrowcolor) {
    if(dir == "downr") {
	var endadjv = -arrowwidth*2;
	var endadjh = -arrowwidth*2;
    }
    if(dir == "upr") {
	var endadjv = arrowwidth*2;
	var endadjh = -arrowwidth*2;	
    }
    if(dir == "downl") {
	var endadjv = -arrowwidth*2;
	var endadjh = arrowwidth*2;	
    }
    if(dir == "upl") {
	var endadjv = arrowwidth*2;
	var endadjh = arrowwidth*2;	
    }
    var slope = (endy-starty)/(endx-startx);
    var negslope = (-1)/slope;
    var arrowpt1x = (arrowwidth/(Math.sqrt(1+(negslope*negslope))))+(endx);
    var arrowpt1y = ((arrowpt1x-(endx))*negslope)+(endy);
    var arrowpt2x = (-(arrowwidth)/(Math.sqrt(1+(negslope*negslope))))+(endx);
    var arrowpt2y = ((arrowpt2x-(endx))*negslope)+(endy);
    var arrowshaft = svg.line(startx,starty,endx,endy,{strokeWidth:arrowstroke,stroke:arrowcolor});
    //Figure out endpoints
    var arrowhead = svg.polygon([[endx,endy],[arrowpt1x,arrowpt1y],
				 [endx,endy],[arrowpt2x,arrowpt2y],[endx,endy]],{fill:arrowcolor});
}

function changeArrowWidth(x) {
    arrowwidth = x;
}

function changeArrowStroke(x) {
    arrowstroke = x;
}

function crtLink(node1,node2) {
    var node1w = parseInt($(node1).attr("width"));
    var node1h = parseInt($(node1).attr("height"));
    var node1y = parseInt($(node1).attr("y")) + (node1h/2);
    var node1x = parseInt($(node1).attr("x")) + (node1w/2);
    var node2w = parseInt($(node2).attr("width"));
    var node2h = parseInt($(node2).attr("height"));
    var node2y = parseInt($(node2).attr("y")) + (node2h/2);
    var node2x = parseInt($(node2).attr("x")) + (node2w/2);
    if (node1x > node2x) {
	if (node1y > node2y) {
	    if(Math.atan2(node1y-node2y,node1x-node2x) > Math.PI/4){
		crtArrow(node1x,node1y-(node1h/2),node2x,node2y+(node2h/2),"upl","red");	
	    }
	    else {
		crtArrow(node1x-(node1w/2),node1y,node2x+(node2w/2),node2y,"upl","red");
	    }
	}
	else {
	    if(Math.atan2(node1y-node2y,node1x-node2x) < -Math.PI/4){
		crtArrow(node1x,node1y+(node1h/2),node2x,node2y-(node2h/2),"downl","red");	
	    }
	    else {
		crtArrow(node1x-(node1h/2),node1y,node2x,node2y-(node2h/2),"downl","red");
	    }
	}
    }
}

//function crtLink(x1,x2,y1,y2) {
//}
