var arrowwidth = 7;
var arrowstroke = 2;
var eventStack;
var objectStack;
var justdragged;
var curxpos;
var curypos;

$(document).ready(function() {
    $("#canvas").svg();
    $("#toolbar").draggable({'containment':'window'});
    svg = $("#canvas").svg('get');
    initCanvas();
    initEventStack();
    initToolbar();
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

function initToolbar() {
    $("#addrect").click(function() {
	initEventStack();
	eventStack.addingRect = true;
    });
    $("#addlink").click(function() {
	initEventStack();
	eventStack.addingLink1 = true;
    });
}

function swapToolbarNode() {
}

function crtRect(x,y) {
    var newID = objectStack.rects.length.toString();
    $("#htmlcanvas").append("<textarea id='r"+newID+"' style='width:100px;height:100px;border-radius:4px;position:absolute;top:"+y+";left:"+x+";z-index:1;resize:none;'></textarea>");
    currect = document.getElementById("r"+newID);
    currect.active = false;
    $(currect).attr('id',"r"+newID);
    $(currect).css('fill','white');
    $(currect).css('stroke','black');
    $(currect).click(function(event) {
	if($(this).is('.ui-draggable-dragging')){
	    return;
	}
	if (eventStack.addingLink1) {
	    eventStack.addingLink2 = true;
	    eventStack.linkNode = event.target;
	    eventStack.addingLink1 = false;
	}
	else if (eventStack.addingLink2 && eventStack.linkNode != event.target) {
	    eventStack.addingLink2 = false;
	    var linkobj = new Object();
	    eventStack.addingLink2 = false;
	    if(eventStack.linkNode) {
		linkobj.node1 = eventStack.linkNode;
	    }
	    if(eventStack.linkPt) {
		linkobj.pt1 = eventStack.linkPt;
	    }
	    linkobj.node2 = event.target;
	    eventStack.linkPt = undefined;
	    eventStack.linkNode = undefined;
	    crtLink(linkobj);
	}
	else {
	    if(!justdragged) {
		$(event.target).draggable({'containment':$("#canvas"),
				       'cancel':'textarea',
					  });
		event.target.focus();
	    }
	    else {
		justdragged = false;
	    }
	}
    });
    currect.head = [];
    currect.tail = [];
    $(currect).draggable({'containment':$("#canvas"),
			  'cancel':'',
			  'delay':'50',
			  'start':function(event,ui){
			      curypos = event.pageY-$("#canvas").offset().top;
			      curxpos = event.pageX-$("#canvas").offset().left;
			  },
			  'drag':function(event,ui){
			      var dy=curypos-(event.pageY-$("#canvas").offset().top);
			      var dx=curxpos-(event.pageX-$("#canvas").offset().left);
			      curxpos = curxpos - dx;
			      curypos = curypos - dy;
			      if(!(dx==0 && dy==0)) {
				  for(var i=0;i<event.target.head.length;i++) {
				      changeArrowHead(event.target.head[i],dx,dy);
				  }
				  for(var i=0;i<event.target.tail.length;i++) {
				      changeArrowTail(event.target.tail[i],dx,dy);   
				  }
			      }
			  },
			  'stop':function(){
			      curxpos = 0;
			      curypos = 0;
			      justdragged = true;
			  }
			 });
    $(currect).focusout(function(event) {
	if (!justdragged) {
	    $(event.target).draggable({'containment':$("#canvas"),'cancel':''});
	}
	else {
	    justdragged = false;
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
    var arrowang = Math.atan2(endy-starty,endx-startx);
    var angpercent = (arrowang%45)/45;
    var arrowstartdisp = angpercent*startx;
    var arrowenddisp = angpercent*endx;
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
    arrow.ang = ang;
    arrow.c1 = c1;
    arrow.c2 = c2;
    arrow.headparent = null;
    arrow.tailparent = null;
    c1.arrow = arrow;
    c2.arrow = arrow;
    $(arrowshaft).hover( function() {
	$(c1).toggle();
	$(c2).toggle();
    });
    $(arrowhead).hover( function() {
	$(c1).toggle();
	$(c2).toggle();
    });
    $(c1).hover( function() {
	$(c1).toggle();
    });
    $(c2).hover( function() {
	$(c2).toggle();
    });
    $(c1).draggable({'containment':$("#canvas"),
		     'start':function(event,ui){
			 $(event.target).unbind("mouseenter");
			 $(event.target).unbind("mouseleave");
			 $(event.target.arrow.head).unbind("mouseenter");
			 $(event.target.arrow.head).unbind("mouseleave");
			 $(event.target.arrow.shaft).unbind("mouseenter");
			 $(event.target.arrow.shaft).unbind("mouseleave");
		     },
		     'drag':function(event,ui){
			 var dx=event.target.getAttribute('cx')-(event.pageX-$("#canvas").offset().left);
			 var dy=event.target.getAttribute('cy')-(event.pageY-$("#canvas").offset().top);
			 if(!(dx==0 && dy==0)) {
			     changeArrowHead(event.target.arrow,dx,dy,true);
			 }
			 event.target.setAttribute('cx', event.pageX-$("#canvas").offset().left);
			 event.target.setAttribute('cy', event.pageY-$("#canvas").offset().top);
		     },
		     'stop':function(event,ui){
			 $(event.target).hover( function(event) {
			     $(event.target).toggle();
			 });
			 $(event.target.arrow.shaft).hover( function() {
			     $(event.target.arrow.c1).toggle();
			     $(event.target.arrow.c2).toggle();
			 });
			 $(event.target.arrow.head).hover( function() {
			     $(event.target.arrow.c1).toggle();
			     $(event.target.arrow.c2).toggle();
			 });
		     }
		    });
    $(c2).draggable({'containment':$("#canvas"),
		     'start':function(event,ui){
			 $(event.target).unbind("mouseenter");
			 $(event.target).unbind("mouseleave");
			 $(event.target.arrow.head).unbind("mouseenter");
			 $(event.target.arrow.head).unbind("mouseleave");
			 $(event.target.arrow.shaft).unbind("mouseenter");
			 $(event.target.arrow.shaft).unbind("mouseleave");

		     },
		     'drag':function(event,ui){
			 var dx=event.target.getAttribute('cx')-(event.pageX-$("#canvas").offset().left);
			 var dy=event.target.getAttribute('cy')-(event.pageY-$("#canvas").offset().top);
			 if(!(dx==0 && dy==0)) {
			     changeArrowTail(event.target.arrow,dx,dy,true);
			 }
			 event.target.setAttribute('cx', event.pageX-$("#canvas").offset().left);
			 event.target.setAttribute('cy', event.pageY-$("#canvas").offset().top);
		     },
		     'stop':function(event){
			 $(event.target).hover( function(event) {
			     $(event.target).toggle();
			 });
			 $(event.target.arrow.shaft).hover( function() {
			     $(event.target.arrow.c1).toggle();
			     $(event.target.arrow.c2).toggle();
			 });
			 $(event.target.arrow.head).hover( function() {
			     $(event.target.arrow.c1).toggle();
			     $(event.target.arrow.c2).toggle();
			 });
		     }
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

function changeArrowHead(arrow,dx,dy,isc1) {
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
    if(!isc1) {
	arrow.c1.setAttribute('cx',(curx-dx).toString());
	arrow.c1.setAttribute('cy',(cury-dy).toString());
    }
}

function changeArrowTail(arrow,dx,dy,isc2) {
    var origx1 = arrow.shaft.getAttribute('x1');
    var origy1 = arrow.shaft.getAttribute('y1');
    var newx1 = parseInt(origx1)-parseInt(dx);
    var newy1 = parseInt(origy1)-parseInt(dy);
    arrow.shaft.setAttribute('x1',(newx1).toString());
    arrow.shaft.setAttribute('y1',(newy1).toString());
    if(!isc2) {
	arrow.c2.setAttribute('cx',(newx1).toString());
	arrow.c2.setAttribute('cy',(newy1).toString());
    }
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
	var n1w = parseInt($(node1).css("width"));
	var n1h = parseInt($(node1).css("height"));
	var n1y = parseInt($(node1).css("top")) + (n1h/2);
	var n1x = parseInt($(node1).css("left")) + (n1w/2);	
    }
    if (node2) {
	if (node1 || pt1) {
	    var n2w = parseInt($(node2).css("width"));
	    var n2h = parseInt($(node2).css("height"));
	    var n2y = parseInt($(node2).css("top")) + (n2h/2);
	    var n2x = parseInt($(node2).css("left")) + (n2w/2);
	}
	else { 
	    var n1w = parseInt($(node2).css("width"));
	    var n1h = parseInt($(node2).css("height"));
	    var n1y = parseInt($(node2).css("top")) + (n1h/2);
	    var n1x = parseInt($(node2).css("left")) + (n1w/2);
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
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1w/2),n1y,x2,y2,"upl","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n1y-y2,n1x-x2) < -Math.PI/4){
			var newarw = crtArrow(n1x,n1y+(n1h/2),x2,y2,"downl","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1h/2),n1y,x2,y2,"downl","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		}
	    }
	    else {
		if (n1y > y2) {
		    if(Math.atan2(y2-n1y,x2-n1x) > -Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),x2,y2,"upr","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y-(n1h/2),x2,y2,"upr","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(y2-n1y,x2-n1x) < Math.PI/4){
			var newarw = crtArrow(n1x+(n1w/2),n1y,x2,y2,"downr","red");
			newarw.tailparent = node2;
			node2.tail.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y+(n1h/2),x2,y2,"downr","red");
			newarw.tailparent = node2;
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
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1w/2),n1y,n2x+(n1w/2),n2y,"upl","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n1y-n2y,n1x-n2x) < -Math.PI/4){
			var newarw = crtArrow(n1x,n1y+(n1h/2),n2x,n2y-(n2h/2),"downl","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x-(n1h/2),n1y,n2x,n2y-(n2h/2),"downl","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
	    }
	    else {
		if (n1y > n2y) {
		    if(Math.atan2(n2y-n1y,n2x-n1x) > -Math.PI/4){
			var newarw = crtArrow(n1x,n1y-(n1h/2),n2x-(n2w/2),n2y,"upr","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y-(n1h/2),n2x,n2y+(n2h/2),"upr","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n2y-n1y,n2x-n1x) < Math.PI/4){
			var newarw = crtArrow(n1x+(n1w/2),n1y,n2x-(n2w/2),n2y,"downr","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(n1x,n1y+(n1h/2),n2x,n2y-(n2h/2),"downr","red");
			newarw.tailparent = node1;
			node1.tail.push(newarw);
			newarw.headparent = node2;
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
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x+(n2w/2),n2y,"upl","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(y1-n2y,x1-n2x) < -Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x,n2y-(n2h/2),"downl","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x+(n2w/2),n2y,"downl","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
	    }
	    else {
		if (y1 > n2y) {
		    if(Math.atan2(n2y-y1,n2x-x1) > -Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x-(n2w/2),n2y,"upr","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x,n2y+(n2h/2),"upr","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
		else {
		    if(Math.atan2(n2y-y1,n2x-x1) < Math.PI/4){
			var newarw = crtArrow(x1,y1,n2x-(n2w/2),n2y,"downr","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		    else {
			var newarw = crtArrow(x1,y1,n2x,n2y-(n2h/2),"downr","red");
			newarw.headparent = node2;
			node2.head.push(newarw);
		    }
		}
	    }	    
	}
    }
}
