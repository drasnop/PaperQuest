var width = 1366,
    height = 768,
    paperMinRadius = 5,
    paperMaxRadius = 20,
    paperMarginBottom = 5,
    titleBaselineOffset = 6;
    // these settings can display at most 17 papers

var colors={
	"blue":"#00A1CB",
	"green":"#61AE24",
	"pink":"#D70060",
	"orange":"#F18D05",
	"darkblue":"#113F8C",
	"turquoise":"#01A4A4",	// not to be used for the nodes
	"red":"#E54028"	// not to be used for the nodes
}

var currentYear=2010;

// I'm not sure what was the point of .select("body").append("svg")...
var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

d3.tsv("data/SmallDataset.tsv", function(data){
	console.log(data);
    
    var papers = svg.selectAll("paper")
    	.data(data)
    .enter()
    .append("g")
    	.attr("class","paper")

    papers.append("circle")
    	.attr("class", "node")
    	.attr("cx", paperMaxRadius)
    	.attr("cy", function(d,i) {return paperMaxRadius+i*(2*paperMaxRadius+paperMarginBottom);})
    	.attr("r", function(d,i) {
    		return Math.max(paperMinRadius,
    			Math.min(paperMaxRadius,
    			currentYear-d.year));
    	})
    	.attr("fill",function(d,i) {return randomColor();});
    
    papers.append("text")
    	.attr("class", "title")
    	.attr("x", 2*paperMaxRadius)
    	.attr("y", function(d,i) {return paperMaxRadius+titleBaselineOffset+i*(2*paperMaxRadius+paperMarginBottom);})
    	.text(function(d,i) {return d.title;});
});

// Return a random color except red or turquoise
function randomColor(){
	var keys=Object.keys(colors);
	return colors[keys[ (keys.length-2) * Math.random() << 0]];
}