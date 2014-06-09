/**
 * @requires brjs/Handler.js
 */

/**
 * Class: brjs.Handler.Drag
 * The drag handler is used to deal with sequences of browser events related
 *     to dragging.  The handler is used by controls that want to know when
 *     a drag sequence begins, when a drag is happening, and when it has
 *     finished.
 *
 * Controls that use the drag handler typically construct it with callbacks
 *     for 'down', 'move', and 'done'.  Callbacks for these keys are called
 *     when the drag begins, with each move, and when the drag is done.  In
 *     addition, controls can have callbacks keyed to 'up' and 'out' if they
 *     care to differentiate between the types of events that correspond with
 *     the end of a drag sequence.  If no drag actually occurs (no mouse move)
 *     the 'down' and 'up' callbacks will be called, but not the 'done'
 *     callback.
 *
 * Create a new drag handler with the <brjs.Handler.Drag> constructor.
 *
 * Inherits from:
 *  - <brjs.Handler>
 */
brjs.Handler.Drag = brjs.Object.create(brjs.Handler, {
  
    /** 
     * Property: started
     * {Boolean} When a mousedown event is received, we want to record it, but
     *     not set 'dragging' until the mouse moves after starting. 
     */
    started: false,
    
    /**
     * Property: stopDown
     * {Boolean} Stop propagation of mousedown events from getting to listeners
     *     on the same element.  Default is true.
     */
    stopDown: true,

    /** 
     * Property: dragging 
     * {Boolean} 
     */
    dragging: false,

    /** 
     * Property: last
     * {<brjs.Pixel>} The last pixel location of the drag.
     */
    last: null,

    /** 
     * Property: start
     * {<brjs.Pixel>} The first pixel location of the drag.
     */
    start: null,

    position: null,
    
    offset:null,
    
    /**
     * Property: oldOnselectstart
     * {Function}
     */
    oldOnselectstart: null,
    
    /**
     * Property: interval
     * {Integer} In order to increase performance, an interval (in 
     *     milliseconds) can be set to reduce the number of drag events 
     *     called. If set, a new drag event will not be set until the 
     *     interval has passed. 
     *     Defaults to 0, meaning no interval. 
     */
    interval: 0,
    
    /**
     * Property: timeoutId
     * {String} The id of the timeout used for the mousedown interval.
     *     This is "private", and should be left alone.
     */
    timeoutId: null,
    
    /**
     * APIProperty: documentDrag
     * {Boolean} If set to true, the handler will also handle mouse moves when
     *     the cursor has moved out of the map viewport. Default is false.
     */
    documentDrag: false,
    
    /**
     * Property: documentEvents
     * {<brjs.Events>} Event instance for observing document events. Will
     *     be set on mouseout if documentDrag is set to true.
     */
    documentEvents: null,

    /**
     * Constructor: brjs.Handler.Drag
     * Returns brjs.Handler.Drag
     * 
     * Parameters:
     * control - {<brjs.Control>} The control that is making use of
     *     this handler.  If a handler is being used without a control, the
     *     handlers setMap method must be overridden to deal properly with
     *     the map.
     * callbacks - {Object} An object containing a single function to be
     *     called when the drag operation is finished. The callback should
     *     expect to recieve a single argument, the pixel location of the event.
     *     Callbacks for 'move' and 'done' are supported. You can also speficy
     *     callbacks for 'down', 'up', and 'out' to respond to those events.
     * options - {Object} 
     */
    initialize: function(control, callbacks, options) {
        brjs.Handler.prototype.initialize.apply(this, arguments);
        
        if(!control.events){
        	control.events = new brjs.Events(control, control.div, null, null, {includeXY:true});
        }
    },
    
    /**
     * The four methods below (down, move, up, and out) are used by subclasses
     *     to do their own processing related to these mouse events.
     */
    
    /**
     * Method: down
     * This method is called during the handling of the mouse down event.
     *     Subclasses can do their own processing here.
     *
     * Parameters:
     * evt - {Event} The mouse down event
     */
    down: function(evt) {
    	//this.position = brjs.Element.pagePosition(this.control.div);
    },
    
    /**
     * Method: move
     * This method is called during the handling of the mouse move event.
     *     Subclasses can do their own processing here.
     *
     * Parameters:
     * evt - {Event} The mouse move event
     *
     */
    move: function(evt) {
		/*var px = new brjs.Pixel((parseInt(this.position[0]) - (this.last.x - evt.xy.x)),
		 		(parseInt(this.position[1]) - (this.last.y - evt.xy.y)));
		this.control.moveTo(px);
		this.position = [px.x, px.y];*/
    },

    /**
     * Method: up
     * This method is called during the handling of the mouse up event.
     *     Subclasses can do their own processing here.
     *
     * Parameters:
     * evt - {Event} The mouse up event
     */
    up: function(evt) {
    	
    },

    /**
     * Method: out
     * This method is called during the handling of the mouse out event.
     *     Subclasses can do their own processing here.
     *
     * Parameters:
     * evt - {Event} The mouse out event
     */
    out: function(evt) {
    },

    /**
     * The methods below are part of the magic of event handling.  Because
     *     they are named like browser events, they are registered as listeners
     *     for the events they represent.
     */

    /**
     * Method: mousedown
     * Handle mousedown events
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    mousedown: function (evt) {
        var propagate = true;
        this.dragging = false;
        
        if (this.checkModifiers(evt) && brjs.Event.isLeftClick(evt)) {
        	
            this.started = true;
            this.start = evt.xy;
            this.last = evt.xy;
                        
            this.down(evt);
            this.callback("down", [evt.xy]);
            
            //brjs.Event.stop(evt);
            propagate = !this.stopDown;
            
        } else {
            this.started = false;
            this.start = null;
            this.last = null;
        }
        return propagate;
    },

    /**
     * Method: mousemove
     * Handle mousemove events
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    mousemove: function (evt) {
        if (this.started) {
            
        	if(this.documentDrag === true && this.documentEvents) {
                
        		this.control.moveTo(new brjs.Pixel((parseInt(evt.clientX) - this.start.x), (evt.clientY - this.start.y)));
 
            }
        	                        
            this.dragging = true;
            
            this.move(evt);
            this.callback("move", [evt.xy]);

            this.last = this.evt.xy;
        }
        return true;
    },
    
    /**
     * Method: removeTimeout
     * Private. Called by mousemove() to remove the drag timeout.
     */
    removeTimeout: function() {
        this.timeoutId = null;
    },

    /**
     * Method: mouseup
     * Handle mouseup events
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    mouseup: function (evt) {
        if (this.started) {
                    	           
            var dragged = (this.start != this.last);
            this.started = false;
            this.dragging = false;
            
            this.control.events.clearMouseCache();
            
            this.up(evt);
            this.callback("up", [evt.xy]);
            if(dragged) {
                this.callback("done", [evt.xy]);
            }
            
        }
        return true;
    },

    /**
     * Method: mouseout
     * Handle mouseout events
     *
     * Parameters:
     * evt - {Event} 
     *
     * Returns:
     * {Boolean} Let the event propagate.
     */
    mouseout: function (evt) {
        if (this.started && brjs.Element.mouseLeft(evt, this.control.div)) {
            
        	/*if(this.documentDrag === true) {
        		if(!this.documentEvents){
	                this.documentEvents = new brjs.Events(this, document,
	                                            null, null, {includeXY: true});
	                this.documentEvents.on({
	                    mousemove: this.mousemove,
	                    mouseup: this.mouseup
	                });
        		}
                
            } else {*/
                var dragged = (this.start != this.last);
                this.started = false; 
                this.dragging = false;
                
                this.out(evt);
                this.callback("out", []);
                if(dragged) {
                    this.callback("done", [evt.xy]);
                }
                
            //}
        }
        return true;
    },

    /**
     * Method: click
     * The drag handler captures the click event.  If something else registers
     *     for clicks on the same element, its listener will not be called 
     *     after a drag.
     * 
     * Parameters: 
     * evt - {Event} 
     * 
     * Returns:
     * {Boolean} Let the event propagate.
     */
    click: function (evt) {
        // let the click event propagate only if the mouse moved
        return (this.start == this.last);
    },

    /**
     * Method: activate
     * Activate the handler.
     * 
     * Returns:
     * {Boolean} The handler was successfully activated.
     */
    activate: function() {
        var activated = false;
        if(brjs.Handler.prototype.activate.apply(this, arguments)) {
            this.dragging = false;
            activated = true;
            
            if(!this.documentEvents){
                this.documentEvents = new brjs.Events(this, document,
                                            null, null, {includeXY: true});
                this.documentEvents.on({
                    mousemove: this.mousemove,
                    mouseup: this.mouseup
                });
    		}
        }
        return activated;
    },

    /**
     * Method: deactivate 
     * Deactivate the handler.
     * 
     * Returns:
     * {Boolean} The handler was successfully deactivated.
     */
    deactivate: function() {
        var deactivated = false;
        if(brjs.Handler.prototype.deactivate.apply(this, arguments)) {
            this.started = false;
            this.dragging = false;
            this.start = null;
            this.last = null;
            this.destroyDocumentEvents();
            deactivated = true;
            
        }
        return deactivated;
    },
    
    /**
     * Method: adjustXY
     * Converts event coordinates that are relative to the document body to
     * ones that are relative to the map viewport. 
     * 
     * Parameters:
     * evt - {Object}
     */
    adjustXY: function(evt) {
        //var pos = brjs.Element.pagePosition(this.control.div);
        evt.xy.x = evt.clientX - this.start.x;
        evt.xy.y = evt.clientY - this.start.y;
    },
    
    /**
     * Method: destroyDocumentEvents
     * Destroys the events instance that gets added to the document body when
     * documentDrag is true and the mouse cursor leaves the map viewport while
     * dragging.
     */
    destroyDocumentEvents: function() {
        
        this.documentEvents.destroy();
        this.documentEvents = null;
    },

    CLASS_NAME: "brjs.Handler.Drag"
});
