/**
 * 
 * 
 */
brjs.Object = {
	
	/**
	 * Property: _seqID
	 * {Integer} The ever-incrementing count variable.
	 *           Used for generating unique ids.
	 */
	_seqID : 0,
			
	/**
	 * Function: extend
	 * Copy all properties of a source object to a destination object.  Modifies
	 *     the passed in destination object.  Any properties on the source object
	 *     that are set to undefined will not be (re)set on the destination object.
	 *
	 * Parameters:
	 * destination - {Object} The object that will be modified
	 * source - {Object} The object with properties to be set on the destination
	 *
	 * Returns:
	 * {Object} The destination object.
	 */
	extend : function(dest, src) {
		
		dest = dest || {};
		
		if(src) {
			
			for(var prop in src) {
				var val = src[prop];
				if(val !== undefined) dest[prop] = val;
			}

			/**
			 * IE doesn't include the toString property when iterating over an object's
			 * properties with the for(property in object) syntax.  Explicitly check if
			 * the source has its own toString property.
			 */

			/**
			 * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
			 * prototype object" when calling hawOwnProperty if the source object
			 * is an instance of window.Event.
			 */

			var srcIsEvt = typeof window.Event == 'function' && src instanceof window.Event;

			if(!srcIsEvt && src.hasOwnProperty && src.hasOwnProperty('toString')) {
				dest.toString = src.toString;
			}
		}
		
		return dest;
	},

	/**
	 * Function: createUniqueID
	 * Create a unique identifier for this session.  Each time this function
	 *     is called, a counter is incremented.  The return will be the optional
	 *     prefix (defaults to "id_") appended with the counter value.
	 * 
	 * Parameters:
	 * prefix {String} Optionsal string to prefix unique id. Default is "id_".
	 * 
	 * Returns:
	 * {String} A unique id string, built on the passed in prefix.
	 */
	createUID : function(prefix) {
		if (prefix == null) prefix = "id_";
		
		brjs.Object._seqID += 1;
		return prefix + brjs.Object._seqID;
	},
		
	/** 
	 * Function: applyDefaults
	 * Takes an object and copies any properties that don't exist from
	 *     another properties, by analogy with LBS.Util.extend() from
	 *     Prototype.js.
	 * 
	 * Parameters:
	 * to - {Object} The destination object.
	 * from - {Object} The source object.  Any properties of this object that
	 *     are undefined in the to object will be set on the to object.
	 *
	 * Returns:
	 * {Object} A reference to the to object.  Note that the to argument is modified
	 *     in place and returned by this function.
	 */
	applyDefaults : function (to, from) {
		to = to || {};
		/**
		 * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
		 * prototype object" when calling hawOwnProperty if the source object is an
		 * instance of window.Event.
		 */
		var fromIsEvt = typeof window.Event == "function" && from instanceof window.Event;

		for (var key in from) {
			if (to[key] === undefined ||
				(!fromIsEvt && from.hasOwnProperty
				 && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
				to[key] = from[key];
			}
		}
		/**
		 * IE doesn't include the toString property when iterating over an object's
		 * properties with the for(property in object) syntax.  Explicitly check if
		 * the source has its own toString property.
		 */
		if(!fromIsEvt && from && from.hasOwnProperty
		   && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
			to.toString = from.toString;
		}
		
		return to;
	},
	
	
	
	/**
	 * M�todo est�tico que retorna um valor "prototype"
	 * Esse m�todo � usado para verificar se o objeto que est� sendo testado
	 * � realmente um "prototype" v�lido
	 */ 
	isPrototype : function() { },
		
	
	
	create: function(){
		
		/** 
		 * cria um objeto vazio.
		 * c�digo inline para melhorar a performance
		 */
		
		var cl = function() {
	        if (arguments && arguments[0] != brjs.Object.isPrototype) {
	            this.initialize.apply(this, arguments);
	        }
	    };
	    
	    var pnt, init, ext = {};
	    
	    /** 
	     * varre todos os argumentos. 
	     * para cada argumento que � identificado como um prototype ou function,
	     * come�a a herdar cada m�todo e atributo do objeto
	     */ 
	    
	    for (var i = 0, l = arguments.length; i < l; ++i) {
	        if (typeof arguments[i] == "function") {
	            
	        	/** 
	        	 * transforma a primeira classe, na lista de argumentos,
	        	 * na superclasse.
	        	 */ 
	        	
	            if (i == 0 && l > 1) {
	                                
	                /** 
	                 * troca o metodo initialize para um m�todo vazio,
	                 * isso pq n�s n�o queremos criar um instancia real
	                 */
	            	
	                init = arguments[i].prototype.initialize;
	                arguments[i].prototype.initialize = function() { };
	                
	                /** 
	                 * the line below makes sure that the new class has a
	                 * superclass
	                 */
	                
	                ext = new arguments[i];
	                
	                /**
	                 * restaura o m�todo initialize original da classe
	                 */
	                
	                if (init === undefined) {
	                    delete arguments[i].prototype.initialize;
	                } else {
	                    arguments[i].prototype.initialize = init;
	                }
	            }
	            
	            // get the prototype of the superclass
	            pnt = arguments[i].prototype;
	            
	        } else {
	            // in this case we're extending with the prototype
	            pnt = arguments[i];
	        }
	        
	        // faz uso do m�todo est�tico 'extend', 
	        // para mesclar atributos e m�todos
	        brjs.Object.extend(ext, pnt);
	    }
	    
	    //copia o objeto j� extendido para o objeto vazio 
	    cl.prototype = ext;
	    
	    return cl;
		
	}
	
};