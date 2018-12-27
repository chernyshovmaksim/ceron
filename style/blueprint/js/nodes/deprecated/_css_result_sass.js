Blueprint.Worker.add('sass_result',{
	params: {
		name: 'Sass Result',
		description: 'Вывод результата в формате sass',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		titleColor: '#3e3729',
		category: 'css',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {
					disableChange: true
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
			this.setValue('output', Generators.Build.Sass());
		},
	}
});