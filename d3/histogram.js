/*
*	Builds an histogram and appends it to the "svg" element
*/

function histogram(svg, xPos, yPos, width, height, bins, minX, maxX, values, xTitle, yTitle){
	// A formatter for counts.
	var formatCount = d3.format(",.0f");

	var margin = {top: 10, right: 30, bottom: 30, left: 30},
	    width = width - margin.left - margin.right,
	    height = height - margin.top - margin.bottom;


	var x = d3.scale.linear()
	    .domain([minX, maxX])
	    .range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
	    .bins(x.ticks(bins))
	    (values);

	var y = d3.scale.linear()
	    .domain([0, d3.max(data, function(d) { return d.y; })])
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var histogram = svg.append("g")
		.attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	   	.attr("transform", "translate("+xPos+","+yPos+")")
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var bar = histogram.selectAll(".bar")
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

	histogram.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	histogram.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr("x", width)
	    .attr("y", height+25)
	    .text(xTitle);

	histogram.append("text")
	    .attr("class", "y label")
	    .attr("text-anchor", "end")
	    .attr("y", -5)
	    .attr("transform", "rotate(-90)")
	    .text(yTitle);
}