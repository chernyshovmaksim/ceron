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