/*
* Global variables
*/
var global= (function () {

  var global={
    // Current x position of the fringe (distinguishes Core&ToRead from Fringe view)
    "fringeApparentWidth": parameters.fringeApparentWidthMin+120,
    // Current zoom level: 0=titles only, 1=metadata (authors/conf/date), 2=first line of abstract, 3=full abstract
    "zoom": 0,
    // Vertical offset used to scroll the fringe
    "scrollOffset": 0,
    // Which paper (with abstract) is currently displayed at the top of the fringe
    "paperScrollOffset":0,
    // whether to update the fringe as soon as the mouse button is realeased, when selecting a paper
    "updateAutomatically": false,
    // whether the autocomplete box contains a complete paper total (ready to be added to core)
    "fullPaperTitle":false,

    // papers dataset, accessed by global.papers[doi]
    "papers": false,

    // medians of the maximal normalized citation counts for each year
    "medians":[],
    // median of the medians! 
    "overallMedian":0,
    // current mminimal connectivity score, computed every time the fringe is updated
    "minConnectivityScore":0,
    // current maximal connectivity score, computed every time the fringe is updated
    "maxConnectivityScore":1,
    
    // All the papers that are potentially visible (automatically computed by view)
    "visibleFringe": [],
    // number of times each author appears among the papers of interest (the most frequent authors will be shown)
    "frequentAuthors": [],
    // publication year of each of the papers of interest
    "publicationYears": [],
    // lower and upper bound of the side histogram
    "oldestPublicationYear": 0,
    "latestPublicationYear": 0,
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
    // The paper that's currently showing links, if any
    "connectedPaper": null,
    // One paper in the fringe can be expanded (without having to select it first)
    "expandedPaper":null,

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
      var p=P(doi);
      data.push({
        "x": p.year,
        "y": p.getMaximumNormalizedCitationCount()
      })
    }
    
    var temp=computeMedians(data);

    // Format the resulting array in a more useful form
    global.medians=[];
    for(var i in temp){
      global.medians[temp[i].x]=temp[i].y;
    }

    // Compute the medians of the medians
    global.overallMedian=d3.median(global.medians);
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
    var nSelected = [];
    var highestRC = [];
    var firstOrLastAuthor = [];

    var author;
    for(var i in papers){
      for(var j in papers[i].authors){
        author=papers[i].authors[j];

        if(occurences[author] == undefined){
          occurences[author]=0;
          nSelected[author]=0;
          highestRC[author]=0;
          firstOrLastAuthor[author]=0;
        }

        occurences[author]++;
        if(papers[i].selected) nSelected[author]++;
        highestRC[author]=Math.max(highestRC[author],papers[i].getRelevanceScore());
        if(j==0 || j==papers[i].authors.length-1) firstOrLastAuthor[author]++;
      }
    }

    // this step is necessary because the two data structures are good for different operations
    global.frequentAuthors=[];
    for(author in occurences){
      global.frequentAuthors.push({
        "author":author,
        "frequency":occurences[author],
        "nSelected":nSelected[author],
        "highestRC":highestRC[author],
        "firstOrLastAuthor":firstOrLastAuthor[author]
      });
    }
    
    // sort in decreasing number of occurences, then relevance score then firstLastAuthor
    global.frequentAuthors.sort(function(a, b){
      if(b.frequency != a.frequency)
      return b.frequency-a.frequency;

      if(b.nSelected != a.nSelected)
      return b.nSelected-a.nSelected;

      if(b.highestRC != a.highestRC)
      return b.highestRC-a.highestRC;
      
      return b.firstOrLastAuthor-a.firstOrLastAuthor;
    });
  }

  global.computeOldestLatestPublicationYears=function(){
    global.oldestPublicationYear=d3.min(Object.keys(global.papers), function(doi) { return global.papers[doi].year; });
    global.latestPublicationYear=d3.max(Object.keys(global.papers), function(doi) { return global.papers[doi].year; });

    // Sets the date filters to the entire dataset
    global.minYear=global.oldestPublicationYear;
    global.maxYear=global.latestPublicationYear;

    console.log("The dataset contains papers from "+global.oldestPublicationYear+" to "+global.latestPublicationYear+".")
  }

  global.publicationYears = function(){
    return papersShownInSidebar().map(function(p) { return p.year; })
  }

  // Checks that a paper passes all the filters in the filters array defined in the namespace
  global.allFilters = function(p) {
    var result = true;
    global.filters.forEach(function(f) {
      result = result && f(p);
    });

    return result;
  }
  
  global.updateDataShown = function(which){
    // toggle the global boolean corresponding to the checkbox
    switch(which){
      case 0:
       global.showCoreInfo = !global.showCoreInfo;
       break;
      case 1:
        global.showToReadInfo = !global.showToReadInfo;
        break;
      case 2:
        global.showVisibleFringeInfo = !global.showVisibleFringeInfo;
        break;
    }

    view.updateView(2); // will do the appropriate computations first
  }


  //////////////////////    Helper functions    ///////////////////////////////

  function papersShownInSidebar(){
    return P.all().filter(function(p){
      return (global.showCoreInfo && p.core)  ||
             (global.showToReadInfo && p.toread) ||
             (global.showVisibleFringeInfo && global.visibleFringe.indexOf(p)>-1);
    });
  }


  function dateFilter(p) {
    return (p.year >= global.minYear && p.year <= global.maxYear);
  }


  ///////////////     Return public properties and methods    /////////////

  return global;

})();
