/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("body").append("svg")
			.attr("id","main-view")
            .attr("width",window.innerWidth)
            .attr("height",window.innerHeight);


// Initialize visualization, with creating the background elements by default
function initializeVisualization(createStaticElements){
	d3.json("data/citeology.json", function(data){
		// Cache the dataset
		global.papers = data.papers;
		
		// Initialize some global parameters
		global.computeOldestLatestPublicationYears();
		global.computeMedianMaximalNormalizedCitationCountsPerYear();
		
		// Restore data from previous session
	    sessionManager.loadPreviousSession();

	    algorithm.generateFringe();
	    view.initializeView(createStaticElements);

	    // setup autocomplete popup
	    $('#dialog .typeahead').typeahead({
	      hint: true,
	      highlight: true,
	      minLength: 1
	    },
	    {
	      name: 'titles',
	      displayKey: 'value',
	      source: substringMatcher(P.all().map(function(p) { return p.title; }))
	    });
	});	
}

initializeVisualization(true);

// Dynamic resize
window.onresize = function(){
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    view.updateView(0);    // don't animate on resize
}

// Handle the "add seed paper" dialog
$("#add-seed").on("click", function(){
	$("#dialog")
	.css("left",window.innerWidth/2 - $("#dialog").width()/2)
	.css("top",window.innerHeight/2 - $("#dialog").height()/2)
	$("#dialog").toggle()

	$("#overlay").width(window.innerWidth).height(window.innerHeight)
	$("#overlay").toggle()

	var adding=$("#dialog").css("display")!="none";
	$("#add-seed").html(adding? "Done" : "+Add")

	$('#dialog .typeahead').focus()
})

// from https://twitter.github.io/typeahead.js/examples/
var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;
 
    // an array that will be populated with substring matches
    matches = [];
 
    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');
 
    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });
 
    cb(matches);
  };
};