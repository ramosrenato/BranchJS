
/**
 * @requires brjs/Events.js
 */

/**
 * Class: brjs.Handler
 * Base class to construct a higher-level handler for event sequences.  All
 *     handlers have activate and deactivate methods.  In addition, they have
 *     methods named like browser events.  When a handler is activated, any
 *     additional methods named like a browser event is registered as a
 *     listener for the corresponding event.  When a handler is deactivated,
 *     those same methods are unregistered as event listeners.
 *
 * Handlers also typically have a callbacks object with keys named like
 *     the abstracted events or event sequences that they are in charge of
 *     handling.  The controls that wrap handlers define the methods that
 *     correspond to these abstract events - so instead of listening for
 *     individual browser events, they only listen for the abstract events
 *     defined by the handler.
 *     
 * Handlers are created by controls, which ultimately have the responsibility
 *     of making changes to the the state of the application.  Handlers
 *     themselves may make temporary changes, but in general are expected to
 *     return the application in the same state that they found it.
 */
brjs.Handler = brjs.Object.create({

    /**
     * Property: id
     * {String}
     */
    id: null,
        
    /**
     * APIProperty: control
     * {<brjs.Control>}. The control that initialized this handler.
     */
    control: null,


    /**
     * APIProperty: keyMask
     * {Integer} Use bitwise operators and one or more of the brjs.Handler
     *     constants to construct a keyMask.  The keyMask is used by
     *     <checkModifiers>.  If the keyMask matches the combination of keys
     *     down on an event, checkModifiers returns true.
     *
     * Example:
     * (code)
     *     // handler only responds if the Shift key is down
     *     handler.keyMask = brjs.Handler.MOD_SHIFT;
     *
     *     // handler only responds if Ctrl-Shift is down
     *     handler.keyMask = brjs.Handler.MOD_SHIFT |
     *                       brjs.Handler.MOD_CTRL;
     * (end)
     */
    keyMask: null,

    /**
     * Property: active
     * {Boolean}
     */
    active: false,
    
    /**
     * Property: evt
     * {Event} This property references the last event handled by the handler.
     *     Note that this property is not part of the stable API.  Use of the
     *     evt property should be restricted to controls in the library
     *     or other applications that are willing to update with changes to
     *     the brjs code.
     */
    evt: null,

    /**
     * Constructor: brjs.Handler
     * Construct a handler.
     *
     * Parameters:
     * control - {<brjs.Control>} The control that initialized this
     *     handler.  The control is assumed to have a valid map property; that
     *     map is used in the handler's own setMap method.
     * callbacks - {Object} An object whose properties correspond to abstracted
     *     events or sequences of browser events.  The values for these
     *     properties are functions defined by the control that get called by
     *     the handler.
     * options - {Object} An optional object whose properties will be set on
     *     the handler.
     */
    initialize: function(control, callbacks, options) {
        brjs.Object.extend(this, options);
        this.control = control;
        this.callbacks = callbacks;
        
        brjs.Object.extend(this, options);
        
        this.id = brjs.Object.createUID(this.CLASS_NAME + "_");
    },
    

    /**
     * Method: checkModifiers
     * Check the keyMask on the handler.  If no <keyMask> is set, this always
     *     returns true.  If a <keyMask> is set and it matches the combination
     *     of keys down on an event, this returns true.
     *
     * Returns:
     * {Boolean} The keyMask matches the keys down on an event.
     */
    checkModifiers: function (evt) {
        if(this.keyMask == null) {
            return true;
        }
        /* calculate the keyboard modifier mask for this event */
        var keyModifiers =
            (evt.shiftKey ? brjs.Handler.MOD_SHIFT : 0) |
            (evt.ctrlKey  ? brjs.Handler.MOD_CTRL  : 0) |
            (evt.altKey   ? brjs.Handler.MOD_ALT   : 0);
    
        /* if it differs from the handler object's key mask,
           bail out of the event handler */
        return (keyModifiers == this.keyMask);
    },

    /**
     * APIMethod: activate
     * Turn on the handler.  Returns false if the handler was already active.
     * 
     * Returns: 
     * {Boolean} The handler was activated.
     */
    activate: function() {
        if(this.active) {
            return false;
        }
        // register for event handlers defined on this class.
        var events = brjs.Events.prototype.BROWSER_EVENTS;
        for (var i=0, len=events.length; i<len; i++) {
            if (this[events[i]]) {
                this.register(events[i], this[events[i]]); 
            }
        } 
        this.active = true;
        return true;
    },
    
    /**
     * APIMethod: deactivate
     * Turn off the handler.  Returns false if the handler was already inactive.
     * 
     * Returns:
     * {Boolean} The handler was deactivated.
     */
    deactivate: function() {
        if(!this.active) {
            return false;
        }
        // unregister event handlers defined on this class.
        var events = brjs.Events.prototype.BROWSER_EVENTS;
        for (var i=0, len=events.length; i<len; i++) {
            if (this[events[i]]) {
                this.unregister(events[i], this[events[i]]); 
            }
        } 
        this.active = false;
        return true;
    },

    /**
    * Method: callback
    * Trigger the control's named callback with the given arguments
    *
    * Parameters:
    * name - {String} The key for the callback that is one of the properties
    *     of the handler's callbacks object.
    * args - {Array(*)} An array of arguments (any type) with which to call 
    *     the callback (defined by the control).
    */
    callback: function (name, args) {
        if (name && this.callbacks[name]) {
            this.callbacks[name].apply(this.control, args);
        }
    },

    /**
    * Method: register
    * register an event on the map
    */
    register: function (name, method) {
    	this.control.events.registerPriority(name, this, method);
    	this.control.events.registerPriority(name, this, this.setEvent);
       
    },

    /**
    * Method: unregister
    * unregister an event from the map
    */
    unregister: function (name, method) {
    	this.control.events.unregister(name, this, method);
    	this.control.events.unregister(name, this, this.setEvent);
    },
    
    /**
     * Method: setEvent
     * With each registered browser event, the handler sets its own evt
     *     property.  This property can be accessed by controls if needed
     *     to get more information about the event that the handler is
     *     processing.
     *
     * This allows modifier keys on the event to be checked (alt, shift,
     *     and ctrl cannot be checked with the keyboard handler).  For a
     *     control to determine which modifier keys are associated with the
     *     event that a handler is currently processing, it should access
     *     (code)handler.evt.altKey || handler.evt.shiftKey ||
     *     handler.evt.ctrlKey(end).
     *
     * Parameters:
     * evt - {Event} The browser event.
     */
    setEvent: function(evt) {
        this.evt = evt;
        return true;
    },

    /**
     * Method: destroy
     * Deconstruct the handler.
     */
    destroy: function () {
        // unregister event listeners
        this.deactivate();
        // eliminate circular references
        this.control = null;        
    },

    CLASS_NAME: "brjs.Handler"
});

/**
 * Constant: brjs.Handler.MOD_NONE
 * If set as the <keyMask>, <checkModifiers> returns false if any key is down.
 */
brjs.Handler.MOD_NONE  = 0;

/**
 * Constant: brjs.Handler.MOD_SHIFT
 * If set as the <keyMask>, <checkModifiers> returns false if Shift is down.
 */
brjs.Handler.MOD_SHIFT = 1;

/**
 * Constant: brjs.Handler.MOD_CTRL
 * If set as the <keyMask>, <checkModifiers> returns false if Ctrl is down.
 */
brjs.Handler.MOD_CTRL  = 2;

/**
 * Constant: brjs.Handler.MOD_ALT
 * If set as the <keyMask>, <checkModifiers> returns false if Alt is down.
 */
brjs.Handler.MOD_ALT   = 4;


