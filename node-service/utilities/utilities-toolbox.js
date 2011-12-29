// Global usage

var Foundations = IMPORTS.foundations;
	
var Future = Foundations.Control.Future;
	
var PalmCall = Foundations.Comms.PalmCall;

// Utility class

var utils = (function() {
	var that = {};
	
	that.extend = function(targetObject, sourceObject) {
		for(key in sourceObject) {
			if(typeof(sourceObject[key]) == 'object') {
				if(!targetObject[key])
					targetObject[key] = {};
				
				that.extend(targetObject[key], sourceObject[key]);
			}
			else
				targetObject[key] = sourceObject[key];
		}
	};
	
	that.findArray = function(array, key, value) {
		// Finds object from an array based on given key and value.
		
		if(!array)
			return -1;
		
		for(var i = 0; i < array.length; i++) {
		  if(array[i][key] == value)
		    return i;
		}
		
		return -1;    
	};

	that.futureLoop = function(array, iterator) {
		function loop(i) {
			if (i < array.length) {
				future.nest(iterator(array[i]));
				
				future.then(this, function(future) {
					loop(i + 1);
				});
			}
			else {
				future.result = true;
			}
		}
		
		var future = new Future();
		
		if(array)
			loop(0);
		else
			future.result = true;
		
		return future;
	};
	
	return that;
}());
