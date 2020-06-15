Blueprint.Utility = {
    sticking_ammount: 8,

	uid: function(len){
        var ALPHABET  = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var ID_LENGTH = len || 8;

        var id = '';

        for (var i = 0; i < ID_LENGTH; i++) {
            id += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
        }

        return id;
    },

    hashCode: function(str){
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },

    capitalizeFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    blueprintFolder: function(){
        return  nw.path.dirname(Config.config.lastProject) + '/blueprint';
    },

    negative: function(n){
        return n >= 0 ? -n : Math.abs(n);
    },

    snapValue: function(value,size){
    	var snap = size || 4;
        
        value = (value/snap).toFixed() * snap;
        
        return value;
    },

    snapPosition: function(position,size){
        if(Blueprint.snaped){
            var stick = this.checkSticking(Blueprint.Render.sticking, position, size);

            if(stick.sticked){
                position.x = stick.point.x;
                position.y = stick.point.y;

                Blueprint.Render.stick = stick;
            }
            else{
                position.x = Blueprint.Utility.snapValue(position.x)
                position.y = Blueprint.Utility.snapValue(position.y)

                Blueprint.Render.stick = false;
            }
        }

    	return position;
    },

    getNodesConner: function(nodes){
        var box = {
            x: Infinity,
            y: Infinity,
        }

        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i],
                posi = node.data.position;

            box.x = Math.min(box.x, posi.x);
            box.y = Math.min(box.y, posi.y);
        }

        return box;
    },

    getViewportPoint: function(position){
        return {
            x: position.x / Blueprint.Viewport.scale - Blueprint.Viewport.position.x,
            y: position.y / Blueprint.Viewport.scale - Blueprint.Viewport.position.y
        }
    },

    getScreenPoint: function(position){
        return {
            x: position.x * Blueprint.Viewport.scale + Blueprint.Viewport.position.x,
            y: position.y * Blueprint.Viewport.scale + Blueprint.Viewport.position.y,
        }
    },

    getDataPointToScreen: function(position){
        return {
            x: (position.x + Blueprint.Viewport.position.x) * Blueprint.Viewport.scale,
            y: (position.y + Blueprint.Viewport.position.y) * Blueprint.Viewport.scale
        }
    },

    getStickingNodes: function(select, start){
        var diff = {};

        //получаем реальную точку в вьюпорте
        var poin = this.getViewportPoint(start);

        //вычисляем левый верхний угол
        var conr = this.getNodesConner(select);

        //где реально находится угол на экране
        var scrn = this.getScreenPoint(conr)

        //разница между вьюпортом и экраном
        var offt = {
            x: conr.x - scrn.x,
            y: conr.y - scrn.y
        }
        
        //разница между курсором, углом и экраном
        diff.x = conr.x - poin.x + offt.x;
        diff.y = conr.y - poin.y + offt.y;

        return this.getSticking(diff);
    },

    getSticking: function(differ){
        var dif = differ ? differ : {x: 0, y: 0};

        //дальше самое интресное
        var sticking = [];

        var node, point, height, width;

        var all = [].concat(Blueprint.Render.nodes, Blueprint.Render.helpers);

        //надо найти линии 
        for (var i = 0; i < all.length; i++) {

            node   = all[i];
            point  = node.data.position;

            height = node.node.outerHeight();
            width  = node.node.outerWidth();

            //добовляем линии
            
            //линия |
            sticking.push({
                pos: point.x - dif.x, 
                dir: 'y',
                node: node, 
                dif: dif
            });
            
            //линия --
            sticking.push({
                pos: point.y - dif.y, 
                dir: 'x',
                node: node, 
                dif: dif
            });

            
            if(Blueprint.Drag.drag.node){
                var in_height = Blueprint.Drag.drag.node.node.outerHeight(),
                    in_width  = Blueprint.Drag.drag.node.node.outerWidth()

                if(height == in_height){
                    sticking.push({
                        pos: point.y + height - dif.y, 
                        dir: 'x',
                        node: node, 
                        dif: dif
                    });
                }
                else{
                    sticking.push({
                        pos: point.y + (height - in_height) - dif.y, 
                        dir: 'x',
                        node: node, 
                        dif: dif
                    });

                    sticking.push({
                        pos: point.y + (height / 2 - in_height / 2) - dif.y, 
                        dir: 'x',
                        node: node, 
                        dif: dif
                    });
                }

                if(width == in_width){
                    sticking.push({
                        pos: point.x + width - dif.x, 
                        dir: 'y',
                        node: node, 
                        dif: dif
                    });
                }
                else{
                    sticking.push({
                        pos: point.x + (width - in_width) - dif.x, 
                        dir: 'y',
                        node: node, 
                        dif: dif
                    });

                    sticking.push({
                        pos: point.x + (width / 2 - in_width / 2) - dif.x, 
                        dir: 'y',
                        node: node, 
                        dif: dif
                    });
                }
            }
        }


        return sticking;
    },

    getStickingHeight: function(differ){
        var dif = differ ? differ : {x: 0, y: 0};

        //дальше самое интресное
        var sticking = [];

        var node, point;

        //надо найти линии 
        for (var i = 0; i < Blueprint.Render.nodes.length; i++) {
            node = Blueprint.Render.nodes[i];

            point = node.data.position;

            //линия --
            sticking.push({
                pos: point.y - dif.y, 
                node: node, 
                height: node.node.outerHeight(),
                dif: dif
            });
        }

        return sticking;
    },

    getStickingVertical: function(point, differ){
        var sticks = this.getStickingHeight(differ);
        var found  = null;

        sticks.sort(function(a,b){
            if(a.height > b.height) return -1;
            else if(a.height < b.height) return 1;
            else return 0;
        });

        for (var i = 0; i < sticks.length; i++) {
            var stick = sticks[i];

            if(point.y >= stick.pos && point.y <= stick.pos + stick.height){
                found = stick.pos;
            }
        }

        return found;
    },

    checkSticking: function(sticking, point, ammount){
        var st,dr,tr,df,cr = {
            x: (point.pageX || point.left || point.x),
            y: (point.pageY || point.top || point.y)
        };

        var power = ammount || this.sticking_ammount;

        var ds = {x: Infinity,y: Infinity};

        for (var i = 0; i < sticking.length; i++) {
            st = sticking[i];
            dr = st.dir == 'x' ? 'y' : 'x';

            if(cr[dr] > st.pos - power && cr[dr] < st.pos + power ){
                df = cr[dr] > st.pos ? cr[dr] - st.pos : st.pos - cr[dr];

                if(df < ds[dr]){
                    cr[dr] = st.pos;
                    ds[dr] = df;

                    tr = st;
                }
            }
        }

        return {
            sticked: tr,
            point: cr
        };
    },

    onChange: function(input){
        var change = false;

        function check(arr){
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];

                if(Arrays.isArray(a)) check(a);
                else if(a) change = true;
            }
        }

        check(input);

        return change;
    },
    intersect: function(r1, r2) {
        r1.right  = r1.left + r1.width;
        r1.bottom = r1.top + r1.height;

        r2.right  = r2.left + r2.width;
        r2.bottom = r2.top + r2.height;

        return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
    },
    intersectPoint: function(box, point){
        return point.x > box.left && point.x < box.left + box.width && point.y > box.top && point.y < box.top + box.height;
    },
    compareVarialbe: function(from, to, from_var, to_var){
        var entrance_from = from.params.vars.output[from_var];
        var entrance_to   = to.params.vars.input[to_var];

        //если это тунель, то велком
        if(entrance_from.tunnel || entrance_to.tunnel){
            return true;
        }
        //если (В) нету не каких разрешений
        else if(!entrance_to.allowed){
            //но (ИЗ) стоят разрешения
            if(entrance_from.allowed){
                //если (ИЗ) есть разрешение (строка) то все гуд
                if(entrance_from.allowed.indexOf('string') !== -1) return true;
            }
            else return true;
        }
        //если (ИЗ) нету разрешений но есть разрешения (В)
        else if(!entrance_from.allowed){
            //если (В) есть разрешение (строка) то все гуд
            if(entrance_to.allowed.indexOf('string') !== -1) return true;
        }
        //если у обоих есть разрешения
        else{
            //то проверяем есть ли обшие разрешение у обоих входа
            if(entrance_to.allowed.filter(element => entrance_from.allowed.includes(element)).length) return true;
        }

        return false;
    },
    maxConnections: function(compare, node, variable){
        var max = node.params.vars.input[variable].maxConnections;

        if(max){
            var count = node.data.parents.filter(elem => elem.input == variable);

            if(count.length >= max) return false;
        }

        return compare;
    }
}
