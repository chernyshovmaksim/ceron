Blueprint.Worker.add('minify_css',{
	params: {
		name: 'MinifyCSS',
		description: 'Сжимает CSS код',
		saturation: 'hsl(47, 100%, 83%)',
		alpha: 0.66,
		category: 'function',
		type: 'round',
		vars: {
			input: {
				input: {
					varType: 'round',
					color: '#ddd'
				},
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

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input  = this.getValue('input');

			var uglifycss = require('uglifycss');

			var uglified = uglifycss.processString(input.join(''),
			    { 
			    	maxLineLen: 500, 
			    	expandVars: true,
			    	cuteComments: true 
			    }
			);

			this.setValue('output', uglified);
		}
	}
});