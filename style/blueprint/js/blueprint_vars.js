Blueprint.Vars = new function(){
	this.data = {}

	this.set = function(uid,name,value){
		this.fix(uid);

		this.data[uid][name] = value;
	}
	this.get = function(uid,name){
		this.fix(uid);

		return this.data[uid][name];
	}
	this.fix = function(uid){
		if(!this.data[uid]) this.data[uid] = {};
	}
}
