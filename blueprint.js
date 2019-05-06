var Blueprint = {
	classes: {},
	cache: {},
	seed: 0
};

Blueprint.Initialization = {
	viewport: function(){
		Blueprint.Render    = new Blueprint.classes.Render();
		Blueprint.Data      = new Blueprint.classes.Data();
		Blueprint.Drag      = new Blueprint.classes.Drag();
		Blueprint.Image     = new Blueprint.classes.Image();
		Blueprint.Shortcut  = new Blueprint.classes.Shortcut();
		Blueprint.Viewport  = new Blueprint.classes.Viewport();
		Blueprint.Selection = new Blueprint.classes.Selection();

		var selectNode, drag, has_focus, presed, dragCopy;
		var cursor = {x: 0, y: 0};
		var buffer = [];

		//drag and drop

		//начали тянуть
		Blueprint.Drag.addEventListener('start',function(event){
			selectNode = false;

			Blueprint.Render.sticking = Blueprint.Utility.getSticking();

			//если зажата одна из клавиш
			//то показывме мыделение
			if(presed.shiftKey || presed.altKey || presed.ctrlKey){
				this.enable = false;

				Blueprint.Selection.enable = true;
			} 

			Blueprint.Callback.Menu.hide();

			drag = false;
		});

		//в самом конце нужно отрисовать линии
		Blueprint.Drag.addEventListener('drag-after',function(event){

			//selectNode хз, уже не помню, 
			//но если он есть то линия не рисуется
			//так как Blueprint.Render.draw стирает ее
			if(!selectNode) Blueprint.Render.draw()
		})

		//таскают
		Blueprint.Drag.addEventListener('drag',function(event){
			
			//как выше описал, стирает линию
			//поэтому если не тянут то рисуем тута
			if(selectNode) Blueprint.Render.draw()

			//отмеряем дистанцию, если было движение
			//то помечаем это и не показываем меню
			var a = event.drag.start,
				b = event.drag.move;

			var d = Math.sqrt(Math.pow(a.x-b.x,2) + Math.pow(a.y-b.y,2));

			if(d > 10) drag = true;

			//если зажали клавишу Alt и начали тянуть нод
			if(dragCopy){
				//отменяем выделение
				Blueprint.Selection.enable = false;
				//возобновляем драг
				Blueprint.Drag.enable      = true;
				//прячим выделение
				Blueprint.Selection.stop();

				var mouse = {},offset;

				var nodes = [], uids = [];

				var select = Blueprint.Selection.selection;

				//и так, для начала у всех нодов удалим драг
				for(var i = 0; i < Blueprint.Render.nodes.length; i++){
					Blueprint.Render.nodes[i].dragRemove();
				}

				//затем снимим выделение и скопируем дату
				for(var i = 0; i < select.length; i++){
					var node = select[i];

					node.node.removeClass('active')

					nodes.push(JSON.parse(JSON.stringify(node.data)));
				}

				//делаем клоны
				for(var i = 0; i < nodes.length; i++){
					var node = nodes[i],
						uid  = node.uid;

					//новый uid
					node.uid = Blueprint.Utility.uid();

					//запоминаем какие добавили
					uids.push(node.uid);

					//смотрим родителей и меняе на новый uid
					for(var a = 0; a < nodes.length; a++){
						var parents = nodes[a].parents;

						for(var b = 0; b < parents.length; b++){
							if(parents[b].uid == uid){
								parents[b].uid = node.uid;
							} 
						}
					}
					
					//пишим в бд
					Blueprint.Data.get().nodes[node.uid] = node;

					//создаем нод
					Blueprint.Render.addNode(node.uid).create(true).fire('init');

					Blueprint.Callback.Program.fireChangeEvent({type: 'dragCopy'});
				}

				//чистим выделение
				Blueprint.Selection.clear();

				//делаем выделение новых нодов
				for(var i = 0; i < uids.length; i++){
					var uid = uids[i],
						node = Blueprint.Render.searchNode(uid);

					if(node){
						node.node.addClass('active');

						Blueprint.Selection.add(node);

						Blueprint.Callback.Program.nodeOption({
							target: node,
							worker: node.data.worker,
							uid: node.uid,
							data: node.data
						})

						node.dragStart(true);
					}
				}

				
				Blueprint.Drag.setSticking(Blueprint.Utility.getStickingNodes(Blueprint.Selection.selection, event.drag.start));

				//обновляем рендер
				Blueprint.Render.update();

				//помечам что больше копировать не нужно
				dragCopy = false;
			}

			//обновляем область если есть выделение
			if(Blueprint.Selection.enable) Blueprint.Selection.drag(event)
		})

		//перестали таскать
		Blueprint.Drag.addEventListener('stop',function(event){
			if(selectNode){
				cursor.x = event.drag.move.x;
				cursor.y = event.drag.move.y;

				//если из нода протянули линию то показать меню
				Blueprint.Callback.Menu.show(cursor)
			} 
			else{
				Blueprint.Render.draw();
			}

			if(Blueprint.Selection.enable && presed.ctrlKey){
				if(Blueprint.Selection.box.width > 200 && Blueprint.Selection.box.height > 100){
					Blueprint.Render.newHelper({
						position: {
							x: Blueprint.Selection.box.left,
							y: Blueprint.Selection.box.top,
						},
						size: {
							width: Blueprint.Selection.viewport.width,
							height: Blueprint.Selection.viewport.height
						}
					});
				}
			}

			this.enable = true;

			//если было выделение, то прячим
			if(Blueprint.Selection.enable) Blueprint.Selection.stop();

			Blueprint.Selection.enable = false;
		})

		//обновляем рендер если был зум
		Blueprint.Viewport.addEventListener('zoom',Blueprint.Render.draw.bind(Blueprint.Render))


		//если жмекнули сохранить то говорим что нуно сохранить
		Blueprint.Shortcut.add('Ctrl+S',function(){
			parent.Shortcut.Fire('Ctrl+S');
		})

		Blueprint.Shortcut.add('Ctrl+C',function(){
			buffer = [];

			buffer = buffer.concat(Blueprint.Selection.selection);
		})

		Blueprint.Shortcut.add('Ctrl+V',function(){
			var mouse = {},offset;

			//смотрим где курсор
			mouse.x = presed.clientX / Blueprint.Viewport.scale - Blueprint.Viewport.position.x;
			mouse.y = presed.clientY / Blueprint.Viewport.scale - Blueprint.Viewport.position.y;

			var nodes = [], uids = [];

			//из буфера копируем данные нодов
			for(var i = 0; i < buffer.length; i++){
				nodes.push(JSON.parse(JSON.stringify(buffer[i].data)));
			}

			//начинаем копировать
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i],
					uid  = node.uid;

				//создаем новый uid
				node.uid = Blueprint.Utility.uid();

				//запоминаем новый uid
				uids.push(node.uid);

				//у родителей заменяем uid
				for(var a = 0; a < nodes.length; a++){
					var parents = nodes[a].parents;

					for(var b = 0; b < parents.length; b++){
						if(parents[b].uid == uid){
							parents[b].uid = node.uid;
						} 
					}
				}
				
				//надо узнать первый отступ
				if(!offset){
					offset = {
						x: mouse.x - node.position.x,
						y: mouse.y - node.position.y
					}
				}

				//к позиции добовляем отступ
				node.position = {
					x: node.position.x + offset.x,
					y: node.position.y + offset.y
				}

				//записываем в бд
				Blueprint.Data.get().nodes[node.uid] = node;

				//создаем нод
				Blueprint.Render.addNode(node.uid).create().fire('init');

				Blueprint.Callback.Program.fireChangeEvent({type: 'paste'});
				
			}

			//чистив выделение
			Blueprint.Selection.clear();

			//делаем активными то что создали
			for(var i = 0; i < uids.length; i++){
				var uid = uids[i],
					node = Blueprint.Render.searchNode(uid);

				if(node){
					node.node.addClass('active');

					Blueprint.Selection.add(node);
				}
			}

			//обновляем
			Blueprint.Render.update();
		})


		//выделение области
		Blueprint.Selection.addEventListener('drag',function(event){
			var v = event.viewport;
			var c = presed.altKey && presed.shiftKey;

			//если зажата клава шифт и альт то чистим все
			if(c) Blueprint.Selection.clear()

			//идем по списку
			$.each(Blueprint.Render.nodes,function(i,node){
				var p = node.data.position;

				//если попали в область
				if(p.x > v.left && p.x < v.left + v.width && p.y > v.top && p.y < v.top + v.height){
					if(c){
						node.node.addClass('active')

						Blueprint.Selection.add(node)
					}
					else if(presed.altKey){
						node.node.removeClass('active')

						Blueprint.Selection.remove(node)
					}
					else{
						node.node.addClass('active')

						Blueprint.Selection.add(node)
					}
				}
				else if(c){
					node.node.removeClass('active')

					Blueprint.Selection.remove(node)
				}
			})
		})

		//эвент на добовление нового нода
		Blueprint.Render.addEventListener('addNode',function(e){
			var node = e.node;

			//вешаем эвенты на сам нод

			//эвент удаления
			node.addEventListener('remove',function(){
				Blueprint.Render.removeNode(node);

				Blueprint.Selection.remove(node);

				Blueprint.Callback.Program.dispatchEvent({type: 'nodeRemove', node: node});
			})

			//начали тянуть линию
			node.addEventListener('output',function(node){
				//там выше drag стирает значение
				//поэтому таймер поставил
				setTimeout(function(){
					selectNode = node.target;
				},0)
			})

			node.addEventListener('setValue',function(){
				Blueprint.Render.draw();

				Blueprint.Callback.Program.fireChangeEvent({type: 'setValue'});
			})

			node.addEventListener('mouseenter',function(event){
				Blueprint.Callback.Program.dispatchEvent({type: 'nodeMouseenter', node: node, nodeEvent: event});
			})

			node.addEventListener('mouseleave',function(event){
				Blueprint.Callback.Program.dispatchEvent({type: 'nodeMouseleave', node: node, nodeEvent: event});
			})

			//протянули линию на input переменную
			node.addEventListener('input',function(event){
				if(selectNode !== this && selectNode && event.entrance !== selectNode.selectEntrance){
					var selectVar = selectNode.selectVar;

					if(event.entrance !== 'input'){
						selectNode.data.parents.push({
							uid: this.data.uid,
							output: event.name,
							input: selectVar
						})
					}
					else{
						this.data.parents.push({
							uid: selectNode.data.uid,
							output: selectVar,
							input: event.name
						})
					}

					Blueprint.Callback.Program.fireChangeEvent({type: 'input'});
					
					Blueprint.Render.update();
				}

				selectNode = false;
			})

			//если удалили инпуты
			node.addEventListener('inputRemove',function(event){
				Blueprint.Callback.Program.fireChangeEvent({type: 'inputRemove'});

				Blueprint.Render.update();
			})

			//если удалили выходы
			node.addEventListener('outputRemove',function(event){
				Blueprint.Callback.Program.fireChangeEvent({type: 'outputRemove'});

				Blueprint.Render.update();
			})

			//если нод двигают
			node.addEventListener('drag',function(event){
				var selection = Blueprint.Selection.selection;

				//поздно каллбак приходит
				//на ум пришло только это
				var real_start = {
					x: event.event.pageX,
					y: event.event.pageY
				};

				Blueprint.Drag.setSticking(Blueprint.Utility.getStickingNodes(selection, real_start));

				//есть более одного выделения
				//а значит ташим их все
				if(selection.length > 1){
					this.group_drag = true;
					
					for(var i = 0; i < selection.length; i++){
						var node = selection[i];

						//естественно кроме себя так как уже добавлен эвент
						if(node !== event.target) node.dragStart(true);
					}
				}
			})

			//если нод выбрали
			node.addEventListener('select',function(event){
				var selection = Blueprint.Selection.selection;

				//добовляем к обшиму выделению
				if(presed.shiftKey){
					Blueprint.Selection.add(event.target);

					event.target.node.addClass('active');
				}
				//снимаем выделение из обших
				else if(presed.altKey){
					Blueprint.Selection.remove(event.target);

					event.target.node.removeClass('active');
				}
				//снимаем все выделение и выделяем только его
				else if(!drag){
					Blueprint.Drag.clear();

					Blueprint.Selection.select(event.target)

					$('.blueprint-node').removeClass('active')

					event.target.node.addClass('active');

					Blueprint.Callback.Program.nodeOption(event)

					//надо обновить переменную
					selection = Blueprint.Selection.selection
				}
			});

			node.addEventListener('showOptionAgain',function(event){
				Blueprint.Callback.Program.nodeOption(event)
			})

			//опаньки, видать нужно к нему подключится
			//надо потом похимичить
			if(selectNode && selectNode.selectEntrance == 'output'){
				var first;

				for(var i in node.params.vars.input){
					if(!first){
						first = i; break;
					}
				}

				if(first){
					node.data.parents.push({
						uid: selectNode.data.uid,
						output: selectNode.selectVar,
						input: first
					})
				}

				Blueprint.Render.update();
			}

			selectNode = false;
		})

		//событие новый нод
		Blueprint.Render.addEventListener('newNode',function(e){
			//если новый то запускаем эвент создать
			e.node.create();
			e.node.fire('init');

			Blueprint.Callback.Program.fireChangeEvent({type: 'newNode'});
		})

		//событие удаляем нод
		Blueprint.Render.addEventListener('removeNode',function(e){
			Blueprint.Callback.Program.fireChangeEvent({type: 'removeNode'});
		})

		//эвент на добовление нового хелпера
		Blueprint.Render.addEventListener('addHelper',function(e){
			var helper = e.helper;

			//вешаем эвенты на сам нод

			//эвент удаления
			helper.addEventListener('remove',function(){
				Blueprint.Render.removeHelper(helper);

				Blueprint.Callback.Program.dispatchEvent({type: 'helperRemove', helper: helper});
			})

			//если нод двигают
			helper.addEventListener('drag',function(event){
				var h_size = helper.data.size;
				var h_posi = helper.data.position;

				this.group_drag = true;

				for (var i = 0; i < Blueprint.Render.nodes.length; i++) {
					var n_node = Blueprint.Render.nodes[i],
						n_posi = n_node.data.position;

					if(n_posi.x > h_posi.x && n_posi.x < h_posi.x + h_size.width  &&  n_posi.y > h_posi.y && n_posi.y < h_posi.y + h_size.height){
						n_node.dragStart(true);
					}
				}
			})

		})

		//событие новый хелпер
		Blueprint.Render.addEventListener('newHelper',function(e){
			//если новый то запускаем эвент создать
			e.helper.create();
		})
		
		//если в меню был выбран нод то создаем его
		Blueprint.Callback.Menu.addEventListener('select',function(event){
			if(has_focus){

				//получаем реальный курсор
				var cur_set  = Arrays.clone(event.cursor || cursor);
				//конвертим в вьюпорт
				var cru_rel  = Blueprint.Utility.getViewportPoint(cur_set);
				//находим где бы разместить красиво
				var cur_ofs  = Blueprint.Utility.getStickingVertical(cru_rel);

				//если есть такой, то смешаем позицию
				if(cur_ofs !== null) cru_rel.y = cur_ofs;

				//дата
				var node = {
					worker: event.name,
					position: cru_rel
				}

				//если есть дополнительные данные
				Arrays.extend(node, event.data);

				//создаем нод
				Blueprint.Render.newNode(node);
			}
		})

		Blueprint.Callback.Program.addEventListener('blueprintChangeParams',function(event){
			var nodes = Blueprint.Render.nodes;
			
			for(var i = 0; i < nodes.length; i++){
				var node = nodes[i];

				if(node.data.userData.blueprintUid == event.blueprint.uid){
					node.fire('blueprintChangeParams',event.node);
				}
			}
		})

		//если кто запустит этот эвент, то делаем рендер
		Blueprint.Callback.Program.addEventListener('update', function(){
			//задержка чтобы другие обновились и только потом делать draw
			setTimeout(function(){
				Blueprint.Render.draw();
			},0)
		})

		//ну понятно да?
		window.onblur = function(){  
		    has_focus = false;
		}  
		window.onfocus = function(){  
		    has_focus = true;
		}

		//активация snaped
		$('.blueprint-snap').on('click',function(){
			$(this).toggleClass('active')

			Blueprint.snaped = false;

			if($(this).hasClass('active')){
				Blueprint.snaped = true;
			}
		}).click();

		//отслеживаем зажатые клавишы
		$(document).on('mousedown',function(e){
			presed = e;

			dragCopy = $(e.target).closest($('.blueprint-node')).length && presed.altKey;
		}).on('mousemove',function(e){
			presed = e;
		}).on('mouseup',function(e){
			presed = e;
		}).on('keydown',function(e){
			//если нажали Del
			if(e.keyCode == 46){
				var selection = Blueprint.Selection.selection;

				for(var i = selection.length; i--;) selection[i].remove()
			}
		})

		//снимаем выделение нодов
		$(document).on('click',function(event){
			if(!$(event.target).closest($('.blueprint-node')).length) {
				if(!drag){
					Blueprint.Selection.clear();

					$('.blueprint-node').removeClass('active')
				}
			}
		})

		//контекстное меню
		$(document).contextmenu(function(e){
			e.preventDefault();

			if(!drag){
				cursor = {
					x: e.pageX,
					y: e.pageY
				};

				if(!$(e.target).closest($('.blueprint-node')).length) Blueprint.Callback.Menu.show(cursor);
			}
		})
	},

	//после установки данных и классов, создаем ноды
	nodes: function(){
		var nodes = Blueprint.Data.get().nodes;

		$.each(nodes,function(uid,params){
			if(Blueprint.Worker.get(params.worker)) Blueprint.Render.addNode(uid).fire('init');
		})

		Blueprint.Render.update();

		Blueprint.Render.sticking = Blueprint.Utility.getSticking();
	},

	//после установки данных и классов, создаем ноды
	helpers: function(){
		var helpers = Blueprint.Data.get().helpers;

		$.each(helpers,function(uid,params){
			Blueprint.Render.addHelper(uid)
		})

		Blueprint.Render.update();
	},

	//наша программа
	program: function(){
		Blueprint.Menu    = new Blueprint.classes.Menu();
		Blueprint.Program = new Blueprint.classes.Program();

		var bluLastActive = Data.blueprint.active,
			bluActive;
		

		//если было открыто blueprint окно
		Blueprint.Program.addEventListener('blueprintInit',function(program){
			var blueprint = program.blueprint;

			blueprint.addEventListener('close',function(){
				Blueprint.Program.blueprintClose(blueprint);
			})

			blueprint.addEventListener('active',function(){
				Blueprint.Program.blueprintActive(blueprint)
			})

			blueprint.addEventListener('remove',function(){
				Blueprint.Program.blueprintClose(blueprint);

				$('#blueprint-settings').empty();
			})

			if(bluLastActive == blueprint.uid) bluActive = blueprint;

			Blueprint.Program.blueprintActive(blueprint);
		})

		Blueprint.Program.addEventListener('blueprintChangeParams',function(program){
			var uid  = program.blueprint.uid,
				name = program.node.name;

			$('#blueprint-tabs li[uid="'+uid+'"] span').text(name)
			$('#blueprint-menu li[uid="'+uid+'"] span').text(name)
			$('#blueprint-list li[uid="'+uid+'"] span a').text(name)
		})

		Blueprint.Program.addEventListener('nodeRemove',function(){
			$('#blueprint-node-option').empty();
		})

		//открываем окна
		$.each(Data.blueprint.opened,function(i,uid){
			if(Blueprint.Program.data[uid]) Blueprint.Program.blueprintInit(Blueprint.Program.data[uid]);
		})

		if(bluActive) bluActive.active();
	}
}

