/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
/*var svg = d3.select("body").append("svg")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);*/


// Initialize visualization (eventually calling these methods from the js file corresponding to the current view )
d3.json("data/citeology.json", function(data){
    global.papers=data.papers;
    initializeVis();
});


// Dynamic resize
/*window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
}*/

function initializeVis(){
	
// Generate a Bates distribution of 10 random variables.
//var values = d3.range(1000).map(d3.random.bates(10));

function internalCitationCounts() {
  var internalCitationCounts = [];
  for(var doi in global.papers){
    internalCitationCounts.push(P(doi).getInternalCitationCount())
  }
  return internalCitationCounts;
}

var values = internalCitationCounts();
console.log("number of papers: "+values.length)

// A formatter for counts.
var formatCount = d3.format(",.0f");

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([0, 20])
    .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .bins(x.ticks(20))
    (values);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = svg.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(data[0].dx) - 1)
    .attr("height", function(d) { return height - y(d.y); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", x(data[0].dx) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
}