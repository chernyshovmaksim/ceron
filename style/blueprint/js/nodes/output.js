Blueprint.Worker.add('output',{
	params: {
		name: 'Output',
		description: 'Исходящие данные',
		saturation: 'hsl(294, 29%, 17%)',
		category: 'blueprint',
		type: 'round',
		vars: {
			input: {
				input: {},
			},
			output: {
				
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
			Blueprint.Vars.set(this.blueprintUid, 'output', this.getValue('input'))
		}
	}
});