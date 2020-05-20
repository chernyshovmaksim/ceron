Ceron.modules.PackageManager = function(){
	var self = this;

    this.Init = function(){
        Generators.Module.GetHtml('package-manager',function(html){

            self.module = $(html);
            self.items  = $('.package-list',self.module);
            self.box    = $('.package-box',self.module).hide();

            $('.libs',self.module).on('click',function(){
                var input = $('input',this);

                File.Choise('fileDir',function(folder){
                    Config.config.packageLibs = Functions.NormalPath(folder);

                    input.val(Config.config.packageLibs);

                    Config.Save();

                    self.BuildList();
                },Config.config.packageLibs ?  nw.path.normalize(Config.config.packageLibs) : '');

            }).find('input').val(Config.config.packageLibs || '');

            $('.reload',self.module).on('click', function(){
                if(Config.config.packageLibs) self.BuildList();
            })

            if(Config.config.packageLibs){
                self.BuildList();
            }

            Generators.Module.AddToTool(self.module);
        })
    }

    this.BuildList = function(){
        self.items.empty();
        self.box.hide();

        var folder = Config.config.packageLibs;
        var eny    = false;
        var ven    = Functions.LocalPath('vendor');
        var sort   = [];

        var params = File.GetJson(nw.path.join(folder,'package.json'));

        if(params.sort && Arrays.isArray(params.sort)) sort = params.sort;

        if (nw.file.existsSync(folder)) {
            var to_sort = [];
            var to_last = [];

            nw.file.readdirSync(folder).forEach((a)=>{
                if(sort.indexOf(a) == -1) to_last.push(a);
                else to_sort.push(a);
            })

            to_sort.sort(function(a, b) {
                return sort.indexOf(a) - sort.indexOf(b);
            })

            var all = to_sort.concat(to_last);

            all.forEach(file => {
                try{
                    var json = nw.file.readFileSync(nw.path.normalize(folder+'/'+file+'/package.json'), 'utf8');

                    var read = JSON.parse(json);

                    if(!nw.file.existsSync(nw.path.join(ven, read.name))){
                        this.BuildItem(folder+'/'+file, read);

                        eny = true;
                    }
                }
                catch(e){
                    
                }
            })
        }

        if(eny) self.box.show();
    }

    this.BuildItem = function(folder, data){
        var item    = $('<li><div class="name">'+data.name+'</div><div><div class="include grid grid-gap-5 grid-flow-column"></div></div></li>');
        var include = [];

        if(data.libs){
            if(data.libs.js && data.libs.js.length)   include.push('<kbd>js</kbd>');
            if(data.libs.css && data.libs.css.length) include.push('<kbd>css</kbd>');
        }

        if(nw.file.existsSync(nw.path.join(folder,'code.js'))) include.push('<code>code</code>');

        $('.include',item).append(include.join(''));

        item.on('click', function(){
            self.Install(folder, data);

            item.remove();

            if($('> li',self.items).length == 0){
                self.box.hide();
            }
        })

        self.items.append(item);
    }

    this.Install = function(folder, data){
        var folder_install = Functions.LocalPath('');
        var folder_vendor  = Functions.LocalPath('vendor');
        var folder_js      = Functions.LocalPath('js');
        var folder_dst     = nw.path.join( folder_vendor, data.name );
        var folder_src     = nw.path.join( folder, 'vendor' );

        var path_include_css = nw.path.join( folder_vendor, 'css.html' );
        var path_include_js  = nw.path.join( folder_vendor, 'js.html' );
        var path_app         = nw.path.join( folder_js, 'app.js' );
        var path_code        = nw.path.join( folder, 'code.js' );

        
        if(!nw.file.existsSync( folder_vendor )) nw.file.mkdirSync(folder_vendor);
        if(!nw.file.existsSync( folder_js ))     nw.file.mkdirSync(folder_js);
        if(!nw.file.existsSync( folder_dst ))    nw.file.mkdirSync(folder_dst);

        Functions.CopyFolder(folder_src, folder_dst);

        if(!nw.file.existsSync( path_app )) Functions.CopyFile('modules/package-manager/app.js',path_app);

        var data_css = File.GetData(path_include_css);
        var data_js  = File.GetData(path_include_js);
        var data_app = File.GetData(path_app);

        if(data.libs){
            if(data.libs.css){
                for (var i = 0; i < data.libs.css.length; i++) {
                    var css = data.libs.css[i];

                    data_css += "\n"+'<link rel="stylesheet" href="vendor/'+data.name+'/'+css+'" />';
                }

                if(data.libs.css.length) File.Write(path_include_css, data_css);
            }

            if(data.libs.js){
                for (var i = 0; i < data.libs.js.length; i++) {
                    var js = data.libs.js[i];

                    data_js += "\n"+'<script src="vendor/'+data.name+'/'+js+'"></script>';
                }

                if(data.libs.js.length)  File.Write(path_include_js, data_js);
            }
        }

        if(nw.file.existsSync( path_code )){
            var code = File.GetData(path_code);

                code = code.split("\n").map(function(a){
                    return "    " + a;
                }).join("\n");

            code = ['App.'+data.name+' = function(){', code , '}' , 'App.init.push("'+data.name+'")'].join("\n\n");

            data_app += code + "\n\n";

            File.Write(path_app, data_app);
        }

        Functions.Notify('Компонент ('+data.name+') успешно установлен');

        Sound.Play('al-1');
    }

    this.Select = function(){

    }
}