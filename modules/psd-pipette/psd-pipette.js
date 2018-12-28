Ceron.modules.PsdPipette =  function(){
    var self = this;

    var box,
        row,
        content;

    var dump_member = [];

    var jsonData = false;
    var fonts_ready = [];

    this.Init = function(){
        
        Generators.Module.GetHtml('psd-pipette',function(html){

            self.module = $(html);

            $('.get-styles',self.module).on('click',function(){
                self.Pip();
            })

            $('.get-fonts',self.module).on('click',function(){
                self.PipFonts();
            })

            $('.install,.ready',self.module).hide();

            if(nw.file.existsSync('modules/psd-pipette/psdToJson.exe')) {
                $('.ready',self.module).show();
            }
            else $('.install',self.module).show();

            $('.compile',self.module).on('click',function(){
                self.Spawn('compile',function(){
                    $('.install',self.module).hide();
                    $('.ready',self.module).show();
                });
            });

            $('.compile-again',self.module).on('click',function(){
                $('.install',self.module).show();
                $('.ready',self.module).hide();
            })

            Generators.Module.AddToTool(self.module);

            Shortcut.Add('Ctrl+X',function(){
                var focused = $('input,textarea').is(':focus');

                if(!focused) $('.get-styles',self.module).click();
            })
        })
    }

    this.Spawn = function(callback){
        if(process.platform === "win32") this.SpawnWin(callback);
        else this.SpawnMac(callback);
    }

    this.SpawnWin = function(callback){
        if(!Functions.checkNetFramework()) return;

        var filePath = 'modules/psd-pipette/psdToJson.exe';

        var spawn = require('child_process').spawn,
            child = spawn(filePath);

        var result = '';

        var call = function(){
            var json = {};
            var parse;

            result = result.trim();

            try{
                json = JSON.parse(result);

                parse = true;
            }
            catch(e){
                Console.Add({message: 'Ошибка, не удалось извлечь данные',stack: (result == 'undefined' ? 'Слой не выбран': result || 'Нет данных') });
            }

            if(callback && parse) callback(json);
        }

        child.stdout.on('data', function (data) {
            result += data;
        });

        child.stderr.on('data', function (data) {
            result += data;

            call();
        });

        child.on('close', function (code) {
            call();
        });
    }

    this.SpawnMac = function(callback){
        var exec = require('child_process').exec;
        var child;

        var com = [
            "osascript -e 'tell application \"Adobe Photoshop CC\"",
            "do javascript (file (POSIX file (\""+nw.__dirname+"/modules/psd-pipette/JavaScriptFile.jsx\")))",
            "end tell'"
        ].join('\n');

        // executes `pwd`
        child = exec(com, function (error, stdout, stderr) {
            if (error !== null) {
                Console.Add({message: 'Exec error',stack: error});
            }
            else{
                var json = {};
                var parse;

                try{
                    json = JSON.parse(stdout);

                    parse = true;
                }
                catch(e){
                    Console.Add({message: 'Ошибка, не удалось извлечь данные',stack: stdout || 'Нет данных'});
                }
                
                if(callback && parse) callback(json);
            }
        });
    }

    this.Pip = function(){
        this._clear();

        this.Spawn(function(json){
            jsonData = json;

            if(!Arrays.isArray(jsonData)){
                jsonData = [json];
            }

            var result = self._result();

            jsonData = false;

            if(result) Popup.Window('Пипетка',box);
        })
    }

    this.PipFonts = function(){
        this.Spawn(function(json){
            jsonData = json;

            var names = [];

                Arrays.extend(names, fonts_ready);

            for(var i = 0; i < json.length; i++){
                var layer = json[i];

                if(layer.textKey){
                    for(var a = 0; a < layer.textKey.textStyleRange.length; a++){
                        var text = layer.textKey.textStyleRange[a].textStyleRange.textStyle;
                        
                        //text.fontStyleName
                        
                        var fullname = '(' + Functions.FontName(text.fontName) + ') ' + text.fontPostScriptName;

                        if(names.indexOf(fullname) == -1){
                            names.push(fullname)

                            fonts_ready.push(fullname)

                            Data.vars['$font-family-'+text.fontName.toLowerCase()] = text.fontName;

                            Data.vars['$font-family-'+text.fontPostScriptName.toLowerCase()] = text.fontPostScriptName;
                        }
                    }
                }
            }

            var box = $('<div class="form-input"><textarea rows="8" disabled>'+names.join("\n")+'</textarea></div>')

            jsonData = false;

            Popup.Window('Шрифты', box, {size: 'sm'});
        })
    }


    this.Get = function(callback){
        if(jsonData) callback(jsonData);
        else{
            var filePath = 'exe/PsdToJson.exe';

            var spawn = require('child_process').spawn,
                child;

            if(process.platform === "win32") child = spawn(filePath);
            else child = spawn(filePath, ['mono']);

            var result = '';

            var call = function(data){
                var json = {};
                var parse;

                try{
                    json = JSON.parse(result);

                    parse = true;
                }
                catch(e){
                    Console.Add({message: 'Ошибка, не удалось извлечь данные',stack: result || 'Нет данных'});
                }
                
                if(callback && parse) callback(json);
            }

            child.stdout.on('data', function (data) {
                result += data;
            });

            child.stderr.on('data', function (data) {
                result += data;

                call();
            });

            child.on('close', function (code) {
                call();
            });
        }
    }

    this.Shadow = function(callback){
        this.Get(function(data){
            var result = {};

            $.each(data,function(i,layer){

                if(layer.layerEffects){
                    var dropShadow  = layer.layerEffects.dropShadow;
                    var innerShadow = layer.layerEffects.innerShadow;
                    var outerGlow   = layer.layerEffects.outerGlow;
                    var innerGlow   = layer.layerEffects.innerGlow;

                    var shadow = [];
                    var shadowType = layer.textKey ? 'text-shadow' : 'box-shadow';

                    if(dropShadow && dropShadow.enabled){
                        var p = self._convertShadow(dropShadow.localLightingAngle,dropShadow.distance);

                        shadow.push(p.x + 'px ' + p.y + 'px ' + dropShadow.blur+'px rgba('+Math.round(dropShadow.color.red)+','+Math.round(dropShadow.color.grain)+','+Math.round(dropShadow.color.blue)+','+(dropShadow.opacity/100)+')');
                    }

                    if(innerShadow && innerShadow.enabled && shadowType !== 'text-shadow'){
                        var p = self._convertShadow(innerShadow.localLightingAngle,innerShadow.distance);

                        shadow.push('inset ' + p.x + 'px ' + p.y + 'px ' + innerShadow.blur+'px rgba('+Math.round(innerShadow.color.red)+','+Math.round(innerShadow.color.grain)+','+Math.round(innerShadow.color.blue)+','+(innerShadow.opacity/100)+')');
                    }

                    if(outerGlow && outerGlow.enabled){
                        shadow.push('0 0 ' + outerGlow.blur+'px rgba('+Math.round(outerGlow.color.red)+','+Math.round(outerGlow.color.grain)+','+Math.round(outerGlow.color.blue)+','+(outerGlow.opacity/100)+')');
                    }

                    if(innerGlow && innerGlow.enabled && shadowType !== 'text-shadow'){
                        shadow.push('inset 0 0 ' + innerGlow.blur+'px rgba('+Math.round(innerGlow.color.red)+','+Math.round(innerGlow.color.grain)+','+Math.round(innerGlow.color.blue)+','+(innerGlow.opacity/100)+')');
                    }

                    if(shadow.length){
                        result[shadowType] = shadow.join(',');
                    }
                }
            })

            callback(result)
        })
    }

    this.Border = function(callback){
        this.Get(function(data){
            var result = {};

            $.each(data,function(i,layer){
                if(layer.keyOriginType.length){
                    var shape  = layer.keyOriginType[0].null;
                    var radius = shape.keyOriginRRectRadii;

                    if(radius){
                        result['border-bottom-left-radius'] = Math.round(radius.bottomLeft)+'px';
                        result['border-bottom-right-radius'] = Math.round(radius.bottomRight)+'px';
                        result['border-top-left-radius'] = Math.round(radius.topLeft)+'px';
                        result['border-top-right-radius'] = Math.round(radius.topRight)+'px';
                    }

                    if(shape.keyOriginType == 5){
                        var bbox = shape.keyOriginShapeBBox;

                        result['border-radius'] = Math.round(bbox.right-bbox.left)+'px';
                    }

                }

                if(layer.AGMStrokeStyleInfo && layer.AGMStrokeStyleInfo.strokeEnabled){
                    var border = layer.AGMStrokeStyleInfo,
                        type   = border.strokeStyleLineDashSet && border.strokeStyleLineDashSet.length ? 'dashed' : 'solid';

                    result['border'] = border.strokeStyleLineWidth+'px '+type+' '+'rgba('+Math.round(border.strokeStyleContent.color.red)+','+Math.round(border.strokeStyleContent.color.grain)+','+Math.round(border.strokeStyleContent.color.blue)+','+(border.strokeStyleOpacity/100)+')';
                }

                if(layer.layerEffects && layer.layerEffects.frameFX){
                    var border = layer.layerEffects.frameFX;

                    if(border.enabled){
                        result['border'] = border.size+'px solid '+'rgba('+Math.round(border.color.red)+','+Math.round(border.color.grain)+','+Math.round(border.color.blue)+','+(border.opacity/100)+')';
                    }
                }

            })
        
            callback(result)
        })
    }

    this.Size = function(callback){
        this.Get(function(data){
            var result = {};

            $.each(data,function(i,layer){
                if(layer.bounds){
                    result['width'] = Math.round(layer.bounds.width);
                    result['height'] = Math.round(layer.bounds.height);
                }

                if(layer.keyOriginType.length){
                    var shape  = layer.keyOriginType[0].null;

                    if(shape.keyOriginShapeBBox){
                        var bbox = shape.keyOriginShapeBBox;

                        result['width'] = Math.round(bbox.right - bbox.left);
                        result['height'] = Math.round(bbox.bottom - bbox.top);
                    } 
                }

                //result['min-width']  = result['width'] + 'px';
                //result['min-height'] = result['height'] + 'px';

                //result['max-width']  = result['width'] + 'px';
                //result['max-height'] = result['height'] + 'px';

                result['width']  = Functions.ConvertUnits( result['width'] );
                result['height'] = Functions.ConvertUnits( result['height'] );

                result['max-width'] = result['min-width'] = result['width'];
                result['max-height'] = result['min-height'] = result['height'];
            })
        
            callback(result)
        })
    }

    this.Fill = function(callback){
        this.Get(function(data){
            var result = {};

            $.each(data,function(i,layer){

                var fillName = layer.textKey ? 'color' : 'background-color';

                if(layer.adjustment){
                    var color = layer.adjustment[0].solidColorLayer.color;
                    
                    result[fillName] = 'rgba('+Math.round(color.red)+','+Math.round(color.grain)+','+Math.round(color.blue)+','+(layer.fillOpacity/255).toFixed(2)+')';
                }

                if(layer.layerEffects){
                    var solid    = layer.layerEffects.solidFill,
                        gradient = layer.layerEffects.gradientFill;
                    
                    if(solid && solid.enabled){
                        result[fillName] = 'rgba('+Math.round(solid.color.red)+','+Math.round(solid.color.grain)+','+Math.round(solid.color.blue)+','+(solid.opacity/100).toFixed(2)+')';
                    }

                    if(gradient && gradient.enabled){
                        var gr = gradient.gradient;

                        var colors = [],
                            range  = gr.interfaceIconFrameDimmed || 100;

                        $.each(gr.colors,function(inx){

                            if(gradient.reverse) inx = gr.colors.length - 1 - inx;

                            var item  = gr.colors[inx];
                            var trnp  = gr.transparency[inx] ? gr.transparency[inx].transferSpec.opacity : gradient.opacity;
                            var stop  = item.colorStop,
                                local = (stop.location / range * 100);

                                local = gradient.reverse ? 100 - local : local;

                            colors.push('rgba('+Math.round(stop.color.red)+','+Math.round(stop.color.grain)+','+Math.round(stop.color.blue)+','+(trnp/100).toFixed(2)+') ' + local + '%');
                        })

                        var deg = Math.abs(gradient.angle - 450) % 360;
                        var bgc = result['background-color'] ? result['background-color'] + ' ' : '';

                        if(gradient.type == 'linear') result['background'] = bgc + gradient.type + '-gradient(' + deg + 'deg, '+colors.join(',')+')';
                        if(gradient.type == 'radial') result['background'] = bgc + gradient.type + '-gradient(circle, '+colors.join(',')+')';
                    }
                }
            })
        
            callback(result)
        })
    }

    this.Font = function(text, callback){
        
        var result   = {};
        var textItem = text.textStyleRange.textStyle;
        var base     = text.textStyleRange.textStyle.baseParentStyle || {};

        try{
            result['color'] = Color.RgbToHex('rgb('+Math.round(textItem.color.red)+','+Math.round(textItem.color.grain)+','+Math.round(textItem.color.blue)+')')
        }
        catch(e){}

        if(!result['color']){
            try{
                result['color'] = Color.RgbToHex('rgb('+Math.round(textItem.baseParentStyle.color.red)+','+Math.round(textItem.baseParentStyle.color.grain)+','+Math.round(textItem.baseParentStyle.color.blue)+')')
            }
            catch(e){}
        }

        //все еше нет? афигеть!
        if(!result['color']) result['color'] = '#000000';

        //капут чуваки, просто капут!
        
        var fontSize = 16;

        try{
            fontSize = Math.round(textItem.impliedFontSize || textItem.size);
        }
        catch(e){}

        result['font-size'] = Functions.ConvertUnits(fontSize);

        //просто жесть!
        try{
            result['font-family'] = Functions.FontName(textItem.fontName || base.fontName);
        }
        catch(e){

        }

        var leading = textItem.impliedLeading || textItem.leading;
        
        if(leading){
            result['line-height'] = (Math.round(leading) / fontSize).toFixed(1);
        }
        else result['line-height'] = 1.2;



        if(textItem.tracking){
            if(Data.units == 'px'){
                result['letter-spacing'] = ((textItem.tracking || 0) * Math.round(textItem.impliedFontSize || textItem.size) / 1000).toFixed(2) + Data.units;
            }
            else if(['em','rem'].indexOf(Data.units) >= 0){
                result['letter-spacing'] = ((textItem.tracking || 0) / 1000).toFixed(2) + Data.units;
            }
            
        } 


        try{
            result['font-weight'] = Functions.FontWeight(textItem.fontPostScriptName || base.fontPostScriptName);
        }
        catch(e){

        }

        if(textItem.syntheticBold){
            result['font-weight'] += 100;
        }


        if(textItem.syntheticItalic || /Italic/.test(textItem.fontPostScriptName || base.fontPostScriptName)){
            result['font-style'] = 'italic';
        }

        if(textItem.fontCaps){
            if(textItem.fontCaps == 'allCaps'){
                result['text-transform'] = 'uppercase';
            }
            if(textItem.fontCaps == 'smallCaps'){
                result['text-transform'] = 'capitalize';
            }
        } 

        if(textItem.underline && textItem.underline !== 'underlineOff'){
            result['text-decoration'] = 'underline';
        }
        if(textItem.strikethrough && textItem.strikethrough !== 'strikethroughOff'){
            result['text-decoration'] = 'line-through';
        }
    

        callback(result);
    }

    this.Effects = function(callback){
        this.Get(function(data){
            var result = {};

            $.each(data,function(i,layer){
                var opacity = layer.opacity / 255;

                if(opacity < 1) result['opacity'] = opacity.toFixed(2);
            })

            callback(result)
        })  
    }

    this._convertShadow = function(deg, diameter) {
        var rad = Math.PI * deg / 180;
        var r   = (diameter + 1) / 2;

        return {x: Math.ceil(-r * Math.cos(rad)), y: Math.ceil(r * Math.sin(rad))};
    }

    this._bind = function(dump){
        $.each(dump,function(i,data){
            Generators.Css.Add(data.name+': '+data.value);
        });

        Generators.Build.Css();

        Generators.Select(Generators.work_class);
    }

    this._result = function(){
        var rangeWorkedOut = [];

        this.Get(function(data){
            $.each(data,function(i,layer){
                if(layer.textKey){
                    var textItem = layer.textKey.textStyleRange;
                    var fulltext = (layer.textKey.textKey || '').trim();

                    $.each(textItem,function(inx,text){
                        var range     = text.textStyleRange;
                        var textrange = (fulltext.slice(range.from, range.to)).trim();

                        var worked = range.from + '_' + range.to;
                        
                        if(textrange && rangeWorkedOut.indexOf(worked) == -1){
                            rangeWorkedOut.push(worked);

                            self.Font(text,function(font){
                                self._add_box('Font', font, 'font', {helper: '<span>('+(textrange.length > 20 ? textrange.slice(0,20) + '...' : textrange)+')</span>'});
                            })
                        }
                    })
                }
            })
        });

        this.Border(function(data){
            self._add_box('Border',data,'border');
        })
        this.Shadow(function(data){
            self._add_box('Shadow',data,'shadow');
        })
        this.Fill(function(data){
            self._add_box('Fill',data,'fill');
        })
        this.Size(function(data){
            self._add_box('Size',data,'size');
        })
        this.Effects(function(data){
            self._add_box('Effects',data,'effects');
        })


        var btn_group = $('<div class="form-field form-field-align-center"></div>')
        var btn       = $('<div class="btn-inline"><div class="form-btn form-btn-big">Применить</div></div>');
        var btn_css   = $('<div class="btn-inline m-l-10"><div class="form-btn form-btn-big">Копировать CSS</div></div>');

        btn.on('click',function(){
            var dump = content.serializeArray();

            if($('input',btn_group).is(':checked')){
                var c = Functions.HashCode(JSON.stringify(dump));

                if(dump_member.indexOf(c) == -1) dump_member.push(c);
            }

            self._bind(dump);

            Popup.Hide();
        });

        btn_css.on('click',function(){
            var dump = content.serializeArray();
            var rest = [];

            $.each(dump,function(i,data){
                rest.push(data.name+': '+data.value+';');
            });

            var clip = nw.Clipboard.get()
                clip.set(rest.join("\n"));

            Functions.Notify('Скопировано')
        });

        btn_group.append(btn);
        btn_group.append(btn_css);

        $('input',content).on('change',function(){
            var dump = content.serializeArray(),
                css  = [];

            $.each(dump,function(i,data){
                css.push(data.name + ':' + data.value);
            });

            $('.element',box).get(0).style.cssText = css.join(';');
        }).trigger('change');

        $('input',box).each(function(){
            var input = $(this),
                value = input.attr('value'),
                name  = input.attr('name');

            var data = Data.base[name];

            if(data !== undefined){
                data = self._needConvert(name, data);

                if(data == value) input.prop('checked', false).change();
            }
        })

        $('#size input',box).prop('checked', false).change();

        var noask = $([
            '<div class="form-field form-field-align-center m-l-10">',
                '<div>',
                    '<div class="form-checkbox m-r-10">',
                        '<input type="checkbox" id="no-ask-again" />',
                        '<label for="no-ask-again"></label>',
                    '</div>',
                '</div>',
                '<div>',
                    '<span class="help-block m-b-0 m-t-0">Больше не показывать это окно, если будут такие же свойства</span>',
                '</div>',
            '</div>'
        ].join(''));

        btn_group.append(noask);

        box.append(btn_group);

        //Фишка чуваки! да бы не шелкать постоянно применить, сделал запоминалку
        var dump_full = content.serializeArray();

        if(dump_member.indexOf(Functions.HashCode(JSON.stringify(dump_full))) >= 0){
            this._bind(dump_full);
        }
        else return true;
    }

    this._needConvert = function(name, data){
        var need = ['font-size'];

        if(need.indexOf(name) >= 0){
            return Functions.ConvertUnits(data);
        }

        return data;
    }

    this._clear = function(){
        box     = $('<div><form class="content grid grid-colums-three grid-gap-20 m-b-20"></form></div>');
        content = $('.content',box)

        boxCount = 0;

        var selectAll = $([
            '<div class="psd-pipette-preview m-b-20"><a class="element">Element</a></div>',
            '<div class="form-field form-field-space m-b-20">',
                '<div>',
                    '<div class="form-field form-field-align-center">',
                        '<div>',
                            '<div class="form-checkbox m-l-10 m-r-10">',
                                '<input type="checkbox" id="selectAll" checked />',
                                '<label for="selectAll"></label>',
                            '</div>',
                        '</div>',
                        '<div>',
                            '<h5><label for="selectAll" class="m-b-0">Выбрать все</label></h5>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div>',
                    '<select class="form-select units" name="units">',
                        '<option value="px">PX</option>',
                        '<option value="em">EM</option>',
                        '<option value="rem">REM</option>',
                    '</select>',
                '</div>',
            '</div>',
        ].join(''));

        box.prepend(selectAll);

        $('input',selectAll).on('change',function(){
            $('input',content).prop('checked', false).change();

            if($(this).is(":checked")){
                $('input',content).prop('checked', true).change();
            }
        })
        
        $('select',selectAll).val(Data.units).on('change',function(){
            var unit = $(this).val();

            $('.list-css > li',content).each(function(){

                var input = $('input',this),
                    code  = $('code',this),
                    value = input.val(),
                    orign = input.data('origin');

                if(!orign){
                    orign = value;
                    input.data('origin',value);
                }

                if(unit == Data.units){
                    input.val(orign);
                    code.text(orign);
                }
                else{
                    var nums = value.match(new RegExp('([0-9.]+(px|em|rem))', 'gi'));

                    if(nums){
                        for (var i = 0; i < nums.length; i++) {
                            var num_unit = nums[i].replace(/[0-9.]+/gi,'');
                            var num_flot = parseFloat(nums[i]);

                            if(unit !== num_unit){
                                if(num_unit == 'px' && unit !== 'px'){
                                    value = value.replace(new RegExp(nums[i],'gi'), (num_flot / 16).toFixed(2) +  unit);
                                }
                                else if(unit == 'px' && num_unit !== 'px'){
                                    value = value.replace(new RegExp(nums[i],'gi'), Math.round((num_flot * 16)) +  unit);
                                }
                                else{
                                    value = value.replace(new RegExp(nums[i],'gi'), num_flot +  unit);
                                }
                            }
                        }
                    }

                    input.val(value);
                    code.text(value);
                }
            })
        })
    }

    this._add_box = function(name, data, id_name, params = {}){
        var countData = 0;

        $.each(data,function(){
            countData++;
        })

        if(!countData) return;


        var col = $('<div></div>');
        var uid = Functions.Uid();

        var title = $([
            '<div class="form-field form-field-align-center m-b-10">',
                '<div>',
                    '<div class="form-checkbox m-l-10 m-r-10" id="'+id_name+'">',
                        '<input type="checkbox" id="'+Functions.HashCode(name + uid)+'" checked />',
                        '<label for="'+Functions.HashCode(name + uid)+'"></label>',
                    '</div>',
                '</div>',
                '<div class="form-field form-field-align-center">',
                    '<h4 class="m-r-10">'+name+'</h4>',
                    (params.helper || ''),
                '</div>',
            '</div>',
        ].join(''));

        col.append(title)

        var listBox = $([
            '<div class="form-group form-group-box p-t-0 p-b-0 m-b-0 m-l-0 m-r-0">',
                '<div class="form-content">',
                    '<ul class="list-css mixin">',
                        
                    '</ul>',
                '</div>',
            '</div>',
        ].join(''));

        var list = $('.list-css',listBox);

        col.append(listBox)

        $.each(data,function(cssName,cssValue){
            var item = $([
                '<li>',
                    '<div>',
                        '<div class="form-checkbox m-r-10">',
                            '<input type="checkbox" value="'+cssValue+'" id="'+Functions.HashCode(cssName + uid)+'" name="'+cssName+'" checked />',
                            '<label for="'+Functions.HashCode(cssName + uid)+'"></label>',
                        '</div>',

                        '<kbd>'+cssName+':</kbd> <code class="code-dark m-l-5">'+cssValue+'</code>',
                    '</div>',
                '</li>',
            ].join(''))

            list.append(item)
        })


        $('input',title).on('change',function(){
            $('input',listBox).prop('checked', false);

            if($(this).is(":checked")){
                $('input',listBox).prop('checked', true);
            }
        })

        content.append(col);
    }

}