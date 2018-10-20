Ceron.modules.Position =  function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('position',function(html){
        
            self.module = $(html);

            Form.RadioChange($('.position',self.module),'position');


            var dirs    = {};

            dirs.top    = $('.position-top',self.module);
            dirs.right  = $('.position-right',self.module);
            dirs.bottom = $('.position-bottom',self.module);
            dirs.left   = $('.position-left',self.module);

            Form.RadioChangeEvent($('.position-select',self.module),function(value){
                var spl = value.split(',');

                /** Вообшем сначала чистка кадров, уволить всех к чкертям! **/
                $.each(dirs,function(dir){
                	$('input',dirs[dir]).val('').trigger('change');
                })

                /** Этого назначить главным! я сказал так! **/
                if(spl[0] == 'center'){
                	$.each(dirs,function(dir){
	                	$('input',dirs[dir]).val(0).trigger('change');
	                })
                }
                /** Опа, кто-то чет там хочет мне сказать да? **/
                else{
                	$.each(spl,function(i,dir){
	                	$('input',dirs[dir]).val(0).trigger('change');
	                })
                }
            });

            Form.InputDrag($('.form-input',self.module))

            Form.InputChange($('.form-input',self.module))
            
            Generators.Module.AddToTool(self.module);

        })
    }

    this.Select = function(){
    	Form.InputSelect($('.form-input',self.module))

    	Form.RadioSelect($('.position',self.module),'position');
    }
}