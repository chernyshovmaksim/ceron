var Arrays = new function(){
    this.toObject = function(a){
        if(Object.prototype.toString.call( a ) === '[object Object]') return a;
        else{
            a = {};
            
            return a;
        }
    }
    this.toArray = function(a){
        if(Object.prototype.toString.call( a ) === '[object Object]'){
            var b = [];
            
            for(var i in a) b.push(a[i]);
            
            return b;
        }
        else if(typeof a == 'string' || a == null) return [];
        else return a;
    }
    this.decodeJson = function(string){
        var json = {};
        
        try{
            json = JSON.parse(string);
        }
        catch(e){
            
        }
        
        return json;
    }
    this.isObject = function(a){
        return Object.prototype.toString.call( a ) === '[object Object]';
    }
    this.isArray = function(a){
        return Object.prototype.toString.call( a ) === '[object Array]';
    }
    this.getRecursive = function(obj,path){
        var tmp;
        
        for(var i = 0; i < path.length; i++) tmp = i ? tmp[path[i]] : obj[path[i]];
        
        return tmp;
    }
    this.setRecursive = function(obj,path,value){
        var tmp;
        
        if(!path.length) return;
        else if(path.length == 1) obj[path[0]] = value;
        else{
            this.createPath(obj,path);
            
            for(var i = 0; i < path.length; i++){
                if(i == path.length-1) tmp[path[i]] = value;
                else{
                    tmp = i ? tmp[path[i]] : obj[path[i]];
                }
            }
        }
    }
    this.getSplit = function(a,s){
        return a !== undefined && typeof a === 'string' ? a.split(s) : [];
    }
    this.createPath = function(a,path){
        if(path.length >= 2){
            var extend = {};
            var tmp;
            
            for(var i = 0; i < path.length - 1; i++){
                if(!i){
                    if(extend[path[i]] == undefined) extend[path[i]] = {};
                    
                    tmp = extend[path[i]];
                }
                else{
                    if(tmp[path[i]] == undefined) tmp[path[i]] = {};
                    
                    tmp = tmp[path[i]];
                }
            }
            
            this.extend(a,extend);
        }
    }
    this.extend = function(a,b,replase){
        for(var i in b){
            if(typeof b[i] == 'object'){
                if(a[i] == undefined) a[i] = Object.prototype.toString.call( b[i] ) == '[object Array]' ? [] : {};
                
                this.extend(a[i],b[i],replase);
            } 
            else if(a[i] == undefined || replase) a[i] = b[i];
        }
    }
    this.getKeys = function(a,add){
        var k = add || [];
        
        for(var i in a) k.push(i);
        
        return k;
    }
    this.getValues = function(a,add){
        var k = add || [];
        
        for(var i in a) k.push(a[i]);
        
        return k;
    }
    this.getRandom = function(arr){
        return arr[Math.floor(Math.random() * arr.length)];
    }
    this.walk = function(a,call,value){
        var b = this.toArray(a);
        
        for(var i = 0; i < b.length; i++){
            if(b[i][call]) b[i][call](value);
        } 
    }
    this.walkReverse = function(a,call,value){
        var b = this.toArray(a);
        
        for(var i = b.length - 1; i >= 0; i--) {
            if(b[i] && b[i][call]) b[i][call](value);
        }
    }
    this.traverse = function(a,call){
        var b = this.toArray(a);
        
        for(var i = b.length - 1; i >= 0; i--) {
            call(b[i])
        }
    }
    this.remove = function(a,b){
        var inx = a.indexOf( b );
        
        if(inx >= 0) a.splice( inx, 1 );
    }

    this.clone = function(a){
        return JSON.parse(JSON.stringify(a));
    }

    this.insert = function(a,index,item){
        a.splice( index, 0, item );
    }
    
    /** В рандомном порядке отсортировать **/
    this.shuffle = function(array){
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    
    this.flip = function(trans){
        var key, tmp_ar = {};
    
        for(key in trans){
            if(trans.hasOwnProperty(key)) {
                tmp_ar[trans[key]] = key;
            }
        }
    
        return tmp_ar;
    }

    this.last = function(arr){
        return arr.slice(-1)[0];
    }

    
    this.getRandomSubarray = function(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }
    
    this.sortBy = function(arr,by){
        var sor = [],res = {};
        
        for(var id in arr) sor.push([id, arr[id][by]]);
        
        sor.sort(function(a, b){
            return a[1] - b[1];
        });
        
        //sor.reverse();
        
        for(var i = 0; i < sor.length; i++) res[sor[i][0]] = arr[sor[i][0]];
        
        return res;
    }
    
    this.reverse = function(arr){
        var k = this.getKeys(arr);
            k.reverse();
            
        var b = {};
        
        for(var i = 0; i < k.length; i++) b[k[i]] = arr[k[i]];
        
        return b;
    }

    this.removeDublicate = function(a, b){
        for(var i in a){
            if(b[i] !== undefined && b[i] == a[i]) delete b[i];
        }
    }

    this.isEqual = function(a, b){
        var equal = true;

        if(this.isObject(a)){
            var la = this.toArray(a);
            var lb = this.toArray(b);

            if(la.length == lb.length){
                for(var i in a){
                    if(b[i] == undefined || a[i] !== b[i]) equal = false;
                }
            }
            else{
                equal = false;
            }
        }
        else if(a.length == b.length){
            for (var i = 0; i < a.length; i++) {
                if(a[i] !== b[i]) equal = false;
            }
        }
        else{
            equal = false;
        }
        
        return equal;
    }
}