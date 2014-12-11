/*
* Global variables
*/
var defaultView = 2;

var global= (function () {

  var global={
    // Current x position of the fringe (distinguishes Core&ToRead from Fringe view)
    "fringeApparentWidth": parameters.fringeApparentWidthMin,
    // Current zoom level: 0=titles only, 1=metadata (authors/conf/date), 2=first line of abstract, 3=full abstract
    "zoom": 0,
    // Vertical offset used to scroll the fringe
    "scrollOffset": 0,
    // whether to update the fringe as soon as the mouse button is realeased, when selecting a paper
    "updateAutomatically": false,
    // papers dataset, accessed by function paperspapers": false,
    // medians of the maximal normalized citation counts for each year
    "medians":[],
    // current maximal connectivity score, computed every time the fringe is updated
    "maxConnectivityScore":1,
    // All the papers that are potentially visible (automatically computed by view)

    "visibleFringe": [],
    // number of times each author appears among the papers of interest (the most frequent authors will be shown)
    "frequentAuthors": [],
    // indicates which data to show in the sidebar (these booleans are toggled by checkboxes)
    // beware: if changing these default values, you must change the checkbox "checked" property in the html too 
    "showCoreInfo": false,
    "showToReadInfo": false,
    "showVisibleFringeInfo": true,
    // All the filters that should be applied to the dataset
    "filters": [dateFilter],  

    // flag indicating that a long animation is currently running
    "animationRunning": false,
    // flag indicating that another animation is waiting for the current one to complete
    "animationWaiting":false,
    // The y-value at which the to-read list and the core are currently separated
    "toReadHeight": window.innerHeight / 2,

    // variables intended for exploratory use: butterfly vs halfmoon
    "butterfly":true,
    // color.shadeDifferenceInternalExternal can be set to 0
    // whether the fringe should be rounded
    "circular":true,
    // The paper that's currently interactive (menu is showing)
    "activePaper": null,

    // Date filters, should be set when the papers dataset is loaded
    "minYear": 0,
    "maxYear": 0
  };

  global.switchEncoding = function(){
      global.butterfly= !global.butterfly;
      d3.select("#fringe-papers").selectAll(".paper").remove()
      view.initializeView();
  }

  // Compute the median maximal normalized citation count for each year
  global.computeMedianMaximalNormalizedCitationCountsPerYear = function(){

    var data=[];
    for(var doi in global.papers){
      var p=global.papers[doi];
      var MNCC=Math.max(Math.min(1,p.citation_count/parameters.externalCitationCountCutoff),
              Math.min(1,p.citations.length/parameters.internalCitationCountCutoff))
      data.push({
        "x":global.papers[doi].year,
        "y": MNCC
      })
    }
    
    var temp=computeMedians(data);

    // Format the resulting array in a more useful form
    global.medians=[];
    for(var i in temp){
      global.medians[temp[i].x]=temp[i].y;
    }
  }


  // Given the current windows dimensions, which papers can be displayed on the Fringe?
  global.computeVisibleFringe = function(){
    global.visibleFringe = P.sortedFringe().filter(global.allFilters).slice(0,maxNumberOfVisiblePapers());
  }


  // Creates a list of authors for the papers shown in the sidebar, sorted by the number of papers they wrote
  global.computeFrequentAuthors = function(){
    var papers=papersShownInSidebar();

    // compute how often each author appears
    var occurences = [];
    var author;
    for(var i in papers){
      for(var j in papers[i].authors){
        author=papers[i].authors[j];

        if(occurences[author] == undefined)
          occurences[author]=0;
        occurences[author]++;
      }
    }

    // this step is necessary because the two data structures are good for different operations
    for(var author in occurences){
      global.frequentAuthors.push({
        "author":author,
        "frequency":occurences[author] 
      });
    }
    
    // sort in decreasing number of occurences
    global.frequentAuthors.sort(function(a, b){return b.frequency-a.frequency});
  }

  // Checks that a paper passes all the filters in the filters array defined in the namespace
  global.allFilters = function(p) {
    var result = true;
    global.filters.forEach(function(f) {
      result = result && f(p);
    });

    return result;
  }
  


  //////////////////////    Helper functions    ///////////////////////////////

  function papersShownInSidebar(){
    return P.all().filter(function(p){
      return (global.showCoreInfo && p.core)  ||
             (global.showToReadInfo && p.toRead) ||
             (global.showVisibleFringeInfo && global.visibleFringe.indexOf(p)>-1)
    }); 
  }


  function dateFilter(p) {
    return (p.year >= global.minYear && p.year <= global.maxYear);
  }


  ///////////////     Return public properties and methods    /////////////

  return global;

})();