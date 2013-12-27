import re

def abstract(svg):
    svgdata = []
    rmsvg = re.sub('<svg(.*)>',"",svg)
    rmsvg = re.sub('</svg(.*)>',"",rmsvg)
    datapoints = re.findall("<rect[\s\S]*>",rmsvg)
    for datapoint in datapoints:
        data = {}
        xstr = re.findall("x=[\S]*",datapoint)[0]
        x = re.findall("[0-9]+",xstr)[0]
        data["x"] = x
        ystr = re.findall("y=[\S]*",datapoint)[0]
        y = re.findall("[0-9]+",ystr)[0]
        data["y"] = y
        widthstr = re.findall("width=[\S]*",datapoint)[0]
        width = re.findall("[0-9]+",widthstr)[0]
        data["width"] = width
        heightstr = re.findall("height=[\S]*",datapoint)[0]
        height = re.findall("[0-9]+",heightstr)[0]
        data["height"] = height
        stylestr = re.findall("style=[\S]*",datapoint)[0]
        style = re.sub("style=","",stylestr)
        style = re.sub("[\"]","",style);
        data["style"] = style
        svgdata.append(data)
    return svgdata

def deabstract(svgdata):
    retstr = ""
    for obj in svgdata:
        for prop in obj.keys():
            data = obj.get(prop)
            datastr = prop+"="+'"'+data+'"'
            retstr = retstr+datastr
    return retstr

test = '''<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
  <rect x="50" y="20" width="150" height="150"
  style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;
  stroke-opacity:0.9"/>
</svg>'''

print deabstract(abstract(test))