Blueprint.classes.Blueprint = function(data){
	this.uid  = data.uid;
	this.data = data;
	
	this.tabs       = $('#blueprint-tabs');
	this.blueprints = $('#blueprint-blueprints');

	this.initTab();
	this.initWindow();
}

Object.assign( Blueprint.classes.Blueprint.prototype, EventDispatcher.prototype, {
	initTab: function(){
		var self = this;

	 	this.tab = $('<li class="active '+(this.uid == 'main' ? 'main' : '')+'" uid="'+this.uid+'"><span>'+this.data.name+'</span>'+(this.uid == 'main' ? '' : '<a></a>')+'</li>'); 

		this.tab.on('click',function(e){
			if($( e.target ).closest($('a',self.tab)).length){
				self.close();
			}
			else{
				self.active();
			}
			
		}).click()

		this.tabs.append(this.tab)
	},

	initViewport: function(){
		this.contentBlueprint.Callback = Blueprint; //втуливаем ссылку тудой
		this.contentBlueprint.Initialization.viewport();
		this.contentBlueprint.Data.set(Blueprint.Program.nodeData(this.uid))
		this.contentBlueprint.Initialization.nodes();
		this.contentBlueprint.Initialization.helpers();
	},

	initWindow: function(){
		var self = this;

		$('iframe',this.blueprints).removeClass('active');

		this.blueprint = $('<iframe src="blueprint.html" class="active" id="'+this.uid+'"></iframe>')

		this.blueprint.on('load',function(){
			self.contents         = self.blueprint.contents()

			self.contentBlueprint = document.getElementById(self.uid).contentWindow.Blueprint; //не знаю, зато млин так работает, маджик!

			self.initViewport();
		})

		this.blueprints.append(this.blueprint)
	},

	close: function(){
		this.tab.remove();
		this.blueprint.remove();

		this.dispatchEvent({type: 'close'})
	},

	remove: function(){
		this.tab.remove();
		this.blueprint.remove();

		this.dispatchEvent({type: 'remove'})
	},

	active: function(){
		$('li',this.tabs).removeClass('active')
		$('iframe',this.blueprints).removeClass('active')

		$(this.tab).addClass('active')
		$(this.blueprint).addClass('active')

		this.dispatchEvent({type: 'active'})
	},

	change: function(){
		$('#blueprint-tabs li[uid="'+this.uid+'"] span').text(this.data.name)

		this.dispatchEvent({type: 'change'})
	}	
})
Blueprint.Build = function(){
	
}

