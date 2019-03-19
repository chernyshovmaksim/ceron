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