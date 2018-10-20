Blueprint.Worker.add('blueprint_build',{
	params: {
		name: 'Blueprint Build',
		description: 'Событие на компиляцию кода Blueprint',
		saturation: 'hsl(188, 97%, 76%)',
		alpha: 0.43,
		category: 'function',
		vars: {
			input: {
				
			},
			output: {
				build: {
					name: 'onBuild',
					color: '#7bda15',
					disableChange: true,
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
			this.setValue('build',true);
		}
	}
});