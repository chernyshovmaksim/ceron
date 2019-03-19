Blueprint.Worker.add('css_result',{
	params: {
		name: 'Css Result',
		description: 'Вывод результата в формате css',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'css',
		vars: {
			input: {
				list: {
					name: 'list',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {
					name: 'all',
					color: '#ddd',
					varType: 'round',
					disableChange: true
				},
				main: {
					name: 'main',
					color: '#ddd',
					disableChange: true,
				},
				cascade: {
					name: 'cascade',
					color: '#ddd',
					disableChange: true,
				},
				media: {
					name: 'media',
					color: '#ddd',
					disableChange: true,
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
			var lis = this.getValue('list');
			var any = this.isAnyTrue(lis);
			
			var css = Generators.Build.Css(true,{
				toObject: true,
				list: any ? lis : false
			});

			this.setValue('main', css.main);
			this.setValue('cascade', css.cascade);
			this.setValue('media', css.media);

			this.setValue('output', [css.main, css.cascade, css.media].join("\n"));
		},
	}
});