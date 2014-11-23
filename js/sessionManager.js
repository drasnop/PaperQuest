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

	function loadSession(){
		var retrievedData=localStorage.getObject("userData");
		if(retrievedData!=null){
			console.log(retrievedData);
			/*
			// We manually add each paper instead of swapping one object for the other,
			// so that the methods defined on userData are not lost. 
			retrievedData.papers.forEach(function(paper){
				userData.papers[paper]=paper;	
			})*/
			userData=retrievedData;
		}
		else{
			console.log("Loading hard-coded seedPapers")
			userData.papers=seedPapers;
		}
	}

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
	sessionManager.loadSession=loadSession;
	sessionManager.saveSession=saveSession;
	sessionManager.resetSession=resetSession;
	return sessionManager;

}();