// Manage the small views in the sidebar, which show only a subset of the data
view.manageSideViews=function(animate){

// Compute the size of the histogram, as it impacts the number of authors that can be shown
var histogramWidth = Math.max(window.innerWidth/10,180),
    histogramHeight=150;



//////////////////      authors list       ///////////////////////////////



//------------------DATA JOIN-------------------//
var authors = d3.select("#authors-list").selectAll(".author")
.data(global.frequentAuthors)

//--------------------ENTER---------------------//
var enteringAuthors = authors.enter()
.append("li")
.attr("class","author")
.style("display",function(a,i) { return (i*20+164) < window.innerHeight-histogramHeight-20? "":"none";  })
// this is super ugly...

//------------------ENTER+UPDATE-------------------//
authors
.text(function(d) { return d.author + " (" + d.frequency + ")"; })

//--------------------EXIT---------------------//
authors.exit().remove();



//////////////////		histogram 		///////////////////////////////




var values=global.publicationYears();

var margin = {top: 10, right: 15, bottom: 30, left: 5},
    innerWidth = histogramWidth - margin.left - margin.right,
    innerHeight = histogramHeight - margin.top - margin.bottom;

// fixed boundaries to allow comparisons across different sets of papers
var x = d3.scale.linear()
    .domain([global.oldestPublicationYear, global.latestPublicationYear])
    .range([0, innerWidth])

// Generate a histogram using uniformly-spaced bins.
var data = d3.layout.histogram()
    //.bins(x.ticks(parameters.nBinsYears))
    .bins(x.ticks(global.latestPublicationYear-global.oldestPublicationYear))
    (values);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([innerHeight, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .ticks(parameters.nBinsYears)
    .tickFormat(d3.format("d"))
    .orient("bottom");


//--------------- draw static elements ----------//
d3.select("svg#publication-years").attr("width", innerWidth + margin.left + margin.right)
    .attr("height", innerHeight + margin.top + margin.bottom)

var histogram = d3.select("svg#publication-years #histogram")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

histogram.select("#x-axis")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(xAxis);

    
//------------------DATA JOIN-------------------//
var bars = histogram.selectAll(".bar")
    .data(data)


//--------------------ENTER---------------------//
var enteringBars = bars.enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
    
enteringBars.append("rect")
    .attr("x", 1)
    .attr("width", x(data[1].x)-x(data[0].x))
    .attr("y", function(d) { return innerHeight - y(d.y); })
    .attr("height", 0)

    .append("svg:title")
    .text(function(d) { return d.y+" papers in "+d.x; })

/*
* Since the bars are very narrow, we don't show a number inside them
enteringBars.append("text")
    .attr("dy", ".75em")
    .attr("text-anchor", "middle")
    .attr("x", (x(data[1].x)-x(data[0].x)) / 2)
    .attr("y",innerHeight)
    .text(function(d) { return d.y>0? d.y : ""; });
*/

//------------------ENTER+UPDATE----------------//
var t0=bars.transition().duration(parameters.fringePapersPositionTransitionDuration[animate])
        .ease(parameters.fringePapersTransitionEasing)

t0.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

t0.select("rect")
    .attr("y", 0)
    .attr("height", function(d) { return innerHeight - y(d.y); })
    .attr("width", x(data[1].x)-x(data[0].x))

/*t0.select("text")
    .attr("y", 6)
    .attr("x", (x(data[1].x)-x(data[0].x)) / 2)
    .text(function(d) { return d.y>0? d.y : ""; })*/


//--------------------EXIT---------------------//
// although this should probably never happen (always same number of bins)
bars.exit().remove();
}