P = (function() {

  var stumpedCollections = ["internalReferences", "externalReferences", "internalCitations", "externalCitations"];
  var readOnlyProperties = ["conference", "title", "abstract", "year", "citation_count", "authors", "references", "citations"];
  var defaultInitialValues =  {
    fringe:   false,            // Paper is in the fringe or not
    core:     false,            // Paper is in the core or not
    toread:   false,            // Paper is in the to-read list or not
    score:    0,                // Relevance score
    upvoters: 0,                // Number of links to other papers of interest to the user
    selected: false,            // Paper has been selected from the fringe by the user or not
    isNew:    true
  };


  /// TODO: NOT CURRENTLY USED, REMOVE IF NOT NEEDED
  function getStumpProperty(paramName) {
    return function() {
      // Assume variable "this" is bound to a stump.  Inflate it
      // and return the required parameter.
      return this.inflate()[paramName];
    }
  }

  function getStumpMethod(methodName) {
    return function() {
      // Assume "this" is bound to a stump.  Inflate it and call
      // the desired method.
      return this.inflate()[methodName].apply(this, arguments);
    }
  }


  /**
   * Paper object
   *
   * Initially a stump, just a wrapper around the paper's dictionary
   * from the global database.  Gets inflated into a full object
   * when some of its methods or properties are queried.
   */
  function paper(doi) {
    var basePaper = global.papers[doi];

    if (!basePaper) { return undefined; }

    var links = {};
    var that = this;

    this.doi = doi;
    this.isStump = true;  // Can be checked externally.  Not used internally.

    /**
     * Adds all key/value pairs from the given dictionary to the
     * paper, replacing values if they already exist.
     */
    this.merge = function(values) {
      for (var key in values) {
        that[key] = values[key];
      }

      return that;  // For chaining
    }

    this.merge(defaultInitialValues);  // Initialize other properties of the paper.

    /**
     * Blows the paper object up into a full object so that its
     * references and citations can be accessed.  This technique
     * allows us to have relevant information only for papers that
     * we're actually using in the vis.
     */
    this.inflate = function() {
      delete that.isStump;  // Remove stump flag.

      // Cached filtered lists of references and citations.
      // Internal publications are wrapped as paper objects.
      links.internalReferences = that.references.filter(function(ref) { return ref in global.papers; }).map(lookup);
      links.externalReferences = that.references.filter(function(ref) { return !(ref in global.papers); });  // Can't really map lookup
      links.internalCitations  = that.citations.filter(function(cit) { return cit in global.papers; }).map(lookup);
      links.externalCitations  = that.citations.filter(function(cit) { return !(cit in global.papers); });   // Can't really map lookup

      // Inflate previously stumped collections.
      stumpedCollections.forEach(function(methodName) {
        that[methodName] = function(callback) {
          if (typeof callback === "function") {
            links[methodName].forEach(callback);
          }

          return links[methodName];
        };
      });


      return that;  // Return same object for chaining.
    }
  }

  function propertyGetter(prop) {
    return function() {
      return global.papers[this.doi][prop];
    }
  }


  // When any of these collections (methods) is called, the stump is
  // promoted to a full paper.
  stumpedCollections.forEach(function(methodName) {
    paper.prototype[methodName] = getStumpMethod(methodName);
  });

  // Read-only properties
  readOnlyProperties.forEach(function(propertyName) {
    Object.defineProperty(paper.prototype, propertyName, {get: propertyGetter(propertyName) });
  });


  /**
   * Return Author1, Author2, Author3 – CHI '96
   */
  paper.prototype.metadataToString = function() {
    var string = this.authors[0];
    for(var i=1; i<this.authors.length; i++)
      string+= ", " + this.authors[i];
    string+= " – " + this.conference + " '" + this.year.slice(2);
    return string;
  }

  paper.prototype.getInternalCitationCount = function(){
    return this.citations.length;
  }

  paper.prototype.getNormalizedInternalCitationCount = function(){
    return Math.min(1,this.citations.length/parameters.internalCitationCountCutoff);
  }

  paper.prototype.getNormalizedExternalCitationCount = function(){
    return Math.min(1,this.citation_count/parameters.externalCitationCountCutoff);
  }

  paper.prototype.getMaximumNormalizedCitationCount = function() {
    return Math.max(this.getNormalizedInternalCitationCount(), this.getNormalizedExternalCitationCount());
  }

  paper.prototype.adjustedCitationCount = function() {
    var median=global.medians[this.year];
    var t=interpolateWithMedian(Math.max(this.getNormalizedInternalCitationCount(),
      this.getNormalizedExternalCitationCount()) , median );
    return t;
  }

  // Bi-linear interpolation of values in [0,1], to move the median to .5
  function interpolateWithMedian(y,median){
    if(y<=median)
      return .5/median*y;
    else
      return .5+.5/(1-median)*(y-median);
  }

  // Normalize from 0 to 1 the connectivity scores
  // (note that all connectivity scores are larger than 1 for papers on the fringe)
  paper.prototype.getNormalizedConnectivityScore = function() {
    return (this.connectivity-1)/(global.maxConnectivityScore-1);
  }

  // combines the two components of the score (each starting at 0)
  paper.prototype.getRelevanceScore = function(){
    return parameters.ACCweight*this.adjustedCitationCount() 
    + parameters.connectivityWeight*this.getNormalizedConnectivityScore();
  }

  // Old citation count computation - kept for comparison in stats page

  paper.prototype.getMaximumCitationCount = function() {
    return Math.max(this.citation_count, this.getInternalCitationCount());
  }

  paper.prototype.oldAdjustedCitationCount = function() {
    return Math.log(1 + this.getMaximumCitationCount() / (parameters.currentYear - this.year));
  }

  /**
   * Sets the state of the paper so that it belongs to the specified
   * region, which can be one of "core", "fringe" or "toread".  This
   * method ensures only one region-flag is true at a time.
   */
  paper.prototype.moveTo = function(where) {
    var that = this;
    // Set everything to false, then only "where" to true
    ["fringe", "core", "toread"].forEach(function(d) { that[d] = false; });
    this[where] = true;
  }




  ////////////////////////////////////////////////////////////////////////////////
  // Paper geometry helper functions
  ////////////////////////////////////////////////////////////////////////////////

  function getGeometryHelper(coreFun, toreadFun, fringeFun) {
    // Calls the right function, depending on where the paper is
    // located right now.
    return function() {
      if (this.fringe) {
        return fringeFun(this);
      } else if (this.toread) {
        return toreadFun(this);
      } else if (this.core) {
        return coreFun(this);
      }
    }
  }

  Object.defineProperty(paper.prototype, "x", {get: getGeometryHelper(corePaperX, toreadPaperX, fringePaperX)});

  Object.defineProperty(paper.prototype, "y", {get: getGeometryHelper(corePaperY, toreadPaperY, fringePaperY)});

  Object.defineProperty(paper.prototype, "h", {get: getGeometryHelper(corePaperHeight, toreadPaperHeight, fringePaperHeight)});

  Object.defineProperty(paper.prototype, "visible", {get: getGeometryHelper(corePaperVisible, toreadPaperVisible, fringePaperVisible)});




  ////////////////////////////////////////////////////////////////////////////////
  // API for interacting with the dataset
  ////////////////////////////////////////////////////////////////////////////////

  /**
   * Main lookup function.  This will be the main access point to
   * papers in the dataset.
   */
  function lookup(doi) {
    // Note: userData.papers is being used as a cache here to
    // avoid building new paper objects each time a doi is looked
    // up.  This is not userData.paper's original purpose, which
    // is to store the list of papers currently of interest to the
    // user (the currently explored subnetwork).  Eventually a
    // separate cache should be considered.
    var p = userData.papers[doi];
    if (p) {                           // Already built, get it from cache
      return p;
    } else if (doi in global.papers) { // First time used, cache it
      p = new paper(doi);
      userData.papers[doi] = p;
      return p;
    } else {                           // Not an internal doi
      return undefined;
    }
  }

  /**
   * Returns a function that returns an array of all the papers in
   * userData.papers that match the given filter.  If a callback is
   * provided to the second function, then it's applied once to each
   * filtered paper.
   *
   * The filter function is optional, if it's not provided then all
   * papers will be retrieved.  A sorting function can also be
   * specified to arrange the array.
   *
   * The filter should be a function that takes a doi and returns
   * true if the paper with that doi should be included in the
   * collection or false otherwise.
   *
   * The sorting function should take two papers and return a number.
   */
  function getSubset(filterFunction, sortingFunction) {
    return function(callback) {
      var subset = Object.keys(userData.papers);

      if (typeof filterFunction === "function") {
        subset = subset.filter(filterFunction);
      }

      subset = subset.map(function(doi) { return userData.papers[doi] });

      if (typeof sortingFunction === "function") {
        subset = subset.sort(sortingFunction);
      }

      if (typeof callback === "function") {
        subset.forEach(callback);
      }

      return subset;
    }
  }

  /**
   * Returns an array of all the papers currently in the core.  If a
   * callback is provided, it's invoked for each paper.
   */
  lookup.core = getSubset(function(doi) { return userData.papers[doi].core; });

  /**
   * Returns an array of all the papers in the to-read list.  If a
   * callback is provided, it's invoked for each paper.
   */
  lookup.toread = getSubset(function(doi) { return userData.papers[doi].toread; });

  /**
   * Returns an array of all the papers currently in the to-read list,
   * sorted in decreasing order by their relevance score.  If a
   * callback is provided, it's invoked for each paper.
   */
  lookup.sortedToread = getSubset(function(doi) { return userData.papers[doi].toread; },
                                  function(a, b) { return b.score - a.score; });  // decreasing order!
  /**
   * Returns an array of all the papers currently in the fringe.  If
   * a callback is provided, it's invoked for each paper.
   */
  lookup.fringe = getSubset(function(doi) { return userData.papers[doi].fringe; });

  /**
   * Returns an array of all the papers currently in the fringe,
   * sorted in decreasing order by their relevance score.  If a
   * callback is provided, it's invoked for each paper.
   */
  lookup.sortedFringe = getSubset(function(doi) { return userData.papers[doi].fringe; },
                                  function(a, b) { return b.getRelevanceScore() - a.getRelevanceScore(); });  // decreasing order!

  /**
   * Returns an array of all the papers currently selected in the
   * fringe.  If a callback is provided, it's invoked for each paper.
   */
  lookup.selected = getSubset(function(doi) { return userData.papers[doi].selected; });

  /**
   * Returns an array of all the papers.  If a callback is provided,
   * it's invoked for each paper.
   */
  lookup.all = getSubset();

  /**
   * Returns an array with all the papers that are of interest to the
   * user, which are all but the non-selected papers.
   */
  lookup.interesting = getSubset(function(doi) {
    var p = userData.papers[doi];
    return (p.core || p.toRead || p.selected);
  });



  return lookup;
})();
