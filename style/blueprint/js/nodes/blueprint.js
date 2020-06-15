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
				cycle: {
					name: 'cycle',
					color: '#ddd',
					value: 'false',
					disableVisible: true,
					type: function(entrance, group, fieldname, params, event){
						var field = $([
							'<div class="form-field form-field-space form-field-align-center">',
								'<div>Использовать как цикл:</div>',
								'<div>',
									'<ul class="form-radio">',
                                        '<li name="false"><img src="style/img/icons/none.png" alt=""></li>',
                                        '<li name="true"><img src="style/img/icons/ok.png" alt=""></li>',
                                    '</ul>',
								'</div>',
							'</div>'
						].join(''));

						Form.RadioChangeEvent($('.form-radio',field),function(value){
							event.target.setValue(entrance, fieldname, value);
						});

						Form.RadioSetValue($('.form-radio',field),event.target.getValue(entrance, fieldname));

						return field;
					}
				},
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

			if(blueprint) $('.display-subtitle',event.target.node).text('('+blueprint.name+')');
		},
		blueprintChangeParams: function(event){
			$('.display-subtitle',event.target.node).text('('+event.add.name+')');

			Blueprint.Render.draw();
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var cycle = this.getValue('cycle',true).join('') == 'true';

			if(cycle){
				var input_data  = this.getValue('input');
				var output_data = [];

				for (var i = 0; i < input_data.length; i++) {
					var input = input_data[i];

					Blueprint.Vars.set(this.data.userData.blueprintUid, 'input', input);
				
					//выполняем воркер
					Blueprint.Program.blueprintBuild(this.data.userData.blueprintUid);
					
					output_data.push(Blueprint.Vars.get(this.data.userData.blueprintUid, 'output'))
				}

				this.setValue('output', output_data);
			}
			else{
				//устанавливаем глобальные значения
				Blueprint.Vars.set(this.data.userData.blueprintUid, 'input', this.getValue('input'));
				
				//выполняем воркер
				Blueprint.Program.blueprintBuild(this.data.userData.blueprintUid);
				
				//записываем результат
				this.setValue('output', Blueprint.Vars.get(this.data.userData.blueprintUid, 'output'));
			}
		}
	}
});