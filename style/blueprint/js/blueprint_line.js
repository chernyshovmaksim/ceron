Blueprint.classes.Line = function(params){
	try{
		this.params  = params;
		this.line    = {};
		this.visible = true;

		this.parent = $('#'+this.params.parent.uid),
		this.self   = $('#'+this.params.node.data.uid);

		this.output = $('.var-output-'+this.params.parent.output,this.parent);
		this.input  = $('.var-input-'+this.params.parent.input,this.self);

		this.output.addClass('active')
		this.input.addClass('active')

		this.parentData   = Blueprint.Data.get().nodes[this.params.parent.uid];
		this.parentWorker = Blueprint.Worker.get(this.parentData.worker)
		this.parentVar    = this.parentWorker.params.vars.output[this.params.parent.output];

		this.reverse        = this.params.node.params.reverse;
		this.reverse_parent = this.parent.hasClass('reverse');

		this.random_color = this.parentVar.color_random ? this.output.data('random-color') : false;
	}
	catch(e){
		this.error = true;
	}
}

Object.assign( Blueprint.classes.Line.prototype, EventDispatcher.prototype, {
	/**
	 * Найти точки входа и выхода
	 */
	dots: function(){
		this.line.start = this.point(this.output);
		this.line.end   = this.point(this.input);
	},

	/**
	 * Видна ли линия в вьюпорте
	 */
	intersect: function(){
		var box = {
			left: 0,
			top: 0,
			width: Blueprint.Render.can.width,
			height: Blueprint.Render.can.height
		};

		var a = Blueprint.Utility.intersectPoint(box,this.line.start);
		var b = Blueprint.Utility.intersectPoint(box,this.line.end);

		this.visible = a || b;
	},

	/**
	 * Расчитать изгиб линии
	 */
	bezier: function(){
		var min      = Math.min(100,Math.abs(this.line.end.y - this.line.start.y));
		var distance = Math.max(min,(this.line.end.x - this.line.start.x) / 2) * Blueprint.Viewport.scale;
		
		this.line.output = {
			x: this.reverse_parent ? this.line.start.x - distance : this.line.start.x + distance,
			y: this.line.start.y
		}

		this.line.input = {
			x: this.reverse ? this.line.end.x + distance : this.line.end.x - distance,
			y: this.line.end.y
		}
	},

	/**
	 * Найти точку у нода
	 */
	point: function(node){
		var offset = node.offset();

		return {
			x: offset.left + 7 * Blueprint.Viewport.scale,
			y: offset.top + 5 * Blueprint.Viewport.scale,
		}
	},

	/**
	 * Рисуем линию
	 */
	draw: function(ctx){
		//если есть ошибка, 
		//то не рисуем линию
		if(this.error) return;

		try{
			//находим точки
			this.dots();

			//проверяем видимость
			this.intersect();

			//если не видно, то накой рисовать?
			//отпимизация чуваки!
			if(!this.visible) return;

			//изгиб
			this.bezier();

			//ну а дальше рисуем
			
			ctx.beginPath();

			ctx.moveTo(
				this.line.start.x, 
				this.line.start.y
			);
			
			ctx.bezierCurveTo(
				this.line.output.x, 
				this.line.output.y, 
				this.line.input.x, 
				this.line.input.y, 
				this.line.end.x, 
				this.line.end.y
			);

			ctx.lineWidth   = 2 * Blueprint.Viewport.scale;
			ctx.strokeStyle = this.random_color || this.parentVar.color || '#ddd';

			ctx.stroke();
		}
		catch(e){
			
		}
	}
})