Blueprint.classes.Data = function(){
	this.data  = {};
	this.empty = {
		nodes: {},
		helpers: {}
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
Blueprint.classes.Drag = function(){
	this.callbacks = [];
	this.enable    = true;
	this.sticking  = false;

	this.drag = {
		active: false,
		start: {
			x: 0,
			y: 0
		},
		move: {
			x: 0,
			y: 0
		},
		dif: {
			x: 0,
			y: 0
		}
	} 

	var self = this;

	var calcSticking = (e)=>{
		var point = {
			x: e.pageX,
			y: e.pageY
		}

		if(this.sticking) point = Blueprint.Utility.checkSticking(this.sticking, point).point;

		return point;
	}


	$(document).mouseup((e)=>{
		this.stop(e);
	}).mousedown((e)=> {
		var stic = calcSticking(e);

    	this.drag.start.x = stic.x;
    	this.drag.start.y = stic.y;

    	this.drag.move.x = stic.x;
    	this.drag.move.y = stic.y;

		this.drag.active = true;

		this.dispatchEvent({type: 'start', drag: this.drag})
    }).mousemove((e)=> {
        var ww = window.innerWidth,
            wh = window.innerHeight;

        var stic = calcSticking(e);

        if(this.drag.active && (stic.y > wh-10 || stic.y < 10 || stic.x > ww-10 || stic.x < 10)) this.stop(e)

        this.drag.dif = {
    		x: this.drag.move.x - stic.x,
    		y: this.drag.move.y - stic.y,
    	}

    	this.drag.move.x = stic.x;
    	this.drag.move.y = stic.y;

        if(this.drag.active == false || !this.callbacks.length) return
        else{
        	this.dispatchEvent({type: 'drag', drag: this.drag})

        	if(this.enable){
	            for(var i = 0; i < this.callbacks.length; i++){
	            	this.callbacks[i](this.drag.dif, this.drag.start, this.drag.move)
	            }
	        }

	        this.dispatchEvent({type: 'drag-after', drag: this.drag})
        }
    });
}

Object.assign( Blueprint.classes.Drag.prototype, EventDispatcher.prototype, {
	add: function(call){
		this.callbacks.push(call)
	},
	get: function(){
		return this.drag;
	},
	has: function(call){
		if(this.callbacks.indexOf(call) >= 0) return true;
	},
	remove: function(call){
		Arrays.remove(this.callbacks,call)
	},
	clear: function(){
		this.callbacks = [];
	},
	setSticking: function(sticking){
		this.sticking = sticking;
	},
	stop: function(e){
		this.drag.active = false;

		this.callbacks = [];
		this.sticking  = [];

		this.dispatchEvent({type: 'stop', drag: this.drag})
	}
})
Blueprint.classes.Helper = function(uid){
	this.uid    = uid;
	this.data   = Blueprint.Data.get().helpers[uid];
	
	this.position = {
		x: 0,
		y: 0
	}

	this.size = {
		width: 0,
		height: 0
	}

	this.init();
}
Object.assign( Blueprint.classes.Helper.prototype, EventDispatcher.prototype, {
	create: function(){
		this.data.position = Blueprint.Utility.snapPosition(this.data.position);

		this.setPosition();
	},
	init: function(){
		this.node = $([
			'<div class="blueprint-helper" id="'+this.data.uid+'">',
				'<div class="blueprint-helper-inner">',
	                '<div class="blueprint-helper-top">',
	                    '<div class="blueprint-helper-title">'+this.data.title+'</div>',
	                    '<div class="blueprint-helper-close"></div>',
	                '</div>',
	                '<div class="blueprint-helper-resize"></div>',
                '</div>',
            '</div>',
		].join(''));

		this.addEvents();

		this.setPosition();
		this.setSize();

		$('.blueprint-container').append(this.node)
	},
	addEvents: function(){
		var self = this;
		
		this.node.on('mousedown',function(event){
			if($(event.target).closest($('.blueprint-helper-resize',self.node)).length) {
				self.resizeStart();

				self.dispatchEvent({type: 'resize'});
			}
			else{
				self.dragStart();

				self.dispatchEvent({type: 'drag',event: event});
			}
		});

		this.node.on('click',function(event){
			self.dispatchEvent({type: 'select',worker: self.data.worker, uid: self.uid, data: self.data});
		});

		$('.blueprint-helper-title',this.node).dblclick(function(){
			var new_title = prompt('Описание хелпера', self.data.title);

			if(new_title){
				self.data.title = new_title;

				$(this).text(new_title);
			}
		})

		$('.blueprint-helper-close',this.node).on('click',function(){
			self.dispatchEvent({type: 'remove'});

			self.remove();
		})

		this.node.mouseenter(function(e){
        	self.dispatchEvent({
        		type: 'mouseenter',
        		offset: self.node.offset(),
        		width:  self.node.outerWidth(),
        		height: self.node.outerHeight()
        	});
        }).mouseleave(function(){
        	self.dispatchEvent({type: 'mouseleave'});
        })
	},
	remove: function(){
		this.node.remove();
	},
	dragStart: function(group_drag){
		this.group_drag = group_drag;

		this.position.x = this.data.position.x;
		this.position.y = this.data.position.y;

		this.dragCall = this.drag.bind(this);

		Blueprint.Drag.add(this.dragCall);
	},
	dragRemove: function(){
		Blueprint.Drag.remove(this.dragCall);
	},
	drag: function(dif, move, start){
		var snap = {};

		snap.x = this.position.x - (move.x - start.x) / Blueprint.Viewport.scale;
		snap.y = this.position.y - (move.y - start.y) / Blueprint.Viewport.scale;

		if(this.group_drag){
			this.data.position = snap;
		}
		else{
			this.data.position = Blueprint.Utility.snapPosition(snap)
		}

		this.setPosition();
	},
	resizeStart: function(){
		this.size.width = this.data.size.width;
		this.size.height = this.data.size.height;

		this.resizeCall = this.resize.bind(this);

		Blueprint.Drag.add(this.resizeCall);
	},
	resize: function(dif){
		this.size.width -= dif.x / Blueprint.Viewport.scale;
		this.size.height -= dif.y / Blueprint.Viewport.scale;

		var snap = {
			x: this.size.width,
			y: this.size.height
		}

		snap = Blueprint.Utility.snapPosition(snap);

		this.data.size.width  = snap.x;
		this.data.size.height = snap.y;

		this.setSize();
	},
	resizeRemove: function(){
		Blueprint.Drag.remove(this.resizeCall);
	},
	setPosition: function(){
		this.node.css({
			left: this.data.position.x + 'px',
			top: this.data.position.y + 'px'
		})

		this.dispatchEvent({type: 'position'})
	},
	setSize: function(){
		this.node.css({
			width: this.data.size.width + 'px',
			height: this.data.size.height + 'px'
		})
	}
})

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

Blueprint.classes.Menu = function(){
	this.highlightRep = /<b class="highlight">(.*?)<\/b>/g,
	this.highlightAdd = '<b class="highlight">$1</b>';

	this.categorys = {
		blueprints: 'Blueprints',
		blueprint: 'Blueprint',
		function: 'Function',
		vtc: 'Vtc',
		css: 'Css',
		file: 'File',
		all: 'All'
	}

	this.menu  = $('#blueprint-menu');
	this.input = $('input',this.menu);
	this.list  = $('.blueprint-menu-list',this.menu);

	this.input.on('keyup',this.search.bind(this))

	var self = this;

	$(document).on('mousedown',function(e){
		if(!$( e.target ).closest( self.menu ).length){
			self.menu.hide();
		}
	})

	this.build();
}



Object.assign( Blueprint.classes.Menu.prototype, EventDispatcher.prototype, {
	show: function(cursor){
		var offset    = $('#blueprint-blueprints').offset(),
			winHeight = $(window).height(),
			position  = {
				x: cursor.x + offset.left,
				y: cursor.y + offset.top,
			};
		
		this.menu.css({
			left: position.x + 'px',
			top: position.y + 'px',
		}).show();

		var menuHeight = this.menu.outerHeight(),
			menuSize   = menuHeight + position.y + 20;

		if(menuSize > winHeight){
			this.menu.css({top: (position.y - (menuSize - winHeight)) + 'px'});
		}

		this.input.focus();

		this.input.val('');

		this.search()

		this.dispatchEvent({type: 'show'})
	},
	select: function(name,data){
		this.hide()

		$('#blueprint-blueprints iframe.active').focus();

		this.dispatchEvent({type: 'select', name: name, data: data || {}})
	},
	build: function(){
		this.list.empty()

		var cats = {},
			self = this;

		$.each(this.categorys,function(category,name){
			cats[category] = $([
				'<li cat="'+category+'">',
					'<span class="cat">'+name+'</span>',
					'<ul></ul>',
				'</li>'
			].join(''))

			self.list.append(cats[category])
		})

		$.each(Blueprint.Worker.getAll(),function(name,params){
			if(params.params.inmenu !== undefined && !params.params.inmenu) return;

			if(params.params.category == 'none') return;

			//var node = $('<li><span>'+params.params.name+'<br><small>'+Functions.Substring(params.params.description || '', 50)+'</small></span></li>'),
			var node = $('<li><span>'+params.params.name+'</span></li>'),
				cat  = cats[params.params.category];

			node.on('click',function(){
				Blueprint.Menu.select(name)
			})

			if(params.params.category && cat){
				$('ul',cat).append(node)
			}
			else $('ul',cats.all).append(node)
		})

		this.dispatchEvent({type: 'build'})
	},
	search: function(){
		var term      = this.input.val(),
			categorys = $(' > li',this.list),
			category,inner,txt;

		var self = this;

		categorys.each(function(){
			category = $(this);
			inner    = $('ul > li',category);

			var found = 0;

			inner.each(function(){
				li = $(this)

				txt = $('span',li).html().replace(self.highlightRep,'$1');

		        if(term !== ''){
			        txt = txt.replace(new RegExp('(' + term + ')', 'gi'), self.highlightAdd);
			    }
		          
		        li.html('<span>'+txt+'</span>'); 

		        li.show();

		        if(term){
		        	if($('.highlight',li).length){
		        		found++;
		        	}
		        	else li.hide();
		        }
			})

			category.show()

			if(term && !found){
				category.hide()
			}          
		})

		this.dispatchEvent({type: 'search', search: term})
	},
	hide: function(){
		this.menu.hide();

		this.dispatchEvent({type: 'hide'})
	}
})
Blueprint.classes.Node = function(uid){
	this.uid    = uid;
	this.data   = Blueprint.Data.get().nodes[uid];
	this.worker = Blueprint.Worker.get(this.data.worker);
	this.params = this.worker.params;

	this.position = {
		x: 0,
		y: 0
	}

	Blueprint.seed++;

	this.init();
}
Object.assign( Blueprint.classes.Node.prototype, EventDispatcher.prototype, {
	fire: function(name,add){
		if(this.worker.on[name]) this.worker.on[name]({
			target: this,
			data: this.data.userData,
			add: add
		})
	},
	create: function(nosnap){
		if(!nosnap) this.data.position = Blueprint.Utility.snapPosition(this.data.position);

		this.setPosition();

		this.fire('create');

		return this;
	},
	init: function(){
		var self = this;

		var title = [
			'<div class="blueprint-node-title" style="'+(this.params.titleColor ? 'color:' + this.params.titleColor : '')+'">',
                this.params.name,
                '<span class="display-subtitle"></span>',
            '</div>',
		].join('');

		this.node = $([
			'<div class="blueprint-node '+(this.params.type || '')+' '+(this.params.add_class || '')+' '+(this.params.reverse ? 'reverse' : '')+'" id="'+this.data.uid+'">',
                (this.params.type == 'round' ? '' : title),

                '<div class="blueprint-node-vars">',
                    '<div class="vars input"></div>',
                    (this.params.type == 'round' ? '<div class="display" style="'+(this.params.titleColor ? 'color:' + this.params.titleColor : '')+'"><span class="display-title"></span><span class="display-subtitle"></span></div>' : ''),
                    '<div class="vars output"></div>',
                '</div>',
            '</div>',
		].join(''));

		if(this.params.saturation){
			Blueprint.Image.saturation('style/blueprint/img/node.png', this.params.saturation, this.params.alpha || 1 ,function(base){
				self.node.css({
					backgroundImage: 'url('+base+')'
				})
			})
		}


		this.addVars('input');
		this.addVars('output');

		if(this.params.type == 'round'){
			$('.display-title',this.node).html(this.params.name)
		}

		this.addEvents();

		this.setPosition();

		$('.blueprint-container').append(this.node)

		return this;
	},
	addVars: function(entrance){
		var self = this;

		$.each(this.params.vars[entrance],function(name,params){
			if(params.displayInTitle){
				$('.display-subtitle', self.node).text('('+self.getValue(entrance, name)+')');
			}

			if(params.disableVisible) return;

			var use_color = params.color 

			

			var variable, select,
				is_content = name == 'input' || name == 'output';

			var type      = is_content && !params.varType ? 'content' : params.varType || '',
				className = 'var var-' + entrance + '-' + name + ' ' + type;

			
			variable = $('<div><span>'+(params.name || '')+'<span class="display-var display-'+entrance+'-'+name+'">'+(params.display ? '('+self.getValue(entrance, name)+')' : '')+'</span></span></div>');
			select   = $('<i class="'+className+'"></i>');

			if(params.colorText) variable.css('color',params.colorText);

			if(entrance == 'input') select.prependTo(variable);
			else                    select.appendTo(variable);

			variable.appendTo($('.vars.'+entrance,self.node));

			if(params.color_random){
				use_color = randomColor({
				   luminosity: 'light',
				   hue: params.color_random,
				   seed: Math.round(self.data.position.y * 0.02 + 1600)
				});

				select.data('random-color',use_color);
			}
			
			if(use_color){
				var img = type == 'content' ? 'node-content' : 'var';

				Blueprint.Image.color('style/blueprint/img/'+img+'.png',use_color,function(base){
					select.css({
						backgroundImage: 'url('+base+')'
					})
				})
			}

			select.on('mousedown',function(event){
				if(event.which == 3){
					self.outputRemove(name);
				}
				else{
					self.selectVar      = name;
					self.selectEntrance = entrance;

					Blueprint.Drag.add(self.drawConnection.bind(self))

					self.dispatchEvent({type: 'output', entrance: entrance, name: name})
				}
				
			})

			select.on('mouseup',function(){
				if(event.which == 3){
					self.inputRemove(name);
				}
				else{
					self.dispatchEvent({type: 'input', entrance: entrance, name: name})
				}
			})
			
		})
	},
	getValue: function(entrance, name){
		var value = this.data.varsData[entrance][name] || this.params.vars[entrance][name].value || '';

		this.dispatchEvent({type: 'getValue', entrance: entrance, name: name, value: value});

		return value;
	},
	setValue: function(entrance, name, value){
		this.data.varsData[entrance][name] = value;

		var params = this.params.vars[entrance][name];

		if(params.display) this.setDisplayInNode(entrance, name, value);

		if(params.displayInTitle) this.setDisplayInTitle(value);

		this.dispatchEvent({type: 'setValue', entrance: entrance, name: name, value: value})
	},
	setDisplayTitle: function(value){
		$('.display-title',this.node).html(value);
	},
	setDisplayInTitle: function(value){
		$('.display-subtitle',this.node).html('('+value+')');
	},
	setDisplayInNode: function(entrance, name, value){
		$('.display-'+entrance+'-'+name,this.node).html('('+value+')');
	},
	inputRemove: function(name){
		var parents = this.data.parents;

		for(var i = parents.length; i--;){
			var p = parents[i];

			if(p.input == name){
				Arrays.remove(parents,p);

				this.dispatchEvent({type: 'inputRemove', name: name})
			} 
		}
	},
	outputRemove: function(name){
		var nodes = Blueprint.Data.get().nodes,
			self  = this;

		$.each(nodes,function(uid,node){
			for(var i = node.parents.length; i--;){
				var p = node.parents[i];

				if(p.uid == self.uid && p.output == name){
					Arrays.remove(node.parents,p);

					self.dispatchEvent({type: 'outputRemove', name: name})
				}
			}
		})
	},
	checkLoop: function(){

	},
	addEvents: function(){
		var self = this;
		
		this.node.on('mousedown',function(event){
			if(!$(event.target).closest($('.var',self.node)).length) {
				if(event.which == 3){
					//self.remove();
				}
				else{
					self.dragStart();

					self.dispatchEvent({type: 'drag',event: event});
				}
			}
		});

		this.node.on('click',function(event){
			if(!$(event.target).closest($('.var',self.node)).length) {
				self.dispatchEvent({type: 'select',worker: self.data.worker, uid: self.uid, data: self.data});

				self.fire('select');
			}
		});

		this.node.mouseenter(function(e){
        	self.dispatchEvent({
        		type: 'mouseenter',
        		offset: self.node.offset(),
        		width:  self.node.outerWidth(),
        		height: self.node.outerHeight()
        	});
        }).mouseleave(function(){
        	self.dispatchEvent({type: 'mouseleave'});
        })
	},
	showOptionAgain: function(){
		this.dispatchEvent({type: 'showOptionAgain',worker: this.data.worker, uid: this.uid, data: this.data});
	},
	remove: function(){
		this.node.remove();

		this.fire('remove');

		this.dispatchEvent({type: 'remove', uid: self.uid});
	},
	dragStart: function(group_drag){
		this.group_drag = group_drag;

		this.position.x = this.data.position.x;
		this.position.y = this.data.position.y;

		this.dragCall = this.drag.bind(this);

		Blueprint.Drag.add(this.dragCall);
	},
	dragRemove: function(){
		Blueprint.Drag.remove(this.dragCall);
	},
	drag: function(dif, move, start){
		var snap = {};

		snap.x = this.position.x - (move.x - start.x) / Blueprint.Viewport.scale;
		snap.y = this.position.y - (move.y - start.y) / Blueprint.Viewport.scale;

		
		if(this.group_drag){
			this.data.position = snap;
		}
		else{
			this.data.position = Blueprint.Utility.snapPosition(snap)
		}

		this.setPosition();
	},
	drawConnection: function(dif,start,move){
		var ctx = Blueprint.Render.ctx;

		var min      = Math.min(100,Math.abs(move.y - start.y));
		var distance = Math.max(min,(move.x - start.x) / 2) * Blueprint.Viewport.scale;
		var variable = this.params.vars[this.selectEntrance][this.selectVar];
		var reverse  = move.x < start.x;

		var output = {
			x: reverse ? start.x - distance : start.x + distance,
			y: start.y
		}

		var input = {
			x: reverse ? move.x + distance : move.x - distance,
			y: move.y
		}

		ctx.beginPath();

		ctx.moveTo(start.x, start.y);
		ctx.bezierCurveTo(output.x, output.y, input.x, input.y, move.x, move.y);

		ctx.lineWidth   = 2;
		ctx.strokeStyle = this.selectVar == 'input' || this.selectVar == 'output' ? '#ddd' : variable.color || '#ff0000';

		ctx.stroke();

		this.dispatchEvent({type: 'connection'})
	},
	setPosition: function(){
		this.node.css({
			left: this.data.position.x + 'px',
			top: this.data.position.y + 'px'
		})

		this.dispatchEvent({type: 'position'})
	}
})

Blueprint.classes.Operator = function(data,workers,blueprintUid){
	this.data         = data;
	this.blueprintUid = blueprintUid;

	/** Воркер и воркеры **/
	this.workers     = workers;
	this.worker      = Blueprint.Worker.get(this.data.worker);

	/** Родители **/
	this.parents     = [];

	/** Счетчик вызовов **/
	this.callCounter = 0;

	/** Значения для детей **/
	this.values      = {}
}
Blueprint.classes.Operator.prototype = {
	/** Для начала, нам нуно найти родителей, 
		чтобы подсчитать callCounter **/
	init: function(){
		for(var i = 0 ; i < this.data.parents.length; i++){
			var parent = this.searchParent(this.data.parents[i].uid);

			if(parent) this.parents.push(parent);
		}
	},
	/** Функция поиска родителей **/
	searchParent: function(uid){
		for(var i = 0 ; i < this.workers.length; i++){
			var worker = this.workers[i];

			if(worker.data.uid == uid){
				return worker;
			}
		}
	},
	getDefault: function(entrance,name){
		var value = this.data.varsData[entrance][name];

		if(value == undefined) value = '';

		return value;
	},
	getDefaultFromWorker: function(entrance,name){
		var value = '';

		try{
			value = this.worker.params.vars[entrance][name].value;

			if(value == undefined) value = '';
		}
		catch(e){ }

		return value;
	},
	/** Вытавскивае значение у родителей **/
	getValue: function(name,getDefault){
		var values = [];

		var defaultValue = this.getDefault('input',name) || this.getDefaultFromWorker('input',name);

		for(var i = 0 ; i < this.data.parents.length; i++){
			var parent = this.data.parents[i];

			if(parent.input == name){
				var worker = this.searchParent(parent.uid),
					val;

				if(worker) val = worker.values[parent.output];

				if(val == undefined) val = ''; //значение у парента нету, значит пустое задаем

				values.push(val);
			}
		}

		if(values.length == 0 && getDefault && defaultValue){
			values.push(defaultValue)
		}

		return this.concat(values);
	},
	/** Вытаскиваем значения в единый массив **/
	concat: function(values){
		var concat = [];

		function get(arr){
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];

                if(Arrays.isArray(a)) get(a);
                else concat.push(a);
            }
        }

        get(values);

        return concat;
	},
	isAnyTrue: function(input){
		var change = false;

        function check(arr){
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];

                if(Arrays.isArray(a)) check(a);
                else if(a) change = true;
            }
        }

        check(input);

        return change;
	},
	removeEmpty: function(arr){
		return arr.filter(function (e) { return e != '' });
	},
	/** Устанавливаем значение **/
	setValue: function(name,value){
		this.values[name] = value;
	},
	start: function(){

	},
	build: function(){
		
	}
}

