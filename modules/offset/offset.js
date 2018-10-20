Ceron.modules.Offset = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('offset',function(html){
        
            self.module = $(html);

            function mpd(name){
                var h = $('.'+name+'-h',self.module);
                var v = $('.'+name+'-v',self.module);

                Form.InputChangeEvent(h,function(n,val){
                    Generators.Css.Add(name+'-left: ' + val);
                    Generators.Css.Add(name+'-right: ' + val);

                    $('input[name="'+name+'-left"]',self.module).val(val);
                    $('input[name="'+name+'-right"]',self.module).val(val);
                })

                Form.InputChangeEvent(v,function(n,val){
                    Generators.Css.Add(name+'-top: ' + val);
                    Generators.Css.Add(name+'-bottom: ' + val);

                    $('input[name="'+name+'-top"]',self.module).val(val);
                    $('input[name="'+name+'-bottom"]',self.module).val(val);
                })
            }

            mpd('padding');
            mpd('margin');

            $('input',self.module).on('change',function(){
            	var name = $(this).attr('name'),
            		val  = $(this).val();

                if(name == 'no') return;
            	
            	if(val) Generators.Css.Add(name+': '+val);
            	else    Generators.Css.Remove(name);
            })

            Form.InputDrop($('.padding .form-input',self.module),'$padding')
            Form.InputDrop($('.margin .form-input',self.module),'$margin')

            Form.InputDrag($('.padding .form-input',self.module))
            Form.InputDrag($('.margin .form-input',self.module))
            
            Generators.Module.AddToBar(self.module);
        })
    }

    this.Select = function(){
    	var dirs = ['top','right','bottom','left'];

    	$.each(dirs,function(i,dir){
    		var padding = Generators.Css.Get('padding-'+dir);
    		var margin  = Generators.Css.Get('margin-'+dir);

    		$('input[name="padding-'+dir+'"]',self.module).val(padding)
    		$('input[name="margin-'+dir+'"]',self.module).val(margin)

            if(dir == 'left'){
                Form.InputSetValue($('.padding-h',self.module), padding);
                Form.InputSetValue($('.margin-h',self.module), margin);
            } 

            if(dir == 'top'){
                Form.InputSetValue($('.padding-v',self.module), padding);
                Form.InputSetValue($('.margin-v',self.module), margin);
            } 
    	})
    }
}