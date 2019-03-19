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
					inputType: 'password'
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
			var ftpuid = this.data.uid;
			var change = Blueprint.Utility.onChange(this.getValue('change',true));

			if(Ceron.cache.ftpsync == undefined) Ceron.cache.ftpsync = {};

			if(Ceron.cache.ftpsync[ftpuid] !== undefined && !Ceron.cache.ftpsync[ftpuid].wait && change){
				Ceron.cache.ftpsync[ftpuid].wait = true;

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

				if(config.Passwd){
					Ceron.cache.ftpsync[ftpuid].pass = config.Passwd;
				}
				else if(Ceron.cache.ftpsync[ftpuid].pass){
					config.Passwd = Ceron.cache.ftpsync[ftpuid].pass;
				}

				if(!config.IP){
					Console.Add({message: 'FTP Sync', stack: 'Укажите IP сервера'});
				}
				else if(!config.Login){
					Console.Add({message: 'FTP Sync', stack: 'Укажите логин'});
				}
				else if(!config.Passwd){
					Console.Add({message: 'FTP Sync', stack: 'Укажите пароль'});
				}

				if(!config.IP || !config.Login || !config.Passwd){
					Ceron.cache.ftpsync[ftpuid].wait = false;

					return;
				} 

				var json = JSON.stringify(config);
				var base = btoa(json);

				var proces = Process.Add();
					proces.name('ftpsync');
					proces.work('Начало загрузки');

		        var spawn = require('child_process').spawn;

		        var total = 0, upload = 0, errors = [];

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

		        setTimeout(()=>{
					var ls = spawn('worker/ftpsync/FtpSync.exe',['base64',base]);

						ls.stdout.on('data', (data) => {
							(data + '').split("\n").map(parse);
						});

						ls.stderr.on('data', (data) => {
							proces.error();
						});

						ls.on('close', (code) => {
							Ceron.cache.ftpsync[ftpuid].wait = false;
						});

				},1000);

				//надо чистить пароль
				//а то не хорошо хранить его
				try{
					this.data.varsData.input.password = '';
				}
				catch(e){}
			}

			if(Ceron.cache.ftpsync[ftpuid] == undefined){
				//а то несколько раз срабатывает
				//поэтому таймер поможет!
				setTimeout(()=>{
					Ceron.cache.ftpsync[ftpuid] = {
						wait: false,
						pass: ''
					};
				},1000);
			}
		}
	}
});