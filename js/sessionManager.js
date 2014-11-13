/*
* Save and load the state of the program from the previous session (if any)
*/

// Handle local storage of objects
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

function saveSession(){
    localStorage.setObject("userData", userData);
    console.log("session saved in localStorage('userData')");
}

var retrievedData=localStorage.getObject("userData");
console.log(retrievedData);