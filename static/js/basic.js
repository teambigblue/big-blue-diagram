var arrowwidth = 7;
var arrowstroke = 2;
var eventStack;
var objectStack;

$(document).ready(function() {
    $("#canvas").svg();
    $("#toolbar").draggable({'containment':'window'});
    svg = $("#canvas").svg('get');
    initCanvas();
    initEventStack();
    readyToolbar();
    initObjectStack();
});

function initObjectStack() {
    objectStack = new Object();
    objectStack.rects = [];
    objectStack.links = [];
}

function initEventStack() {
    eventStack = new Object();
    eventStack.addingRect = false;
    eventStack.addingLink1 = false;
    eventStack.linkPt;
    eventStack.linkNode;
    eventStack.selectedRect;
    eventStack.addingLink2 = false;
}

function initCanvas() {
    $("#canvas").click(function(e) {
	var parentOffset = $(this).parent().offset();
	var relX = e.pageX - parentOffset.left;
	var relY = e.pageY - parentOffset.top;
	if (eventStack.addingRect) {
	    crtRect(relX,relY);
	    eventStack.addingRect = false;
	}
	else if (eventStack.addingLink1 && !eventStack.addingLink2) {
	    eventStack.addingLink2 = true;
	    eventStack.linkPt = [relX,relY];
	    eventStack.addingLink1 = false;
	}
	else if (eventStack.addingLink2 && !eventStack.linkNode) {
	    var linkobj = new Object();
	    if(eventStack.linkNode) {
		linkobj.node1 = eventStack.linkNode;
	    }
	    if(eventStack.linkPt) {
		linkobj.pt1 = eventStack.linkPt;
	    }
	    linkobj.pt2 = [relX,relY];
	    initEventStack();
	    crtLink(linkobj);
	}
    });
}

function readyToolbar() {
    $("#addrect").click(function() {
	initEventStack();
	eventStack.addingRect = true;
    });
    $("#addlink").click(function() {
	initEventStack();
	eventStack.addingLink1 = true;
    });
}

function crtRect(x,y) {
    var newID = objectStack.rects.length.toString();
    var curgroup = svg.group("rg"+newID);
    var currect = svg.rect(curgroup,x,y,100,100,4,4);
    $(currect).css('fill','white');
    $(currect).css('stroke','black');
    $(currect).css('z-index','3');
    $(currect).click(function() {
	if (eventStack.addingLink1) {
	    eventStack.addingLink2 = true;
	    eventStack.linkNode = currect;
	    eventStack.addingLink1 = false;
	}
	else if (eventStack.addingLink2 && eventStack.linkNode != currect) {
	    eventStack.addingLink2 = false;
	    var linkobj = new Object();
	    eventStack.addingLink2 = false;
	    if(eventStack.linkNode) {
		linkobj.node1 = eventStack.linkNode;
	    }
	    if(eventStack.linkPt) {
		linkobj.pt1 = eventStack.linkPt;
	    }
	    linkobj.node2 = currect;
	    eventStack.linkPt = undefined;
	    eventStack.linkNode = undefined;
	    crtLink(linkobj);
	}
    });
    $(currect).attr('id',"r"+newID);
    currect.text = svg.text(curgroup,x+10,y+15,"");
    currect.head = [];
    currect.tail = [];
    currect.flashing = false;
    currect.flashingInt;
    $(currect).keypress(function(event) {
	console.log("here");
	console.log(event.which);
    });
    $(currect).dblclick(function(event) {
	if(event.target.text.flashing) {
	    clearInterval(event.target.flashingInt);
	    event.target.flashing = false;
	    $(document).focus();
	}
	else {
	    eventStack.selectedRect = event.target;
	    event.target.flashingInt = setInterval(flashingHandler,500);
	    event.target.flashing = true;
	    $(event.target).focus();
	}
    });
    $(currect).draggable({'containment':$("#canvas")});
    $(currect).bind('drag', function(event, ui){
	var dx = event.target.getAttribute('x') - ui.position.left;
	var dy = event.target.getAttribute('y') - ui.position.top;
	event.target.text.setAttribute('x',ui.position.left+10);
	event.target.text.setAttribute('y',ui.position.top+15);
        event.target.setAttribute('x', ui.position.left);
	event.target.setAttribute('y', ui.position.top);
	for(var i=0;i<event.target.head.length;i++) {
	    changeArrowHead(event.target.head[i],dx,dy);
	}
	for(var i=0;i<event.target.tail.length;i++) {
	    changeArrowTail(event.target.tail[i],dx,dy);
	}
    });
    objectStack.rects.push(currect);
}

