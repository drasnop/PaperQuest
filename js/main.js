/* 
* Calls the appropriate rendering functions to create and update the vis
*/

// I'm not sure what was the point of .select("body").append("svg") instead of select("svg")...
var svg = d3.select("svg#main-view")
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

		// If no seed papers, won't do anything
		algorithm.updateFringe();
		view.initializeView(createStaticElements);

		// setup autocomplete popup
		$('#dialog .typeahead').typeahead({
			hint: true,
			highlight: true,
			minLength: 3
		},
		{
			name: 'titles',
			displayKey: 'value',
			source: substringMatcher(Object.keys(global.papers)
				.map(function(doi) { return global.papers[doi].title; }))
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

	$("#overlay").width(window.innerWidth).height(window.innerHeight)

	global.fullPaperTitle=false;

	toggleDialog();

	$('#dialog .typeahead').focus()
})

function toggleDialog(){
	$("#dialog").toggle()
	$("#overlay").toggle()

	var adding=$("#dialog").css("display")!="none";
	$("#add-seed").html(adding? "Done" : "+Add")
	$('#dialog .typeahead').typeahead("val","")
}

// When autocomplete has been succesful, add a paper when enter is pressed
$('#dialog .typeahead').on("typeahead:autocompleted", function(e,s,d){
	global.fullPaperTitle=true;
})
$('#dialog .typeahead').on("typeahead:selected", function(){
	global.fullPaperTitle=true;
})
$('#dialog .typeahead').on("keypress", function(e){
	if(e.which == 13 && global.fullPaperTitle){
		console.log("paper title typed: ", $('#dialog .typeahead').typeahead('val'))
		var title=$('#dialog .typeahead').typeahead('val');

		addCorePaper(title);
	}
})

// Add a paper to the core based on its title
function addCorePaper(title){

	// find the doi
	for(var doi in global.papers){
		if(global.papers[doi].title == title){
			console.log("adding " + doi + " to core");

			var from;
			var p=P(doi);
			if(userData.papers[doi] === undefined) {
				from=0; // unknown
				userData.papers[doi] = p;
				if (p.isStump) {
					p.inflate();
				}
			} else
				from=p.weightIndex();

			p.moveTo("core");
			// Add the paper to the core, via the list that will update the fringe
			userData.addToQueue(p, from, p.weightIndex());

			view.updateUpdateFringeButton();
			view.doAutomaticFringeUpdate();  // if necessary
			view.updateView(2);

			toggleDialog();
		}
	}
}