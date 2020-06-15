Blueprint.classes.Render = function(){
	this.nodes = [];
	this.lines = [];

	this.helpers  = [];
	this.sticking = [];

	this.can = document.getElementById("blueprint-canvas");
	this.ctx = this.can.getContext("2d");

	this.can.width  = window.innerWidth;
	this.can.height = window.innerHeight;

	$(window).resize(this.resize.bind(this));
}

Object.assign( Blueprint.classes.Render.prototype, EventDispatcher.prototype, {
	hide: function(){
		this.clearCanvas();
	},
	update: function(){
		this.clear();
		this.clearParents();

		var self = this;

		$('.var').removeClass('active');

		var parents,parentNode,selfNode,line;

		$.each(this.nodes,function(i,node){
			parents = node.data.parents;

			$.each(parents,function(a,parent){
				self.lines.push(new Blueprint.classes.Line({
					node: node,
					parent: parent
				}))
			})
		})

		this.draw();
	},
	clearParents: function(){
		var nodes = Blueprint.Data.get().nodes;

		$.each(nodes,function(uid,node){
			var parents = node.parents;

			for(var i = parents.length; i--;){
				var p = parents[i];

				if(!nodes[p.uid]) Arrays.remove(parents,p);
			}
		})
	},
	clear: function(){
		this.lines = [];
	},
	clearCanvas: function(){
		this.ctx.clearRect(0, 0, this.can.width, this.can.height);
	},
	resize: function(){
		this.can.width  = window.innerWidth;
		this.can.height = window.innerHeight;

		this.draw();
	},
	draw: function(){
		this.clearCanvas();

		for(var i = 0; i < this.lines.length; i++){
			this.lines[i].draw(this.ctx);
		}

		//this.drawCord();

		/* degug
		for (var i = 0; i < this.sticking.length; i++) {
			var st = this.sticking[i];
			var pt = st.node.data.position;
			var nd = {
				sticked: st,
				point: {
					x: st.pos,
					y: st.pos
				}
			}

			this.drawSticking(nd,'rgba(249, 10, 201, 0.1803921568627451)');
		}
		*/

		if(this.stick) this.drawSticking(this.stick);
	},
	drawCord: function(){
		this.ctx.beginPath();

		this.ctx.lineWidth   = 1;
		this.ctx.strokeStyle = '#4affff';
		this.ctx.fillStyle   = '#4affff';

		var cord = Blueprint.Utility.getDataPointToScreen({x:0,y:0});
			cord.x = Math.round(cord.x) - 2 + 0.5;
			cord.y = Math.round(cord.y) - 2 + 0.5;

		this.ctx.moveTo(0, cord.y);
		this.ctx.lineTo(this.can.width, cord.y);

		this.ctx.moveTo(cord.x, 0);
		this.ctx.lineTo(cord.x, this.can.height);

		this.ctx.stroke();

		this.ctx.font = "12px Arial";
		this.ctx.fillText("0", cord.x - 12, cord.y - 6);
	},
	drawSticking: function(stick, color){
		this.ctx.beginPath();

		var point = Blueprint.Utility.getDataPointToScreen(stick.point);
		var posit = 0;

		if(stick.sticked.dir == 'x'){
			posit = Math.round(point.y) + 0.5;

			this.ctx.moveTo(0, posit);
			this.ctx.lineTo(this.can.width, posit);
		}
		else{
			posit = Math.round(point.x) + 0.5;

			this.ctx.moveTo(posit, 0);
			this.ctx.lineTo(posit, this.can.height);
		}

		this.ctx.lineWidth   = 1;
		this.ctx.strokeStyle = color || '#ff4aff';

		this.ctx.stroke();
	},
	searchNode: function(uid){
		for(var i = 0; i < this.nodes.length; i++){
			if(this.nodes[i].uid == uid) return this.nodes[i];
		}
	},
	newNode: function(option){
		var uid = Blueprint.Utility.uid();

		var defaults = {
			position: {x: 0, y: 0},
			parents: [],
			userData: {},
			varsData: {
				input: {},
				output: {}
			}
		}

		//option.position.x = option.position.x / Blueprint.Viewport.scale - Blueprint.Viewport.position.x;
		//option.position.y = option.position.y / Blueprint.Viewport.scale - Blueprint.Viewport.position.y;
        
        var data = $.extend(defaults,option,{
            uid: uid,
        });

        var worker = Blueprint.Worker.get(data.worker);

        if(worker.params.userData) Arrays.extend(data.userData,Arrays.clone(worker.params.userData))
        
        Blueprint.Data.get().nodes[uid] = data;

        var node = this.addNode(uid);

        this.dispatchEvent({type: 'newNode', node: node})

        this.stick = false;

        this.update();
	},
	newHelper: function(option){
		var uid = Blueprint.Utility.uid();

		var defaults = {
			position: {x: 0, y: 0},
			title: 'Helper'
		}

		option.position.x = option.position.x / Blueprint.Viewport.scale - Blueprint.Viewport.position.x;
		option.position.y = option.position.y / Blueprint.Viewport.scale - Blueprint.Viewport.position.y;
        
        var data = $.extend(defaults,option,{
            uid: uid,
        });

        Blueprint.Data.get().helpers[uid] = data;

        var helper = this.addHelper(uid);

        this.dispatchEvent({type: 'newHelper', helper: helper})

        this.stick = false;
        
        this.update();
	},
	addNode: function(uid){
		var node = new Blueprint.classes.Node(uid);

        this.nodes.push(node)

        this.dispatchEvent({type: 'addNode', node: node})

        return node;
	},
	addHelper: function(uid){
		var helper = new Blueprint.classes.Helper(uid);

        this.helpers.push(helper)

        this.dispatchEvent({type: 'addHelper', helper: helper})

        return helper;
	},
	removeNode: function(node){
		delete Blueprint.Data.get().nodes[node.uid];

		Arrays.remove(this.nodes,node);

		this.update()

		this.dispatchEvent({type: 'removeNode', node: node})
	},
	removeHelper: function(helper){
		delete Blueprint.Data.get().helpers[helper.uid];

		Arrays.remove(this.helpers,helper);

		this.update()

		this.dispatchEvent({type: 'removeHelper', helper: helper})
	},
	close: function(){
		$.each(this.nodes,function(i,node){
			node.fire('close');
		})
	}
})