var width = 1366,
    height = 768;

var currentYear=2010;

// I'm not sure what was the point of .select("body").append("svg")...
var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

d3.tsv("data/SmallDataset.tsv", function(data){
	console.log(data);
    var nodes = svg.selectAll(".node")
    	.data(data)
    .enter().append("circle")
    	.attr("class","node")
    	.attr("cx", function(d,i) {return 20;})
    	.attr("cy", function(d,i) {return i*20;})
    	.attr("r", 10);
    	//.style("stroke-width", 3);
});