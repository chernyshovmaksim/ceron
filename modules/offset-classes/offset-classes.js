Ceron.modules.OffsetClasses = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('offset-classes',function(html){
        
            self.module = $(html);

            $('input',self.module).on('change',function(){
                var name = $(this).attr('name'),
                    val  = $(this).val();
                    
                var dir  = name.split('-');

                Raid.dispatchEvent({
                    type:      'offset-classes', 
                    uid:       Raid.lastSelect.data('vcid'), 
                    elem:      Raid.lastSelect,
                    folder:    dir[0],
                    direction: dir[1],
                    offset:    val
                });
            });

            Form.InputDrag($('.form-input',self.module),'')


            Raid.addEventListener('click', function(event){
                var classes = (event.elem.attr('class') || '').split(' ');

                Form.InputSetValue($('.form-input',self.module), '');

                classes.filter(function(name){
                    name = name.replace(new RegExp(Data.join, 'gi'),'-');

                    var segments = name.split('-');

                    if(segments.length == 3){
                        if(segments[0] == 'padding' || segments[0] == 'margin'){
                            $('input[name="'+segments[0]+'-'+segments[1]+'"]',self.module).val(segments[2]);
                        }
                    }
                })
            })
            
            Generators.Module.AddToTool(self.module);
        })
    }

    this.Select = function(){
    	
    }
}