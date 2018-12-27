Blueprint.Worker.add('generate',{
	params: {
		name: 'File Generate',
		description: 'Выводит сообщение о том, кем был сгенерирован этот файл',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'all',
		type: 'round',
		vars: {
			input: {

			},
			output: {
				output: {

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
			var massage = [
		        '/*!',
		        ' * Ceron v'+Ceron.package.version,
		        ' * Copyright (c) 2018 Ceron, Inc.',
		        ' * Website: https://ceron.pw',
		        ' * ',
		        ' * ВНИМАНИЕ!',
		        ' * --------',
		        ' * Этот файл сгенерирован программой Ceron, все дальнейшие изменения файла будут утеряны!',
		        ' * Вносить изменения в файл можно если вы на 100% уверены что верстка полностью готова и больше не будет не каких изменений!',
		        ' * Если же вам нужно что-то поменять, то пожалуйста создайте дополнительный файл и там вносите изменения',
		        ' * ',
		        ' * PS. Я вас предупредил! :) ',
		        ' */',
		    ].join("\n")

			this.setValue('output', massage);
		}
	}
});