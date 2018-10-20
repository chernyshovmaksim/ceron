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