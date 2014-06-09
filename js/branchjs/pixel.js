/**
 * Class: brjs.Pixel
 * This class represents a screen coordinate, in x and y coordinates
 */
brjs.Pixel = brjs.Object.create({
    
    /**
     * APIProperty: x
     * {Number} The x coordinate
     */
    x: 0.0,

    /**
     * APIProperty: y
     * {Number} The y coordinate
     */
    y: 0.0,
    
    /**
     * Constructor: brjs.Pixel
     * Create a new brjs.Pixel instance
     *
     * Parameters:
     * x - {Number} The x coordinate
     * y - {Number} The y coordinate
     *
     * Returns:
     * An instance of brjs.Pixel
     */
    initialize: function(x, y) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    },
    
    /**
     * Method: toString
     * Cast this object into a string
     *
     * Returns:
     * {String} The string representation of Pixel. ex: "x=200.4,y=242.2"
     */
    toString:function() {
        return ("x=" + this.x + ",y=" + this.y);
    },

    /**
     * APIMethod: clone
     * Return a clone of this pixel object
     *
     * Returns:
     * {<brjs.Pixel>} A clone pixel
     */
    clone:function() {
        return new brjs.Pixel(this.x, this.y);
    },
    
    /**
     * APIMethod: equals
     * Determine whether one pixel is equivalent to another
     *
     * Parameters:
     * px - {<brjs.Pixel>}
     *
     * Returns:
     * {Boolean} The point passed in as parameter is equal to this. Note that
     * if px passed in is null, returns false.
     */
    equals:function(px) {
        var equals = false;
        if (px != null) {
            equals = ((this.x == px.x && this.y == px.y) ||
                      (isNaN(this.x) && isNaN(this.y) && isNaN(px.x) && isNaN(px.y)));
        }
        return equals;
    },

    /**
     * APIMethod: add
     *
     * Parameters:
     * x - {Integer}
     * y - {Integer}
     *
     * Returns:
     * {<brjs.Pixel>} A new Pixel with this pixel's x&y augmented by the
     * values passed in.
     */
    add:function(x, y) {
        if ( (x == null) || (y == null) ) {
            return null;
        }
        return new brjs.Pixel(this.x + x, this.y + y);
    },

    /**
    * APIMethod: offset
    * 
    * Parameters
    * px - {<brjs.Pixel>}
    * 
    * Returns:
    * {<brjs.Pixel>} A new Pixel with this pixel's x&y augmented by the
    *                      x&y values of the pixel passed in.
    */
    offset:function(px) {
        var newPx = this.clone();
        if (px) newPx = this.add(px.x, px.y);
        return newPx;
    },

    CLASS_NAME: "brjs.Pixel"
});