Blueprint.classes.Program = function(){
	this.data        = {};

	this._blueprints = [];
	this._options    = {};
	this._settings   = {};

	this._uidsDelete = [];
	this._uidsSaved  = [];

	this._empty = {
		uid: 'main',
		name: 'Main',
		change: 0,
		data: {}
	};

	$('.blueprint-right-showhide').on('click',function(){
		$('.blueprint-right').toggle()
	})
	
	this.reloadBlueprints();

	this._uidsSaved = Arrays.getKeys(this.data);
}

Object.assign( Blueprint.classes.Program.prototype, EventDispatcher.prototype, {
	/**
	 * Загружаемся
	 */
	_loadBlueprints: function(){
		
		var folder = nw.path.dirname(Config.config.lastProject) + '/blueprint';

		if (nw.file.existsSync(folder)) {
			nw.file.readdirSync(folder).forEach(file => {
				try{
		            var json = nw.file.readFileSync(nw.path.normalize(folder+'/'+file), 'utf8');

		            var read = JSON.parse(json);

		            if(this._uidsDelete.indexOf(read.uid) == -1){

			            if(!this.data[read.uid]) this.data[read.uid] = read;
			        }
		        }
		        catch(e){
		            Functions.Error('Поврежден файл ('+nw.path.normalize(folder+'/'+file)+')')
		        }
			})
		}

		this.dispatchEvent({type: 'loadBlueprints', data: this.data})
	},
	/**
	 * Строим список блюпринтов в интерфейсе
	 */
	_buildBlueprintsList: function(){
		var container = $('#blueprint-list').empty();

		var self = this;

		$.each(this.data,function(i,node){
			var item = $('<li uid="'+node.uid+'" class="'+(node.uid == Data.blueprint.active ? 'active' : '')+'"><span><a>'+node.name+'</a><ico><img src="style/img/icons-panel/settings.png" /></ico></span></li>');
			var ico  = $('ico',item);

			item.on('click',function(e){
				if(!$(e.target).closest(ico).length) {
					self.blueprintOpen(node);
				}
			})

			ico.on('click',function(e){
				var menu = $([
					'<ul>',
						'<li class="edit">Изменить</li>',
						(node.uid == 'main' ? '' : '<li class="remove">Удалить</li>'),
					'</ul>'
				].join(''))


				$('.edit',menu).on('click',function(){
					var blueprint = self._getBlueprint(node.uid);

					if(!blueprint) self.blueprintOpen(node);

					self.blueprintSettings(self._getBlueprint(node.uid));

					$('[tab="blueprint-settings"]').click();

					Menu.Hide();
				})

				if(node.uid !== 'main'){
					$('.remove',menu).on('click',function(){
						self.blueprintRemove(node.uid);

						Menu.Hide();
					})
				}

				Menu.Show($('ico',item),menu)
			})

			container.append(item);
		})

		$('li[uid="'+Data.blueprint.active+'"]',container).click();
	},
	_getBlueprint: function(uid){
		for(var i = 0; i < this._blueprints.length; i++){
			var blueprint = this._blueprints[i];

			if(blueprint.uid == uid){
				return blueprint; break;
			}
		}
		
	},
	/**
	 * Строим список блюпринтов в меню
	 */
	_appendBlueprintsToMenu: function(){
		var menu = $('#blueprint-menu li[cat="blueprints"] ul').empty();

		$.each(this.data,function(uid,params){
			var item = $('<li uid="'+uid+'"><span>'+params.name+'</span></li>');

			item.on('click',function(){
				Blueprint.Menu.select('blueprint',{
					userData: {
						blueprintUid: uid
					}
				})
			})

			menu.append(item)
		})
	},

	fireChangeEvent: function(){
		return;
		
		clearTimeout(this._fire_change_timer);

		this._fire_change_timer = setTimeout(this.projectBuild.bind(this),100);
	},
	/**
	 * Полный релоад, строим заново все списки
	 */
	reloadBlueprints: function(){
		//на всякий пожарный, вдруг чувак взял и удалил папку?
		this.projectNew();

		this._loadBlueprints();
		this._buildBlueprintsList();
		this._appendBlueprintsToMenu();
	},
	/**
	 * Из блюпринта вытаскивае все дынные
	 * @param {string} uid - айди блюпринта
	 */
	nodeData: function(uid){
		return this.data[uid].data;
	},
	/**
	 * Показываем какие параметры есть у нода
	 * @param {Object} event
	 * @param {Class}  event.target - ссылка на нод в блюпринте
	 * @param {Object} event.data   - все данные о ноде
	 * @param {string} event.uid    - айди нода
	 */
	nodeOption: function(event){
		var options = $('<div></div>'),
			worker  = Blueprint.Worker.get(event.data.worker),
			html;

		var field = function(entrance, group, name, params){
			if((name == 'input' || name == 'output') && !params.enableChange) return;

			if(params.disableChange) return;

			if(typeof params.type == 'function'){
				arguments.push = [].push;
				arguments.push(event)

				//запускаем функцию, но не из параметров а из воркера, потому что так надо чуваки!
				html = worker.params.vars[entrance][name].type.apply(null, arguments);
			}
			else{
				if(params.type == 'fileSave' || params.type == 'fileOpen' || params.type == 'fileDir' || params.type == 'fileOpenMultiple'){
					html = $([
						'<div class="form-field form-field-icon m-b-5">',
							'<div>',
								'<div class="form-btn form-btn-icon m-r-5"><img src="style/img/icons-panel/search.png" /></div>',
							'</div>',
							'<div>',
								'<div class="form-input">',
                                    '<input type="'+(params.inputType || 'text')+'" name="background-position" autocomplete="off value="" disabled placeholder="'+(params.placeholder || (params.name || name))+'" />',
                                    '<ul class="drop up icons"><li class="clear"><img src="style/img/icons-panel/delete.png" alt=""></li></ul>',
                                '</div>',
							'</div>',
                        '</div>',
					].join(''))

					var path  = event.target.getValue(entrance, name);
					var input = $('input',html).val(path);

					$('.form-btn',html).on('click',function(){
			            File.Choise(params.type,function(file){
			            	file = Functions.RelativePath('', file);

			            	event.target.setValue(entrance, name, file);

			                input.val(file)
			            },nw.path.dirname(Functions.LocalPath(path)))
			        });

			        $('.clear',html).on('click',function(){
			        	event.target.setValue(entrance, name, '');

			        	input.val('')
			        })
				}
				else{
					html = $([
						'<div class="m-b-5">',
	                        '<div class="form-input">',
	                            '<input type="'+(params.inputType || 'text')+'" name="'+name+'" value="" autocomplete="new-password" placeholder="'+(params.placeholder || (params.name || name))+'" />',
	                        '</div>',
		                '</div>',
					].join(''));

					$('input',html).val(event.target.getValue(entrance, name));

					var change = function(inputName, inputValue){
						if(inputValue == undefined) inputValue= '';

						event.target.setValue(entrance, inputName, inputValue);
					}

					Form.InputChangeEvent($('.form-input',html), change, change);
				}
			}

			group.append(html);
		}

		var group = function(entrance){
			var html = $([
				'<div class="form-group group-'+entrance+' p-b-5">',
                    '<div class="form-name">Значения ('+ Blueprint.Utility.capitalizeFirstLetter(entrance)+')</div>',
                    '<div class="form-content">',
                        
                    '</div>',
                '</div>',
			].join(''));

			options.append(html)

			return $('.form-content',html);
		}


		var vars        = event.target.params.vars;
		var description = $('<p class="text-center m-b-20">'+(event.target.params.description || '-')+'</p>')

		options.append(description)

		//формируем группы
		var input  = group('input'),
			output = group('output');

		$.each(vars.input,function(name,params){
			field('input', input, name, params);
		})

		$.each(vars.output,function(name,params){
			field('output', output, name, params);
		})

		//если в блоках пусто то зачем их показывать а?
		if(!$('*',input).length)  $('.group-input',options).remove();
		if(!$('*',output).length) $('.group-output',options).remove();

		$('#blueprint-node-option').empty().append(options);
		
	},

	_processStart: function(){
		this._building = true;

		$('.blueprint-process').addClass('active');

		var uids = [];

		for(var i in this.data){
			var nodes = this.data[i].data.nodes;

			for(var a in nodes){
				var node = nodes[a];

				if(node.worker == 'blueprint'){
					var uid = node.userData.blueprintUid;

					if(uids.indexOf(uid) == -1) uids.push(uid);
				}
			}
		}

		uids.push('main');

		$('.blueprint-process-title').text('Процесс 0 из '+uids.length);

		this._process_total = uids.length;
		this._process_uids  = uids;
	},

	_processComplite: function(uid){
		Arrays.remove(this._process_uids, uid);

		var now = this._process_total - this._process_uids.length;

		$('.blueprint-process-title').text('Процесс '+now+' из '+this._process_total)

		$('.blueprint-process-bar-inside').css({
			width: Math.round(now / this._process_total * 100) + '%'
		});
	},

	_processEnd: function(){
		//поcтавил таймер да бы видеть что была компиляция
		setTimeout(function(){
			$('.blueprint-process').removeClass('active');
		},10)

		setTimeout(function(){
			Blueprint.Program._building = false;
		},500);
	},

	//эвент на новый проект, создаем там и папку тоже
	projectNew: function(){
		var folder = nw.path.dirname(Config.config.lastProject) + '/blueprint';

		if(!nw.file.existsSync(folder)) nw.file.mkdirSync(folder);

		if(!nw.file.existsSync(folder+'/main.blu')){
			nw.file.writeFileSync(nw.path.normalize(folder+'/main.blu'), nw.file.readFileSync('main.blu'));
		}
	},
	
	//строим
	projectBuild: function(){
		this._processStart();

		this.blueprintBuild('main');

		this._processEnd();
	},

	buildingStatus: function(){
		return this._building;
	},

	//если сработал эвент сохранения то тоже сохраняем
	projectSave: function(){
		this._start_save = true;

		//для начала строим все полностью
		this.projectBuild();

		//ну а дальше сохраняем изменения
		var folder = nw.path.dirname(Config.config.lastProject) + '/blueprint';

		var self = this;

		var uidsNow = Arrays.getKeys(this.data);

		//то что будем сохраняь
		var needSave = Arrays.clone(Data.blueprint.opened);

			//мержем
			needSave = needSave.concat($(uidsNow).not(this._uidsSaved).get());

		$.each(needSave,function(i,uid){
			var node = self.data[uid];

			var change = JSON.stringify(node).length;
			
			//if(change !== node.change){
				node.change = change;
				node.change = JSON.stringify(node).length;
				
				nw.file.writeFileSync(nw.path.normalize(folder+'/'+uid+'.blu'),JSON.stringify(node),'utf8')
			//} 
		})


		//удаляем то что осталось лервое
		var _uidsDelete = $(this._uidsSaved).not(uidsNow).get();

		for(var i = _uidsDelete.length; i--;){
			try{
				nw.file.unlinkSync(nw.path.normalize(folder+'/'+_uidsDelete[i]+'.blu'));
			}
			catch(e){

			}
		}
		
		//обновляем список
		this._uidsSaved = uidsNow;

		this._start_save = false;
	},
	/**
	 * Строим и строим
	 * @param {string} uid
	 */
	blueprintBuild: function(uid){
		try{
			this._processComplite(uid);
			
			Blueprint.Worker.build(uid, this.data[uid].data.nodes);
		}
		catch(err){
			Console.Add(err)
		}
	},
	/**
	 * Загружаем или показываем blueprint
	 * @param {Object} node
	 */
	blueprintOpen: function(node){
		if(Data.blueprint.opened.indexOf(node.uid) == -1){
			Data.blueprint.opened.push(node.uid)
		
			this.blueprintInit(node);
		}
		else{
			for(var i = 0; i < this._blueprints.length; i++){
				var blueprint = this._blueprints[i];

				if(blueprint.uid == node.uid) blueprint.active();
			}
		}
	},
	/**
	 * Инициализируем блюпринт
	 * @param {Object} node
	 */
	blueprintInit: function(node){
		var blueprint = new Blueprint.classes.Blueprint(node);

		this._blueprints.push(blueprint)

		Data.blueprint.active = node.uid;

		this.dispatchEvent({type: 'blueprintInit', blueprint: blueprint, node: node})
	},
	/**
	 * Закрываем блюпринт
	 * @param {Class} blueprint - класс ифрейм окошка
	 */
	blueprintClose: function(blueprint){
		var pos = this._blueprints.indexOf(blueprint);

		Arrays.remove(Data.blueprint.opened,blueprint.uid);
		Arrays.remove(this._blueprints,blueprint);

		this.dispatchEvent({type: 'blueprintClose', blueprint: blueprint})

		if(Data.blueprint.active == blueprint.uid){
			//открываем вкладку что рядом
			if(this._blueprints[pos]){
				this._blueprints[pos].active();
			}
			else{
				pos--;

				this._blueprints[pos].active();
			}
		}
	},
	/**
	 * Создаем новый блюпринт
	 */
	blueprintNew: function(){
		var uid  = 'blueprint_'+Blueprint.Utility.uid();
		
		this.data[uid] = {
			uid: uid,
			name: 'Blueprint',
			change: 0,
			data: {}
		};

		this.reloadBlueprints();
	},
	/**
	 * Удаляем блюпринт
	 * @param {string} uid - айди блюпринта
	 */
	blueprintRemove: function(uid){
		for(var b = this._blueprints.length; b--;){
			var blueprint = this._blueprints[b];

			if(blueprint.uid == uid) blueprint.remove();
		}

		delete this.data[uid];

		this._uidsDelete.push(uid);

		this.reloadBlueprints();
	},
	/**
	 * Нстройки блюпринта
	 * @param {Class} blueprint
	 */
	blueprintActive: function(blueprint){
		var list = $('#blueprint-list');

		$('li',list).removeClass('active')

		$('[uid="'+blueprint.uid+'"]',list).addClass('active')

		this.blueprintSettings(blueprint);

		Data.blueprint.active = blueprint.uid;
	},
	/**
	 * Нстройки блюпринта
	 * @param {Class} node
	 */
	blueprintSettings: function(blueprint){
		var self = this;

		var data  = blueprint.data;
		var group = $([
			'<div class="form-group">',
                '<div class="form-name">Название</div>',
                '<div class="form-content">',
                    '<div class="form-input">',
                        '<input type="text" name="name" value="'+(data.name || '')+'" placeholder="" />',
                    '</div>',
                '</div>',
            '</div>',
		].join(''));

		var changeName = function(n,value){
			data.name = value;

			self.dispatchEvent({type: 'blueprintChangeParams', blueprint: blueprint, node: data})
		}

		Form.InputChangeEvent($('.form-input',group),changeName,changeName)
		
		$('#blueprint-settings').empty().append(group)
	}
})
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
	}
})
Blueprint.classes.Selection = function(){
	this.selection = [];
	this.area      = $('.blueprint-selection');
	this.viewport  = {};
	this.box       = {};
}

