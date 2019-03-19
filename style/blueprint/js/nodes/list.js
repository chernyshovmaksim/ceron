Blueprint.Worker.add('list',{
	params: {
		name: 'String to list',
		description: 'Разбивает строку на список',
		saturation: 'hsl(35, 89%, 40%)',
		alpha: 0.85,
		category: 'all',
		type: 'round',
		vars: {
			input: {

			},
			output: {
				output: {
					color: '#fdbe00',
					varType: 'round',
					enableChange: true,
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-input">',
								'<textarea rows="6" name="'+name+'" placeholder="" />',
                            '</div>',
						].join(''))

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						input.find('textarea').val(event.target.getValue(entrance, name) || '');

						return input;
					}
				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var str = this.getDefault('output', 'output');
			
			this.setValue('output', str.trim().split("\n"));
		}
	}
});