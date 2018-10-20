Blueprint.Worker.add('input',{
	params: {
		name: 'Input',
		description: 'Входные данные',
		saturation: 'hsl(294, 29%, 17%)',
		category: 'blueprint',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {}
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
			//console.log(this)
			//console.log('input',this.blueprintUid,Blueprint.Vars.get(this.blueprintUid, 'input'))
			this.setValue('output', Blueprint.Vars.get(this.blueprintUid, 'input'));
		}
	}
});