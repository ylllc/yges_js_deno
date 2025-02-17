// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';

// Quick Queue -------------------------- //
(()=>{ // local namespace 

function _qq_create(args){

	let cur=0;

	let q={
		Name:'YgEs.QuickQueue.Unit',
		User:{},
		_private_:{},

		IsEnd:()=>{return cur>=args.length;},
		Count:()=>{return args.length;},
		Pos:()=>{return cur;},
		Reset:()=>{cur=0;},
		Peek:()=>{
			if(cur>=args.length)return undefined;
			return args[cur];
		},
		Next:()=>{
			if(cur>=args.length)return undefined;
			return args[cur++];
		},
	}
	return q;
}

YgEs.QuickQueue={
	Name:'YgEs.QuickQueue.Container',
	User:{},
	_private_:{},

	Create:_qq_create,
}

})();
export default YgEs.QuickQueue;
