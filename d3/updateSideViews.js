// Manage the small views in the sidebar, which show only a subset of the data
view.manageSideViews=function(){

//------------------DATA JOIN-------------------//
// Join new data with old elements, if any
var authors = d3.select("#authors-list").selectAll(".author")
.data(global.frequentAuthors)

//--------------------ENTER---------------------//
// Create new elements as needed
var enteringAuthors = authors.enter()
.append("li")
.attr("class","author")
.style("display",function(a,i) { 
    return (i*20+164) < window.innerHeight-height-20? "":"none";  })
// this is super ugly...

//------------------ENTER+UPDATE-------------------//
// Appending to the enter selection expands the update selection to include
// entering elements; so, operations on the update selection after appending to
// the enter selection will apply to both entering and updating nodes.
authors
.text(function(d) { return d.author + " (" + d.frequency + ")"; })

//--------------------EXIT---------------------//
// Remove old elements as needed.
authors.exit().remove();


//////////////////		histogram 		///////////////////////////////



var values=global.publicationYears(),
	svgHistogram=d3.select("svg#publication-years"),
    width = Math.max(window.innerWidth/10,180),
    height=150;

var margin = {top: 10, right: 10, bottom: 30, left: 10},
    innerWidth = width - margin.left - margin.right,
    innerHeight = height - margin.top - margin.bottom;

// fixed boundaries to allow comparisons across different sets of papers
var x = d3.scale.linear()
    .domain([global.oldestPublicationYear, global.latestPublicationYear])
    .range([0, innerWidth])

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .bins(x.ticks(parameters.nBinsYears))
    (values);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([innerHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(parameters.nBinsYears)
    .orient("bottom");

var histogram = svgHistogram.attr("width", innerWidth + margin.left + margin.right)
    .attr("height", innerHeight + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = histogram.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(data[1].x)-x(data[0].x))
    .attr("height", function(d) { return innerHeight - y(d.y); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", (x(data[1].x)-x(data[0].x)) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return d.y>0? d.y : ""; });

histogram.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(xAxis);

}