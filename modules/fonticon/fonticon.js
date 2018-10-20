Ceron.modules.Fonticon = function(){
	var self = this;

    this.Init = function(){
        Generators.Module.GetHtml('fonticon',function(html){

            self.module = $(html);

            $('.search',self.module).on('click',function(){
                File.Choise('fileOpen',self.Load);
            })
           
            Generators.Module.AddToTool(self.module);

        })
    }

    this.Load = function(file){
        var exe = nw.path.extname(file);

        if(exe == '.png'){
            self.Compare(file);
        }
        else Functions.Error('Файл не является .png')
    }

    this.Compare = function(file){
        if(!Functions.checkNetFramework()) return;

        var filePath = 'modules/fonticon/compare/IconFind.exe';

        var execFile = require('child_process').execFile;
        
        execFile(filePath, ['20', file], function(err, data) {
            if(err) throw err;
            else self.ShowResult(data);
        });
    }

    this.ShowResult = function(data){
        var json = JSON.parse(data);

        var content = $('<div></div>');
        var search  = $('<div></div>');
        var icons   = $('<div></div>');


        icons.css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridGap: '20px',
        })

        search.css({
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridGap: '20px',
        })

        var found = [];

        for(var i in json.IconsToPercent){
            found.push(json.IconsToPercent[i]);
        }

        found.push({name: 'spliter', value: 'Метод пиксель в пиксель'});

        for(var i in json.IconsToPX){
            found.push(json.IconsToPX[i]);
        }

        found.push({name: 'spliter', value: 'Другой метод'});

        for(var i in json.IconsToPxPercent){
            found.push(json.IconsToPxPercent[i]);
        }

        function creaateBox(to, methodName){
            var box = $('<div></div>');

                box.css({
                    display: 'grid',
                    gridTemplateColumns: 'repeat( auto-fit, minmax(70px, 1fr) )',
                    gridGap: '16px',
                })

            to.append('<div><h4>'+methodName+'</h4></div>');
            to.append(box);

            return box;
        }

        function createIcon(name){
            var item = $([
                '<div>',
                    '<div><img src="modules/fonticon/compare/icons/'+name+'.png" ></div>',
                    '<span>'+name+'</span>',
                '</div>'
            ].join(''));

            $('div',item).css({
                height: '70px',
                background: '#fff',
                borderRadius: '3px',
                marginBottom: '5px',
                boxShadow: '0 3px 7px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }).on('click',function(){
                var clip = nw.Clipboard.get()
                    clip.set(name);

                Functions.Notify('Скопировано')
            })

            $('img',item).css({
                opacity: 0.7,
                width: '40px'
            })

            $('span',item).css({
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: 'block'
            })

            return item;
        }

        function searchIcons(name){
            var first = name.split('-')[0];
            var found = [];

            nw.file.readdirSync('modules/fonticon/compare/icons/').forEach(file => {
                var fullName  = file.split('.')[0];
                var fileFirst = fullName.split('-')[0];

                if(first == fileFirst) found.push(fullName);
            })

            return found;
        }


        var iconsBox = creaateBox(icons, 'Метод средний результат');
        
        $.each(found, function(i, obj){
            if(obj.name == 'spliter'){
                iconsBox = creaateBox(icons, obj.value);

                return;
            } 

            var item = createIcon(obj.Icon);

            $('div',item).on('click',function(){
                var like = searchIcons(obj.Icon);

                if(like.length){
                    icons.hide()
                    search.empty().css({display: 'grid'});

                    var searchBox = creaateBox(search, 'Похожие иконки');

                    $.each(like, function(a, searchName){
                        searchBox.append(createIcon(searchName));
                    })

                    var back = $('<div><div class="form-btn form-btn-big">Назад</div></div>');

                    $('div',back).on('click',function(){
                        search.hide().empty();
                        icons.css({display: 'grid'});
                    })

                    search.append(back);
                }
            })

            iconsBox.append(item);
        })

        content.append(icons);
        content.append(search);

        Popup.Window('Результат поиска', content, {size: 'lg'});
    }

    this.Select = function(){

    }
}