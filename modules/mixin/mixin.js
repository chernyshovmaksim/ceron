Ceron.modules.Mixin = function(){
	var self = this;

    this.Init = function(){
        if(!Data.path.mixin) Data.path.mixin = '';
        
        Generators.Module.GetHtml('mixin',function(html){

            self.module = $(html);

            var settingsBox = $('.project-settings').eq(2);

            var settingField = $([
                '<div class="form-group">',
                    '<div class="form-name">Файл mixin</div>',
                    '<div class="form-content">',
                        '<div class="form-input mixin">',
                            '<input type="text" name="mixin" value="" readonly placeholder="mixin.sass">',
                        '</div>',
                        '<span class="help-block m-b-0">Файл с миксинами для чтения, более подробно смотрите в <a href="https://docs.ceron.pw/module-mixin" target="_blank" class="external">документации</a>.</span>',
                    '</div>',
                '</div>',
            ].join(''));

            $('input',settingField).val(Data.path.mixin).on('click',function(){
                var input = $(this);

                File.Choise('fileOpen',function(file){
                    Data.path.mixin = Functions.NormalPath(Functions.RelativePath('', file));

                    input.val(Data.path.mixin)

                    self.ReadMixin();

                },nw.path.dirname(Functions.LocalPath(Data.path.mixin)))
            })

            settingsBox.append(settingField);

            Generators.Module.AddToTool(self.module);

            Generators.Build.AddReplace('css',self.Replace)
            Generators.Build.AddReplace('sass',self.Replace)

            self.ReadMixin();
        })
    }

    this.Replace = function(result){
        return result.replace(/@include\s(.*?):\((.*?)\)/g,'@include $1($2)');
    }

    this.ReadMixin = function(){
        if(!Data.path.mixin) return;

        var read = '';

        try{
            read = nw.file.readFileSync(Functions.LocalPath(Data.path.mixin), 'utf8');
        }
        catch(e){
            Functions.Error('Не удалось открыть файл ('+Data.path.mixin+')')
        }

        var regex = /\@mixin\s+(.*?)\((.*?)\)/gim;

        for (var matches = []; result = regex.exec(read); matches.push(result));

        var mixinList = $('.mixin',self.module).empty();
            mixinList.css({
                maxHeight: '200px',
                overflow: 'auto'
            })

        $.each(matches,function(i,found){
            var vars = Functions.Substring(found[2] || '', 15);

            var item = $([
                '<li>',
                    '<div>'+found[1]+' '+(vars ? '<code class="m-l-5">'+vars+'</code>' : '')+'</div>',
                '</li>',
            ].join(''))

            item.css({
                cursor:'pointer'
            })

            var varsSplit = found[2].split(',');

            item.on('click',function(){
                if(found[2]){
                    var popupBox = $('<div></div>');

                    $.each(varsSplit,function(a,varName){
                        var varNameSplit = varName.split(':');

                        var input = $([
                            '<div class="form-field form-field-half">',
                                '<div>',
                                    varNameSplit.length > 1 ? varNameSplit[0] : varName,
                                '</div>',
                                '<div>',
                                    '<div class="form-input">',
                                        '<input type="text" name="" value="" placeholder="auto" />',
                                    '</div>',
                                '</div>',
                            '</div>',
                            '<div class="form-divider form-divider-small"></div>'
                        ].join(''))

                        $('input',input).val(varNameSplit.length > 1 ? varNameSplit[1].trim() : '');

                        popupBox.append(input)
                    })

                    var btn = $('<div class="form-field"><div class="form-btn select-img">добавить</div></div>')

                    btn.on('click',function(){
                        Popup.Hide();

                        var result = [];

                        $('input',popupBox).each(function(){
                            result.push($(this).val())
                        })

                        Generators.Css.Add('@include ' + found[1] + ':' + '('+result.join(', ')+')');
                    })

                    popupBox.append(btn);

                    Popup.Box(item,popupBox)
                }
                else{
                    Generators.Css.Add('@include ' + found[1] + ':' + '()');
                }
            })

            mixinList.append(item)
        })

        function search(){
            var value = $(this).val();

            if(value){
                $('li',mixinList).hide();

                $( 'li:contains("'+value+'")',mixinList).show();
            }
            else{
                $('li',mixinList).show();
            }
        }

        $('.search input',self.module).on('keyup',search).on('change',search)
    }

    this.Select = function(){
    	
    }
}