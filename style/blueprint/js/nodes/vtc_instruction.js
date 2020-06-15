Blueprint.Worker.add('vtc_instruction',{
	params: {
		name: 'VTC Instruction',
		description: 'Создать инструкцию',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'none',
		unclosed: true,
		deprecated: true,
		vars: {
			input: {
				perform: {
					name: 'perform',
					color: '#7bda15',
					disableChange: true,
					allowed: ['vtc_perform']
				},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(event){
			var uid = Blueprint.Utility.uid();

			event.target.data.userData.uid = uid;
		},
		remove: function(event){
			parent.Blueprint.Worker.get('vtc_instruction').working.remove(event.target.data.userData.uid);
		},
		close: function(event){
			parent.Blueprint.Worker.get('vtc_instruction').working.remove(event.target.data.userData.uid);
		},
		init: function(){
			
		}
	},
	working: {
		start: function(){
			
		},
		remove: function(uid){
			delete Data.vtc.instructions[uid];
		},
		build: function(){
			var uid     = this.data.userData.uid;
			var perform = this.getValue('perform');

			Data.vtc.instructions[uid] = Arrays.clone(perform);
		}
	}
});