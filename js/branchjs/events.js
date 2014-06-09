/**
 * Namespace: brjs.Event
 * Utility functions for event handling.
 */
brjs.Event = {

    /** 
    * Property: observers 
    * {Object} A hashtable cache of the event observers. Keyed by
    * element._eventCacheID 
    */
    observers: null,

    /** 
    * Constant: KEY_BACKSPACE 
    * {int} 
    */
    KEY_BACKSPACE: 8,

    /** 
    * Constant: KEY_TAB 
    * {int} 
    */
    KEY_TAB: 9,

    /** 
    * Constant: KEY_RETURN 
    * {int} 
    */
    KEY_RETURN: 13,

    /** 
    * Constant: KEY_ESC 
    * {int} 
    */
    KEY_ESC: 27,

    /** 
    * Constant: KEY_LEFT 
    * {int} 
    */
    KEY_LEFT: 37,

    /** 
    * Constant: KEY_UP 
    * {int} 
    */
    KEY_UP: 38,

    /** 
    * Constant: KEY_RIGHT 
    * {int} 
    */
    KEY_RIGHT: 39,

    /** 
    * Constant: KEY_DOWN 
    * {int} 
    */
    KEY_DOWN: 40,

    /** 
    * Constant: KEY_DELETE 
    * {int} 
    */
    KEY_DELETE: 46,


    /**
    * Method: element
    * Cross browser event element detection.
    * 
    * Parameters:
    * e - {Event} 
    * 
    * Returns:
    * {DOMElement} The element that caused the event 
    */
    element: function (e) {
        return e.target || e.srcElement;
    },

    /**
    * Method: isLeftClick
    * Determine whether event was caused by a left click. 
    *
    * Parameters:
    * e - {Event} 
    * 
    * Returns:
    * {Boolean}
    */
    isLeftClick: function (e) {
        return (((e.which) && (e.which == 1)) ||
                ((e.button) && (e.button == 1)));
    },

    /**
    * Method: isRightClick
    * Determine whether event was caused by a right mouse click. 
    *
    * Parameters:
    * e - {Event} 
    * 
    * Returns:
    * {Boolean}
    */
    isRightClick: function (e) {
        return (((e.which) && (e.which == 3)) ||
                ((e.button) && (e.button == 2)));
    },

    /**
    * Method: stop
    * Stops an event from propagating. 
    *
    * Parameters: 
    * e - {Event} 
    * allowDefault - {Boolean} If true, we stop the event chain but 
    *                               still allow the default browser 
    *                               behaviour (text selection, radio-button 
    *                               clicking, etc)
    *                               Default false
    */
    stop: function (e, allowDefault) {

        if (!allowDefault) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        }

        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },

    /** 
    * Method: findElement
    * 
    * Parameters:
    * e - {Event} 
    * tagName - {String} 
    * 
    * Returns:
    * {DOMElement} The first node with the given tagName, starting from the
    * node the event was triggered on and traversing the DOM upwards
    */
    findElement: function (e, tagName) {
        var el = brjs.Event.element(e);
        while (el.parentNode && (!el.tagName ||
              (el.tagName.toUpperCase() != tagName.toUpperCase()))) {
        	el = el.parentNode;
        }
        return el;
    },

    addListener: function (obj, event, handler, capture) {
    	//verificar para colocar o addDOMListener quando o objeto for DOM
    	return (obj.events) ? obj.events.register(event, obj, handler) : null;
    },

    addDOMListener: function (obj, event, handler, capture) {
        this.observe(obj, event, handler, capture);
    },

    removeListener: function (handle) {
        if (typeof handle.obj != 'undefined')
            handle.obj.events.unregister(handle.type, handle.obj, handle.func);
    },
    
    removeDOMListener: function(handle){
    	
    },

    clearListeners: function (obj, event) {
        if (typeof obj.Events != 'undefined')
            obj.events.clear(event, obj);
        
        //TODO - fazer o stopObserving para remover os listeners de um objeto DOM         
    },

    trigger: function (obj, evt, handler) {
        if ((typeof obj == 'undefined') || (obj == null)) return;

        if (typeof obj.Events != 'undefined')
            obj.events.triggerEvent(evt, handler);
    },

    /** 
    * Method: observe
    * 
    * Parameters:
    * obj - {DOMElement || String} 
    * name - {String} 
    * observer - {function} 
    * capture - {Boolean} 
    */
    observe: function (obj, name, observer, capture) {
        var e = brjs.Element.$(obj);

        if (name == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || e.attachEvent)) 
            name = 'keydown';

        //if observers cache has not yet been created, create it
        if (!this.observers) this.observers = {};
        
        //if not already assigned, make a new unique cache ID
        if (!e._eventCacheID) {
            var idPrefix = "eventCacheID_";
            if (e.id) idPrefix = e.id + "_" + idPrefix;
            e._eventCacheID = brjs.Object.createUID(idPrefix);
        }

        var cID = e._eventCacheID;

        //if there is not yet a hash entry for this element, add one
        if (!this.observers[cID]) this.observers[cID] = [];
        
        //add a new observer to this element's list
        this.observers[cID].push({
            'element': e,
            'name': name,
            'observer': observer,
            'useCapture': (capture || false)
        });

        //add the actual browser event listener
        if (e.addEventListener) {
        	if(typeof capture == 'undefined')
        		e['on' + name] = observer;
        	else
        		e.addEventListener(name, observer, capture);
        } else if (e.attachEvent) {
            e.attachEvent('on' + name, observer);
        }
    },

    /** 
    * Method: stopObservingElement
    * Given the id of an element to stop observing, cycle through the 
    *   element's cached observers, calling stopObserving on each one, 
    *   skipping those entries which can no longer be removed.
    * 
    * parameters:
    * elementParam - {DOMElement || String} 
    */
    stopObservingElement: function (elementParam) {
        var element = brjs.Element.$(elementParam);
        var cacheID = element._eventCacheID;

        this._removeElementObservers(brjs.Event.observers[cacheID]);
    },

    /**
    * Method: _removeElementObservers
    *
    * Parameters:
    * elementObservers - {Array(Object)} Array of (element, name, 
    *                                         observer, usecapture) objects, 
    *                                         taken directly from hashtable
    */
    _removeElementObservers: function (elementObservers) {
        if (elementObservers) {
            for (var i = elementObservers.length - 1; i >= 0; i--) {
                var entry = elementObservers[i];
                var args = new Array(entry.element,
                                     entry.name,
                                     entry.observer,
                                     (entry.useCapture || false));
                var removed = brjs.Event.stopObserving.apply(this, args);
            }
        }
    },

    /**
    * Method: stopObserving
    * 
    * Parameters:
    * elementParam - {DOMElement || String} 
    * name - {String} 
    * observer - {function} 
    * useCapture - {Boolean} 
    *  
    * Returns:
    * {Boolean} Whether or not the event observer was removed
    */
    stopObserving: function (elementParam, name, observer, useCapture) {
        useCapture = useCapture || false;

        var element = brjs.Element.$(elementParam);
        var cacheID = element._eventCacheID;

        if (name == 'keypress') {
            if (navigator.appVersion.match(/Konqueror|Safari|KHTML/) ||
                 element.detachEvent) {
                name = 'keydown';
            }
        }

        // find element's entry in this.observers cache and remove it
        var foundEntry = false;
        var elementObservers = brjs.Event.observers[cacheID];
        if (elementObservers) {

            // find the specific event type in the element's list
            var i = 0;
            while (!foundEntry && i < elementObservers.length) {
                var cacheEntry = elementObservers[i];
                
                if ((cacheEntry.name == name) &&
                	(cacheEntry.observer == observer) &&
                    (cacheEntry.useCapture == useCapture)) {

                    elementObservers.splice(i, 1);
                    if (elementObservers.length == 0) {
                        delete brjs.Event.observers[cacheID];
                    }
                    foundEntry = true;
                    break;
                }
                i++;
            }
        }

        //actually remove the event listener from browser
        if (foundEntry) {
            if (element.removeEventListener) {
                element.removeEventListener(name, observer, useCapture);
            } else if (element && element.detachEvent) {
                element.detachEvent('on' + name, observer);
            }
        }
        return foundEntry;
    },

    /** 
    * Method: unloadCache
    * Cycle through all the element entries in the events cache and call
    *   stopObservingElement on each. 
    */
    unloadCache: function () {
        // check for brjs.Event before checking for observers, because
        // brjs.Event may be undefined in IE if no map instance was
        // created
        if (brjs.Event && brjs.Event.observers) {
            for (var cacheID in brjs.Event.observers) {
                var elementObservers = brjs.Event.observers[cacheID];
                brjs.Event._removeElementObservers.apply(this,
                                                           [elementObservers]);
            }
            brjs.Event.observers = null;
        }
    },

    CLASS_NAME: "brjs.Event"
};

