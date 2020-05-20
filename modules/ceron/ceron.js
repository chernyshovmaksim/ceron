Ceron.modules.Ceron = function(){
	var self = this;

    var pr_node   = [];
    var pr_medias = ['xl','lg','md','sm','xs'];
    var pr_media  = 'all';
    var pr_time   = false;
    var pr_prefix = 'cn-';
    var pr_colums = 12;

    var pr_colors = {
        'm':{
            'b': '#9f7e69',
            'c': '#fff'
        },
        'w':{
            'b': '#fdbe00',
            'c': '#000'
        },
        'd':{
            'b': '#ff6978',
            'c': '#fff'
        },
        't':{
            'b': '#fff',
            'c': '#000'
        },
        'c':{
            'b': '#667c87',
            'c': '#fff'
        },
        'u':{
            'b': '#8ea604',
            'c': '#fff'
        },
        'p': {
            'b': '#a5bb98',
            'c': '#3f4c3f'
        }
    }

    var pr_classify = [
        {
            patern: 'pn-([a-z]+)',
            color: 'u',
            name: function(m){
                return 'position: '+m[1];
            } 
        },
        {
            patern: 'p([a-z])-(\\d+)',
            color: 'p',
            name: function(m){
                return 'padding-'+m[1]+': '+m[2];
            } 
        },
        {
            patern: 'p([a-z])-auto',
            color: 'p',
            name: function(m){
                return 'padding-'+m[1]+': auto';
            } 
        },
        {
            patern: 'move-(\\d+)_(\\d+)',
            color: 'w',
            name: function(m){
                return 'move: '+m[1]+'-'+m[2];
            } 
        },
        {
            patern: 'm([a-z])-(\\d+)',
            color: 'm',
            name: function(m){
                return 'margin-'+m[1]+': '+m[2];
            } 
        },
        {
            patern: 'm([a-z])-auto',
            color: 'm',
            name: function(m){
                return 'margin-'+m[1]+': auto';
            } 
        },

        {
            patern: 'w-(\\d+)_(\\d+)',
            color: 'w',
            name: function(m){
                return 'width: '+m[1]+'-'+m[2];
            } 
        },
        {
            patern: 'wp-(\\d+)',
            color: 'w',
            name: function(m){
                return 'width: '+m[1]+'%';
            } 
        },
        {
            patern: 'w-([a-z]+)',
            color: 'w',
            name: function(m){
                return 'width: '+m[1];
            } 
        },
        {
            patern: 'd-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'display: '+m[1];
            } 
        },
        {
            patern: 'fd-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'direction: '+m[1];
            } 
        },
        {
            patern: 'fw-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'wrap: '+m[1];
            } 
        },
        {
            patern: 'jc-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'justify: '+m[1];
            } 
        },
        {
            patern: 'ai-self-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'self: '+m[1];
            } 
        },
        {
            patern: 'ai-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'align: '+m[1];
            } 
        },
        {
            patern: 'sh-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'shrink: '+m[1];
            } 
        },
        {
            patern: 'gr-([a-z]+)',
            color: 'd',
            name: function(m){
                return 'grow: '+m[1];
            } 
        },
        {
            patern: 'ord-(\\w+)',
            color: 'd',
            name: function(m){
                return 'order: '+m[1];
            } 
        },
        {
            patern: 'fx-(\\d+)',
            color: 'd',
            name: function(m){
                return 'flex: '+m[1];
            } 
        },
        {
            patern: 'cols-([a-z]+)',
            color: 'c',
            name: function(m){
                return 'cols: '+m[1];
            } 
        },
        {
            patern: 'gutter-([a-z])-(\\d+)',
            color: 'c',
            name: function(m){
                return 'gutter-'+m[1]+': '+m[2];
            } 
        },
        {
            patern: 'fw-(\\d+)',
            color: 't',
            name: function(m){
                return 'weight: '+m[1];
            } 
        },
        {
            patern: 'ff-([a-z]+)',
            color: 't',
            name: function(m){
                return 'style: '+m[1];
            } 
        },
        {
            patern: 'fs-(\\d+)',
            color: 't',
            name: function(m){
                return 'size: '+m[1];
            } 
        },
        {
            patern: 'fl-(\\d+)',
            color: 't',
            name: function(m){
                return 'line: '+m[1];
            } 
        },
        {
            patern: 'fi-(\\d+)',
            color: 't',
            name: function(m){
                return 'spacing: '+m[1];
            } 
        },
        {
            patern: 'fe-([a-z]+)',
            color: 't',
            name: function(m){
                return 'decoration: '+m[1];
            } 
        },
        {
            patern: 'fa-([a-z]+)',
            color: 't',
            name: function(m){
                return 'align: '+m[1];
            } 
        },
        {
            patern: 'ft-([a-z]+)',
            color: 't',
            name: function(m){
                return 'transform: '+m[1];
            } 
        },
        {
            patern: 'fc-([a-z]+)',
            color: 't',
            name: function(m){
                return 'wrap: '+m[1];
            } 
        },
        {
            patern: 'fo-([a-z]+)',
            color: 't',
            name: function(m){
                return 'overflow: '+m[1];
            } 
        },
        {
            patern: 'op-(\\d+)',
            color: 'u',
            name: function(m){
                return 'opacity: '+m[1]+'%';
            } 
        },
        {
            patern: 'tr-(\\d+)',
            color: 'u',
            name: function(m){
                return 'transition: '+m[1];
            } 
        },
        {
            patern: 'ow-([a-z]+)',
            color: 'u',
            name: function(m){
                return 'overflow: '+m[1];
            } 
        },
        {
            patern: 'text',
            color: 't',
            name: function(m){
                return 'text';
            } 
        },
    ]

    this.Init = function(){
        
        Generators.Module.GetHtml('ceron',function(html){
        
            self.module = $(html);

            /** Main **/

            Form.RadioChangeEvent($('.media',self.module),function(name){
                pr_media = name;

                self.Clear();

                self.Extract();
            });

            Form.RadioChangeEvent($('.colums-system',self.module),function(total){
                pr_colums = parseInt(total)
            });


            /** Functions **/
            
            var spacing_extract = function(input, add){
                var i_name = input.attr('name'),
                    i_auto = input.val() == 'auto',
                    i_val  = i_auto ? 'auto' : (parseInt(input.val())/5).toFixed() * 5,
                    i_dir  = i_name.split('-'),
                    i_typ  = i_dir[0] == 'padding' ? 'p' : 'm',
                    i_ptr  = i_auto ? '-auto' : '-\\d+'

                
                if(add){
                    self.PushClass(i_typ+i_dir[1]+i_ptr, [i_typ+i_dir[1],i_val].join('-'));
                }
                else{
                    self.RemoveClass(i_typ+i_dir[1]+i_ptr);
                }
                
            }

            var spacing_width_percent = function(input, add){
                var i_val  = (parseInt(input.val())/5).toFixed() * 5;

                
                if(add){
                    self.PushClass('wp-\\d+', 'wp-'+i_val);
                }
                else{
                    self.RemoveClass('wp-\\d+');
                }
                
            }

            var radio_select = function(params = {}){
                var li = $('.'+params.name+' > li', self.module);

                li.on('click', function(){
                    var li_active = li.filter('.active');
                    var li_same   = li_active && li_active.attr('name') == $(this).attr('name');

                    if((li_active && !li_same) || li_same){
                        li.removeClass('active');

                        self.RemoveClass(params.patern);
                    }

                    if(!li_same){
                        $(this).addClass('active');

                        self.PushClass(params.patern, params.className($(this).attr('name')));
                    }
                })
            }

            var radio_enable = function(params = {}){
                var li = $('.'+params.name+' > li', self.module);

                li.on('click', function(){
                    if(li.hasClass('active')){
                        li.removeClass('active');

                        self.RemoveClass(params.patern, false);
                    }
                    else{
                        $(this).addClass('active');

                        self.PushClass(params.patern, params.patern, false);
                    }
                })
            }

            var select_extract = function(params){
                $('.'+params.name,self.module).on('change', function(){
                    var val = $(this).val()

                    if(val){
                        self.PushClass(params.patern, params.className(val), params.media);
                    }
                    else{
                        self.RemoveClass(params.patern, params.media);
                    }
                })
            }

            /** Spacing **/

            var spacing_inputs = $('.padding .form-input, .margin .form-input',self.module);


            $('.padding input, .margin input',self.module).on('change',function(){
                spacing_extract($(this), true);
            })

            $('li',spacing_inputs).on('click', function(){
                var parent = $(this).parents('.form-input').find('input');

                spacing_extract(parent);

                parent.val('');
            })

            $('ul',spacing_inputs).each(function(){
                var auto = $('<li><img src="style/img/icons-panel/auto.png" alt=""></li>');

                auto.on('click', function(){
                    var parent = $(this).parents('.form-input').find('input');

                    parent.val('auto');

                    spacing_extract(parent, true);
                })

                $(this).append(auto)
            })
            

            Form.InputDrag(spacing_inputs,'',{step: 5, min: 0, max: 100});


            /** Width percent **/

            var w_percent = $('.width-percent', self.module);

            $('li',w_percent).on('click', function(){
                var parent = $(this).parents('.form-input').find('input');

                spacing_width_percent(parent);

                parent.val('');
            })

            $('input',w_percent).on('change',function(){
                spacing_width_percent($(this), true);
            })

            Form.InputDrag(w_percent,'',{step: 5, min: 0, max: 100});


            /** Radio **/

            radio_select({
                name: 'display',
                patern: 'd-[a-z]+',
                className: (n)=>{
                    return 'd-'+n;
                }
            })

            radio_select({
                name: 'justify-content',
                patern: 'jc-[a-z]+',
                className: (n)=>{
                    return 'jc-'+n;
                }
            })

            radio_select({
                name: 'align-items',
                patern: 'ai-[a-z]+',
                className: (n)=>{
                    return 'ai-'+n;
                }
            })

            radio_select({
                name: 'align-self',
                patern: 'ai-self-[a-z]+',
                className: (n)=>{
                    return 'ai-self-'+n;
                }
            })

            radio_select({
                name: 'flex-direction',
                patern: 'fd-[a-z]+',
                className: (n)=>{
                    return 'fd-'+n;
                }
            })

            radio_select({
                name: 'flex-wrap',
                patern: 'fw-[a-z]+',
                className: (n)=>{
                    return 'fw-'+n;
                }
            })

            radio_select({
                name: 'width-column',
                patern: 'w-\\d+_\\d+',
                className: (n)=>{
                    return 'w-'+n+'_'+pr_colums;
                }
            })

            radio_select({
                name: 'move-column',
                patern: 'move-\\d+_\\d+',
                className: (n)=>{
                    return 'move-'+n+'_'+pr_colums;
                }
            })

            radio_select({
                name: 'width-more',
                patern: 'w-[a-z]+',
                className: (n)=>{
                    return 'w-'+n;
                }
            })

            radio_select({
                name: 'gutter-a',
                patern: 'gutter-a-\\d+',
                className: (n)=>{
                    return 'gutter-'+n;
                }
            })

            radio_select({
                name: 'gutter-v',
                patern: 'gutter-v-\\d+',
                className: (n)=>{
                    return 'gutter-'+n;
                }
            })

            radio_select({
                name: 'gutter-h',
                patern: 'gutter-h-\\d+',
                className: (n)=>{
                    return 'gutter-'+n;
                }
            })

            radio_select({
                name: 'flex-shrink',
                patern: 'sh-\\d+',
                className: (n)=>{
                    return 'sh-'+n;
                }
            })

            radio_select({
                name: 'flex-grow',
                patern: 'gr-\\d+',
                className: (n)=>{
                    return 'gr-'+n;
                }
            })

            radio_select({
                name: 'overflow',
                patern: 'ow-[a-z]+',
                className: (n)=>{
                    return 'ow-'+n;
                }
            })

            radio_select({
                name: 'position',
                patern: 'pn-[a-z]+',
                className: (n)=>{
                    return 'pn-'+n;
                }
            })

            radio_enable({
                name: 'cols-row',
                patern: 'cols-row',
            })

            radio_enable({
                name: 'cols-same',
                patern: 'cols-same',
            })

            radio_enable({
                name: 'default-text',
                patern: 'text',
            })

            select_extract({
                name: 'font-weight',
                patern: 'fw-\\d+',
                className: (n)=>{
                    return 'fw-'+n;
                }
            })

            select_extract({
                name: 'line-height',
                patern: 'fl-\\d+',
                className: (n)=>{
                    return 'fl-'+n;
                }
            })

            select_extract({
                name: 'letter-spacing',
                patern: 'fi-\\d+',
                className: (n)=>{
                    return 'fi-'+n;
                }
            })

            select_extract({
                name: 'transition',
                patern: 'tr-\\d+',
                media: false,
                className: (n)=>{
                    return 'tr-'+n;
                }
            })

            select_extract({
                name: 'flex-order',
                patern: 'ord-\\d+',
                media: false,
                className: (n)=>{
                    return 'ord-'+n;
                }
            })

            radio_select({
                name: 'font-style',
                patern: 'ff-[a-z]+',
                className: (n)=>{
                    return 'ff-'+n;
                }
            })

            radio_select({
                name: 'text-decoration',
                patern: 'fe-[a-z]+',
                className: (n)=>{
                    return 'fe-'+n;
                }
            })

            radio_select({
                name: 'text-align',
                patern: 'fa-[a-z]+',
                className: (n)=>{
                    return 'fa-'+n;
                }
            })

            radio_select({
                name: 'text-transform',
                patern: 'ft-[a-z]+',
                className: (n)=>{
                    return 'ft-'+n;
                }
            })

            radio_select({
                name: 'white-space',
                patern: 'fc-[a-z]+',
                className: (n)=>{
                    return 'fc-'+n;
                }
            })

            radio_select({
                name: 'text-overflow',
                patern: 'fo-[a-z]+',
                className: (n)=>{
                    return 'fo-'+n;
                }
            })

            radio_select({
                name: 'flex-flex',
                patern: 'fx-\\d+',
                className: (n)=>{
                    return 'fx-'+n;
                }
            })


            /** Font **/

            var font_input = $('.font-size',self.module);

            Form.InputDrag(font_input,'',{min: 5, max: 40});

            Form.InputChangeEventSimple(font_input, function(name,val){
                var i_val  = (parseInt(val || 0) / 1).toFixed() * 1;

                if(val){
                    self.PushClass('fs-\\d+', 'fs-' + i_val);
                }
                else{
                    self.RemoveClass('fs-\\d+');
                }
            })

            $('li',font_input).on('click', function(){
                font_input.find('input').val('').change();
            })

            /** Opacity **/

            var opacity = $('.opacity',self.module);

            Form.InputChangeEventSimple(opacity, function(name,val){
                var i_val  = (parseInt(val || 0) / 5).toFixed() * 5;

                if(val){
                    self.PushClass('op-\\d+', 'op-' + i_val);
                }
                else{
                    self.RemoveClass('op-\\d+');
                }
            })

            $('li',opacity).on('click', function(){
                opacity.find('input').val('').change();
            })

            Form.InputDrag(opacity,'',{step: 5, min: 0, max: 100});

            /** Если выбрали нод в VTC **/

            setTimeout(()=>{
                /*
                Ceron.VTCGlobal.option.addEventListener('show',(e)=>{
                    if(e.node){
                        setTimeout(()=>{
                            pr_node = e.node.data;

                            self.Extract();

                            clearTimeout(pr_time);

                            console.log(Ceron.VTCGlobal.selection.selection)

                            Raid.SearchAndSelect('[data-vcid="'+e.node.uid+'"]');
                        },10)
                    }
                })
                */

                WorkClass.addEventListener('work-class-item',self.Classify);

                

                Ceron.VTCGlobal.selection.addEventListener('clear',()=>{
                    self.ClearFull();

                    WorkClass.SelectEmpty()
                })

                Ceron.VTCGlobal.selection.addEventListener('select',()=>{
                    
                })

                Ceron.VTCGlobal.selection.addEventListener('add',()=>{
                    setTimeout(()=>{
                        self.ClearFull();

                        var selection = Ceron.VTCGlobal.selection.selection;
                        var uids      = [];

                        for (var i = 0; i < selection.length; i++) {
                            var select = selection[i];

                            pr_node.push(select.data);

                            if(select.data.tpl){
                                var tpl_main_node = Ceron.VTCGlobal.viewport.getMainNode(select.data.tpl);

                                if(tpl_main_node){
                                    uids.push(tpl_main_node.uid);
                                }
                            }
                            else{
                                uids.push(select.uid);
                            }
                        }

                        var search = uids.map((a)=>{
                            return '[data-vcid="'+a+'"]';
                        })

                        self.Extract();

                        Raid.SearchAndSelect(search.join(','));

                        clearTimeout(pr_time);
                    },10)
                })
                

            },1)

            /** Если выбрали в браузере **/

            Raid.addEventListener('click', function(e){
                setTimeout(()=>{
                    if(e.uid){
                        pr_node = [];

                        pr_node.push(Ceron.VTCGlobal.viewport.searchNodeEverywhere(e.uid));

                        self.Extract();

                        clearTimeout(pr_time);
                    }
                },10)
            })

            
            Generators.Module.AddToTool(self.module);
        })
    }

    this.MediaPrefix = function(media){
        if(media !== undefined && !media) return '';

        return pr_media == 'all' ? '' : '--' + pr_media;
    }

    this.GetNodeAttr = function(node){
        if(node.tpl){
            if(node.attr.classes == undefined){
                node.attr.classes = '';
            }
        }

        return node.tpl ? node.attr.classes : node.attr.class;
    }

    this.SetNodeAttr = function(node, str){
        node.attr[node.tpl ? 'classes' : 'class'] = str;
    }

    this.RemoveClass = function(patern, media){
        if(!pr_node.length) return;

        for (var c = 0; c < pr_node.length; c++) {
            var node = pr_node[c];

            var cl_list = this.GetNodeAttr(node).split(' ');

            var regex = new RegExp(pr_prefix + patern + this.MediaPrefix(media),'g');
            var remov = [];

            for (var i = 0; i < cl_list.length; i++) {
                var str = cl_list[i];

                if(this.IsMath(str, media)){
                    var math = str.match(regex);

                    if(math) remov = remov.concat(math);

                    str = str.replace(regex, '');
                }

                cl_list[i] = str;
            }

            cl_list = cl_list.filter((a)=>{
                return a.trim();
            })
            

            this.SetNodeAttr(node, cl_list.join(' '));
        }

        Raid.RemoveClass(remov);
    }

    this.RemoveClassSimple = function(name){
        if(!pr_node.length) return;

        for (var c = 0; c < pr_node.length; c++) {
            var node = pr_node[c];

            var cl_list = this.GetNodeAttr(node).split(' ');

            Arrays.remove(cl_list, name);

            this.SetNodeAttr(node, cl_list.join(' '));
        }

        Raid.RemoveClass([name]);
    }

    this.PushClass = function(patern, name, media){
        if(!pr_node.length) return;

        this.RemoveClass(patern, media);

        for (var i = 0; i < pr_node.length; i++) {
            var node = pr_node[i];

            this.SetNodeAttr(node,(this.GetNodeAttr(node).trim() + ' ' + pr_prefix + name + this.MediaPrefix(media)).trim());
        }

        Raid.PushClass(pr_prefix + name + this.MediaPrefix(media));
    }

    this.IsMath = function(class_str, media){
        if(media !== undefined && !media) return true;

        if(!this.MediaPrefix() && class_str.indexOf('--') >= 0) return;
        if(this.MediaPrefix() && class_str.indexOf('--') == -1) return;

        return true;
    }

    this.ExtOffset = function(class_str, offset, u){
        var math = class_str.match(new RegExp(pr_prefix + u + '([a-z]+)?-(\\d+|auto)'+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            var name = math[1] ? offset + '-' + math[1] : offset;

            $('input[name="'+name+'"]',self.module).val(math[2]);
        }
    }

    this.ExtDisplay = function(class_str){
        var math = class_str.match(new RegExp(pr_prefix + 'd-([a-z]+)'+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.display li[name="'+math[1]+'"]',self.module).addClass('active')
        }
    }

    this.ExtRadio = function(class_str, name, patern){
        var math = class_str.match(new RegExp(pr_prefix + patern +'-([a-z]+|\\d+)'+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.'+name+' li[name="'+math[1]+'"]',self.module).addClass('active')
        }
    }

    this.ExtWColumn = function(class_str, name, patern){
        var math = class_str.match(new RegExp(pr_prefix + patern +'-(\\d+)_'+pr_colums+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.'+name+' li[name="'+math[1]+'"]',self.module).addClass('active')
        }
    }

    this.ExtGutter = function(class_str){
        var math = class_str.match(new RegExp(pr_prefix +'gutter-([a-z])-(\\d+)'+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.gutter-'+math[1]+' li[name="'+math[1]+'-'+math[2]+'"]',self.module).addClass('active')
        }
    }

    this.ExtRadioEnable = function(class_str, name, patern){
        var math = class_str.match(new RegExp(pr_prefix +patern));

        if(math){
            $('.'+name+' li',self.module).addClass('active')
        }
    }

    this.ExtFontSize = function(class_str){
        var math = class_str.match(new RegExp(pr_prefix +'fs-(\\d+)'+this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.font-size input',self.module).val(math[1])
        }
    }

    this.ExtSelect = function(class_str, name, patern, media){
        var math = class_str.match(new RegExp(pr_prefix + patern +this.MediaPrefix(media)));

        if(math && this.IsMath(class_str, media)){
            $('.'+name,self.module).val(math[1])
        }
    }

    this.ExtWidthPercent = function(class_str){
        var math = class_str.match(new RegExp(pr_prefix + 'wp-(\\d+)' +this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.width-percent input',self.module).val(math[1])
        }
    }

    this.ExtInput = function(class_str, name, patern){
        var math = class_str.match(new RegExp(pr_prefix + patern + this.MediaPrefix()));

        if(math && this.IsMath(class_str)){
            $('.'+name+' input',self.module).val(math[1])
        }
    }

    this.Extract = function(){
        if(pr_node.length && pr_node.length == 1){
            var node         = pr_node[0];
            var node_classes = this.GetNodeAttr(node).split(' ');

            for (var i = 0; i < node_classes.length; i++) {
                var cl = node_classes[i];

                this.ExtOffset(cl,'padding','p');
                this.ExtOffset(cl,'margin','m');

                this.ExtDisplay(cl);

                this.ExtRadio(cl,'justify-content','jc');
                this.ExtRadio(cl,'align-items','ai');
                this.ExtRadio(cl,'align-self','ai-self');
                this.ExtRadio(cl,'flex-direction','fd');
                this.ExtRadio(cl,'flex-wrap','fw');
                this.ExtRadio(cl,'width-more','w');
                this.ExtRadio(cl,'flex-grow','gr');
                this.ExtRadio(cl,'flex-shrink','sh');

                this.ExtRadioEnable(cl,'cols-row','cols-row');
                this.ExtRadioEnable(cl,'cols-same','cols-same');
                this.ExtRadioEnable(cl,'default-text','text');
                

                this.ExtWColumn(cl, 'width-column','w');
                this.ExtWColumn(cl, 'move-column','move');

                this.ExtGutter(cl);

                this.ExtFontSize(cl);

                this.ExtSelect(cl,'font-weight','fw-(\\d+)');
                this.ExtSelect(cl,'line-height','fl-(\\d+)');
                this.ExtSelect(cl,'letter-spacing','fi-(\\d+)');
                this.ExtSelect(cl,'transition','tr-(\\d+)',false);
                this.ExtSelect(cl,'flex-order','ord-(\\w+)');

                this.ExtRadio(cl,'text-overflow','fo');
                this.ExtRadio(cl,'white-space','fc');
                this.ExtRadio(cl,'text-transform','ft');
                this.ExtRadio(cl,'text-align','fa');
                this.ExtRadio(cl,'text-decoration','fe');

                this.ExtWidthPercent(cl);

                this.ExtInput(cl, 'opacity','op-(\\d+)');

                this.ExtRadio(cl,'overflow','ow');
                this.ExtRadio(cl,'position','pn');

                this.ExtRadio(cl,'flex-flex','fx');
            }
        }
    }

    this.Clear = function(){
        $('.padding input, .margin input, .font-size input, .width-percent input, .opacity input',self.module).val('');

        $('.font-weight,.letter-spacing,.line-height,.transition,.flex-order',self.module).val('');

        var radio = [
            'display',
            'flex-direction',
            'flex-wrap',
            'justify-content',
            'align-items',
            'align-self',
            'width-column',
            'move-column',
            'width-more',
            'gutter',
            'cols-row',
            'cols-same',
            'text-overflow',
            'white-space',
            'text-transform',
            'text-align',
            'text-decoration',
            'flex-grow',
            'flex-shrink',
            'overflow',
            'position',
            'flex-flex',
            'gutter',
            'default-text'
        ];

        for (var i = 0; i < radio.length; i++) {
            $('.'+radio[i]+' li',self.module).removeClass('active');
        }
    }

    this.ClearFull = function(){
        pr_node = [];

        this.Clear();
    }

    this.Classify = function(e){
        if(/cn-/.test(e.name)){
            e.item.addClass('code-ui');

            var media = e.name.match(/--([a-z]+)/),
                classify;

            var name = e.name.replace(/--[a-z]+/g,'');

            for (var i = 0; i < pr_classify.length; i++) {
                classify = pr_classify[i];

                var math = name.match(new RegExp('cn-'+classify.patern));

                if(math){
                    name = classify.name(math);

                    e.item.unbind().on('click', ()=>{
                        var now_media = pr_media;

                        pr_media = media ? media[1] : 'all';

                        self.RemoveClassSimple(e.name);

                        pr_media = now_media;

                        e.item.remove();

                        self.Clear();

                        self.Extract();
                    })

                    break;
                }
            }

            var color = pr_colors[classify.color],
                style = 'background: '+color.b+'; color: '+color.c;


            e.item.html('<span>'+(media ? media[1]: 'all').toUpperCase()+'</span><span style="'+style+'">'+name+'</span>');
        }
    }

    this.Select = function(class_name){
        this.ClearFull();

        if(Iframe.SelectElement && Iframe.SelectElement.uid){
            clearTimeout(pr_time);

            pr_time = setTimeout(()=>{
                var node = Ceron.VTCGlobal.viewport.searchNodeEverywhere(Iframe.SelectElement.uid);

                if(node) pr_node.push(node);

                this.Extract();
            },50)
        } 
    }
}