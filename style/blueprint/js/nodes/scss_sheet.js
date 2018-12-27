Blueprint.Worker.add('scss_sheet',{
	params: {
		name: 'Style Sheet',
		description: '',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		titleColor: '#a8da47',
		category: 'none',
		type: 'round',
		add_class: 'css',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					varType: 'round',
				}
			},
			output: {

			}
		},
	},
	on: {
		create: function(event){
			var uid = Blueprint.Utility.uid();

			event.target.data.userData.uid = uid;

			parent.Blueprint.Worker.get('scss_sheet').working.create(uid);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('scss_sheet').working.remove(event.target.data.userData.uid);
		},
		init: function(event){
			event.target.setDisplayTitle('<i class="flaticon-app" style="font-size: 15px; margin-right: 5px"></i>Style Sheet');
		}
	},
	working: {
		create: function(uid, data){
			Data.css[uid] = {
				name: '',
				media: {}
			};
		},
		remove: function(uid){
			delete Data.css[uid];
		},
		start: function(){
			
		},
		build: function(){
			var uid    = this.data.userData.uid;
			var input  = this.getValue('input',true);
			var output = [];

			if(input.length){
				for (var i = 0; i < input.length; i++) {
					output = output.concat(input[i]);
				}
			}
			
			Data.css[uid].fullname = this.data.userData.lastBuild = output.join(', .');
		}
	}
});