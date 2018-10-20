Blueprint.Worker.add('scss_sheet',{
	params: {
		name: 'Style Sheet',
		description: '',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		titleColor: '#3e3729',
		category: 'none',
		type: 'round',
		vars: {
			input: {
				input: {
					name: '',
					color: '#fff',
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
			event.target.setDisplayTitle('<i class="flaticon-app" style="font-size: 15px"></i> Style Sheet');
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
			var output = this.getValue('input',true).join(', .');

			this.data.userData.lastBuild = output;

			Data.css[uid].fullname = output;

			this.setValue('output', output);
		}
	}
});