function crtArrow(startx,starty,endx,endy,dir,arrowcolor) {
    if(dir == "downl") {
	var endadj = arrowwidth*2;
    }
    if(dir == "upl") {
	var endadj = arrowwidth*2;
    }
    if(dir == "downr") {
	var endadj = -arrowwidth*2;
    }
    if(dir == "upr") {
	var endadj = -arrowwidth*2;
    }
    var slope = (endy-starty)/(endx-startx);
    var negslope = (-1)/slope;
    var arrowpt0x = (endadj/(Math.sqrt(1+(slope*slope))))+(endx);
    var arrowpt0y = ((arrowpt0x-(endx))*slope)+(endy);
    var arrowpt1x = (arrowwidth/(Math.sqrt(1+(negslope*negslope))))+(arrowpt0x);
    var arrowpt1y = ((arrowpt1x-(arrowpt0x))*negslope)+(arrowpt0y);
    var arrowpt2x = (-(arrowwidth)/(Math.sqrt(1+(negslope*negslope))))+(arrowpt0x);
    var arrowpt2y = ((arrowpt2x-(arrowpt0x))*negslope)+(arrowpt0y);
    var arrowshaft = svg.line(startx,starty,endx,endy,{'strokeWidth':arrowstroke,'stroke':arrowcolor});
    var arrowhead = svg.polygon([[arrowpt0x,arrowpt0y],[arrowpt1x,arrowpt1y],
				 [endx,endy],[arrowpt2x,arrowpt2y],[arrowpt0x,arrowpt0y]],{'fill':arrowcolor});
    var arrow = new Object();
    $(arrowhead).css("padding","50px");
    $(arrowshaft).css("padding","50px");
    $(arrowhead).css("z-index","3");
    $(arrowshaft).css("z-index","3");
    var c1 = svg.circle(endx,endy,Math.abs(endadj/5),{'fill':'white','stroke':'black','strokeWidth':1});
    var c2 = svg.circle(startx,starty,Math.abs(endadj/5),{'fill':'white','stroke':'black','strokeWidth':1});
    $(c1).hide();
    $(c2).hide();
    arrow.head = arrowhead;
    arrow.origStartX = startx;
    arrow.origStartY = starty;
    arrow.origEndX = endx;
    arrow.origEndY = endy;
    arrow.curStartX = startx;
    arrow.curStartY = starty;
    arrow.curEndX = endx;
    arrow.curEndY = endy;
    arrow.shaft = arrowshaft;
    arrow.ang = Math.atan2(endy-starty,endx-startx);
    arrow.c1 = c1;
    arrow.c2 = c2;
    $(arrowhead).hover( function() {
	$(c1).toggle();
	$(c2).toggle();
    });
    $(arrowshaft).hover( function() {
	$(c1).toggle();
	$(c2).toggle();
    });
    objectStack.links.push(arrow);
    return arrow;
}

function changeArrowWidth(x) {
    arrowwidth = x;
}

function changeArrowStroke(x) {
    arrowstroke = x;
}

