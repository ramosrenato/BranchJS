/**
* Namespace: brjs.Element
*/
brjs.Element = {

	/**
	 * Function: $
	 * 
	 * return object DOM
	 * Returns:
	 * {Object}  
	 */	
	$ : function () {
		var es = [];

		for (var i = 0, l = arguments.length; i < l; i++) {
			var e = arguments[i];
			
			if (typeof e == 'string') 
				e = document.getElementById(e);
			
			if (arguments.length == 1) 
				return e;
			
			es.push(e);
		}
		
		return es;
	},
	
	/** 
	 * Function: indexOf
	 * Seems to exist already in FF, but not in MOZ.
	 * 
	 * Parameters:
	 * a - {Array}
	 * obj - {Object}
	 * 
	 * Returns:
	 * {Integer} The index at, which the object was found in the array.
	 *           If not found, returns -1.
	 */
	indexOf : function(a, obj) {

		for(var i=0, l=a.length; i<l; i++) 
			if (a[i] == obj) return i;
		
		return -1;   
	},

		
    /**
    * Function: isVisible
    * 
    * Parameters: 
    * element - {DOMElement}
    * 
    * Returns:
    * {Boolean} Is the element visible?
    */
    isVisible: function(e) {
        return brjs.Element.$(e).style.display != 'none';
    },

    /**
    * APIFunction: toggle
    * Toggle the visibility of element(s) passed in
    * 
    * Parameters:
    * element - {DOMElement} Actually user can pass any number of elements
    */
    toggle: function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
            var e = brjs.Element.$(arguments[i]);
            var d = brjs.Element.isVisible(e) ? 'hide':'show';
            brjs.Element[d](e);
        }
    },


    /**
    * APIFunction: hide
    * Hide element(s) passed in
    * 
    * Parameters:
    * element - {DOMElement} Actually user can pass any number of elements
    */
    hide: function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
            var e = brjs.Element.$(arguments[i]);
            e.style.display = 'none';
        }
    },

    /**
    * APIFunction: show
    * Show element(s) passed in
    * 
    * Parameters:
    * element - {DOMElement} Actually user can pass any number of elements
    */
    show: function() {
        for (var i = 0, l = arguments.length; i < l; i++) {
            var e = brjs.Element.$(arguments[i]);
            e.style.display = '';
        }
    },

    /**
    * APIFunction: remove
    * Remove the specified element from the DOM.
    * 
    * Parameters:
    * element - {DOMElement}
    */
    remove: function(e) {
        e = brjs.Element.$(e);
        e.parentNode.removeChild(e);
    },

    /**
    * APIFunction: getHeight
    *  
    * Parameters:
    * element - {DOMElement}
    * 
    * Returns:
    * {Integer} The offset height of the element passed in
    */
    getHeight: function(e) {
        e = brjs.Element.$(e);
        return e.offsetHeight;
    },

    /**
    * APIFunction: getDimensions
    *  
    * Parameters:
    * element - {DOMElement}
    * 
    * Returns:
    * {Object} Object with 'width' and 'height' properties which are the 
    *          dimensions of the element passed in.
    */
    getDimensions: function(element) {
        element = brjs.Element.$(element);
        if (brjs.Element.getStyle(element, 'display') != 'none') {
            return { width: element.offsetWidth, height: element.offsetHeight };
        }

        // All *Width and *Height properties give 0 on elements with display none,
        // so enable the element temporarily
        var els = element.style;
        var originalVisibility = els.visibility;
        var originalPosition = els.position;
        els.visibility = 'hidden';
        els.position = 'absolute';
        els.display = '';
        var originalWidth = element.clientWidth;
        var originalHeight = element.clientHeight;
        els.display = 'none';
        els.position = originalPosition;
        els.visibility = originalVisibility;
        return { width: originalWidth, height: originalHeight };
    },
    
    /*pagePosition : function(forElement) {
		var vT = 0, vL = 0;
		var e = forElement;
		var c = forElement;
		
		while(e) {

			if(e == document.body) {
				if(brjs.Element.getStyle(c, 'position') == 'absolute') {
					break;
				}
			}
			
			vT += e.offsetTop  || 0;
			vL += e.offsetLeft || 0;

			c = e;
			try {
				// wrapping this in a try/catch because IE chokes on the offsetParent
				e = element.offsetParent;
			} catch(e) {
				break;
			}
		}

		e = forElement;
		
		while(e) {
			vT -= e.scrollTop  || 0;
			vL -= e.scrollLeft || 0;
			e = e.parentNode;
		}
		
		return [vL, vT];
	},*/
    
    pagePosition :function(obj)
    {
    	var vT = vL = 0;
    	var e = obj;
    	var o = obj;
    	
    	if (o.offsetParent) {
    		
    		do{
    			
    			vL += o.offsetLeft; 
    			vT += o.offsetTop;
    			
    		}while(o = o.offsetParent)
    			
			do {
				
				vL -= e.scrollLeft || 0;
				vT -= e.scrollTop  || 0;
				
			}while (e = e.parentNode)
    	}
    	
    	return [vL,vT];
    },

    /**
    * Function: hasClass
    * Tests if an element has the given CSS class name.
    *
    * Parameters:
    * element - {DOMElement} A DOM element node.
    * name - {String} The CSS class name to search for.
    *
    * Returns:
    * {Boolean} The element has the given class name.
    */
    hasClass: function(e, name) {
        var ns = e.className;
        return (!!ns && new RegExp("(^|\\s)" + name + "(\\s|$)").test(ns));
    },

    /**
    * Function: addClass
    * Add a CSS class name to an element.  Safe where element already has
    *     the class name.
    *
    * Parameters:
    * element - {DOMElement} A DOM element node.
    * name - {String} The CSS class name to add.
    *
    * Returns:
    * {DOMElement} The element.
    */
    addClass: function(element, name) {
        if (!brjs.Element.hasClass(element, name)) {
            element.className += (element.className ? " " : "") + name;
        }
        return element;
    },

    /**
    * Function: removeClass
    * Remove a CSS class name from an element.  Safe where element does not
    *     have the class name.
    *
    * Parameters:
    * element - {DOMElement} A DOM element node.
    * name - {String} The CSS class name to remove.
    *
    * Returns:
    * {DOMElement} The element.
    */
    removeClass: function(element, name) {
        var names = element.className;
        if (names) {
            element.className = brjs.String.trim(
                names.replace(
                    new RegExp("(^|\\s+)" + name + "(\\s+|$)"), " "
                )
            );
        }
        return element;
    },

    /**
    * Function: toggleClass
    * Remove a CSS class name from an element if it exists.  Add the class name
    *     if it doesn't exist.
    *
    * Parameters:
    * element - {DOMElement} A DOM element node.
    * name - {String} The CSS class name to toggle.
    *
    * Returns:
    * {DOMElement} The element.
    */
    toggleClass: function(element, name) {
        if (brjs.Element.hasClass(element, name)) {
            brjs.Element.removeClass(element, name);
        } else {
            brjs.Element.addClass(element, name);
        }
        return element;
    },

    /**
    * APIFunction: getStyle
    * 
    * Parameters:
    * element - {DOMElement}
    * style - {?}
    * 
    * Returns:
    * {?}
    */
    getStyle: function(element, style) {
        element = brjs.Element.$(element);

        var value = null;
        if (element && element.style) {
            value = element.style[brjs.String.camelize(style)];
            if (!value) {
                if (document.defaultView &&
                    document.defaultView.getComputedStyle) {

                    var css = document.defaultView.getComputedStyle(element, null);
                    value = css ? css.getPropertyValue(style) : null;
                } else if (element.currentStyle) {
                    value = element.currentStyle[brjs.String.camelize(style)];
                }
            }

            var positions = ['left', 'top', 'right', 'bottom'];
            if (window.opera &&
                (brjs.Element.indexOf(positions, style) != -1) &&
                (brjs.Element.getStyle(element, 'position') == 'static')) {
                value = 'auto';
            }
        }

        return value == 'auto' ? null : value;
    },
    
    /**
     * APIFunction
     * 
     */
    isDOM : function(obj) {
    	  
    	/**
    	* Browsers not supporting W3 DOM2 don't have HTMLElement and
    	* an exception is thrown and we end up here. Testing some
    	* properties that all elements have. (works on IE7)
    	*/
    	return ((typeof(obj)==="object") && ((obj.nodeType===9)||(obj.nodeType===1) || (obj.nodeType ===3)));   
    },
    
    /** 
     * APIFunction: mouseLeft
     * 
     * Parameters:
     * evt - {Event}
     * div - {HTMLDivElement}
     * 
     * Returns:
     * {Boolean}
     */
     mouseLeft: function (evt, div) {
        // start with the element to which the mouse has moved
        var target = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
        // walk up the DOM tree.
        while (target != div && target != null) {
            target = target.parentNode;
        }
        // if the target we stop at isn't the div, then we've left the div.
        return (target != div);
    }

};





