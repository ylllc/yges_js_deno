// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Quick Queue //

function _create(args){

	var cur=0;

	var q={
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

var mif={
	name:'YgEs_QuickQueueContainer',
	User:{},

	create:_create,
}

export default mif;
