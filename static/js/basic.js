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
    if(dir = "down") {
	var endadj = -arrowwidth*2
    }
    if(dir = "up") {
	var endadj = arrowwidth*2
    }
    var slope = ((endy+endadj)-starty)/((endx+endadj)-startx);
    var negslope = (-1)/slope;
    var arrowpt1x = (arrowwidth/(Math.sqrt(1+(negslope*negslope))))+(endx+endadj);
    var arrowpt1y = ((arrowpt1x-(endx+endadj))*negslope)+(endy+endadj);
    var arrowpt2x = (-(arrowwidth)/(Math.sqrt(1+(negslope*negslope))))+(endx+endadj);
    var arrowpt2y = ((arrowpt2x-(endx+endadj))*negslope)+(endy+endadj);
    var arrowshaft = svg.line(startx,starty,endx+endadj,endy+endadj,{strokeWidth:arrowstroke,stroke:arrowcolor});
    var arrowhead = svg.polygon([[endx+endadj,endy+endadj],[arrowpt1x,arrowpt1y],
				 [endx,endy],[arrowpt2x,arrowpt2y],[endx+endadj,endy+endadj]],{fill:arrowcolor});
}

function changeArrowWidth(x) {
    arrowwidth = x;
}

function changeArrowStroke(x) {
    arrowstroke = x;
}

function crtLink(node1,node2) {
    var node1w = parseInt($(node1).css("width"));
    var node1h = parseInt($(node1).css("height"));
    var node1x = parseInt($(node1).css("top")) + node1w/2;
    var node1y = parseInt($(node1).css("left")) - node1h/2;
    var node2w = parseInt($(node2).css("width"));
    var node2h = parseInt($(node2).css("height"));
    var node2x = parseInt($(node2).css("top")) + node2w/2;
    var node2y = parseInt($(node2).css("left")) - node2h/2;
    if (node1x > node2x) {
	if (node1y > node2y) {
	    if(Math.atan2(node1y-node2y,node1x-node2x) > PI/4)
		crtarrow(node1x+node1w,node1y+node1h,node2x+node2w,node2y+node2h,"up","black");
	    //else
	//	crtarrow(node1x+node1
	}
    }
}

function crtLink(x1,x2,y1,y2) {
}
