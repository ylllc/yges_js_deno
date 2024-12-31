// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';

// Quick Queue -------------------------- //
(()=>{ // local namespace 

function _qq_create(args){

	let cur=0;

	let q={
		name:'YgEs_QuickQueue',
		User:{},

		isEnd:()=>{return cur>=args.length;},
		count:()=>{return args.length;},
		pos:()=>{return cur;},
		reset:()=>{cur=0;},
		peek:()=>{
			if(cur>=args.length)return undefined;
			return args[cur];
		},
		next:()=>{
			if(cur>=args.length)return undefined;
			return args[cur++];
		},
	}
	return q;
}

YgEs.QuickQueue={
	name:'YgEs_QuickQueueContainer',
	User:{},

	create:_qq_create,
}

})();
export default YgEs.QuickQueue;
