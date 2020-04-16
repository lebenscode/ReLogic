
class ReLogicResistor extends ReLogicElement{

    constructor(scene, title, coors, R = 100) {
        super();

        this.title = title;
        this.R = R;
        this.scene = scene;
        this.ctx = scene.ctx;
        this.voltageDrop = true;
        this.coors = coors;
        this.drawData = {
            border: [0, 0, 0, 0],
            start: [0, 0],
            end: [0, 0]
        };
    }

    draw(){
        let ctx = this.ctx;
        let x = this.coors[0], y = this.coors[1];
        let w = 50, h = 20;
        let dh = h / 2;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 2;

        ctx.moveTo(x, y);
        ctx.lineTo(x + CONTACT_W, y);

        ctx.moveTo(x + CONTACT_W + w, y);
        ctx.lineTo(x + CONTACT_W * 2 + w, y);

        ctx.stroke();

        ctx.strokeRect(x + CONTACT_W, y - dh, w, h);
        ctx.restore();

        this.drawData = {
            border: [x, y - 35, x + CONTACT_W * 2 + w, y + dh + 2],
            start: [x, y],
            end: [x + CONTACT_W * 2 + w, y]
        };

        this.drawTitle();
    }

}