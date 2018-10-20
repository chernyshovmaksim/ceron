Blueprint.classes.Data = function(){
	this.data  = {};
	this.empty = {
		nodes: {}
	}
}

Object.assign( Blueprint.classes.Data.prototype, EventDispatcher.prototype, {
	set: function(data){
		this.data = data;

		Arrays.extend(this.data,this.empty);

		this.dispatchEvent({type: 'set',data: this.data})
	},
	get: function(){
		this.dispatchEvent({type: 'get',data: this.data})

		return this.data; 
	}
})