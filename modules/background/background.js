Ceron.modules.Background = function(){
    var self = this;

    this.Init = function(){
        Generators.Module.GetHtml('background',function(html){
        
            self.module = $(html);

            Form.ColorsChange($('.background-color',self.module),'$color','background-color');
            Form.RadioChange($('.background-repeat',self.module),'background-repeat');
            Form.RadioChange($('.background-attachment',self.module),'background-attachment');

            var posX = $('.background-position-x',self.module);
            var posY = $('.background-position-y',self.module);

            Form.RadioChange($('.background-position',self.module),'background-position',function(value){
                var spl = value.split(' ');

                $('input',posX).val(spl[0]).trigger('change');
                $('input',posY).val(spl[1]).trigger('change');
            });

            Form.InputDrag(posX)
            Form.InputDrag(posY)

            Form.InputChangeEvent(posX,function(name,val){
                Generators.Css.Add('background-position' + ': ' + val + ' ' + $('input',posY).val());
            })
            Form.InputChangeEvent(posY,function(name,val){
                Generators.Css.Add('background-position' + ': ' + $('input',posX).val() + ' ' + val );
            })
            


            var sizeX = $('.background-size-x',self.module);
            var sizeY = $('.background-size-y',self.module);

            Form.RadioChange($('.background-size',self.module),'background-size',function(value){
                $('input',sizeX).val('');
                $('input',sizeY).val('');
            });

            Form.InputDrag(sizeX)
            Form.InputDrag(sizeY)

            Form.InputChangeEvent(sizeX,function(name,val){
                Generators.Css.Add('background-size' + ': ' + val + ' ' + $('input',sizeY).val());
            })
            Form.InputChangeEvent(sizeY,function(name,val){
                Generators.Css.Add('background-size' + ': ' + $('input',sizeX).val() + ' ' + val );
            })

            $('.select-img',self.module).on('click',function(){
                File.Choise('fileOpen',function(file){
                    Generators.Css.Add('background-image: url({path-'+Functions.RelativePath('', file)+'})');
                })
            })
            
            Generators.Module.AddToTool(self.module);

        })
    }

    this.GetSplit = function(value){
        var resut = [];
        var match = value.match(/((calc\()?[^\)c]+\)?) ((calc\()?[^\)]+\)?)/);

        if(match){
            resut.push(match[1]);
            resut.push(match[3]);
        }

        return resut;
    }

    this.Select = function(){
        Form.RadioSelect($('.background-repeat',self.module),'background-repeat');
        Form.RadioSelect($('.background-attachment',self.module),'background-attachment');
        Form.RadioSelect($('.background-position',self.module),'background-position');
        Form.RadioSelect($('.background-size',self.module),'background-size');
        Form.ColorsSelect($('.background-color'),'background-color');

        var pos = this.GetSplit(Generators.Css.Get('background-position'));
        var siz = this.GetSplit(Generators.Css.Get('background-size'));


        $('.background-position-x input',self.module).val(pos[0]);
        $('.background-position-y input',self.module).val(pos[1]);

        $('.background-size-x input',self.module).val(siz[0]);
        $('.background-size-y input',self.module).val(siz[1]);
    }
}