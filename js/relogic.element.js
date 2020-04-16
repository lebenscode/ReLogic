
class ReLogicElement{
    /**
     *
     * @type {boolean}
     * @private
     * Show if current flows through element.
     */
    _hasCurrent = false;

    /**
     *
     * @type {boolean}
     * @private
     * Indicates whether an element can conduct current.
     */
    _canCurrentFlow = true;

    /**
     *
     * @type {boolean}
     * Indicates whether an element has voltage drop on it.
     */
    voltageDrop = false;

    /**
     *
     * @type {string}
     * Element title.
     */
    title = "Default Element";

    /**
     *
     * @type {null}
     * ReLogicScene[type] object.
     */
    scene = null;

    /**
     *
     * Canvas 2D context.
     */
    ctx = null;

    drawTitle(){
        if(!this.scene){
            console.log("[ReLogic] Can't find Canvas 2D context of the element.");
            return;
        }

        this.scene.drawTitle(this.id, this.title);
    }

    clear(){
        let border = this.drawData.border;

        if(!Array.isArray(border) || border.length < 4){
            return;
        }

        this.ctx.clearRect(border[0], border[1], border[2] - border[0], border[3] - border[1]);
    }
}