/* prevent memory leaks in IE */
brjs.Event.observe(window, 'unload', brjs.Event.unloadCache, false);

// FIXME: Remove this in 3.0. In 3.0, Event.stop will no longer be provided
// by brjs.
/*if (window.Event) {
    brjs.object.applyDefaults(window.Event, brjs.Event);
} else {
    var Event = brjs.Event;
}*/

/**
 * Class: brjs.Events
 */
brjs.Events = brjs.Object.create({

    /** 
    * Constant: BROWSER_EVENTS
    * {Array(String)} supported events 
    */
    BROWSER_EVENTS: [
        "mouseover", "mouseout",
        "mousedown", "mouseup", "mousemove",
        "click", "dblclick", "rightclick", "dblrightclick",
        "resize", "focus", "blur"
    ],

    /** 
    * Property: listeners 
    * {Object} Hashtable of Array(Function): events listener functions  
    */
    listeners: null,

    /** 
    * Property: object 
    * {Object}  the code object issuing application events 
    */
    object: null,

    /** 
    * Property: element 
    * {DOMElement}  the DOM element receiving browser events 
    */
    element: null,

    /** 
    * Property: eventTypes 
    * {Array(String)}  list of support application events 
    */
    eventTypes: null,

    /** 
    * Property: eventHandler 
    * {Function}  bound event handler attached to elements 
    */
    eventHandler: null,

    /** 
    * APIProperty: fallThrough 
    * {Boolean} 
    */
    fallThrough: null,

    /** 
    * APIProperty: includeXY
    * {Boolean} Should the .xy property automatically be created for browser
    *    mouse events? In general, this should be false. If it is true, then
    *    mouse events will automatically generate a '.xy' property on the 
    *    event object that is passed. (Prior to LBS 2.7, this was true
    *    by default.) Otherwise, you can call the getMousePosition on the
    *    relevant events handler on the object available via the 'evt.object'
    *    property of the evt object. So, for most events, you can call:
    *    function named(evt) { 
    *        this.xy = this.object.Events.getMousePosition(evt) 
    *    } 
    *
    *    This option typically defaults to false for performance reasons:
    *    when creating an events object whose primary purpose is to manage
    *    relatively positioned mouse events within a div, it may make
    *    sense to set it to true.
    *
    *    This option is also used to control whether the events object caches
    *    offsets. If this is false, it will not: the reason for this is that
    *    it is only expected to be called many times if the includeXY property
    *    is set to true. If you set this to true, you are expected to clear 
    *    the offset cache manually (using this.clearMouseCache()) if:
    *        the border of the element changes
    *        the location of the element in the page changes
    */
    includeXY: false,

    /**
    * Method: clearMouseListener
    * A version of <clearMouseCache> that is bound to this instance so that
    *     it can be used with <brjs.Event.observe> and
    *     <brjs.Event.stopObserving>.
    */
    clearMouseListener: null,

    /**
    * Constructor: brjs.Events
    * Construct an brjs.Events object.
    *
    * Parameters:
    * object - {Object} The js object to which this Events object  is being
    * added element - {DOMElement} A dom element to respond to browser events
    * eventTypes - {Array(String)} Array of custom application events 
    * fallThrough - {Boolean} Allow events to fall through after these have
    *                         been handled?
    * options - {Object} Options for the events object.
    */
    initialize: function (object, element, eventTypes, fallThrough, options) {
        brjs.Object.extend(this, options);
        this.object = object;
        this.fallThrough = fallThrough;
        this.listeners = {};

        // keep a bound copy of handleBrowserEvent() so that we can
        // pass the same function to both Event.observe() and .stopObserving()
        this.eventHandler = brjs.Function.bindAsEventListener(
            this.handleBrowserEvent, this
        );

        // to be used with observe and stopObserving
        this.clearMouseListener = brjs.Function.bind(
            this.clearMouseCache, this
        );

        // if eventTypes is specified, create a listeners list for each 
        // custom application event.
        this.eventTypes = [];
        if (eventTypes != null) {
            for (var i = 0, len = eventTypes.length; i < len; i++) {
                this.addEventType(eventTypes[i]);
            }
        }

        // if a dom element is specified, add a listeners list 
        // for browser events on the element and register them
        if (element != null) {
            this.attachToElement(element);
        }
    },

    /**
    * APIMethod: destroy
    */
    destroy: function () {
        if (this.element) {
            brjs.Event.stopObservingElement(this.element);
            if (this.element.hasScrollEvent) {
                brjs.Event.stopObserving(
                    window, "scroll", this.clearMouseListener
                );
            }
        }
        this.element = null;

        this.listeners = null;
        this.object = null;
        this.eventTypes = null;
        this.fallThrough = null;
        this.eventHandler = null;
    },

    /**
    * APIMethod: addEventType
    * Add a new event type to this events object.
    * If the event type has already been added, do nothing.
    * 
    * Parameters:
    * eventName - {String}
    */
    addEventType: function (eventName) {
        if (!this.listeners[eventName]) {
            this.eventTypes.push(eventName);
            this.listeners[eventName] = [];
        }
    },

    /**
    * Method: attachToElement
    *
    * Parameters:
    * element - {HTMLDOMElement} a DOM element to attach browser events to
    */
    attachToElement: function (element) {
        if (this.element) {
            brjs.Event.stopObservingElement(this.element);
        }
        this.element = element;
        for (var i = 0, len = this.BROWSER_EVENTS.length; i < len; i++) {
            var eventType = this.BROWSER_EVENTS[i];

            // every browser event has a corresponding application event 
            // (whether it's listened for or not).
            this.addEventType(eventType);

            // use Prototype to register the event cross-browser
            brjs.Event.observe(element, eventType, this.eventHandler);
        }
        // disable dragstart in IE so that mousedown/move/up works normally
        brjs.Event.observe(element, "dragstart", brjs.Event.stop);
    },

    /**
    * Method: on
    * Convenience method for registering listeners with a common scope.
    *
    * Example use:
    * (code)
    * events.on({
    *     "loadstart": loadStartListener,
    *     "loadend": loadEndListener,
    *     scope: object
    * });
    * (end)
    */
    on: function (object) {
        for (var type in object) {
            if (type != "scope") {
                this.register(type, object.scope, object[type]);
            }
        }
    },

    /**
    * Method: on
    * Convenience method for registering listeners with a common scope and priority.
    *
    * Example use:
    * (code)
    * events.on({
    *     "loadstart": loadStartListener,
    *     "loadend": loadEndListener,
    *     scope: object
    * });
    * (end)
    */
    onPriority: function (object) {
        for (var type in object) {
            if (type != "scope") {
                this.registerPriority(type, object.scope, object[type]);
            }
        }
    },


    /**
    * APIMethod: register
    * Register an event on the events object.
    *
    * When the event is triggered, the 'func' function will be called, in the
    * context of 'obj'. Imagine we were to register an event, specifying an 
    * brjs.Bounds Object as 'obj'. When the event is triggered, the
    * context in the callback function will be our Bounds object. This means
    * that within our callback function, we can access the properties and 
    * methods of the Bounds object through the "this" variable. So our 
    * callback could execute something like: 
    * :    leftStr = "Left: " + this.left;
    *   
    *                   or
    *  
    * :    centerStr = "Center: " + this.getCenterLonLat();
    *
    * Parameters:
    * type - {String} Name of the event to register
    * obj - {Object} The object to bind the context to for the callback#.
    *                     If no object is specified, default is the Events's 
    *                     'object' property.
    * func - {Function} The callback function. If no callback is 
    *                        specified, this function does nothing.
    * 
    * 
    */
    register: function (type, objt, funct) {

        if ((funct != null) && (brjs.Element.indexOf(this.eventTypes, type) != -1)) {

            if (objt == null) {
                objt = this.object;
            }
            var listeners = this.listeners[type];

            if (listeners != null) {
                /*for (var i = 0, len = listeners.length; i < len; i++) {
                    if ((listeners[i].obj == objt || listeners[i].obj.CLASS_NAME == objt.CLASS_NAME) &&
                        listeners[i].func.toString() == funct.toString()) {
                        return { 'type': type, 'obj': listeners[i].obj, 'func': listeners[i].func };
                    }
                }*/
                listeners.push({ 'obj': objt, 'func': funct });
                return { 'type': type, 'obj': objt, 'func': funct };
            }
        }
    },

    /**
    * APIMethod: registerPriority
    * Same as register() but adds the new listener to the *front* of the
    *     events queue instead of to the end.
    *    
    *     TODO: get rid of this in 3.0 - Decide whether listeners should be 
    *     called in the order they were registered or in reverse order.
    *
    *
    * Parameters:
    * type - {String} Name of the event to register
    * obj - {Object} The object to bind the context to for the callback#.
    *                If no object is specified, default is the Events's 
    *                'object' property.
    * func - {Function} The callback function. If no callback is 
    *                   specified, this function does nothing.
    */
    registerPriority: function (type, obj, func) {

        if (func != null) {
            if (obj == null) {
                obj = this.object;
            }
            var l = this.listeners[type];
            if (l != null) {
                l.unshift({ obj: obj, func: func });
            }
        }
    },

    /**
    * Method: un
    * Convenience method for unregistering listeners with a common scope.
    *
    * Example use:
    * (code)
    * events.un({
    *     "loadstart": loadStartListener,
    *     "loadend": loadEndListener,
    *     scope: object
    * });
    * (end)
    */
    un: function (object) {
        for (var type in object) {
            if (type != "scope") {
                this.unregister(type, object.scope, object[type]);
            }
        }
    },

    /**
    * APIMethod: unregister
    *
    * Parameters:
    * type - {String} 
    * obj - {Object} If none specified, defaults to this.object
    * func - {Function} If none specified, unregister all listeners to the event 
    */
    unregister: function (type, obj, func) {
        if (obj == null) {
            obj = this.object;
        }
        var listeners = this.listeners[type];
        
        if (listeners != null) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].obj == obj && (listeners[i].func == func || typeof func == 'undefined')) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    },
    
    /**
    * APIMethod: clear
    *
    * Parameters:
    * type - {String} 
    * obj - {Object} If none specified, defaults to this.object
    */
    clear: function (type, obj) {
        if (obj == null) {
            obj = this.object;
        }
        var listeners = this.listeners[type];
        if (listeners != null) {
            for (var i = listeners.length-1; i>=0; i--) {
                if (listeners[i].obj == obj) {
                    listeners.splice(i, 1);
                }
            }
        }
    },

    /** 
    * Method: remove
    * Remove all listeners for a given event type. If type is not registered,
    *     does nothing.
    *
    * Parameters:
    * type - {String} 
    */
    remove: function (type) {
        if (this.listeners[type] != null) {
            this.listeners[type] = [];
        }
    },

    /**
    * APIMethod: triggerEvent
    * Trigger a specified registered event.  
    * 
    * Parameters:
    * type - {String} 
    * evt - {Event}
    *
    * Returns:
    * {Boolean} The last listener return.  If a listener returns false, the
    *     chain of listeners will stop getting called.
    */
    triggerEvent: function (type, evt) {

    	var listeners = this.listeners[type];

        // fast path
        if (!listeners || listeners.length == 0) {
            return;
        }

        // prep evt object with object & div references
        if ((evt == null) || (typeof evt == 'undefined')) {
            evt = {};
        }
        evt.object = this.object;
        evt.element = this.element;
        if (!evt.type) {
            evt.type = type;
        }

        // execute all callbacks registered for specified type
        // get a clone of the listeners array to
        // allow for splicing during callbacks
        var listeners = listeners.slice(), continueChain = null;
        
        for (var i = 0, len = listeners.length; i < len; i++) {
            var callback = listeners[i];
            // bind the context to callback.obj
            continueChain = callback.func.apply(callback.obj, [evt]);

            if ((continueChain != undefined) && (continueChain == false)) {
                // if callback returns false, execute no more callbacks.
                break;
            }
        }
        // don't fall through to other DOM elements
        if (!this.fallThrough) {
            brjs.Event.stop(evt, true);
        }
        return continueChain;
    },

    /**
    * Method: handleBrowserEvent
    * Basically just a wrapper to the triggerEvent() function, but takes 
    *     care to set a property 'xy' on the event with the current mouse 
    *     position.
    *
    * Parameters:
    * evt - {Event} 
    */
    handleBrowserEvent: function (evt) {
    	if (this.element == null) return;
        
    	if (this.includeXY) {
            evt.xy = this.getMousePosition(evt);
        }
    	
        this.triggerEvent(evt.type, evt);
    },

    _executeBreakEvent: function (evt) {
        evt.object.Events.unregister(evt.type, null, evt.object.Events._executeBreakEvent);
        brjs.Event.stop(evt, true);
        return false;
    },

    breakEvent: function (type) {
        this.registerPriority(type, null, this._executeBreakEvent);
    },

    /**
    * APIMethod: clearMouseCache
    * Clear cached data about the mouse position. This should be called any 
    *     time the element that events are registered on changes position 
    *     within the page.
    */
    clearMouseCache: function () {
        this.element.scrolls = null;
        this.element.lefttop = null;
        this.element.position = null;
    },

    /**
    * Method: getMousePosition
    * 
    * Parameters:
    * evt - {Event} 
    * 
    * Returns:
    * {x:<number>, y:<number>} The current xy coordinate of the mouse, adjusted for offsets
    *                      
    */
    getMousePosition: function (evt) {
    	
    	var de = document.documentElement;
    	
        if (!this.includeXY) {
            this.clearMouseCache();
        } else if (!this.element.hasScrollEvent) {
            brjs.Event.observe(window, "scroll", this.clearMouseListener);
            this.element.hasScrollEvent = true;
        }

        if (!this.element.scrolls) {
            this.element.scrolls = [
                (de.scrollLeft || document.body.scrollLeft),
                (de.scrollTop || document.body.scrollTop)
            ];
        }

        if (!this.element.lefttop) {
            this.element.lefttop = [
                (de.clientLeft || 0),
                (de.clientTop || 0)
            ];
        }
        
        if(!this.element.position){
	        this.element.position = brjs.Element.pagePosition(this.element);
	        this.element.position[0] += this.element.scrolls[0];
	        this.element.position[1] += this.element.scrolls[1];
        }
        
        return {x : (evt.clientX + this.element.scrolls[0]) - this.element.position[0] - this.element.lefttop[0],
            	y : (evt.clientY + this.element.scrolls[1]) - this.element.position[1] - this.element.lefttop[1]};
    },


    CLASS_NAME: "brjs.Events"
});

