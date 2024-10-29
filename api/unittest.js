// † Yggdrasil Essense for Node.js † //
// ==================================== //
// © 2024 Yggdrasil Leaves, LLC.        //
//        All rights reserved.          //

// Unit Test Utility //

import {
	assert,
} from "https://deno.land/std@0.65.0/testing/asserts.ts";

export default {

	chk:(cond,msg)=>{assert(cond,msg)},
	chk_loose:(v1,v2,msg)=>{assert(v1==v2,msg)},
	chk_strict:(v1,v2,msg)=>{assert(v1===v2,msg)},

	run:(scn)=>{

		// when there is even one pickup 
		// unselected tests are ignored. 
		// (use insted of Deno.test({only:true}) to suppress redundant log) 
		var puf=false;
		for(var t of scn){
			if(!t.pickup)continue;
			puf=true;
			break;
		}

		for(var t of scn){
			if(puf && !t.pickup)continue;
			if(t.filter!==undefined && !t.filter)continue;
			Deno.test({
				name: t.title,
				fn: t.proc,
			});
		}
	},
};