Object.assign( Blueprint.classes.Selection.prototype, EventDispatcher.prototype, {
	add: function(node){
		if(this.selection.indexOf(node) == -1){
			this.selection.push(node)

			this.dispatchEvent({type: 'add', node: node})
		}
	},
	remove: function(node){
		if(this.selection.indexOf(node) >= 0){
			Arrays.remove(this.selection, node);

			this.dispatchEvent({type: 'remove', node: node})
		}
	},
	clear: function(){
		this.selection = [];

		this.dispatchEvent({type: 'clear'})
	},
	select: function(node){
		this.clear();
		this.add(node);

		this.dispatchEvent({type: 'select', node: node})
	},
	drag: function(event){
		this.area.show();

		var x = event.drag.move.x - event.drag.start.x,
			y = event.drag.move.y - event.drag.start.y;

		var box = {
			left: x < 0 ? event.drag.move.x : event.drag.start.x,
			top: y < 0 ? event.drag.move.y : event.drag.start.y,
			width: x < 0 ? event.drag.start.x - event.drag.move.x : x,
			height: y < 0 ? event.drag.start.y - event.drag.move.y : y,
		}

		var viewport = {
			left: Blueprint.Utility.negative( Blueprint.Viewport.position.x - box.left / Blueprint.Viewport.scale ),
			top: Blueprint.Utility.negative( Blueprint.Viewport.position.y - box.top / Blueprint.Viewport.scale ),
			width: box.width / Blueprint.Viewport.scale,
			height: box.height / Blueprint.Viewport.scale,
		}

		this.area.css({
			left: box.left + 'px',
			top: box.top + 'px',
			width: box.width  + 'px',
			height: box.height + 'px'
		})

		this.viewport = viewport;
		this.box      = box;

		this.dispatchEvent({type: 'drag', box: box, viewport: viewport})
	},
	stop: function(){
		this.area.hide()

		this.dispatchEvent({type: 'stop'})
	}
})
Blueprint.classes.Shortcut = function(){
	this.shortcuts = [];

	$(window).on('keydown',this._down.bind(this));
}

Object.assign( Blueprint.classes.Shortcut.prototype, EventDispatcher.prototype, {
	add: function(key,callback){
		this.shortcuts.push({
			key: key,
			callback: callback
		})
	},
	_down: function(e){
		var key  = this._decode(e.keyCode);
		var ctrl = e.ctrlKey;

		$.each(this.shortcuts,function(i,shortcut){
			var combination = shortcut.key.split('+');
			var pressed     = true;

			$.each(combination,function(a,combo){
				if(combo == 'Ctrl'){
					if(!ctrl) pressed = false;
				}
				else if(combo !== key) pressed = false;
			})

			if(pressed) shortcut.callback();
		})
	},
	_decode: function(key){
		var decode = {
			37: 'Left',
			39: 'Right',
			38: 'Up',
			40: 'Down',
			16: 'Shift'
		}

		if(decode[key]){
			return decode[key];
		}
		else return String.fromCharCode(key).toUpperCase();
	}
})
Blueprint.Utility = {
    sticking_ammount: 8,

	uid: function(len){
        var ALPHABET  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var ID_LENGTH = len || 8;

        var id = '';

        for (var i = 0; i < ID_LENGTH; i++) {
            id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }

        return id;
    },

    hashCode: function(str){
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    blueprintFolder: function(){
        return  nw.path.dirname(Config.config.lastProject) + '/blueprint';
    },

    negative: function(n){
        return n >= 0 ? -n : Math.abs(n);
    },

    snapValue: function(value,size){
    	var snap = size || 4;
        
        value = (value/snap).toFixed() * snap;
        
        return value;
    },

    snapPosition: function(position,size){
        if(Blueprint.snaped){
            var stick = this.checkSticking(Blueprint.Render.sticking, position, size);

            if(stick.sticked){
                position.x = stick.point.x;
                position.y = stick.point.y;
            }
            else{
                position.x = Blueprint.Utility.snapValue(position.x)
                position.y = Blueprint.Utility.snapValue(position.y)
            }
        }

    	return position;
    },

    getNodesConner: function(nodes){
        var box = {
            x: Infinity,
            y: Infinity,
        }

        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i],
                posi = node.data.position;

            box.x = Math.min(box.x, posi.x);
            box.y = Math.min(box.y, posi.y);
        }

        return box;
    },

    getViewportPoint: function(position){
        return {
            x: position.x / Blueprint.Viewport.scale - Blueprint.Viewport.position.x,
            y: position.y / Blueprint.Viewport.scale - Blueprint.Viewport.position.y
        }
    },

    getScreenPoint: function(position){
        return {
            x: position.x * Blueprint.Viewport.scale + Blueprint.Viewport.position.x,
            y: position.y * Blueprint.Viewport.scale + Blueprint.Viewport.position.y,
        }
    },

    getStickingNodes: function(select, start){
        var diff = {};

        //получаем реальную точку в вьюпорте
        var poin = this.getViewportPoint(start);

        //вычисляем левый верхний угол
        var conr = this.getNodesConner(select);

        //где реально находится угол на экране
        var scrn = this.getScreenPoint(conr)

        //разница между вьюпортом и экраном
        var offt = {
            x: conr.x - scrn.x,
            y: conr.y - scrn.y
        }
        
        //разница между курсором, углом и экраном
        diff.x = conr.x - poin.x + offt.x;
        diff.y = conr.y - poin.y + offt.y;

        return this.getSticking(diff);
    },

    getSticking: function(differ){
        var dif = differ ? differ : {x: 0, y: 0};

        //дальше самое интресное
        var sticking = [];

        var node, point;

        //надо найти линии 
        for (var i = 0; i < Blueprint.Render.nodes.length; i++) {
            node = Blueprint.Render.nodes[i];

            point = node.data.position;

            //добовляем линии
            //линия |
            sticking.push({
                pos: point.x - dif.x, 
                dir: 'y',
                node: node, 
                dif: dif
            });
            //линия | + width
            sticking.push({
                pos: point.x + node.node.outerWidth() - dif.x, 
                dir: 'y',
                node: node, 
                dif: dif
            });

            //линия --
            sticking.push({
                pos: point.y - dif.y, 
                dir: 'x',
                node: node, 
                dif: dif
            });

            //линия -- + height
            sticking.push({
                pos: point.y + node.node.outerHeight() - dif.y, 
                dir: 'x',
                node: node, 
                dif: dif
            });

            //линия -- + height / 2
            sticking.push({
                pos: point.y + node.node.outerHeight() / 2 - dif.y, 
                dir: 'x',
                node: node, 
                dif: dif
            });
        }

        return sticking;
    },

    getStickingHeight: function(differ){
        var dif = differ ? differ : {x: 0, y: 0};

        //дальше самое интресное
        var sticking = [];

        var node, point;

        //надо найти линии 
        for (var i = 0; i < Blueprint.Render.nodes.length; i++) {
            node = Blueprint.Render.nodes[i];

            point = node.data.position;

            //линия --
            sticking.push({
                pos: point.y - dif.y, 
                node: node, 
                height: node.node.outerHeight(),
                dif: dif
            });
        }

        return sticking;
    },

    getStickingVertical: function(point, differ){
        var sticks = this.getStickingHeight(differ);
        var found  = null;

        sticks.sort(function(a,b){
            if(a.height > b.height) return -1;
            else if(a.height < b.height) return 1;
            else return 0;
        });

        for (var i = 0; i < sticks.length; i++) {
            var stick = sticks[i];

            if(point.y >= stick.pos && point.y <= stick.pos + stick.height){
                found = stick.pos;
            }
        }

        return found;
    },

    checkSticking: function(sticking, point, ammount){
        var st,dr,tr,cr = {
            x: (point.pageX || point.left || point.x),
            y: (point.pageY || point.top || point.y)
        };

        var power = ammount || this.sticking_ammount;

        for (var i = 0; i < sticking.length; i++) {
            st = sticking[i];
            dr = st.dir == 'x' ? 'y' : 'x';

            if(cr[dr] > st.pos - power && cr[dr] < st.pos + power ){
                cr[dr] = st.pos;

                tr = st;
            }
        }

        return {
            sticked: tr,
            point: cr
        };
    },

    onChange: function(input){
        var change = false;

        function check(arr){
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];

                if(Arrays.isArray(a)) check(a);
                else if(a) change = true;
            }
        }

        check(input);

        return change;
    },
    intersect: function(r1, r2) {
        r1.right  = r1.left + r1.width;
        r1.bottom = r1.top + r1.height;

        r2.right  = r2.left + r2.width;
        r2.bottom = r2.top + r2.height;

        return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
    },
    intersectPoint: function(box, point){
        return point.x > box.left && point.x < box.left + box.width && point.y > box.top && point.y < box.top + box.height;
    }
}

Blueprint.Vars = new function(){
	this.data = {}

	this.set = function(uid,name,value){
		this.fix(uid);

		this.data[uid][name] = value;
	}
	this.get = function(uid,name){
		this.fix(uid);

		return this.data[uid][name];
	}
	this.fix = function(uid){
		if(!this.data[uid]) this.data[uid] = {};
	}
}

Blueprint.classes.Viewport = function(){
	this.scale = 1;

	this.position = {
		x: 0,
		y: 0
	}

	this.cursor = {
		x: 0,
		y: 0
	}

	this.zoom = $('.blueprint-zoom');
	this.wrap = $('.blueprint-wrap');
	this.body = $('body');

	var self = this;

    $(document).mouseup(function(e) {
		
    }).mousedown(function(e) {
    	if(!$(e.target).closest($('.blueprint-node,.blueprint-helper')).length) {
    		Blueprint.Drag.add(self.drag.bind(self));
		}
    }).mousemove(function(e) {
        self.cursor.x = e.pageX;
        self.cursor.y = e.pageY;
    }).on('mousewheel',this.mousewheel.bind(this))
}

Object.assign( Blueprint.classes.Viewport.prototype, EventDispatcher.prototype, {
    mousewheel: function(e){
        e.preventDefault();

        var delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/120 : -e.originalEvent.detail/3;
            delta *= 0.120;


        var zoom = (1.1 - (delta < 0 ? 0.2 : 0));
            
        var newscale = this.scale * zoom;
            newscale = newscale > 1 ? 1 : newscale;

        var mx = -this.cursor.x;
        var my = -this.cursor.y;
        
        this.position.x = Math.round(mx / this.scale + this.position.x - mx / newscale);
        this.position.y = Math.round(my / this.scale + this.position.y - my / newscale);
        
        this.scale = newscale;
        
        this.zoom.css({
            transform: 'scale('+this.scale+')',
            transformOrigin: '0 0'
        })

        this.drag({x: 0, y: 0})

        this.dispatchEvent({type: 'zoom'})
    },
    drag: function(dif){
        this.position.x -= dif.x / this.scale;
        this.position.y -= dif.y / this.scale;

        this.wrap.css({
            left: this.position.x + 'px',
            top: this.position.y + 'px'
        })

        this.body.css({
            backgroundPosition: this.position.x + 'px ' + this.position.y + 'px'
        })

        this.dispatchEvent({type: 'drag'})
    }
})
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

