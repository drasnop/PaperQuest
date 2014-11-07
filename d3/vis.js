var width = 1366,
    height = 768;

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
    	.attr("cx", 25)
    	.attr("cy", function(d,i) {return i*25;})
    	.attr("r", function(d,i) {return 5+Math.sqrt(currentYear-d.year);})
    papers.append("text")
    	.attr("class", "title")
    	.attr("x", 50)
    	.attr("y", function(d,i) {return i*25+5;})
    	.text(function(d,i) {return d.title;});
});