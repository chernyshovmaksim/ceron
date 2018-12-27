Blueprint.Worker.add('blueprint',{
	params: {
		name: 'Blueprint',
		description: '',
		saturation: 'hsl(169, 95%, 19%)',
		alpha: 0.82,
		category: 'blueprint',
		type: 'round',
		vars: {
			input: {
				input: {},
			},
			output: {
				output: {}
			}
		},
		inmenu: false
	},
	on: {
		create: function(event){
			
		},
		remove: function(event){
			
		},
		init: function(event){
			var blueprint = parent.Blueprint.Program.data[event.data.blueprintUid];

			if(blueprint) $('.display-subtitle',event.target.node).text('('+blueprint.name+')')
		},
		blueprintChangeParams: function(event){
			$('.display-title',event.target.node).text('Blueprint Content ('+event.add.name+')')
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			//устанавливаем глобальные значения
			Blueprint.Vars.set(this.data.userData.blueprintUid, 'input', this.getValue('input'));
			
			//выполняем воркер
			Blueprint.Program.blueprintBuild(this.data.userData.blueprintUid);
			
			//записываем результат
			this.setValue('output', Blueprint.Vars.get(this.data.userData.blueprintUid, 'output'));
		}
	}
});