Blueprint.Worker.add('css_custom_font',{
	params: {
		name: 'Custom Font',
		description: 'Подключение шрифта через @font-face',
		saturation: 'hsl(191, 61%, 56%)',
		titleColor: '#ffffff',
		alpha: 0.41,
		category: 'css',
		vars: {
			input: {
				name: {
					name: 'Font Name',
					color: '#ddd',
					display: true,
					displayInTitle: true,
				},

				Thin: {
					name: '100 Thin',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ThinItalic: {
					name: '100 ThinItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				ExtraLight: {
					name: '200 ExtraLight',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ExtraLightItalic: {
					name: '200 ExtraLightItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Light: {
					name: '300 Light',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				LightItalic: {
					name: '300 LightItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Regular: {
					name: '400 Regular',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				RegularItalic: {
					name: '400 RegularItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Medium: {
					name: '500 Medium',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				MediumItalic: {
					name: '500 MediumItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Semibold: {
					name: '600 Semibold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				SemiboldItalic: {
					name: '600 SemiboldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Bold: {
					name: '700 Bold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				BoldItalic: {
					name: '700 BoldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				ExtraBold: {
					name: '800 ExtraBold',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				ExtraBoldItalic: {
					name: '800 ExtraBoldItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},

				Black: {
					name: '900 Black',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
				BlackItalic: {
					name: '900 BlackItalic',
					color: '#ddd',
					type: 'fileOpen',
					display: true
				},
			},
			output: {
				output: {},
			}
		},
	},
	on: {
		init: function(event){
			event.target.addEventListener('setValue',function(e){
				if(e.name !== 'name'){
					if(!this.getValue('input', e.name)){
						this.setValue('input', e.name, parent.Blueprint.Worker.get('css_custom_font').working.name(e.value));

						this.showOptionAgain();
					}
				}
				else{
					this.setDisplayInTitle(e.value);

					Blueprint.Render.draw();
				}
			});
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		name: function(path){
			return nw.path.basename(path, nw.path.extname(path));
		},
		start: function(){
			
		},
		build: function(){
			var font_name = this.getValue('name',true).join('');

			var weights = {
		        'Thin': '100',
		        'ThinItalic': '100',

		        'ExtraLight': '200',
		        'ExtraLightItalic': '200',

		        'Light': '300',
		        'LightItalic': '300',

		        'Regular': '400',
		        'RegularItalic': '400',

		        'Medium': '500',
		        'MediumItalic': '500',

		        'Semibold': '600',
		        'SemiboldItalic': '600',

		        'Bold': '700',
		        'BoldItalic': '700',

		        'ExtraBold': '800',
		        'ExtraBoldItalic': '800',

		        'Black': '900',
		        'BlackItalic': '900',
		    };

		    var formats = {
				eot: 'embedded-opentype',
				woff2: 'woff2',
				woff: 'woff',
				ttf: 'truetype',
				svg: 'svg',
				otf: 'opentype'
			};

		    var fonts = [];

		    var checkFileExist = function(path){
		    	nw.file.existsSync(path)
		    }

		    for(var name in weights){
		    	var weight = weights[name];
		    	var path   = this.getValue(name,true).join('');

		    	if(!path) continue;

		    	var folder = path.split('.');
		    		folder.pop();
		    		folder = folder.join('.');

		    	var style  = /Italic/.test(name) ? 'italic' : 'normal';
		    	var urls   = [];

		    	for(var fr in formats){
		    		var newPath = folder + '.' + fr;

		    		if(nw.file.existsSync(Functions.LocalPath(newPath))){
		    			urls.push('url("' + Functions.NormalPath(Functions.AssetPath(Data.path.img, newPath)) + '") format("'+formats[fr]+'")');
		    		}
		    	}

				var font = [
					'@font-face {',
					    '	font-family: "' + font_name + '";',
					    '	src: ',
					    //'	src: local("' + font_name + '"), local("'+font_name+'-'+name+'"),',
					    '	'+urls.join(",\n    ")+';',
					    '	font-weight: '+weight+';',
					    '	font-style: '+style+';',
					'}',
				].join("\n");

				fonts.push(font);
		    }

			this.setValue('output',fonts.join("\n"));
		}
	}
});