// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Common Store ------------------------- //

// export target 
let YgEs={
	Name:'YgEs',
	User:{},
	_private_:{},
};

(()=>{ // local namespace 

const _rx_zero=/^(0+(|\.)0*|0*(|\.)0+)$/;
const _rx_null=/^null$/i;
const _rx_false=/^false$/i;
const _rx_undefined=/^undefined$/i;

let _prevID=(1234567890+Date.now())&0x7fffffff;
let _deltaID=727272727; // 31bit prime number, except 2 

YgEs.ShowPrivate=false;

YgEs.InitID=(init,delta=null)=>{
	_prevID=init;
	if(delta)_deltaID=delta;
}

YgEs.NextID=()=>{
	_prevID=(_prevID+_deltaID)&0x7fffffff;
	return _prevID;
}

YgEs.CreateEnum=(src)=>{

	let ll={}
	for(let i=0;i<src.length;++i)ll[src[i]]=i;
	return ll;
}

YgEs.CoreError=(src,prop=undefined)=>{

	if(YgEs.HappeningManager)YgEs.HappeningManager.Happen(src,prop);
	else throw src;
}

YgEs.CoreWarn=(src,prop=undefined)=>{

	if(YgEs.HappeningManager)YgEs.HappeningManager.Happen(src,prop);
	else if(YgEs.Log)YgEs.Log.Warn(src,prop);
	else{
		console.warn(src);
		console.dir(prop);
	}
}

function _validate_number(src,attr,tag=''){

	let dst=src;
	if(attr.Max!==undefined){
		if(dst>attr.Max){
			YgEs.CoreWarn(tag+' is too much: '+src+'/'+attr.Max);
			dst=attr.Max;
		}
	}
	if(attr.Min!==undefined){
		if(dst<attr.Min){
			YgEs.CoreWarn(tag+' is too less: '+src+'/'+attr.Min);
			dst=attr.Min;
		}
	}
	if(attr.Integer){
		let d2=Math.round(dst);
		if(d2!=dst){
			YgEs.CoreWarn(tag+' have fragments: '+dst);
			dst=d2;
		}
	}

	return dst;
}

function _validate_string(src,attr,tag=''){

	let dst=src;
	if(attr.Max!==undefined){
		if(src.length>attr.Max){
			YgEs.CoreWarn(tag+' is too long: '+src.length+'/'+attr.Max);
			dst=src.substring(0,attr.Max);
		}
	}
	if(attr.Min!==undefined){
		if(src.length<attr.Min){
			YgEs.CoreWarn(tag+' is too short: '+src.length+'/'+attr.Min);
		}
	}

	return dst;
}

function _fix_undefined(src,attr,tag=''){

	if(src===null)return src;
	if(src!==undefined)return src;
	if(attr.Default!==undefined)return attr.Default;

	if(attr.List)return []
	if(attr.Dict)return {}

	if(attr.Required){
		YgEs.CoreWarn(tag+' is missing');
	}

	return src;
}

YgEs.Validate=(src,attr,tag='')=>{

	let dst=src;

	if(attr.Any){}
	else switch(typeof src){
		case 'function':
		if(!attr.Callable){
			YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
			dst=undefined;
		}
		break;

		case 'boolean':
		if(!attr.Boolable){
			YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
			if(attr.Integer || attr.Numeric)dst=src?1:0;
			else if(attr.Literal)dst=src?'true':'false';
			else dst=undefined;
		}
		break;

		case 'number':
		if(!attr.Integer && !attr.Numeric){
			YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
			if(attr.Literal)dst=''+dst;
			else if(attr.Boolable)dst=!!dst;
			else dst=undefined;
		}
		else dst=_validate_number(src,attr,tag);
		break;

		case 'string':
		if(!attr.Literal){
			YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
			if(attr.Integer){
				dst=parseInt(dst);
				if(!attr.NaNable && Number.isNaN(dst)){
					if(attr.Boolable)dst=!!src;
					else dst=undefined;
				}
			}
			else if(attr.Numeric){
				dst=parseFloat(dst);
				if(!attr.NaNable && Number.isNaN(dst)){
					if(attr.Boolable)dst=!!src;
					else dst=undefined;
				}
			}
			else if(attr.Boolable)dst=YgEs.Booleanize(src,true);
			else dst=undefined;
		}
		else dst=_validate_string(src,attr,tag);
		break;

		case 'object':
		if(src===null){
			if(!attr.Nullable){
				YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
				if(attr.Boolable)dst=false;
				else if(attr.Integer || attr.Numeric)dst=0;
				else if(attr.Literal)dst='';
				else dst=undefined;
			}
		}
		else if(Array.isArray(src)){
			if(!attr.List){
				YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
				dst=undefiend;
			}
			else if(typeof attr.List==='object'){
				dst=[];
				for(let k in src){
					dst[k]=YgEs.Validate(src[k],attr.List,tag+'['+k+']');
				}
			}
		}
		else{
			let cnt=(attr.Dict?1:0)+(attr.Struct?1:0)+(attr.Class?1:0);
			if(cnt>1){
				YgEs.CoreWarn(tag+' has object types in a chaos',attr);
			}
			else if(attr.Dict){
				if(typeof attr.Dict==='object'){
					dst={}
					for(let k in src){
						dst[k]=YgEs.Validate(src[k],attr.Dict,tag+'["'+k+'"]');
					}
				}
			}
			else if(attr.Struct){
				if(typeof attr.Struct==='object'){
					dst={}
					for(let k in attr.Struct){
						dst[k]=YgEs.Validate(src[k],attr.Struct[k],tag+'["'+k+'"]');
					}
					for(let k in src){
						if(attr.Struct[k])continue;
						// undefined item 
						if(attr.Others)dst[k]=src[k];
						else{
							YgEs.CoreWarn(tag+'["'+k+'"] is undefined spec',src[k]);
						}
					}
				}
			}
			else if(attr.Class){
				switch(typeof attr.Class){
					case 'string':
					if(!src.IsComprised(attr.Class)){
						YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
						dst=undefined;
					}
					break;

					case 'function':
					if(!src instanceof attr.Class){
						YgEs.CoreWarn(tag+' is invalid: '+YgEs.Inspect(src));
						dst=undefined;
					}
					break;

					default:
					YgEs.CoreWarn(tag+' specified by invalid attr',attr);
					dst=undefined;
				}
			}
			else{
				YgEs.CoreWarn(tag+' has unknown object type',attr);
			}
		}
		break;
	}

	if(attr.Validator)dst=attr.Validator(dst,attr,tag);

	dst=_fix_undefined(dst,attr,tag);

	return dst;
}

YgEs.InstanceOf=(obj,name)=>{

	if(obj===null)return false;
	if(typeof obj==='object')return false;
	if(!obj.IsComprised)return false;
	return obj.IsComprised(name);
}

YgEs.SoftClass=()=>{

	const name='YgEs.SoftClass';
	let priv_idx={}

	const entrait=(name,priv,pub)=>{

		if(priv_idx[name]){
			YgEs.CoreWarn('** '+name+' already exists in class table of '+inst.GetCaption()+' **',Object.keys(priv_idx));
		}

		let t=priv?priv:{}
		priv_idx[name]=t;
		if(pub)Object.assign(inst,pub);
		return t;
	}

	let inst={
		Name:undefined,
		User:{},
		_class_:name,
		_genealogy_:[],
		_private_:YgEs.ShowPrivate?priv_idx:{},
		GetCaption:()=>inst.Name??inst._class_,
		GetClassName:()=>inst._class_,
		GetGenealogy:()=>inst._genealogy_,
		IsComprised:(name)=>!!priv_idx[name],
		Trait:(name,priv=null,pub=null)=>{
			let t=entrait(name,priv,pub);
			priv_cur._trait_.push({_class_:name,_user_:t});
			return t;
		},
		Extend:(name,priv=null,pub=null)=>{

			let t=entrait(name,priv,pub);
			let pn=inst._class_;
			inst._class_=name;
			inst._genealogy_.push(name);
			priv_cur={_class_:name,_parent_:priv_cur,_trait_:[],_super_:{},_user_:t}
			if(YgEs.ShowPrivate)inst._inherit_=priv_cur;
			return t;
		},
		Inherit:(symbol,override)=>{
			if(priv_cur._super_[symbol]){
				YgEs.CoreWarn('** '+symbol+' already exists in inheritance table of '+inst.GetCaption()+' **',priv_cur._super_);
			}

			const dst=priv_cur._super_[symbol]=inst[symbol];
			inst[symbol]=override;
			return dst;
		},
	}
	let priv_cur={_class_:name,_trait_:[],_super_:{},_user_:entrait(name)}
	if(YgEs.ShowPrivate){
		inst._inherit_=priv_cur;
		inst._private_=priv_idx;
	}

	return inst;
}

YgEs.SetDefault=(dst,def)=>{

	if(Array.isArray(def))return dst;
	if(typeof def!=='object')return dst;
	if(dst==null)dst={}

	for(let k in def){
		dst[k]=(dst[k]===undefined)?def[k]:
			YgEs.SetDefault(dst[k],def[k]);
	}
	return dst;
}

YgEs.FromError=(err)=>{
	return {
		Name:err.name,
		Msg:err.message,
		Cause:err.cause,
		File:err.fileName,
		Line:err.lineNumber,
		Col:err.columnNumber,
		Stack:err.stack,
		Src:err,
	}
}

YgEs.Booleanize=(val,stringable=false)=>{
	if(val===null)return false;
	if(val===undefined)return false;
	switch(typeof val){
		case 'boolean':
		return val;

		case 'number':
		if(isNaN(val))return true;
		break;

		case 'string':
		if(stringable){
			if(val.match(_rx_zero))return false;
			if(val.match(_rx_false))return false;
			if(val.match(_rx_null))return false;
			if(val.match(_rx_undefined))return false;
		}
		break;

		case 'object':
		return true;
	}
	return !!val;
}

YgEs.Trinarize=(val,stringable=false)=>{

	if(val==null)return null;
	if(val===undefined)return null;
	switch(typeof val){
		case 'string':
		if(stringable){
			if(val.match(_rx_null))return null;
			if(val.match(_rx_undefined))return null;
		}
		break;
	}
	return YgEs.Booleanize(val,stringable);
}

YgEs.JustString=(val)=>{
	switch(typeof val){
		case 'undefined': return 'undefined';
		case 'boolean': return val?'true':'false';
		case 'string': return val;
		case 'number': return val.toString();

		case 'object':
		if(val===null)return 'null';
		else if(Array.isArray(val)){
			let sub=[]
			for(let v of val)sub.push(YgEs.JustString(v));
			return '['+sub.join(',')+']';
		}
		else{
			let sub=[]
			for(let k in val)sub.push([JSON.stringify(k),YgEs.JustString(val[k])]);
			let sub2=[]
			for(let s of sub)sub2.push(s.join(':'));
			return '{'+sub2.join(',')+'}';
		}
		break;
	}
	return val.toString();
}

YgEs.Inspect=(val)=>{
	switch(typeof val){
		case 'undefined': return 'undefined';
		case 'number': return val.toString();

		case 'object':
		if(val===null)return 'null';
		else if(Array.isArray(val)){
			let sub=[]
			for(let v of val)sub.push(YgEs.Inspect(v));
			return '['+sub.join(',')+']';
		}
		else{
			let sub=[]
			for(let k in val)sub.push([JSON.stringify(k),YgEs.Inspect(val[k])]);
			let sub2=[]
			for(let s of sub)sub2.push(s.join(':'));
			return '{'+sub2.join(',')+'}';
		}
		break;
	}
	return JSON.stringify(val);
}

})();
export default YgEs;