function changeArrowHead(arrow,dx,dy) {
    var origx = arrow.origEndX;
    var origy = arrow.origEndY;
    var curx = arrow.curEndX;
    var cury = arrow.curEndY;
    var newx = curx-origx-parseInt(dx);
    var newy = cury-origy-parseInt(dy);;
    arrow.curEndX = curx-dx;
    arrow.curEndY = cury-dy;
    var theta = Math.atan2((cury-dy)-arrow.curStartY,(curx-dx)-arrow.curStartX);
    theta = (arrow.ang*180/Math.PI) - (theta*180)/Math.PI;
    if(arrow.head.hasAttribute('transform')) {
	var curtrans = arrow.head.getAttribute('transform');
	if(curtrans.indexOf('translate') >= 0) {
	    var newtrans = curtrans.replace(/translate[^\s]*/,'translate('+newx+','+newy+')');
	}
	else {
	    var newtrans = curtrans.concat(' translate('+newx+','+newy+')');
	}
	if(newtrans.indexOf('rotate') >= 0)  {
	    newtrans = newtrans.replace(/rotate[^\s]*/,'rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')');
	}
	else {
	    newtrans = newtrans.concat(' rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')');
	}
	arrow.head.setAttribute('transform',newtrans);
    }
    else {
	arrow.head.setAttribute('transform','rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')'+'translate('+newx+','+newy+')');
    }
    arrow.shaft.setAttribute('x2',curx-dx);
    arrow.shaft.setAttribute('y2',cury-dy);
    arrow.c1.setAttribute('cx',(curx-dx).toString());
    arrow.c1.setAttribute('cy',(cury-dy).toString());
}

function changeArrowTail(arrow,dx,dy) {
    var origx1 = arrow.shaft.getAttribute('x1');
    var origy1 = arrow.shaft.getAttribute('y1');
    var newx1 = parseInt(origx1)-parseInt(dx);
    var newy1 = parseInt(origy1)-parseInt(dy);
    arrow.shaft.setAttribute('x1',(newx1).toString());
    arrow.shaft.setAttribute('y1',(newy1).toString());
    arrow.c2.setAttribute('cx',(newx1).toString());
    arrow.c2.setAttribute('cy',(newy1).toString());
    var theta = Math.atan2(arrow.curEndY-newy1,arrow.curEndX-newx1);
    theta = (arrow.ang*180/Math.PI) - (theta*180)/Math.PI;
    if(arrow.head.hasAttribute('transform')) {
	var curtrans = arrow.head.getAttribute('transform');
	if(curtrans.indexOf('rotate') >= 0) {
	    var newtrans = curtrans.replace(/rotate[^\s]*/,'rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')');
	}
	else {
	    var newtrans = curtrans.concat(' rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')');
	}
	arrow.head.setAttribute('transform',newtrans);
    }
    else {
	arrow.head.setAttribute('transform','rotate('+theta*-1+','+arrow.curEndX+','+arrow.curEndY+')');
    }
    arrow.curStartX = newx1;
    arrow.curStartY = newy1;
}

