/*
* Save and load the state of the program from the previous session (if any)
*/

var sessionManager = function(){

    // Handle local storage of objects
    Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
    }

    Storage.prototype.getObject = function(key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
    }

    function loadPreviousSession(){
        var retrievedData = localStorage.getObject("userData");

        if(retrievedData!=null){
            console.log("retrieved: ");
            console.log(retrievedData);
            // We re-wrap each retrieved item in a paper object.
            Object.keys(retrievedData.papers).forEach(function(doi) {
              var p = P(doi);
              if (typeof p !== "undefined") {   // Check just in case an external doi made it in
                userData.papers[doi] = p;
                if (typeof p.isStump === "undefined") {
                  // Re-inflate papers that need it
                  p.inflate();
                }
                // Copy values from retrieved data.
                p.merge(retrievedData.papers[doi]);
              }
            });
        }
        else{
            console.log("Loading hard-coded seedPapers")
            uploadSeedPapers();
        }
    }

    /**
     * Adds a hardcoded list of papers to the user's core.  Used
     * to initialize the core.
     */
    function uploadSeedPapers() {
      var p;
      for (var i in seedPapers) {
        console.log("seed paper: " + seedPapers[i]);
        p = P(seedPapers[i]);
        userData.papers[p.doi] = p;
        if (typeof p !== "undefined") {  // ignore seed papers that are not internal
          p.moveTo("core");
        }
      }
    }

    // we could just store userData.papers, but eh. Having the methods could be useful for debugging
    function saveSession(){
        localStorage.setObject("userData", userData);
        console.log("session saved in localStorage('userData')");
    }

    function resetSession(){
        localStorage.setObject("userData", null);
        console.log("localStorage('userData') has been deleted");
        // reload the page - a bit brutal, but does what we want
        window.location.reload();
    }

    ////////        Create public static methods    /////////////////

    var sessionManager={};
    sessionManager.loadPreviousSession=loadPreviousSession;
    sessionManager.saveSession=saveSession;
    sessionManager.resetSession=resetSession;
    return sessionManager;

}();
