brjs.Util = {
		
		getParameterString : function(params) {
		    var paramsArray = [];
		    
		    for (var key in params) {
		    	var value = params[key];
		    	if ((value != null) && (typeof value != 'function')) {
		    		var encodedValue;
		    		if (typeof value == 'object' && value.constructor == Array) {
		    			/* value is an array; encode items and separate with "," */
		    			var encodedItemArray = [];
		    			for (var itemIndex=0, len=value.length; itemIndex<len; itemIndex++) {
		    				encodedItemArray.push(encodeURIComponent(value[itemIndex]));
		    			}
		    			encodedValue = encodedItemArray.join(",");
		    		}
		    		else {
		    			/* value is a string; simply encode */
		    			encodedValue = encodeURIComponent(value);
		    		}
		    		paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
		    	}
		    }
		    
		    return paramsArray.join("&");
		},

		/** 
		 * Function: upperCaseObject
		 * Creates a new hashtable and copies over all the keys from the 
		 *     passed-in object, but storing them under an uppercased
		 *     version of the key at which they were stored.
		 * 
		 * Parameters: 
		 * object - {Object}
		 * 
		 * Returns: 
		 * {Object} A new Object with all the same keys but uppercased
		 */
		upperCaseObject : function (object) {
		    var uObject = {};
		    for (var key in object) {
		        uObject[key.toUpperCase()] = object[key];
		    }
		    return uObject;
		}
};

