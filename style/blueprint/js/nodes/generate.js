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