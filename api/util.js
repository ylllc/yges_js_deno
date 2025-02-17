// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';

// Utilities ---------------------------- //
(()=>{ // local namespace 

const _rx_zero=/^(0+(|\.)0*|0*(|\.)0+)$/;
const _rx_null=/^null$/i;
const _rx_false=/^false$/i;
const _rx_undefined=/^undefined$/i;

let Util=YgEs.Util={
	Name:'YgEs.Util',
	User:{},
	_private_:{},

	IsJustNaN:(val)=>{
		if(typeof val!=='number')return false;
		return isNaN(val);
	},

	IsJustInfinity:(val)=>{
		if(val===Infinity)return true;
		if(val===-Infinity)return true;
		return false;
	},

	IsEmpty:(val)=>{
		if(val===null)return true;
		if(val===undefined)return true;
		if(val==='')return true;
		return false;
	},

	IsValid:(val)=>{
		if(val===null)return false;
		if(val===undefined)return false;
		if(Util.IsJustNaN(val))return false;
		return true;
	},

	IsPoly:(val)=>{
		if(val===null)return false;
		if(typeof val==='object')return true;
		return false;
	},

	Booleanize:(val,stringable=false)=>{
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
	},

	Trinarize:(val,stringable=false)=>{
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
		return Util.Booleanize(val,stringable);
	},

	FillZero:(val,col,sgn=false)=>{
		let sf=val<0;
		if(sf)val=-val;

		let ss=sf?'-':sgn?'+':'';
		col-=ss.length;
		let vs=''+val;
		if(vs.length>=col)return ss+vs;

		vs='0'.repeat(col-1)+vs;
		return ss+vs.substring(vs.length-col);
	},

	SafeStepIter:(bgn,end,step,cb_iter)=>{

		let cnt=bgn;
		if(!step){
			// zero stride, do nothing 
			return cnt;
		}
		if(bgn==end)return cnt;

		if(step<0 != end-bgn<0){
			HappeningManager.Happen('backward',{bgn:bgn,end:end,step:step});
			return cnt;
		}

		let abort=false;
		for(;(step<0)?(cnt>end):(cnt<end);cnt+=step){
			if(abort)return cnt;
			((cnt_)=>{
				if(cb_iter(cnt_)===false)abort=true;
			})(cnt);
		}

		return cnt;
	},

	SafeArrayIter:(src,cb_iter)=>{

		let abort=false;
		for(let t of src){
			if(abort)return;
			((t_)=>{
				if(cb_iter(t_)===false)abort=true;
			})(t);
		}
	},

	SafeDictIter:(src,cb_iter)=>{

		let abort=false;
		for(let k in src){
			if(abort)return;
			((k_)=>{
				if(cb_iter(k_,src[k_])===false)abort=true;
			})(k);
		}
	},
}

})();
export default YgEs.Util;
