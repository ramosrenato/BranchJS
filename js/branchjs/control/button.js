
/**
 * @requires brjs/Control.js
 */

/**
 * Class: brjs.Control.Button
 * The Button control is a very simple push-button, for use with 
 * <brjs.Control.Panel>.
 * When clicked, the function trigger() is executed.
 * 
 * Inherits from:
 *  - <brjs.Control>
 *
 * Use:
 * (code)
 * var button = new brjs.Control.Button({
 *     displayClass: "MyButton", trigger: myFunction
 * });
 * panel.addControls([button]);
 * (end)
 * 
 * Will create a button with CSS class MyButtonItemInactive, that
 *     will call the function MyFunction() when clicked.
 */
brjs.Control.Button = brjs.Object.create(brjs.Control, {
			
	initialize: function(options){
		
		brjs.Control.prototype.initialize.apply(this, [options]);
      
		
		/* 
		 * quando queremos atribuir eventos a um objeto por meio
		 * de brjs.Events.addListener( ... devemos instanciar
		 * a propriedade events no objeto que ser� usado para observar os eventos
		 * 
		 */ 
		
		this.events = new brjs.Events(this, this.div, null, null, {includeXY:true});
	
		this.handler = 
			{
				click: new brjs.Handler.Click(
	                this, {
	                    'click': this.onClick,
	                    'dblclick': this.onDblclick 
	                }, 
	                {
	                	'single': true,
	                    'double': true,
	                    'pixelTolerance': 0,
	                    'stopSingle': false,
	                    'stopDouble': false
	                }
	            ),
		
				drag: new brjs.Handler.Drag(
						this,
						{
							down:this.onDown,
							move:this.onMove,
							done:this.onDone
						},
						{
							documentDrag:true
						}
				)
			};
		 
		this.handler.click.activate();
		this.handler.drag.activate();
		
	},
	
	/**
     * Property: type
     * {Integer} brjs.Control.TYPE_BUTTON.
     */
    type: brjs.Control.TYPE_BUTTON,
    
    /**
     * Method: onClick
     * Called by a control panel when the button is clicked.
     */
    onClick: function (evt) {
    	alert('evento click interno');
        //brjs.Event.stop(evt ? evt : window.event);
        //this.activateControl(ctrl);
    },
    
    onDblclick: function(evt){
    	alert('evento duplo click interno');
    },
    
    onDown: function(xy){
    	
    },
    
    onDone: function(xy){
    	
    },
    
    onMove: function(xy, xypage){
    	this.moveTo(xypage);
    	
    },
           
  
    CLASS_NAME: "brjs.Control.Button"
});
