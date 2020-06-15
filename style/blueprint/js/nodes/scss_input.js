Blueprint.Worker.add('scss_input',{
	params: {
		name: 'Input',
		description: '',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		titleColor: '#fdbe00',
		category: 'none',
		type: 'round',
		add_class: 'css',
		random_line_color: true,
		vars: {
			input: {
				
			},
			output: {
				output: {
					name: '',
					color: '#ddd',
					varType: 'round',
				}
			}
		},
	},
	on: {
		create: function(event){
			parent.Blueprint.Worker.get('scss_input').working.create(event.target.uid);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('scss_input').working.remove(event.target.uid);
		},
		init: function(event){
			var data    = event.target.data.userData;
			var working = parent.Blueprint.Worker.get('scss_input').working;

			event.target.node.dblclick(function(){

				working.rename({
					type: 'input',
					data: data,
					uid:  event.target.uid
				}, ()=>{
					event.target.setDisplayTitle('<i class="flaticon-layers" style="font-size: 15px; margin-right: 5px"></i>Input ('+(data.name || '...')+')');

					Blueprint.Render.draw();
				});
				
			})

			event.target.setDisplayTitle('<i class="flaticon-layers" style="font-size: 15px; margin-right: 5px"></i>Input ('+(data.name || '...')+')');
		}
	},
	working: {
		create: function(uid){
			Data.vtc.scssInputs[uid] = '';
		},
		remove: function(uid){
			delete Data.vtc.scssInputs[uid];
		},
		rename: function(params, call){
			swal("Название", {
				content: {
					element: "input",
					attributes: {
						value: params.data.name || '',
					}
				}
            }).then((new_name) => {
                params.data.name = new_name;

                if(Data.vtc.scssEnters[params.data.name] == undefined){
                	Data.vtc.scssEnters[params.data.name] = {};
                }

                if(params.type == 'input'){
                	Data.vtc.scssInputs[params.uid] = new_name;
                }

                call(new_name);

                Ceron.VTCGlobal.scss.build();

                Generators.Build.Css();
            })
		},
		start: function(){
			
		},
		build: function(){
			var data  = this.data.userData;
			var input = Data.vtc.scssEnters[data.name] || {};

			var lines = [];

			for(var a in input){
				lines.push(input[a]);
			}

			this.setValue('output', lines);
		}
	}
});