Blueprint.classes.Line = function(params){
	this.params = params;
	this.line   = {};

	this.parent = $('#'+this.params.parent.uid),
	this.self   = $('#'+this.params.node.data.uid);

	this.output = $('.var-output-'+this.params.parent.output,this.parent);
	this.input  = $('.var-input-'+this.params.parent.input,this.self);

	this.output.addClass('active')
	this.input.addClass('active')

	this.parentData   = Blueprint.Data.get().nodes[this.params.parent.uid];
	this.parentWorker = Blueprint.Worker.get(this.parentData.worker)
	this.parentVar    = this.parentWorker.params.vars.output[this.params.parent.output];
}

Object.assign( Blueprint.classes.Line.prototype, EventDispatcher.prototype, {
	calculate: function(){
		this.line.start = this.point(this.output)
		this.line.end   = this.point(this.input)

		var min      = Math.min(100,Math.abs(this.line.end.y - this.line.start.y));
		var distance = Math.max(min,(this.line.end.x - this.line.start.x) / 2) * Blueprint.Viewport.scale;
		
		this.line.output = {
			x: this.line.start.x + distance,
			y: this.line.start.y
		}

		this.line.input = {
			x: this.line.end.x - distance,
			y: this.line.end.y
		}
	},
	point: function(node,varName){
		var offset = node.offset();

		return {
			x: offset.left + node.width() / 2 * Blueprint.Viewport.scale,
			y: offset.top + node.height() / 2 * Blueprint.Viewport.scale,
		}
	},
	draw: function(ctx){
		this.calculate();

		ctx.beginPath();

		ctx.moveTo(this.line.start.x, this.line.start.y);
		ctx.bezierCurveTo(this.line.output.x, this.line.output.y, this.line.input.x, this.line.input.y, this.line.end.x, this.line.end.y);

		ctx.lineWidth   = 2 * Blueprint.Viewport.scale;
		ctx.strokeStyle = this.parentVar.color || '#ddd';

		ctx.stroke();
	}
})
