/**
 * @requires brjs/Console.js
 */

/**
 * Class: brjs.Control
 * Controls affect the display or behavior of the map. They allow everything
 * from panning and zooming to displaying a scale indicator. Controls by 
 * default are added to the map they are contained within however it is
 * possible to add a control to an external div by passing the div in the
 * options parameter.
 * 
 * Example:
 * The following example shows how to add many of the common controls
 * to a map.
 * 
 * > var map = new brjs.Map('map', { controls: [] });
 * >
 * > map.addControl(new brjs.Control.PanZoomBar());
 * > map.addControl(new brjs.Control.MouseToolbar());
 * > map.addControl(new brjs.Control.LayerSwitcher({'ascending':false}));
 * > map.addControl(new brjs.Control.Permalink());
 * > map.addControl(new brjs.Control.Permalink('permalink'));
 * > map.addControl(new brjs.Control.MousePosition());
 * > map.addControl(new brjs.Control.OverviewMap());
 * > map.addControl(new brjs.Control.KeyboardDefaults());
 *
 * The next code fragment is a quick example of how to intercept 
 * shift-mouse click to display the extent of the bounding box
 * dragged out by the user.  Usually controls are not created
 * in exactly this manner.  See the source for a more complete 
 * example:
 *
 * > var control = new brjs.Control();
 * > brjs.Util.extend(control, {
 * >     draw: function () {
 * >         // this Handler.Box will intercept the shift-mousedown
 * >         // before Control.MouseDefault gets to see it
 * >         this.box = new brjs.Handler.Box( control,
 * >             {"done": this.notice},
 * >             {keyMask: brjs.Handler.MOD_SHIFT});
 * >         this.box.activate();
 * >     },
 * >
 * >     notice: function (bounds) {
 * >         brjs.Console.userError(bounds);
 * >     }
 * > }); 
 * > map.addControl(control);
 * 
 */
brjs.Control = brjs.Object.create({

    /** 
     * Property: id 
     * {String} 
     */
    id: null,
    
    /** 
     * Property: div 
     * {DOMElement} 
     */
    div: null,

    /** 
     * Property: type 
     * {brjs.Control.TYPES} Controls can have a 'type'. The type
     * determines the type of interactions which are possible with them when
     * they are placed into a toolbar. 
     */
    type: null, 

    /** 
     * Property: allowSelection
     * {Boolean} By deafault, controls do not allow selection, because
     * it may interfere with map dragging. If this is true, brjs
     * will not prevent selection of the control.
     * Default is false.
     */
    allowSelection: false,  

    /** 
     * Property: displayClass 
     * {string}  This property is used for CSS related to the drawing of the
     * Control. 
     */
    displayClass: "",
    
    /**
    * Property: title  
    * {string}  This property is used for showing a tooltip over the  
    * Control.  
    */ 
    title: "",

    /** 
     * Property: active 
     * {Boolean} The control is active.
     */
    active: null,

    /** 
     * Property: handler 
     * {<brjs.Handler>} null
     */
    handler: null,

    /**
     * APIProperty: eventListeners
     * {Object} If set as an option at construction, the eventListeners
     *     object will be registered with <brjs.Events.on>.  Object
     *     structure must be a listeners object as shown in the example for
     *     the events.on method.
     */
    eventListeners: null,

    /** 
     * Property: events
     * {<brjs.Events>} Events instance for triggering control specific
     *     events.
     */
    events: null,

    /**
     * Constant: EVENT_TYPES
     * {Array(String)} Supported application event types.  Register a listener
     *     for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     * object - {Object} A reference to control.events.object (a reference
     *      to the control).
     * element - {DOMElement} A reference to control.events.element (which
     *      will be null unless documented otherwise).
     *
     * Supported map event types:
     * activate - Triggered when activated.
     * deactivate - Triggered when deactivated.
     */
    EVENT_TYPES: ["activate", "deactivate"],

    /**
     * Constructor: brjs.Control
     * Create an brjs Control.  The options passed as a parameter
     * directly extend the control.  For example passing the following:
     * 
     * > var control = new brjs.Control({div: myDiv});
     *
     * Overrides the default div attribute value of null.
     * 
     * Parameters:
     * options - {Object} 
     */
    initialize: function (options) {
                
        brjs.Object.extend(this, options);
        
        this.events = new brjs.Events(this, null, this.EVENT_TYPES);
        
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
        
        if (this.id == null) {
            this.id = brjs.Object.createUID(this.CLASS_NAME + "_");
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function () {
        if(this.events) {
            if(this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
            this.events = null;
        }
        this.eventListeners = null;

        // eliminate circular references
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if(this.handlers) {
            for(var key in this.handlers) {
                if(this.handlers.hasOwnProperty(key) &&
                   typeof this.handlers[key].destroy == "function") {
                    this.handlers[key].destroy();
                }
            }
            this.handlers = null;
        }
    },

    
    /**
     * Method: draw
     * The draw method is called when the control is ready to be displayed
     * on the page.  If a div has not been created one is created.  Controls
     * with a visual component will almost always want to override this method 
     * to customize the look of control. 
     *
     * Parameters:
     * px - {<brjs.Pixel>} The top-left pixel position of the control
     *      or null.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function (px) {
        if (this.div == null) {
            this.div = brjs.Object.createDiv(this.id);
            this.div.className = this.displayClass;
            if (!this.allowSelection) {
                this.div.className += " olControlNoSelect";
                this.div.setAttribute("unselectable", "on", 0);
                this.div.onselectstart = function() { return(false); }; 
            }    
            if (this.title != "") {
                this.div.title = this.title;
            }
        }
        if (px != null) {
            this.position = px.clone();
        }
        this.moveTo(this.position);
        return this.div;
    },

    /**
     * Method: moveTo
     * Sets the left and top style attributes to the passed in pixel 
     * coordinates.
     *
     * Parameters:
     * px - {<brjs.Pixel>}
     */
    moveTo: function (px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.y + "px";
        }
    },

    /**
     * Method: activate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function () {
        if (this.active) {
            return false;
        }
        if (this.handler) {
            this.handler.activate();
        }
        this.active = true;
        this.events.triggerEvent("activate");
        return true;
    },
    
    /**
     * Method: deactivate
     * Deactivates a control and it's associated handler if any.  The exact
     * effect of this depends on the control itself.
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function () {
        if (this.active) {
            if (this.handler) {
                this.handler.deactivate();
            }
            this.active = false;
            this.events.triggerEvent("deactivate");
            return true;
        }
        return false;
    },

    CLASS_NAME: "brjs.Control"
});

brjs.Control.TYPE_BUTTON = 1;
brjs.Control.TYPE_TOGGLE = 2;
brjs.Control.TYPE_TOOL   = 3;
