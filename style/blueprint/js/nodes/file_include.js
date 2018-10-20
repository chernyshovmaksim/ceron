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