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
				input: {},
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

			if(Blueprint.Program._start_save && Ceron.connected){
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