Blueprint.Worker.add('blueprint',{
	params: {
		name: 'Blueprint',
		description: '',
		saturation: 'hsl(169, 95%, 19%)',
		alpha: 0.82,
		category: 'blueprint',
		type: 'round',
		vars: {
			input: {
				input: {},
			},
			output: {
				output: {}
			}
		},
		inmenu: false
	},
	on: {
		create: function(event){
			
		},
		remove: function(event){
			
		},
		init: function(event){
			var blueprint = parent.Blueprint.Program.data[event.data.blueprintUid];

			if(blueprint) $('.display-subtitle',event.target.node).text('('+blueprint.name+')')
		},
		blueprintChangeParams: function(event){
			$('.display-title',event.target.node).text('Blueprint Content ('+event.add.name+')')
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			//устанавливаем глобальные значения
			Blueprint.Vars.set(this.data.userData.blueprintUid, 'input', this.getValue('input'));
			
			//выполняем воркер
			Blueprint.Program.blueprintBuild(this.data.userData.blueprintUid);
			
			//записываем результат
			this.setValue('output', Blueprint.Vars.get(this.data.userData.blueprintUid, 'output'));
		}
	}
});
Blueprint.Worker.add('blueprint_build',{
	params: {
		name: 'Build',
		description: 'Событие на компиляцию кода Blueprint',
		saturation: 'hsl(188, 97%, 76%)',
		alpha: 0.43,
		category: 'blueprint',
		vars: {
			input: {
				
			},
			output: {
				build: {
					name: 'onBuild',
					color: '#7bda15',
					disableChange: true,
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('build',true);
		}
	}
});
Blueprint.Worker.add('build_version',{
	params: {
		name: 'Build version',
		description: 'Генерирует хеш, если сработал тригер изменения',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		vars: {
			input: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var change = Blueprint.Utility.onChange(this.getValue('change',true));

			if(change){
				Ceron.cache.build_version = Math.round(Math.random() * 1e10);
			}
		}
	}
});
Blueprint.Worker.add('css_autoprefixer',{
	params: {
		name: 'Autoprefixer',
		description: 'Autoprefixer будет использовать данные на основе текущей популярности браузера и поддержки свойств, чтобы применять префиксы.',
		saturation: 'hsl(188, 97%, 76%)',
		alpha: 0.33,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
				version: {
					name: 'version',
					color: '#ddd',
					disableVisible: true,
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var result  = this.getValue('input').join("\n");
			var version = this.getDefault('input','version');
				version = version || Data.autoprefixer;

			try{
				result = nw.postcss([nw.autoprefixer({ browsers: version.split(',') })]).process(result).css;
			}
			catch(e){
				Console.Add({message: 'Autoprefixer: ' + e.message, stack: e.stack});
			}
			
			this.setValue('output',result);
		}
	}
});
Blueprint.Worker.add('css_custom_font',{
	params: {
		name: 'Custom Font',
		description: 'Подключение шрифта через @font-face',
		saturation: 'hsl(191, 61%, 56%)',
		titleColor: '#ffffff',
		alpha: 0.41,
		category: 'css',
		vars: {
			input: {
				name: {
					name: 'Font Name',
					color: '#ddd',
					display: true,
					displayInTitle: true,
				},

				display: {
					name: 'Display',
					color: '#ddd',
					value: 'swap',
					display: true,
					type: function(entrance, group, fieldname, params, event){
						var select = $([
							'<select class="form-select m-b-5">',
								'<option value="auto">Auto</option>',
								'<option value="block">Block</option>',
								'<option value="swap">Swap</option>',
								'<option value="fallback">Fallback</option>',
								'<option value="optional">Optional</option>',
							'</select>'
						].join(''))

						select.val(event.target.getValue(entrance, fieldname));

						select.on('change', function(){
							event.target.setValue(entrance, fieldname, $(this).val());
						});

						return select;
					}
				},

				local: {
					name: 'Local',
					color: '#ddd',
					value: 'false',
					type: function(entrance, group, fieldname, params, event){
						var field = $([
							'<div class="form-field form-field-space form-field-align-center">',
								'<div>Локальные шрифты:</div>',
								'<div>',
									'<ul class="form-radio">',
                                        '<li name="false"><img src="style/img/icons/none.png" alt=""></li>',
                                        '<li name="true"><img src="style/img/icons/ok.png" alt=""></li>',
                                    '</ul>',
								'</div>',
							'</div>',
							'<div class="form-divider"></div>'
						].join(''));

						Form.RadioChangeEvent($('.form-radio',field),function(value){
							event.target.setValue(entrance, fieldname, value);
						});

						Form.RadioSetValue($('.form-radio',field),event.target.getValue(entrance, fieldname));

						return field;
					}
				},

				Thin: {
					name: '100 Thin',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ThinItalic: {
					name: '100 ThinItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				ExtraLight: {
					name: '200 ExtraLight',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ExtraLightItalic: {
					name: '200 ExtraLightItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Light: {
					name: '300 Light',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				LightItalic: {
					name: '300 LightItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Regular: {
					name: '400 Regular',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				RegularItalic: {
					name: '400 RegularItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Medium: {
					name: '500 Medium',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				MediumItalic: {
					name: '500 MediumItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Semibold: {
					name: '600 Semibold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				SemiboldItalic: {
					name: '600 SemiboldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Bold: {
					name: '700 Bold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				BoldItalic: {
					name: '700 BoldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				ExtraBold: {
					name: '800 ExtraBold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ExtraBoldItalic: {
					name: '800 ExtraBoldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Black: {
					name: '900 Black',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				BlackItalic: {
					name: '900 BlackItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
			},
			output: {
				output: {},
			}
		},
	},
	on: {
		init: function(event){
			event.target.addEventListener('setValue',function(e){
				if(e.name !== 'name'){
					if(!this.getValue('input', e.name) && e.value){
						this.setValue('input', e.name, parent.Blueprint.Worker.get('css_custom_font').working.name(e.value));

						this.showOptionAgain();
					}
				}
				else{
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();
				}
			});
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		name: function(path){
			return nw.path.basename(path, nw.path.extname(path));
		},
		start: function(){
			
		},
		build: function(){
			var font_name    = this.getValue('name',true).join('');
			var font_display = this.getValue('display',true).join('');
			var font_local   = this.getValue('local',true).join('') == 'true';

			var weights = {
		        'Thin': '100',
		        'ThinItalic': '100',

		        'ExtraLight': '200',
		        'ExtraLightItalic': '200',

		        'Light': '300',
		        'LightItalic': '300',

		        'Regular': '400',
		        'RegularItalic': '400',

		        'Medium': '500',
		        'MediumItalic': '500',

		        'Semibold': '600',
		        'SemiboldItalic': '600',

		        'Bold': '700',
		        'BoldItalic': '700',

		        'ExtraBold': '800',
		        'ExtraBoldItalic': '800',

		        'Black': '900',
		        'BlackItalic': '900',
		    };

		    var formats = {
				eot: 'embedded-opentype',
				woff2: 'woff2',
				woff: 'woff',
				ttf: 'truetype',
				svg: 'svg',
				otf: 'opentype'
			};

		    var fonts = [];

		    var checkFileExist = function(path){
		    	nw.file.existsSync(path)
		    }

		    for(var name in weights){
		    	var weight = weights[name];
		    	var path   = this.getValue(name,true).join('');

		    	if(!path) continue;

		    	var folder = path.split('.');
		    		folder.pop();
		    		folder = folder.join('.');

		    	var style  = /Italic/.test(name) ? 'italic' : 'normal';
		    	var urls   = [];

		    	if(font_local){
		    		urls.push('local("'+font_name+' '+name+'")');
		    		urls.push('local("'+font_name+'-'+name+'")');
		    	}
		    	

		    	for(var fr in formats){
		    		var newPath = folder + '.' + fr;

		    		if(nw.file.existsSync(Functions.LocalPath(newPath))){
		    			urls.push('url("' + Functions.NormalPath(Functions.AssetPath(Data.path.img, newPath)) + '") format("'+formats[fr]+'")');
		    		}
		    	}

				var font = [
					'@font-face {',
					    '	font-family: "' + font_name + '";',
					    '	font-display: ' + font_display + ';',
					    '	src: ',
					    '		'+urls.join(",\n    	")+';',
					    '	font-weight: '+weight+';',
					    '	font-style: '+style+';',
					'}',
				].join("\n");

				fonts.push(font);
		    }

			this.setValue('output',fonts.join("\n"));
		}
	}
});
Blueprint.Worker.add('css_google_font',{
	params: {
		name: 'Google Fonts',
		description: 'Подключение шрифта через сервис Google Fonts',
		saturation: 'hsl(151, 64%, 36%)',
		titleColor: '#ffffff',
		alpha: 0.87,
		category: 'css',
		vars: {
			input: {
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				},
				types: {
					name: 'files',
					color: '#ddd',
					disableVisible: true,
					type: function(entrance, group, fieldname, params, event){
						var weights = {
					        'Thin': '100',
					        'ThinItalic': '100i',

					        'ExtraLight': '200',
					        'ExtraLightItalic': '200i',

					        'Light': '300',
					        'LightItalic': '300i',

					        'Regular': '400',
					        'RegularItalic': '400i',

					        'Medium': '500',
					        'MediumItalic': '500i',

					        'Semibold': '600',
					        'SemiboldItalic': '600i',

					        'Bold': '700',
					        'BoldItalic': '700i',

					        'ExtraBold': '800',
					        'ExtraBoldItalic': '800i',

					        'Black': '900',
					        'BlackItalic': '900i',
					    };

						var ul = $('<ul class="list-css mixin"></ul>');

						var include = event.target.getValue(entrance, fieldname).split(',');

						$.each(weights, function(name, weight){
							var id = Functions.Uid();
							var item = $([
								'<li>',
									'<div>',
										'<div class="form-checkbox m-r-10">',
											'<input type="checkbox" id="cvd-'+id+'" name="'+weight+'">',
											'<label for="cvd-'+id+'"></label>',
										'</div>',
										'<kbd>'+weight+'</kbd> ',
										'<code class="code-dark m-l-5">'+name+'</code>',
									'</div>',
								'</li>',
							].join(''));

							$('input',item).on('change',function(){
								include = [];

								$('input',ul).each(function(){
									if($(this).is(':checked')) include.push($(this).attr('name'));
								})

								event.target.setValue(entrance, fieldname, include.join(','));
							})

							if(include.indexOf(weight) >= 0) $('input',item).prop('checked',true);

							ul.append(item);
						});

						return ul;
					}
				}
			},
			output: {
				output: {},
			}
		},
	},
	on: {
		init: function(event){
			
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		name: function(path){
			return nw.path.basename(path, nw.path.extname(path));
		},
		start: function(){
			
		},
		build: function(){
			var name = this.getValue('name',true).join('');
			var types = this.getValue('types',true).join('');

			name = name.replace(' ','+');

			var url = "@import url('https://fonts.googleapis.com/css?family="+name+":"+types+"');";

			this.setValue('output',url);
		}
	}
});
Blueprint.Worker.add('css_result',{
	params: {
		name: 'Css Result',
		description: 'Вывод результата в формате css',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'css',
		vars: {
			input: {
				list: {
					name: 'list',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {
					name: 'all',
					color: '#ddd',
					varType: 'round',
					disableChange: true
				},
				main: {
					name: 'main',
					color: '#ddd',
					disableChange: true,
				},
				cascade: {
					name: 'cascade',
					color: '#ddd',
					disableChange: true,
				},
				media: {
					name: 'media',
					color: '#ddd',
					disableChange: true,
				},
			}
		},
		userData: {
			
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		
		build: function(){
			var lis = this.getValue('list');
			var any = this.isAnyTrue(lis);
			
			var css = Generators.Build.Css(true,{
				toObject: true,
				list: any ? lis : false
			});

			this.setValue('main', css.main);
			this.setValue('cascade', css.cascade);
			this.setValue('media', css.media);

			this.setValue('output', [css.main, css.cascade, css.media].join("\n"));
		},
	}
});
Blueprint.Worker.add('css_unminify',{
	params: {
		name: 'Css Unminify',
		description: 'Перевод css в читабельный вид',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var value = this.getValue('input').join("\n");

				value = Generators.Build._unminify(value);
			
			this.setValue('output',value);
		}
	}
});
Blueprint.Worker.add('dir_watch',{
	params: {
		name: 'Dir Watch',
		description: 'Отслеживает изменения файлов в папке, каждый раз при изменение будет компилировать Blueprint',
		saturation: 'hsl(53, 28%, 57%)',
		alpha: 0.4,
		category: 'file',
		vars: {
			input: {
				path: {
					name: 'path',
					color: '#ddd',
					disableVisible: true,
					type: 'fileDir'
				}
			},
			output: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				}
			}
		},
	},
	on: {
		create: function(event){
			parent.Blueprint.Worker.get('dir_watch').working.create(event);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('dir_watch').working.remove(event);
		},
		init: function(event){
			event.target.setDisplayInTitle(event.target.getValue('input','path'));
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();

					parent.Blueprint.Worker.get('dir_watch').working.reset(event);
				}
			});

			parent.Blueprint.Worker.get('dir_watch').working.reset(event);
		}
	},
	working: {
		create: function(event){
			
		},
		remove: function(event){
			if(event.target.watcher) event.target.watcher.close();
		},
		reset: function(event){
			if(event.target.watcher) event.target.watcher.close();

			event.target.watcher = nw.chokidar.watch(Functions.LocalPath(event.target.getValue('input','path')), {
				persistent: true
			});

			var timer, first = true;

			event.target.watcher.on('all', function(){
				clearTimeout(timer);

				timer = setTimeout(function(){
					if(!first && !Blueprint.Program.buildingStatus()){
						event.data.change = true;

						Blueprint.Program.projectSave();
					}

					first = false;
				},250);
			})
		},
		start: function(){
			
		},
		build: function(){
			var change = this.data.userData.change;

			this.data.userData.change = false;

			this.setValue('change', change);
		}
	}
});
Blueprint.Worker.add('file_include',{
	params: {
		name: 'File Include',
		description: 'Подключить к HTML файл (link или script)',
		saturation: 'hsl(360, 88%, 56%)',
		alpha: 0.71,
		category: 'file',
		//type: 'round',
		vars: {
			input: {
				path: {
					name: 'path',
					color: '#ddd',
					disableVisible: false,
					type: 'fileOpen'
				}
			},
			output: {
				output: {

				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayInTitle(event.target.getValue('input','path'));
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();
				}
			});
		}
	},
	working: {
		start: function(){
			
		},
		build: function(e){
			var path       = this.getValue('path',true).join('');
			var path_local = Functions.NormalPath(Functions.AssetPath(Data.path.img, path));

			var file = '';
			var exe  = nw.path.extname(path_local);


			if(exe == '.css'){
				file = '<link rel="stylesheet" type="text/css" href="'+path_local+'">';
			}
			else if(exe == '.js'){
				file = '<script type="text/javascript" src="'+path_local+'"></script>';
			}

			this.setValue('output', file);
		}
	}
});
Blueprint.Worker.add('file_open',{
	params: {
		name: 'File Open',
		description: 'Открыть файл и прочитать содержимое',
		saturation: 'hsl(139, 45%, 44%)',
		alpha: 0.67,
		category: 'file',
		//type: 'round',
		vars: {
			input: {
				path: {
					name: 'path',
					color: '#ddd',
					disableVisible: false,
					type: 'fileOpen'
				}
			},
			output: {
				output: {

				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayInTitle(event.target.getValue('input','path'));
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();
				}
			});
		}
	},
	working: {
		start: function(){
			
		},
		build: function(e){
			var path = this.getValue('path',true).join('');
			var data = '';

			try{
	            data = nw.file.readFileSync(Functions.LocalPath(path), 'utf8');
	        }
	        catch(e){
	        	Console.Add({message: 'Не удалось открыть файл', stack: path || 'Не указан путь.'});
	        }

			this.setValue('output', data);
		}
	}
});
Blueprint.Worker.add('file_save',{
	params: {
		name: 'File Save',
		description: 'Сохранить результат в файл',
		saturation: 'hsl(32, 45%, 44%)',
		alpha: 0.67,
		category: 'file',
		//type: 'round',
		vars: {
			input: {
				input: {
					name: 'data'
				},
				path: {
					name: 'path',
					color: '#ddd',
					disableVisible: false,
					type: 'fileSave'
				}
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayInTitle(event.target.getValue('input','path'));
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();
				}
			});
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var result = this.getValue('input').join(''),
				path   = this.getValue('path',true).join('');

			if(Blueprint.Program._start_save){
				try{
					nw.file.writeFileSync(Functions.LocalPath(path), result, 'utf8');
				}
				catch(e){
					Console.Add({message: 'Не удалось записать файл', stack: path || 'Не указан путь для сохранения файла.'});
				}
			}
		}
	}
});
Blueprint.Worker.add('file_watch',{
	params: {
		name: 'File Watch',
		description: 'Отслеживает изменения файла, каждый раз при изменение будет компилировать Blueprint',
		saturation: 'hsl(53, 28%, 57%)',
		alpha: 0.4,
		category: 'file',
		vars: {
			input: {
				path: {
					name: 'path',
					color: '#ddd',
					disableVisible: true,
					type: 'fileOpen'
				}
			},
			output: {
				output: {
					disableVisible: true,
				},
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			}
		},
	},
	on: {
		create: function(event){
			parent.Blueprint.Worker.get('file_watch').working.create(event);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('file_watch').working.remove(event);
		},
		init: function(event){
			event.target.setDisplayInTitle(event.target.getValue('input','path'));
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();

					parent.Blueprint.Worker.get('file_watch').working.reset(event);
				}
			});

			parent.Blueprint.Worker.get('file_watch').working.reset(event);
		}
	},
	working: {
		create: function(event){
			
		},
		remove: function(event){
			if(event.target.watcher) event.target.watcher.close();
		},
		reset: function(event){
			if(event.target.watcher) event.target.watcher.close();

			event.target.watcher = nw.chokidar.watch(Functions.LocalPath(event.target.getValue('input','path')), {
				persistent: true
			});

			var timer,first = true;

			event.target.watcher.on('all', function(path, stats){
				clearTimeout(timer);

				timer = setTimeout(function(){

					if(!first && !Blueprint.Program.buildingStatus()){
						event.data.change = true;

						Blueprint.Program.projectSave();
					}

					first = false;
				},250);
			})
		},
		start: function(){
			
		},
		build: function(event){
			var change = this.data.userData.change;

			this.data.userData.change = false;

			this.setValue('change', change);
		}
	}
});
Blueprint.Worker.add('ftpsync',{
	params: {
		name: 'FTP Sync',
		description: 'Заливает файлы на FTP если они были изменены',
		saturation: 'hsl(0, 89%, 72%)',
		alpha: 0.98,
		category: 'file',
		titleColor: '#883232',
		vars: {
			input: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
				ip: {
					name: 'server',
					color: '#ddd',
				},
				login: {
					name: 'user login',
					color: '#ddd',
				},
				password: {
					name: 'user password',
					color: '#ddd',
					inputType: 'password'
				},
				ftp_folder: {
					name: 'folder ftp',
					color: '#ddd',
				},
				local_folder: {
					name: 'folder local',
					color: '#ddd',
					type: 'fileDir'
				},
				full: {
					disableVisible: true,
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-btn form-btn-red">Очистить дату изменений</div>',
						].join(''))

						field.on('click', function(){
							event.data.userData.lastTime = '01.01.0001 0:00:00';

							Functions.Notify('Дата очишина');
						})

						return field;
					}
				}
			},
			output: {

			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var ftpuid = this.data.uid;
			var change = Blueprint.Utility.onChange(this.getValue('change',true));

			if(Ceron.cache.ftpsync == undefined) Ceron.cache.ftpsync = {};

			if(Ceron.cache.ftpsync[ftpuid] !== undefined && !Ceron.cache.ftpsync[ftpuid].wait && change){
				Ceron.cache.ftpsync[ftpuid].wait = true;

				var name     = this.getValue('name').join('');
				var execFile = require('child_process').execFile;

				var config = {
					IP:           this.getValue('ip',true).join(''),
					Login:        this.getValue('login',true).join(''),
					Passwd:       this.getValue('password',true).join(''),
					FtpFolder:    this.getValue('ftp_folder',true).join(''),
					LocalFolder:  Functions.LocalPath(this.getValue('local_folder',true).join('')),
					LastSyncGood: this.data.userData.lastTime
				}

				if(config.Passwd){
					Ceron.cache.ftpsync[ftpuid].pass = config.Passwd;
				}
				else if(Ceron.cache.ftpsync[ftpuid].pass){
					config.Passwd = Ceron.cache.ftpsync[ftpuid].pass;
				}

				if(!config.IP){
					Console.Add({message: 'FTP Sync', stack: 'Укажите IP сервера'});
				}
				else if(!config.Login){
					Console.Add({message: 'FTP Sync', stack: 'Укажите логин'});
				}
				else if(!config.Passwd){
					Console.Add({message: 'FTP Sync', stack: 'Укажите пароль'});
				}

				if(!config.IP || !config.Login || !config.Passwd){
					Ceron.cache.ftpsync[ftpuid].wait = false;

					return;
				} 

				var json = JSON.stringify(config);
				var base = btoa(json);

				var proces = Process.Add();
					proces.name('ftpsync');
					proces.work('Начало загрузки');

		        var spawn = require('child_process').spawn;

		        var total = 0, upload = 0, errors = [];

		        var parse = (data) => {
		        	data = data.trim();

		        	if(!data) return;

		        	var json = {}, method;

		        	try{
			        	json   = JSON.parse(data.trim()),
						method = json.method;
					}
					catch(e){

					}

					if(method == 'lastSyncGood'){
						this.data.userData.lastTime = json.data;
					}
					else if(method == 'uploadFile'){
						upload++;

						proces.work(upload + ' из '+total+': '+json.data.localFile);

						proces.percent(Math.round(upload / total * 100));

						if(json.data.errorMsg){
							errors.push(json.data.errorMsg);
						}
					}
					else if(method == 'uploadStat'){
						total = json.data;
					}
					else if(method == 'syncGood'){
						proces.work('Результат загрузки: '+(json.data ? 'успешно' : 'с ошибкой'));

						if(errors.length) proces.logs(errors.join("\n"));

						proces.complite();
					}
					else if(method == 'errorMsg'){
						proces.work(json.data);

						if(errors.length) proces.logs(errors.join("\n"));

						proces.error();
					}
		        }

		        setTimeout(()=>{
					var ls = spawn('worker/ftpsync/FtpSync.exe',['base64',base]);

						ls.stdout.on('data', (data) => {
							(data + '').split("\n").map(parse);
						});

						ls.stderr.on('data', (data) => {
							proces.error();
						});

						ls.on('close', (code) => {
							Ceron.cache.ftpsync[ftpuid].wait = false;
						});

				},1000);

				//надо чистить пароль
				//а то не хорошо хранить его
				try{
					this.data.varsData.input.password = '';
				}
				catch(e){}
			}

			if(Ceron.cache.ftpsync[ftpuid] == undefined){
				//а то несколько раз срабатывает
				//поэтому таймер поможет!
				setTimeout(()=>{
					Ceron.cache.ftpsync[ftpuid] = {
						wait: false,
						pass: ''
					};
				},1000);
			}
		}
	}
});
Blueprint.Worker.add('generate',{
	params: {
		name: 'File Generate',
		description: 'Выводит сообщение о том, кем был сгенерирован этот файл',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'all',
		type: 'round',
		vars: {
			input: {

			},
			output: {
				output: {

				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			try{
				var massage = nw.file.readFileSync('generate.txt', 'utf8');
					massage = massage.replace(/{ver}/gi, Ceron.package.version);
			}
			catch(e){
				Console.Add({message: 'Не удалось открыть файл', stack: 'generate.txt'});
			}
			
			this.setValue('output', massage);
		}
	}
});
Blueprint.Worker.add('get_version',{
	params: {
		name: 'Get version',
		description: 'Получить версию изменений',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {
					name: '',
					varType: 'round',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
	},
	working: {
		start: function(){
			
		},
		build: function(event){
			if(Ceron.cache.build_version == undefined){
				Ceron.cache.build_version = Math.round(Math.random() * 1e10);
			}

			this.setValue('output', Ceron.cache.build_version || 1);
		}
	}
});
Blueprint.Worker.add('html_diff',{
	params: {
		name: 'Html Diff',
		description: 'Заменят HTML в браузере если он был изменен',
		saturation: 'hsl(84, 0%, 100%)',
		alpha: 0.78,
		category: 'function',
		titleColor: '#444',
		vars: {
			input: {
				input: {
					name: 'html',
					disableChange: true
				},
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				}
			},
			output: {
				
			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input  = this.getValue('input').join('');
			var change = this.isAnyTrue(this.getValue('change'));

			if(change) Raid.ReplaceBody(input);

			this.setValue('change',change);
		}
	}
});
Blueprint.Worker.add('html_unminify',{
	params: {
		name: 'Html Unminify',
		description: 'Перевод html в читабельный вид',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'function',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var value = this.getValue('input').join("\n");

				value = nw.beautify_html(value, { indent_size: 4, space_in_empty_paren: true })
			
			this.setValue('output',value);
		}
	}
});
Blueprint.Worker.add('input',{
	params: {
		name: 'Input',
		description: 'Входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.22,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				
			},
			output: {
				output: {}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var join = $('<i class="flaticon-exit"></i>');
				join.css({
					fontSize: '15px',
					color: '#ddd',
				});
				
			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output', Blueprint.Vars.get(this.blueprintUid, 'input'));
		}
	}
});
Blueprint.Worker.add('join',{
	params: {
		name: 'Join',
		description: 'Объединить входные данные в один выход',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'blueprint',
		type: 'round',
		add_class: 'join',
		vars: {
			input: {
				input: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayTitle('');
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output',this.getValue('input'));
		}
	}
});
Blueprint.Worker.add('join_reverse',{
	params: {
		name: 'Join Reverse',
		description: 'Объединить входные данные в один выход',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'blueprint',
		type: 'round',
		add_class: 'join',
		reverse: true,
		vars: {
			input: {
				input: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayTitle('');
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output',this.getValue('input'));
		}
	}
});
Blueprint.Worker.add('list',{
	params: {
		name: 'String to list',
		description: 'Разбивает строку на список',
		saturation: 'hsl(35, 89%, 40%)',
		alpha: 0.85,
		category: 'all',
		type: 'round',
		vars: {
			input: {

			},
			output: {
				output: {
					color: '#fdbe00',
					varType: 'round',
					enableChange: true,
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-input">',
								'<textarea rows="6" name="'+name+'" placeholder="" />',
                            '</div>',
						].join(''))

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						input.find('textarea').val(event.target.getValue(entrance, name) || '');

						return input;
					}
				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var str = this.getDefault('output', 'output');
			
			this.setValue('output', str.trim().split("\n"));
		}
	}
});
Blueprint.Worker.add('merge',{
	params: {
		name: 'Merge',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		category: 'function',
		vars: {
			input: {
				a: {
					name: 'input A',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				b: {
					name: 'input B',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				join: {
					name: 'join',
					color: '#ddd',
					displayInTitle: true,
					disableVisible: true,
					value: '\\n',
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-field form-field-icon m-b-5">',
								'<div>',
									'<span class="m-r-5">Join type:</span>',
								'</div>',
								'<div>',
									'<div class="form-input">',
                                        '<input type="text" value="" name="'+name+'" placeholder="" />',
                                        '<ul class="drop"></ul>',
                                   ' </div>',
								'</div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						Form.InputDrop(input,{
							'\\n':'\\n',
							'.':'.',
							'_.':' .',
							' + ':' + ',
							' > ':' > ',
							'_':'_',
							'&nbsp;':' ',
						},true)

						input.find('input').val(event.target.getValue(entrance, name) || '.');

						return field;
					}
				}
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var j = this.getValue('join',true).join('');

			var c = {
				'\\n': "\n\r",
			};

			j = c[j] || j;
			
			var	a = this.removeEmpty(this.getValue('a',true)).join(j),
				b = this.removeEmpty(this.getValue('b',true)).join(j);
			
			var r = [a,b];
				r = this.removeEmpty(r);

			this.setValue('output',r.join(j));
		}
	}
});
Blueprint.Worker.add('merge_bigger',{
	params: {
		name: 'Merge Bigger',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		category: 'function',
		vars: {
			input: {
				a: {
					name: 'input A',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				b: {
					name: 'input B',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				c: {
					name: 'input C',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				d: {
					name: 'input D',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				e: {
					name: 'input E',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				join: {
					name: 'join',
					color: '#ddd',
					displayInTitle: true,
					disableVisible: true,
					value: '\\n',
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-field form-field-icon m-b-5">',
								'<div>',
									'<span class="m-r-5">Join type:</span>',
								'</div>',
								'<div>',
									'<div class="form-input">',
                                        '<input type="text" value="" name="'+name+'" placeholder="" />',
                                        '<ul class="drop"></ul>',
                                   ' </div>',
								'</div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						Form.InputDrop(input,{
							'\\n':'\\n',
							'.':'.',
							'_.':' .',
							' + ':' + ',
							' > ':' > ',
							'_':'_',
							'&nbsp;':' ',
						},true)

						input.find('input').val(event.target.getValue(entrance, name) || '.');

						return field;
					}
				}
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var j = this.getValue('join',true).join('');

			var c = {
				'\\n': "\n\r",
			};

			j = c[j] || j;

			var	a = this.removeEmpty(this.getValue('a',true)).join(j),
				b = this.removeEmpty(this.getValue('b',true)).join(j),
				c = this.removeEmpty(this.getValue('c',true)).join(j),
				d = this.removeEmpty(this.getValue('d',true)).join(j),
				e = this.removeEmpty(this.getValue('e',true)).join(j);
			
			var r = [a,b,c,d,e];
				r = this.removeEmpty(r);

			this.setValue('output',r.join(j));
		}
	}
});
Blueprint.Worker.add('output',{
	params: {
		name: 'Output',
		description: 'Исходящие данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.22,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				input: {},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var join = $('<i class="flaticon-login"></i>');
				join.css({
					fontSize: '15px',
					color: '#ddd',
					marginLeft: '2px'
				});
				
			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			Blueprint.Vars.set(this.blueprintUid, 'output', this.getValue('input'))
		}
	}
});
Blueprint.Worker.add('regex',{
	params: {
		name: 'Regexp',
		description: 'Находит и заменяет',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
				},
				find: {
					name: 'find',
					color: '#ddd',
					placeholder: 'Что найти'
				},
				replace: {
					name: 'replace',
					color: '#ddd',
					placeholder: 'На что заменить'
				},
				flag: {
					name: 'flag',
					color: '#ddd',
					value: 'gi'
				},
			},
			output: {
				output: {
					name: '',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input   = this.getValue('input',true).join('');
			var find    = this.getValue('find',true).join('');
			var replace = this.getValue('replace',true).join('');
			var flag    = this.getValue('flag',true).join('');

			input = input.replace(new RegExp(find, flag), replace);

			this.setValue('output', input);
		}
	}
});
Blueprint.Worker.add('replace',{
	params: {
		name: 'Replace',
		description: 'Заменяет переменную в строке, используя регулярное выражение {@varname}',
		saturation: 'hsl(139, 45%, 44%)',
		alpha: 0.67,
		category: 'function',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					disableChange: true
				},
				vars: {
					name: 'vars',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {

				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		
		build: function(){
			var data = this.getValue('input',true).join('');
			var vars = this.getValue('vars',true);

			
			for (var i = 0; i < vars.length; i++) {
				var variable = vars[i];

				if(Arrays.isObject(variable)){
					data = data.replace(new RegExp('{@'+variable.name+'}',"g"), variable.value);
				}
			}

			this.setValue('output', data);
		}
	}
});
Blueprint.Worker.add('replace_var',{
	params: {
		name: 'Set variable',
		description: 'Создает переменную для замены в функции Replace, Blueprint',
		saturation: 'hsl(29, 100%, 58%)',
		alpha: 0.33,
		category: 'function',
		vars: {
			input: {
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				},
				value: {
					name: 'value',
					color: '#ddd'
				},
			},
			output: {
				var: {
					color: '#fdbe00',
					disableChange: true
				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var name  = this.getValue('name',true).join('');
			var value = this.getValue('value',true);

			this.setValue('var', {
				name: name,
				value: value
			});
		}
	}
});
Blueprint.Worker.add('replace_var_get',{
	params: {
		name: 'Get variable',
		description: 'Получить значение из переменной',
		saturation: 'hsl(29, 100%, 58%)',
		alpha: 0.33,
		category: 'function',
		vars: {
			input: {
				var: {
					name: 'variable',
					color: '#fdbe00',
					disableChange: true
				},
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				}
			},
			output: {
				value: {
					color: '#ddd',
					disableChange: true
				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var name  = this.getValue('name',true).join('');
			var input = this.getValue('var');
			var value = [];

			input.map(function(a){
				if(Arrays.isObject(a)){
					if(a.name == name) value = a.value;
				}
			});

			this.setValue('value', value);
		}
	}
});
Blueprint.Worker.add('sass_to_css',{
	params: {
		name: 'Sass To Css',
		description: 'Sass является расширением CSS, добавляя вложенные правила, переменные, mixins, селекторное наследование и многое другое',
		saturation: 'hsl(188, 97%, 76%)',
		alpha: 0.33,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var result  = this.getValue('input').join("\n");

			try{
				result  = nw.sass.renderSync({data: result});

				this.setValue('output',result.css.toString('utf8'));
			}
			catch(e){
				Console.Add({message: 'Sass To Css', stack: e.message});
			}
		}
	}
});
Blueprint.Worker.add('scss_class',{
	params: {
		name: 'Class',
		description: 'Строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'none',
		type: 'round',
		add_class: 'css',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					varType: 'round',
					color_random: 'random'
				}
			},
			output: {
				output: {
					name: '',
					enableChange: true,
					displayInTitle: true,
					varType: 'round',
					color: '#ddd',
					color_random: 'random'
				},
			}
		},
	},
	on: {
		create: function(event){
			var data = event.target.data.userData;

			if(data.custom && data.custom[0] == ':'){
				data.join = true;
			}
		},
		remove: function(){

		},
		init: function(event){
			var data    = event.target.data.userData;
			var working = parent.Blueprint.Worker.get('scss_class').working;

			var join = $((data.uid ? '<i class="flaticon-tabs" style="margin-right: 5px"></i> ' : '') + '<span style="cursor: pointer">&</span>');
				join.on('click',function(){
					$(this).toggleClass('active');

					data.join = $(this).hasClass('active');

					status(data.join);

					Blueprint.Callback.Program.fireChangeEvent({type: 'scss_join'}); 
				})

			var status = function(joined){
				if(joined){
					join.css({
						color: '#fdbe00',
						opacity: 1
					})
				}
				else{
					join.css({
						color: '#ddd',
						opacity: 0.5
					})
				}
			}

			status(false);

			if(data.join) join.addClass('active'), status(true);

			event.target.setDisplayInTitle( working.decode( working.search(data.custom || data.uid) || data.custom || 'Не найдено' ) );
			event.target.setDisplayTitle(join);

			Blueprint.Callback.Program.addEventListener('update', function(){
				event.target.setDisplayInTitle( working.decode( working.search(data.custom || data.uid) || data.custom || 'Не найдено' ) );
			})

			Blueprint.Callback.Program.addEventListener('highlight', function(e){
				if(data.lastBuild == e.name) event.target.node.addClass('active');
				else                         event.target.node.removeClass('active');
			})
		}
	},
	working: {
		search: function(nameOrUid){
			var found, name = Generators.Css._check(nameOrUid);

			if(Data.css[nameOrUid]) found = '{@css-'+nameOrUid+'}';//Data.css[nameOrUid].fullname;

			if(name) found = name.fullname;

			return found;
		},
		decode: function(css){
			return Generators.Build.decode( css );
		},
		start: function(){
			
		},
		build: function(){
			var data  = this.data.userData;
			var join  = data.join ? '' : ' ';

			var search = this.worker.working.search(data.uid || data.custom);
			var name   = search ? search : data.custom || 'not-found';

			var input  = this.getValue('input',true);
			var output = name;

			var output = [];

			if(input.length){
				output = input.map(function(a){
					return a + join + (data.uid && search ? '.' : '') + name;
				})
			}
			else{
				output.push(name);
			}
			
			data.lastBuild = output.join(', .');

			this.setValue('output', output);
		}
	}
});
Blueprint.Worker.add('scss_merge',{
	params: {
		name: 'Extend',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		titleColor: '#fdbe00',
		category: 'none',
		add_class: 'css',
		vars: {
			input: {
				a: {
					name: 'from class',
					color: '#ddd',
					colorText: '#ddd',
					varType: 'round',
					disableChange: true
				},
				b: {
					name: 'to class',
					color: '#ddd',
					colorText: '#ddd',
					varType: 'round',
					disableChange: true
				},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var a_i = this.getValue('a',true);
			var a_o = [];

			var b_i = this.getValue('b',true);
			var b_o = [];

			for (var i = 0; i < a_i.length; i++) {
				a_o = a_o.concat(a_i[i]);
			}

			for (var i = 0; i < b_i.length; i++) {
				b_o = b_o.concat(b_i[i]);
			}

			this.data.userData.input_a = a_o.join(', .');
			this.data.userData.input_b = b_o.join(', .');
		}
	}
});
Blueprint.Worker.add('scss_sheet',{
	params: {
		name: 'Style Sheet',
		description: '',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		titleColor: '#a8da47',
		category: 'none',
		type: 'round',
		add_class: 'css',
		random_line_color: true,
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					varType: 'round',
				}
			},
			output: {

			}
		},
	},
	on: {
		create: function(event){
			var uid = Blueprint.Utility.uid();

			event.target.data.userData.uid = uid;

			parent.Blueprint.Worker.get('scss_sheet').working.create(uid);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('scss_sheet').working.remove(event.target.data.userData.uid);
		},
		init: function(event){
			event.target.setDisplayTitle('<i class="flaticon-app" style="font-size: 15px; margin-right: 5px"></i>Style Sheet');
		}
	},
	working: {
		create: function(uid, data){
			Data.css[uid] = {
				name: '',
				media: {}
			};
		},
		remove: function(uid){
			delete Data.css[uid];
		},
		start: function(){
			
		},
		build: function(){
			var uid    = this.data.userData.uid;
			var input  = this.getValue('input',true);
			var output = [];

			if(input.length){
				for (var i = 0; i < input.length; i++) {
					output = output.concat(input[i]);
				}
			}
			
			Data.css[uid].fullname = this.data.userData.lastBuild = output.join(', .');
		}
	}
});
Blueprint.Worker.add('server_update',{
	params: {
		name: 'Browser Reload',
		description: 'Обновит страницу браузера, если simple или stream будет присвоено true',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'function',
		vars: {
			input: {
				simple: {
					name: 'simple',
					color: '#7bda15',
					disableChange: true,
				},
				stream: {
					name: 'stream',
					color: '#7bda15',
					disableChange: true,
				},
				files: {
					name: 'files',
					color: '#ddd',
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-input">',
								'<textarea rows="6" name="'+name+'" placeholder="Перечислите файлы с новой строки" />',
                            '</div>',
						].join(''))

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						input.find('textarea').val(event.target.getValue(entrance, name) || '');

						return input;
					}
				}
			},
			output: {
				simple: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
				stream: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var simple = this.getValue('simple',true);
			var stream = this.getValue('stream',true);

			var se = sm = false;

			function check(arr){
				for (var i = 0; i < arr.length; i++) {
					var a = arr[i];

					if(Arrays.isArray(a)) check(a);
					else if(a) se = true;
				}
			}

			check(simple);

			for (var i = 0; i < stream.length; i++) {
				if(stream[i]) sm = true;
			}

			var files         = this.getValue('files'),
				files_default = this.getDefault('input','files');

			var files_reload = [];

			if(files.length) files_reload = files;
			else if(files_default){
				files_reload = files_default.split("\n");
			}

			if(se) Server.Reload();
			else if(sm) Server.Reload(files_reload);

			this.setValue('simple',se);
			this.setValue('stream',sm);
		}
	}
});
Blueprint.Worker.add('string',{
	params: {
		name: 'String',
		description: 'Строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				input: {
					enableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					name: '',
					enableChange: true,
					displayInTitle: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input  = this.getValue('input',true);
			var output = this.getDefault('output', 'output')

				output = input ? input + output : output;

			this.setValue('output', output);
		}
	}
});
Blueprint.Worker.add('string_change',{
	params: {
		name: 'String change',
		description: 'Проверяет изменилась ли строки',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'function',
		vars: {
			input: {
				data: {
					name: 'data',
					color: '#ddd',
					disableChange: true,
				},
			},
			output: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var data = this.getValue('data',true).join('');

			if(this.data.userData.cache_uid == undefined) this.data.userData.cache_uid = Functions.Uid();

			var cache_name = 'string_' + this.data.userData.cache_uid,
				cache_data = Ceron.cache[cache_name];

			var change = false, data_hash = Functions.StringHash(data);

			if(cache_data !== data_hash){
				change = true;

				Ceron.cache[cache_name] = data_hash;
			}

			this.setValue('change', change);
		}
	}
});
Blueprint.Worker.add('switch',{
	params: {
		name: 'Switch',
		description: 'Переключатель',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				input: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var data = event.target.data.userData;

			if(data.enable == undefined) data.enable = true;

			var join = $('<i class="flaticon-app"></i>');
				join.css({
					fontSize: '15px',
					cursor: 'pointer',
					color: '#ddd',
					marginLeft: '2px'
				});

				join.on('click',function(){
					$(this).toggleClass('active');

					data.enable = $(this).hasClass('active');

					status(data.enable);
				})

			var status = function(enable){
				join.removeClass('flaticon-multiply flaticon-app')

				if(enable){
					join.css({
						opacity: 1
					}).addClass('flaticon-app')
				}
				else{
					join.css({
						opacity: 0.5
					}).addClass('flaticon-multiply')
				}
			}

			status(false);

			if(data.enable) join.addClass('active'), status(true);

			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			if(this.data.userData.enable) this.setValue('output',this.getValue('input'));
		}
	}
});
Blueprint.Worker.add('vtc_clear',{
	params: {
		name: 'VTC Clear',
		description: 'Чистит код от атрибутов data-vcid',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'vtc',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var value = this.getValue('input').join("");

				value = value.replace(new RegExp(' data-vcid=\"[^\"]+\"', 'gi'), '');
			
			this.setValue('output',value);
		}
	}
});
Blueprint.Worker.add('vtc_live',{
	params: {
		name: 'VTC Live',
		description: 'Вставить свой HTML код в живой просмотр VTC',
		saturation: 'hsl(191, 100%, 40%)',
		alpha: 0.77,
		category: 'vtc',
		vars: {
			input: {
				html: {
					name: 'html',
					color: '#ddd',
					disableChange: true
				},
				update: {
					name: 'update',
					color: '#7bda15',
					disableChange: true
				},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var html   = this.getValue('html',true).join('');
			var update = this.getValue('update',true);

			var change = false;

			for (var i = 0; i < update.length; i++) {
				if(update[i]) change = true;
			}

			if(VTC.Live){
				VTC.Live.includeHtml(html, change);
			}
		}
	}
});
Blueprint.Worker.add('vtc_render',{
	params: {
		name: 'VTC Render',
		description: 'Возвращает скомпилированный html код шаблона',
		saturation: 'hsl(139, 45%, 44%)',
		alpha: 0.67,
		category: 'vtc',
		vars: {
			input: {
				template: {
					name: 'template',
					placeholder: 'Название шаблона в VTC',
					color: '#ddd',
					display: true
				},
				vars: {
					name: 'vars',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {

				},
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var data = '';
			var name = this.getValue('template',true).join('');
			var vars = this.getValue('vars',true);

			var template;

			var match = Functions.SeachTPL('title',name);

			if(match && !match.data.isFolder){
				template = Data.vtc.tpl[match.data.key];
			}

			if(template){
				data = VTC.Build.template(template, match.data.key);
			}
			else{
				Console.Add({message: 'Не найден шаблон', stack: name});
			}

			for (var i = 0; i < vars.length; i++) {
				var variable = vars[i];

				if(Arrays.isObject(variable)){
					data = data.replace(new RegExp('{@'+variable.name+'}',"g"), variable.value);
				}
			}

			//да бы не срабатывало обновление постоянно, ставим кеш
			if(Ceron.cache.vtc_render == undefined) Ceron.cache.vtc_render = {};

			var cache_name = 'render_' + name,
				cache_data = Ceron.cache.vtc_render[cache_name];

			var change = false, data_hash = Functions.StringHash(data);

			if(cache_data !== data_hash){
				change = true;

				Ceron.cache.vtc_render[cache_name] = data_hash;
			}

			data = data.replace(new RegExp('{@(.*?)}',"g"),''); //затираем лишнии переменные

			this.setValue('output', data);
			this.setValue('change', change);
		}
	}
});