Blueprint.Worker.add('scss_merge',{
	params: {
		name: 'Extend',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		titleColor: '#fdbe00',
		category: 'none',
		add_class: 'css',
		vars: {
			input: {
				a: {
					name: 'from class',
					color: '#ddd',
					colorText: '#ddd',
					varType: 'round',
					disableChange: true
				},
				b: {
					name: 'to class',
					color: '#ddd',
					colorText: '#ddd',
					varType: 'round',
					disableChange: true
				},
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
			var a_i = this.getValue('a',true);
			var a_o = [];

			var b_i = this.getValue('b',true);
			var b_o = [];

			for (var i = 0; i < a_i.length; i++) {
				a_o = a_o.concat(a_i[i]);
			}

			for (var i = 0; i < b_i.length; i++) {
				b_o = b_o.concat(b_i[i]);
			}

			this.data.userData.input_a = a_o.join(', .');
			this.data.userData.input_b = b_o.join(', .');
		}
	}
});