Blueprint.classes.Image = function(){
	this.canvas = document.createElement('canvas');
	this.ctx    = this.canvas.getContext('2d');

	this.loaded = {};
	this.wait   = {};
	this.filter = {
		color: {},
		saturation: {}
	}
}


Object.assign( Blueprint.classes.Image.prototype, EventDispatcher.prototype, {
	load: function(src,callback){
		var self = this;

		this.wait[src] = [];

		var img = new Image();
			img.src = src;

		img.onload = function(){
			for(var i = 0; i < self.wait[src].length; i++){
				self.wait[src][i](img)
			}

			delete self.wait[src];

			self.loaded[src] = img;

			callback(img);
		};
	},
	get: function(src,callback){
		if(this.loaded[src]) callback(this.loaded[src])
		else if(this.wait[src]) this.wait[src].push(callback)
		else this.load(src,callback)
	},
	color: function(src,color,callback){
		var self = this;

		if(this.filter.color[src] && this.filter.color[src][color]) callback(this.filter.color[src][color]);
		else{
			this.get(src,function(img){
				self.canvas.width  = img.width;
	  			self.canvas.height = img.height;

	  			self.ctx.drawImage(img,0,0);

				self.ctx.globalCompositeOperation = "source-in";
				self.ctx.fillStyle = color;
				self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.height);

				if(!self.filter.color[src]) self.filter.color[src] = {};

				self.filter.color[src][color] = self.canvas.toDataURL()
				
				callback(self.canvas.toDataURL());
			})
		}
	},
	saturation: function(src,color,alpha,callback){
		var self = this;

		var colorHash = Blueprint.Utility.hashCode(color + alpha);

		if(this.filter.saturation[src] && this.filter.saturation[src][colorHash]) callback(this.filter.saturation[src][colorHash]);
		else{
			this.get(src,function(img){
				self.canvas.width  = img.width;
	  			self.canvas.height = img.height;

	  			self.ctx.globalAlpha = alpha;

	            self.ctx.drawImage(img,0,0);

	            self.ctx.globalAlpha = 1.0;

	  			//self.ctx.drawImage(img,0,0);

				self.ctx.globalCompositeOperation = "lighter";
	            self.ctx.globalAlpha = alpha;
	            self.ctx.fillStyle=color;
	            self.ctx.fillRect(0,0,self.canvas.width,self.canvas.height);

	            self.ctx.globalCompositeOperation = "destination-in";
                self.ctx.drawImage(img, 0, 0);

                self.ctx.globalCompositeOperation = "source-over";

				if(!self.filter.saturation[src]) self.filter.saturation[src] = {};

				self.filter.saturation[src][colorHash] = self.canvas.toDataURL()
				
				callback(self.canvas.toDataURL());
			})
		}
	},
})