function crtLink(obj) {
    var node1 = obj.node1;
    var node2 = obj.node2;
    var pt1 = obj.pt1;
    var pt2 = obj.pt2;
    var x1,y1;
    var x2,y2;
    if (pt1) {
	x1 = pt1[0];
	y1 = pt1[1];
    }
    if (pt2) {
	if (pt1 || node1) {
	    x2 = pt2[0];
	    y2 = pt2[1];
	}
	else {
	    x1 = pt2[0];
	    y1 = pt2[1];
	}
    }
    if (node1) {
	var n1w = parseInt($(node1).attr("width"));
	var n1h = parseInt($(node1).attr("height"));
	var n1y = parseInt($(node1).attr("y")) + (n1h/2);
	var n1x = parseInt($(node1).attr("x")) + (n1w/2);	
    }
    if (node2) {
	if (node1 || pt1) {
	    var n2w = parseInt($(node2).attr("width"));
	    var n2h = parseInt($(node2).attr("height"));
	    var n2y = parseInt($(node2).attr("y")) + (n2h/2);
	    var n2x = parseInt($(node2).attr("x")) + (n2w/2);
	}
	else { 
	    var n1w = parseInt($(node2).attr("width"));
	    var n1h = parseInt($(node2).attr("height"));
	    var n1y = parseInt($(node2).attr("y")) + (n1h/2);
	    var n1x = parseInt($(node2).attr("x")) + (n1w/2);
	}
    }
    if (pt2) {
	if (pt1) {
	    if (y2 > y1) {
		if (x2 > x1) {
		    var newarw = crtArrow(x1,y1,x2,y2,"downr","red");
		}
		else {
		    var newarw = crtArrow(x1,y1,x2,y2,"downl","red");
		}
	    }
	    else {
		if (x2 > x1) {
		    var newarw = crtArrow(x1,y1,x2,y2,"upr","red");
		}
		else {
		    var newarw = crtArrow(x1,y1,x2,y2,"upl","red");
		}
	    }   
	}
	else if (node1) {
	    if(n1x > x2) {
		if (n1y > y2) {
		    if(Math.atan2(n1y-y2,n1x-x2) > Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),x2,y2,"upl","red");
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1w/2),n1y,x2,y2,"upl","red");
			node2.tail.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n1y-y2,n1x-x2) < -Math.PI/4){
			var newarw = crtArrow(n1x,n1y+(n1h/2),x2,y2,"downl","red");
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1h/2),n1y,x2,y2,"downl","red");
			node2.tail.push(newarw);
		    }
		}
	    }
	    else {
		if (n1y > y2) {
		    if(Math.atan2(y2-n1y,x2-n1x) > -Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),x2,y2,"upr","red");
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y-(n1h/2),x2,y2,"upr","red");
			node2.tail.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(y2-n1y,x2-n1x) < Math.PI/4){
			var newarw = crtArrow(n1x+(n1w/2),n1y,x2,y2,"downr","red");
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y+(n1h/2),x2,y2,"downr","red");
			node2.tail.push(newarw);
		    }
		}
	    }	    
	}
    }
    if (node2) {
	if (node1) {
	    if (n1x > n2x) {
		if (n1y > n2y) {
		    if(Math.atan2(n1y-n2y,n1x-n2x) > Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),n2x,n2y+(n2h/2),"upl","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1w/2),n1y,n2x+(n1w/2),n2y,"upl","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n1y-n2y,n1x-n2x) < -Math.PI/4){
			var newarw = crtArrow(n1x,n1y+(n1h/2),n2x,n2y-(n2h/2),"downl","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1h/2),n1y,n2x,n2y-(n2h/2),"downl","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		}
	    }
	    else {
		if (n1y > n2y) {
		    if(Math.atan2(n2y-n1y,n2x-n1x) > -Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),n2x-(n2w/2),n2y,"upr","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y-(n1h/2),n2x,n2y+(n2h/2),"upr","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n2y-n1y,n2x-n1x) < Math.PI/4){
			var newarw = crtArrow(n1x+(n1w/2),n1y,n2x-(n2w/2),n2y,"downr","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y+(n1h/2),n2x,n2y-(n2h/2),"downr","red");
			node1.tail.push(newarw);
			node2.head.push(newarw);
		    }
		}
	    }
	}
	else if (pt1) {
	    if(x1 > n2x) {
		if (y1 > n2y) {
		    if(Math.atan2(y1-n2y,x1-n2x) > Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x,n2y+(n2h/2),"upl","red");
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x+(n2w/2),n2y,"upl","red");
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(y1-n2y,x1-n2x) < -Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x,n2y-(n2h/2),"downl","red");
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x+(n2w/2),n2y,"downl","red");
			node2.head.push(newarw);
		    }
		}
	    }
	    else {
		if (y1 > n2y) {
		    if(Math.atan2(n2y-y1,n2x-x1) > -Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x-(n2w/2),n2y,"upr","red");
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x,n2y+(n2h/2),"upr","red");
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n2y-y1,n2x-x1) < Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x-(n2w/2),n2y,"downr","red");
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x,n2y-(n2h/2),"downr","red");
			node2.head.push(newarw);
		    }
		}
	    }	    
	}
    }
}

function flashingHandler() {
    if(eventStack.selectedRect.text.on) {
	var curtext = $(eventStack.selectedRect.text).text();
	var newtext = curtext.substring(0,curtext.length-1);
	$(eventStack.selectedRect.text).text(newtext);
	eventStack.selectedRect.text.on = false;
    }
    else {
	var curtext = $(eventStack.selectedRect.text).text();
	var newtext = curtext.concat('|');
	$(eventStack.selectedRect.text).text(newtext);
	eventStack.selectedRect.text.on = true;
    }
}
