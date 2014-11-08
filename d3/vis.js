var width = 1366,
    height = 700,
    paperMinRadius = 5,
    paperMaxRadius = 15,
    paperOutlineWidth = 4,	// this divided by 2 must be > min radius
    paperMarginBottom = 5,
    titleBaselineOffset = 6;

var colors={
	"blue":"#00A1CB",
	"green":"#61AE24",
	"pink":"#D70060",
	"orange":"#F18D05",
	"darkblue":"#113F8C",
	"turquoise":"#01A4A4",	// not to be used for the nodes
	"red":"#E54028",	// not to be used for the nodes
	"darkgray":"#616161"	// not to be used for the nodes
}

var currentYear=2010;

// I'm not sure what was the point of .select("body").append("svg")...
var svg = d3.select("body").append("svg");

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
    	.attr("r", function(d,i) {return radius(d.year);})
    	.attr("fill",randomColor);
   	
   	papers.append("circle")
    	.attr("cx", paperMaxRadius)
    	.attr("cy", function(d,i) {return paperMaxRadius+i*(2*paperMaxRadius+paperMarginBottom);})
    	.attr("r", function(d,i) {return radius(d.year)*.4;})
    	.attr("fill","white");
    
    papers.append("text")
    	.attr("class", "title")
    	.attr("x", 2*paperMaxRadius)
    	.attr("y", function(d,i) {return paperMaxRadius+titleBaselineOffset+i*(2*paperMaxRadius+paperMarginBottom);})
    	.text(function(d,i) {return d.title;});

    // sidebar
/*    svg.append("rect")
    	.attr("x","")
    	.attr("y","0")
    	.attr("width","100")
    	.attr("height","100%")
    	.attr("fill",colors.darkgray);*/
});

// Compute a radius from the value supplied, between min and max
// If we want to display an outline instead of a fill circle, the radius must be smaller
function radius(value){
	return Math.max(paperMinRadius, Math.min(paperMaxRadius,
		currentYear-value));
}

// Return a random color except red or turquoise
function randomColor(){
	var keys=Object.keys(colors);
	return colors[keys[ (keys.length-2) * Math.random() << 0]];
}