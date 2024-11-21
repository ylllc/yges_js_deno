// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Common Utilities //

import hap from './happening.js';

const rx_zero=/^(0+(|\.)0*|0*(|\.)0+)$/;
const rx_null=/^null$/i;
const rx_false=/^false$/i;
const rx_undefined=/^undefined$/i;

var mif={
	name:'YgEs_Utilities',
	User:{},

	isJustNaN:(val)=>{
		if(typeof val!=='number')return false;
		return isNaN(val);
	},

	isJustInfinity:(val)=>{
		if(val===Infinity)return true;
		if(val===-Infinity)return true;
		return false;
	},

	isEmpty:(val)=>{
		if(val===null)return true;
		if(val===undefined)return true;
		if(val==='')return true;
		return false;
	},

	isValid:(val)=>{
		if(val===null)return false;
		if(val===undefined)return false;
		if(mif.isJustNaN(val))return false;
		return true;
	},

	booleanize:(val,stringable=false)=>{
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
				if(val.match(rx_zero))return false;
				if(val.match(rx_false))return false;
				if(val.match(rx_null))return false;
				if(val.match(rx_undefined))return false;
			}
			break;

			case 'object':
			return true;
		}
		return !!val;
	},

	trinarize:(val,stringable=false)=>{
		if(val==null)return null;
		if(val===undefined)return null;
		switch(typeof val){
			case 'string':
			if(stringable){
				if(val.match(rx_null))return null;
				if(val.match(rx_undefined))return null;
			}
			break;
		}
		return mif.booleanize(val,stringable);
	},

	zerofill:(val,col,sgn=false)=>{
		var sf=val<0;
		if(sf)val=-val;

		var ss=sf?'-':sgn?'+':'';
		col-=ss.length;
		var vs=''+val;
		if(vs.length>=col)return ss+vs;

		vs='0'.repeat(col-1)+vs;
		return ss+vs.substring(vs.length-col);
	},

	justString:(val)=>{
		switch(typeof val){
			case 'undefined': return 'undefined';
			case 'boolean': return val?'true':'false';
			case 'string': return val;
			case 'number': return val.toString();

			case 'object':
			if(val===null)return 'null';
			else if(Array.isArray(val)){
				var sub=[]
				for(var v of val)sub.push(mif.justString(v));
				return '['+sub.join(',')+']';
			}
			else{
				var sub=[]
				for(var k in val)sub.push([JSON.stringify(k),mif.justString(val[k])]);
				var sub2=[]
				for(var s of sub)sub2.push(s.join(':'));
				return '{'+sub2.join(',')+'}';
			}
			break;
		}
		return val.toString();
	},

	inspect:(val)=>{
		switch(typeof val){
			case 'undefined': return 'undefined';
			case 'number': return val.toString();

			case 'object':
			if(val===null)return 'null';
			else if(Array.isArray(val)){
				var sub=[]
				for(var v of val)sub.push(mif.inspect(v));
				return '['+sub.join(',')+']';
			}
			else{
				var sub=[]
				for(var k in val)sub.push([JSON.stringify(k),mif.inspect(val[k])]);
				var sub2=[]
				for(var s of sub)sub2.push(s.join(':'));
				return '{'+sub2.join(',')+'}';
			}
			break;
		}
		return JSON.stringify(val);
	},

	safeStepIter:(bgn,end,step,cbiter)=>{

		var cnt=bgn;
		if(!step){
			// zero stride, do nothing 
			return cnt;
		}
		if(bgn==end)return cnt;

		if(step<0 != end-bgn<0){
			hap.happenProp({msg:'backward',bgn:bgn,end:end,step:step});
			return cnt;
		}

		var abort=false;
		for(;(step<0)?(cnt>end):(cnt<end);cnt+=step){
			if(abort)return cnt;
			((cnt_)=>{
				if(cbiter(cnt_)===false)abort=true;
			})(cnt);
		}

		return cnt;
	},

	safeArrayIter:(src,cbiter)=>{

		var abort=false;
		for(var t of src){
			if(abort)return;
			((t_)=>{
				if(cbiter(t_)===false)abort=true;
			})(t);
		}
	},

	safeDictIter:(src,cbiter)=>{

		var abort=false;
		for(var k in src){
			if(abort)return;
			((k_)=>{
				if(cbiter(k_,src[k_])===false)abort=true;
			})(k);
		}
	},
}

export default mif;
