P = (function() {

    var stumpedCollections = ["internalReferences", "externalReferences", "internalCitations", "externalCitations"];
    var readOnlyProperties = ["conference", "title", "abstract", "year", "citation_count", "authors", "references", "citations"];
    var defaultInitialValues =  {};


    /// NOT CURRENTLY USED, REMOVE IF NOT NEEDED
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
                    links[methodName].forEach(callback);
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
     * The filter should be a function that takes a doi and returns
     * true if the paper with that doi should be included in the
     * collection or false otherwise.
     */
    function getSubset(filterFunction) {
        return function(callback) {
            var subset = Object.keys(userData.papers).filter(filterFunction)
                .map(function(doi) { return userData.papers[doi] });

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
     * Returns an array of all the papers currently in the fringe.  If
     * a callback is provided, it's invoked for each paper.
     */
    lookup.fringe = getSubset(function(doi) { return userData.papers[doi].fringe; });

    return lookup;
})();
