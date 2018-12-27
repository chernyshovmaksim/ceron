Blueprint.Worker.add('ftpsync',{
	params: {
		name: 'FTP Sync',
		description: 'Заливает файлы на FTP если они были изменены',
		saturation: 'hsl(0, 89%, 72%)',
		alpha: 0.98,
		category: 'file',
		titleColor: '#883232',
		vars: {
			input: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
				ip: {
					name: 'server',
					color: '#ddd',
				},
				login: {
					name: 'user login',
					color: '#ddd',
				},
				password: {
					name: 'user password',
					color: '#ddd',
				},
				ftp_folder: {
					name: 'folder ftp',
					color: '#ddd',
				},
				local_folder: {
					name: 'folder local',
					color: '#ddd',
					type: 'fileDir'
				},
				full: {
					disableVisible: true,
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-btn form-btn-red">Очистить дату изменений</div>',
						].join(''))

						field.on('click', function(){
							event.data.userData.lastTime = '01.01.0001 0:00:00';

							Functions.Notify('Дата очишина');
						})

						return field;
					}
				}
			},
			output: {

			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
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
			var change = Blueprint.Utility.onChange(this.getValue('change',true));

			if(Ceron.cache.ftpsync !== undefined && !Ceron.cache.ftpsync && change){
				Ceron.cache.ftpsync = true;

				var name     = this.getValue('name').join('');
				var execFile = require('child_process').execFile;

				var config = {
					IP:           this.getValue('ip',true).join(''),
					Login:        this.getValue('login',true).join(''),
					Passwd:       this.getValue('password',true).join(''),
					FtpFolder:    this.getValue('ftp_folder',true).join(''),
					LocalFolder:  Functions.LocalPath(this.getValue('local_folder',true).join('')),
					LastSyncGood: this.data.userData.lastTime
				}

				var json = JSON.stringify(config);
				var base = btoa(json);

				var proces = Process.Add();
					proces.name('ftpsync');
					proces.work('Начало загрузки');

		        var spawn = require('child_process').spawn;

		        var total = upload = 0, errors = [];

		        var parse = (data) => {
		        	data = data.trim();

		        	if(!data) return;

		        	var json = {}, method;

		        	try{
			        	json   = JSON.parse(data.trim()),
						method = json.method;
					}
					catch(e){

					}

					if(method == 'lastSyncGood'){
						this.data.userData.lastTime = json.data;
					}
					else if(method == 'uploadFile'){
						upload++;

						proces.work(upload + ' из '+total+': '+json.data.localFile);

						proces.percent(Math.round(upload / total * 100));

						if(json.data.errorMsg){
							errors.push(json.data.errorMsg);
						}
					}
					else if(method == 'uploadStat'){
						total = json.data;
					}
					else if(method == 'syncGood'){
						proces.work('Результат загрузки: '+(json.data ? 'успешно' : 'с ошибкой'));

						if(errors.length) proces.logs(errors.join("\n"));

						proces.complite();
					}
					else if(method == 'errorMsg'){
						proces.work(json.data);

						if(errors.length) proces.logs(errors.join("\n"));

						proces.error();
					}
		        }
				
				var ls = spawn('worker/ftpsync/FtpSync.exe',['base64',base]);

					ls.stdout.on('data', (data) => {
						(data + '').split("\n").map(parse);
					});

					ls.stderr.on('data', (data) => {
						console.log(`stderr: ${data}`);

						proces.error();
					});

					ls.on('close', (code) => {
						Ceron.cache.ftpsync = false;
					});
			}

			if(Ceron.cache.ftpsync == undefined){
				//а то несколько раз срабатывает
				//поэтому таймер поможет!
				setTimeout(()=>{
					Ceron.cache.ftpsync = false;
				},1000);
			}
		}
	}
});