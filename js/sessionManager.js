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
		var retrievedData=localStorage.getObject("userData");
		if(retrievedData!=null){
/*			// We manually add each paper instead of swapping one object for the other,
			// so that the methods defined on userData are not lost. 
			Object.keys(retrievedData.papers).forEach(function(doi){
				userData.papers[doi]=JSON.parse( JSON.stringify( retrievedData.papers[doi] ) );
			})*/
			// In fact, all the methods are defined on userData, not userData.papers, so ok to swap
			console.log("retrieved: "+userData)
			userData.papers=retrievedData.papers;
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
        function uploadSeedPapers = function() {
            var p;
            for (var i in seedPapers) {
                console.log("seed paper: " + seedPapers[i]);
                p = PQ(seedPapers[i]);
                if (typeof p !== "undefined") {
                    p.core = true;
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
	}

	////////	Create public static methods	/////////////////

	var sessionManager={};
	sessionManager.loadPreviousSession=loadPreviousSession;
	sessionManager.saveSession=saveSession;
	sessionManager.resetSession=resetSession;
	return sessionManager;

}();
