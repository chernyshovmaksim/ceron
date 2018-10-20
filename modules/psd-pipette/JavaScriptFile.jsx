#target photoshop

/*
 *
 * Descriptor-Info
 * JSX script to recursively get all the properties in an ActionDescriptor used in Adobe applications
 * 
 * Author: Javier Aroche (https://github.com/JavierAroche)
 * Repo: https://github.com/JavierAroche/descriptor-info
 * Version: v1.0.0
 * License MIT
 *
 */

/*
 * Descriptor Info constructor.
 * @constructor
 */
function DescriptorInfo() {}

/*
 * @public
 * Handler function to get Action Descriptor properties
 * @param {Object} Action Descriptor
 * @param {Object} Optional params object
 *    @flag {Boolean} reference - return reference descriptors. Could slighly affect speed.
 *    @flag {Boolean} extended - returns extended information about the descriptor.
 */
DescriptorInfo.prototype.getProperties = function( theDesc, params ) {
    // Define params
    this.descParams = {
        reference : params ? params.reference : false,
        extended : params ? params.extended : false
    };
    
    if( theDesc == '[ActionList]' ) {
        return this._getDescList( theDesc );
    } else {
        return this._getDescObject( theDesc, {} );
    }
};

/*
 * @private
 * Handler function to get the items in an ActionDescriptor Object
 * @param {Object} Action Descritor
 * @param {Object} Empty object to return (required since it's a recursive function)
 */
DescriptorInfo.prototype._getDescObject = function( theDesc, descObject ) {
    for( var i = 0; i < theDesc.count; i++ ) {        
        try {
            var descType = ( theDesc.getType( theDesc.getKey(i) ) ).toString();
			
			var descProperties,
				descStringID = typeIDToStringID( theDesc.getKey(i) ),
				descCharID = typeIDToCharID( theDesc.getKey(i) );
            
			if( this.descParams.extended ) {
				descProperties = {
					stringID : descStringID,
					charID : descCharID,
					id : theDesc.getKey(i),
					key : i,
					type : descType,
					value : this._getValue( theDesc, descType, theDesc.getKey(i) )
				};
			} else {
				descProperties = this._getValue( theDesc, descType, theDesc.getKey(i) );
			}
            
            var objectName = descStringID == '' ? descCharID : descStringID;
            
            switch( descType ) {
                case 'DescValueType.OBJECTTYPE':
					if( this.descParams.extended ) {
						descProperties.object = this._getDescObject( descProperties.value, {} );
					} else {
						descProperties = this._getDescObject( descProperties, {} );
					}
                    break;
                
                case 'DescValueType.LISTTYPE':
					if( this.descParams.extended ) {
                    	descProperties.list = this._getDescList( descProperties.value );
					} else {
						descProperties = this._getDescList( descProperties );
					}
                    break;
                    
                case 'DescValueType.ENUMERATEDTYPE':
                    descProperties.enumerationType = typeIDToStringID(theDesc.getEnumerationType( theDesc.getKey(i) ));  
                    break;
                    
                case 'DescValueType.REFERENCETYPE':
                    if( this.descParams.reference ) {
						if( this.descParams.extended ) {
							descProperties.reference = executeActionGet( descProperties.value );
						} else {
							descProperties = executeActionGet( descProperties );
						}
                    }
                    break;
                
                default: 
                    break;
            }
            
            descObject[objectName] = descProperties;
            
        } catch(err) {
            $.writeln('error: ' + descStringID + ' - ' + err);
        }
    }
    
    return descObject;
};

/*
 * @private
 * Handler function to get the items in an ActionList
 * @param {Object} Action List
 */
DescriptorInfo.prototype._getDescList = function( list ) {
    var listArray = [];
        
    for ( var ii = 0; ii < list.count; ii++ ) {
        var listItemType = list.getType(ii).toString();
        var listItemValue = this._getValue( list, listItemType, ii );
        
        switch( listItemType ) {
            case 'DescValueType.OBJECTTYPE':
                var listItemOBJ = {};
				
				var listItemProperties,
					descStringID = typeIDToStringID( list.getClass(ii) );
                
				if( this.descParams.extended ) {
					listItemProperties = {
						stringID : descStringID,
						key : ii,
						type : listItemType,
						value : listItemValue
					};

					listItemProperties.object = this._getDescObject( listItemValue, {} );
				} else {
					listItemProperties = this._getDescObject( listItemValue, {} );
				}
                
                var listItemObject = {};
                listItemObject[descStringID] = listItemProperties;
                
                listArray.push( listItemObject );
                break;

            case 'DescValueType.LISTTYPE':
                listArray.push( this._getDescList( listItemValue ) );
                break;
            
            case 'DescValueType.REFERENCETYPE':
                if( this.descParams.reference ) {
                    listArray.push( executeActionGet( listItemValue ) );
                } else {
                    listArray.push( listItemValue );
                }
                break;

            default: 
                listArray.push( listItemValue );
                break;
        }
    }
    
    return listArray;
}

