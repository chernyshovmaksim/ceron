Blueprint.classes.Operator = function(data,workers,blueprintUid){
	this.data         = data;
	this.blueprintUid = blueprintUid;

	/** Воркер и воркеры **/
	this.workers     = workers;
	this.worker      = Blueprint.Worker.get(this.data.worker);

	/** Родители **/
	this.parents     = [];

	/** Счетчик вызовов **/
	this.callCounter = 0;

	/** Значения для детей **/
	this.values      = {}
}
Blueprint.classes.Operator.prototype = {
	/** Для начала, нам нуно найти родителей, 
		чтобы подсчитать callCounter **/
	init: function(){
		for(var i = 0 ; i < this.data.parents.length; i++){
			var parent = this.searchParent(this.data.parents[i].uid);

			if(parent) this.parents.push(parent);
		}
	},
	/** Функция поиска родителей **/
	searchParent: function(uid){
		for(var i = 0 ; i < this.workers.length; i++){
			var worker = this.workers[i];

			if(worker.data.uid == uid){
				return worker;
			}
		}
	},
	getDefault: function(entrance,name){
		var value = this.data.varsData[entrance][name];

		if(value == undefined) value = '';

		return value;
	},
	getDefaultFromWorker: function(entrance,name){
		var value = '';

		try{
			value = this.worker.params.vars[entrance][name].value;

			if(value == undefined) value = '';
		}
		catch(e){ }

		return value;
	},
	/** Вытавскивае значение у родителей **/
	getValue: function(name,getDefault){
		var values = [];

		var defaultValue = this.getDefault('input',name) || this.getDefaultFromWorker('input',name);

		for(var i = 0 ; i < this.data.parents.length; i++){
			var parent = this.data.parents[i];

			if(parent.input == name){
				var worker = this.searchParent(parent.uid),
					val;

				if(worker) val = worker.values[parent.output];

				if(val == undefined) val = ''; //значение у парента нету, значит пустое задаем

				values.push(val);
			}
		}

		if(values.length == 0 && getDefault && defaultValue){
			values.push(defaultValue)
		}

		return this.concat(values);
	},
	/** Вытаскиваем значения в единый массив **/
	concat: function(values){
		var concat = [];

		function get(arr){
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i];

                if(Arrays.isArray(a)) get(a);
                else concat.push(a);
            }
        }

        get(values);

        return concat;
	},
	isAnyTrue: function(input){
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
	removeEmpty: function(arr){
		return arr.filter(function (e) { return e != '' });
	},
	/** Устанавливаем значение **/
	setValue: function(name,value){
		this.values[name] = value;
	},
	start: function(){

	},
	build: function(){
		
	}
}
