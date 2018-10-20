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