/*
 * @private
 *
 * Based on code by Michael Hale
 * http://www.ps-scripts.com/
 *
 * Handler function to get the value of an Action Descriptor
 * @param {Object} Action Descriptor
 * @param {String} Action Descriptor type
 * @param {Number} Action Descriptor Key / Index
 */
DescriptorInfo.prototype._getValue = function( theDesc, descType, position ) {    
    switch( descType ) {  
        case 'DescValueType.BOOLEANTYPE':  
            return theDesc.getBoolean( position );  
            break;

        case 'DescValueType.CLASSTYPE':  
            return theDesc.getClass( position );  
            break;

        case 'DescValueType.DOUBLETYPE':  
            return theDesc.getDouble( position );  
            break;

        case 'DescValueType.ENUMERATEDTYPE':  
            return typeIDToStringID(theDesc.getEnumerationValue( position ));  
            break;

        case 'DescValueType.INTEGERTYPE':  
            return theDesc.getInteger( position );  
            break;

        case 'DescValueType.LISTTYPE':  
            return theDesc.getList( position );  
            break;

        case 'DescValueType.OBJECTTYPE':
            return theDesc.getObjectValue( position );  
            break;

        case 'DescValueType.REFERENCETYPE':
            return theDesc.getReference( position );  
            break;

        case 'DescValueType.STRINGTYPE':
            var str = '';
            return str + theDesc.getString( position );  
            break;

        case 'DescValueType.UNITDOUBLE':  
            return theDesc.getUnitDoubleValue( position );  
            break;        
        
        case 'DescValueType.ALIASTYPE':  
            return decodeURI(theDesc.getPath( position ));
            break;
        
        case 'DescValueType.RAWTYPE':  
            return theDesc.getData( position );
            break;

        default:
            break;  
    };
};

// Create a new Descriptor instance
var descriptorInfo = new DescriptorInfo();

if(typeof JSON!=='object'){JSON={};}(function(){'use strict';function f(n){return n<10?'0'+n:n;}function this_value(){return this.valueOf();}if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+f(this.getUTCMonth()+1)+'-'+f(this.getUTCDate())+'T'+f(this.getUTCHours())+':'+f(this.getUTCMinutes())+':'+f(this.getUTCSeconds())+'Z':null;};Boolean.prototype.toJSON=this_value;Number.prototype.toJSON=this_value;String.prototype.toJSON=this_value;}var cx,escapable,gap,indent,meta,rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}if(typeof rep==='function'){value=rep.call(holder,key,value);}switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==='string'){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}if(typeof JSON.stringify!=='function'){escapable=/[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}return str('',{'':value});};}if(typeof JSON.parse!=='function'){cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}return reviver.call(holder,key,value);}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}throw new SyntaxError('JSON.parse');};}}());

function copyTextToClipboard( txt ){
	return txt;
}

function getSelectedLayers() {  
      var A = [];  
      var B = [];
      
      var ac = app.activeDocument.activeLayer;
      
      var desc11 = new ActionDescriptor();  
      var ref9 = new ActionReference();  
      ref9.putClass(stringIDToTypeID('layerSection'));  
      desc11.putReference(charIDToTypeID('null'), ref9);  
      
      var ref10 = new ActionReference();  
      ref10.putEnumerated(charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));  
      
      
      desc11.putReference(charIDToTypeID('From'), ref10);  
      executeAction(charIDToTypeID('Mk  '), desc11, DialogModes.NO);  
      
      var gL = activeDocument.activeLayer.layers;  
      
      for (var i = 0; i < gL.length; i++) {  
         A.push(gL[i]);  
         
         app.activeDocument.activeLayer = gL[i];
         
         var ref = new ActionReference();
                ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
       
         var desc = executeActionGet(ref);
         var descObject = descriptorInfo.getProperties( desc );  
      
         B.push(descObject);
      }  
  
      executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);  
      
      app.activeDocument.activeLayer = ac;
      
      return B;  
   }

try{
    var layers = getSelectedLayers();
    /*
    var layers = app.activeDocument.layers;

    $.writeln(layers);

    var ref = new ActionReference();
           ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var desc = executeActionGet(ref);
    var descObject = descriptorInfo.getProperties( desc );  
    */  
    var json = JSON.stringify( layers );

    copyTextToClipboard(json);
}
catch(e){
    
}



