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
				Functions.AutoprefixerPrintError({
					result: result,
					message: e.message,
					title: 'Blueprint - (autoprefixer) error: '
				});
			}
			
			this.setValue('output',result);
		}
	}
});