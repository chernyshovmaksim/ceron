Blueprint.classes.Worker = function(){
	this.worker   = {};
	this.defaults = {}
}


Object.assign( Blueprint.classes.Worker.prototype, EventDispatcher.prototype, {
	add: function(name,data){
		data.params = $.extend({}, this.defaults, data.params);

		this.worker[name] = data;
	},
	get: function(name){
		return this.worker[name];
	},
	getAll: function(name){
		return this.worker;
	},
	assign: function(name,workers){
		var assign = function(data,workers){
	        Blueprint.classes.Operator.call(this,data,workers);
	    }
	    
	    if(this.worker[name]){
		    assign.prototype             = Object.assign(Object.create( Blueprint.classes.Operator.prototype ), this.worker[name].working);
		    assign.prototype.constructor = this.worker[name].working;
		}
		else{
			assign.prototype             = Object.assign(Object.create( Blueprint.classes.Operator.prototype ));
		    assign.prototype.constructor = 'Operator';
		}

	    return assign;
	},
	build: function(blueprintUid,nodes){
		var workers = [];

		var node,assign,working;

		for(var uid in nodes){
			node = nodes[uid];

			assign = this.assign(node.worker);
			
			working = new assign(node,workers);

			working.blueprintUid = blueprintUid;

			workers.push(working);
		}

		function countParents(work){
            work.callCounter++;
            
            for(var i = 0; i < work.parents.length; i++) countParents(work.parents[i]);
        }
        
        for(var i = workers.length; i--;) workers[i].init();
        for(var i = workers.length; i--;) countParents(workers[i]);
        
        workers.sort(function(i,ii){
            if (i.callCounter > ii.callCounter) return 1;
            else if (i.callCounter < ii.callCounter) return -1;
            else return 0;
        })
        
        for(var i = workers.length; i--;) workers[i].start();
        for(var i = workers.length; i--;) workers[i].build();

        this.dispatchEvent({type: 'build'})
	}
})


Blueprint.Worker = new Blueprint.classes.Worker();
