Ceron.modules.ImageCrop = function(){
	var self = this;

    var crope  = {};
    var worked = false;
    var preset = false;

    this.Init = function(){
        if(Data.imageCrope == undefined) Data.imageCrope = {};

        Arrays.extend(Data.imageCrope, {
            presets: {},
            last: ''
        });

        crope = Data.imageCrope;

        

        Generators.Module.GetHtml('image-crope',function(html){

            self.module    = $(html);

            self.input_choise = $('.image-choise',self.module);
            self.input_start  = $('.image-start',self.module);

            self.input_create_preset = $('.image-create-preset',self.module);
            self.input_create_image  = $('.image-create-image',self.module);

            self.input_path_watch = $('.image-path-watch',self.module);
            self.input_path_save  = $('.image-path-save',self.module);

            self.dom_images   = $('.image-images',self.module);
            self.dom_image    = $('.image-item',self.module);
            
            self.dom_presets  = $('.image-presets',self.module);
            self.dom_preset   = $('.image-preset',self.module).hide();
            self.dom_empty    = $('.image-empty',self.module);

            self.dom_work     = $('.image-work',self.module);

            //если поменяли пресет
            self.input_choise.on('change', function(){
                self.ChoisePreset($(this).val());

                Generators.Module.Fixed(self.module);
            });

            //билдим выбора папок
            $('.image-path',self.module).on('click',function(){
                var input = $('input',this);
                var name  = input.attr('name');

                File.Choise('fileDir',function(folder){
                    preset[name] = Functions.NormalPath(folder);

                    input.val(preset[name]);
                },preset[name]);
            });

            //кнопка старт
            self.input_start.on('click',function(){
                self.Start();
            });

            //кнопка создать услове
            self.input_create_image.on('click',function(){
                self.CreateImage();

                Generators.Module.Fixed(self.module);
            });

            //кнопка создать пресет
            self.input_create_preset.on('click',function(){
                self.CreatePreset();

                Generators.Module.Fixed(self.module);
            });

            //фиксим старую версию
            self.ForOld();

            //билдим список пресетов
            $.each(crope.presets, function(uid, data){
                self.AddPreset(uid);
            });
           
            Generators.Module.AddToTool(self.module);

            //если был выбран пресет ранее, то выбераем его
            if(crope.last) self.ChoisePreset(crope.last);
        })
    }

    /**
     * Для прошлой версии, данные переводим в пресет
     */
    this.ForOld = function(){
        if(crope.images && !Arrays.getValues(crope.presets).length){
            var uid = Functions.Uid();

            var pre = {
                name: 'Preset',
                images: Arrays.clone(crope.images),
                watch: crope.watch,
                save: crope.save
            }

            crope.presets[uid] = pre;

            delete crope.images;
            delete crope.watch;
            delete crope.save;

            this.ChoisePreset(uid);
        }
    }

    /**
     * Выбрать пресет
     * @param {String} choise - uid пресета
     */
    this.ChoisePreset = function(choise){
        preset = choise ? crope.presets[choise] : false;
        
        crope.last = choise;

        if(preset){
            this.dom_preset.show();
            this.dom_empty.hide();
            this.dom_images.empty();


            Form.InputSetValue(this.input_path_watch, preset.watch);
            Form.InputSetValue(this.input_path_save, preset.save);

            $.each(preset.images, function(i, data){
                self.AddImage(data);
            });
        }
        else{
            this.dom_preset.hide();
            this.dom_empty.show();
        }
    }

    /**
     * Выбераем любой доступный пресет
     */
    this.ChoiseAnyPreset = function(){
        var any = '';

        for(var i in crope.presets){
            any = i; break;
        }

        this.ChoisePreset(any);
    }

    /**
     * Создать пресет
     */
    this.CreatePreset = function(){
        var uid = Functions.Uid();

        var pre = {
            name: 'Preset',
            images: [],
            watch: '',
            save: ''
        }

        crope.presets[uid] = pre;

        this.AddPreset(uid);

        if(!crope.last){
            crope.last[uid];

            this.ChoisePreset(uid);
        }
    }

    /**
     * Добавить пресет
     * @param {String} uid
     */
    this.AddPreset = function(uid){
        var data = crope.presets[uid];

        var elem_option = $('<option value="'+uid+'">'+data.name+'</option>');

        var elem_item = $([
            '<li>',
                '<div class="name">'+data.name+'</div>',
                '<div>',
                    '<ico class="edit m-r-5"><img src="style/img/icons-panel/pencel.png"></ico>',
                    '<ico class="delete"><img src="style/img/icons-panel/delete.png"></ico>',
                '</div>',
            '</li>',
        ].join(''));

        var elem_name   = $('.name',elem_item);
        var elem_edit   = $('.edit',elem_item);
        var elem_delete = $('.delete',elem_item);

        elem_delete.on('click', function(){
            delete crope.presets[uid];

            elem_option.remove();

            elem_item.remove();

            if(crope.last == uid) self.ChoiseAnyPreset();
        })

        elem_edit.on('click', function(e){
            Popup.Name(elem_edit,(value)=>{
                data.name = value;

                elem_name.text(value);
                elem_option.text(value);

            },{width: 'auto', value: data.name, position: {left: e.clientX, top: e.clientY}})
        })

        self.input_choise.append(elem_option);

        self.dom_presets.append(elem_item);
    }

    /**
     * Создать условие
     */
    this.CreateImage = function(){
        var data = {
            folder_name: 'small',
            width: 1200,
            height: 500,
            croped: 'contain'
        }

        this.AddImage(data);

        preset.images.push(data);
    }

    /**
     * Добавить условие
     * @param {Object} data - параметры условия
     */
    this.AddImage = function(data){
        var clone = self.dom_image.clone();

        Form.InputDrag($('.num',clone),'');

        Form.InputChangeEvent($('.form-input',clone), function(name, value){
            data[name] = value;
        });

        Form.RadioChangeEvent($('.type',clone),function(name){
            data.croped = name;
        });

        Form.RadioSetValue($('.type',clone),data.croped);

        Form.InputSetValue($('.folder_name',clone), data.folder_name);

        Form.InputSetValue($('.width',clone), data.width);
        Form.InputSetValue($('.height',clone), data.height);

        $('.delete',clone).on('click', function(){
            Arrays.remove(preset.images, data);

            clone.remove();

            Generators.Module.Fixed(self.module);
        })

        self.dom_images.append(clone);
    }

    /**
     * Запуск
     */
    this.Start = function(){
        if(worked) return;

        if(!preset.watch) return Functions.Error('Укажите путь к папке с изображениями');
        if(!preset.save)  return Functions.Error('Укажите путь к папке для сохранения');
        if(!preset.images.length) return Functions.Error('Создайте хотя бы одно условие');

        worked = true;

        self.dom_work.css({"opacity": 0.4, "pointer-events": 'none'});

        var proces = Process.Add();
            proces.name('Обрезка изображений');
            proces.work(preset.save);

        var json = JSON.stringify(preset.images);
        var base = btoa(json);
        
        Psd.ImageMagick(
            'resizefolder',
            preset.watch,
            preset.save,
            base,
            '',
            function(){
                proces.complite();

                self.dom_work.css({"opacity": 1, "pointer-events": 'all'});

                worked = false;
            },
            function(){
                proces.error();

                self.dom_work.css({"opacity": 1, "pointer-events": 'all'});

                worked = false;
            }
        );
        
    }

    this.Select = function(){

    }
}