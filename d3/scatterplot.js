/*
*	Builds a scatterplot and appends it to the "svg" element
*   Each element of data must have a .x and .y value
*/

function scatterplot(svg, width, height, data, halfVerticalScale, showMedian) {

	// Set the dimensions of the canvas / graph
	var margin = {top: 10, right: 30, bottom: 30, left: 50},
	    width = width - margin.left - margin.right,
	    height = height - margin.top - margin.bottom;

	// Set the ranges
	var x = d3.scale.linear()
	.domain([d3.min(data, function(d) { return d.x; }), d3.max(data, function(d) { return d.x; }) ])
	.range([0, width])

	var y = d3.scale.linear()
	.domain([d3.min(data, function(d) { return d.y; }), 
		d3.max(data, function(d) { return d.y; }) / (halfVerticalScale? 2 : 1) ])
	.clamp(true)
	.range([height, 0])

	// Define the axes
	var xAxis = d3.svg.axis().scale(x)
	    .orient("bottom").ticks(5).tickFormat(d3.format("d"));

	var yAxis = d3.svg.axis().scale(y)
	    .orient("left").ticks(5);
	
	if(showMedian){
		// Define the medians line
		var medians=computeMedians(data);
		var mediansLine = d3.svg.line()
		.x(function(d) { return x(d.x); })
		.y(function(d) { return y(d.y); });    
	}

	// Adds the svg canvas
	var scatterplot = svg
	        .attr("width", width + margin.left + margin.right)
	        .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	        .attr("transform", 
	              "translate(" + margin.left + "," + margin.top + ")");

    // Add the scatterplot
    scatterplot.selectAll(".dot")
        .data(data)
      .enter().append("circle")
      	.attr("class","dot")
        .attr("r", 2)
        .attr("cx", function(d) { return x(d.x); })
        .attr("cy", function(d) { return y(d.y); });

    if(showMedian){  	
	    // Add the valueline path.
	    scatterplot.append("path")
	        .attr("class", "line")
	        .attr("d", mediansLine(medians));
    }

    // Add the X Axis
    scatterplot.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    scatterplot.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}