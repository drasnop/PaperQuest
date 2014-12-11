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


//------------------ENTER+UPDATE-------------------//
// Appending to the enter selection expands the update selection to include
// entering elements; so, operations on the update selection after appending to
// the enter selection will apply to both entering and updating nodes.
authors
.text(function(d) { return d.author + " (" + d.frequency + ")"; })

//--------------------EXIT---------------------//
// Remove old elements as needed.
authors.exit().remove();

}