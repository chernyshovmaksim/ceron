Blueprint.Utility = {
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
    	var snap = size || 15;
        
        value = (value/snap).toFixed() * snap;
        
        return value;
    },

    snapPosition: function(position,size){
    	if(Blueprint.snaped){
			position.x = Blueprint.Utility.snapValue(position.x)
			position.y = Blueprint.Utility.snapValue(position.y)
    	}

    	return position;
    }
}
