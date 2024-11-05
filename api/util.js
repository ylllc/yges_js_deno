// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Common Utilities //

import hap from './happening.js';

var mif={

	safestepiter:(bgn,end,step,cbiter)=>{

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

	safearrayiter:(src,cbiter)=>{

		var abort=false;
		for(var t of src){
			if(abort)return;
			((t_)=>{
				if(cbiter(t_)===false)abort=true;
			})(t);
		}
	},

	safedictiter:(src,cbiter)=>{

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
