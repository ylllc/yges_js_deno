// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Unit Test Utility for Deno //

import {
	assert,
} from "https://deno.land/std@0.65.0/testing/asserts.ts";

import util from './util.js';

function _cpmsg(msg,v1,op,v2){
	if(!msg)msg='Test Mismatch:';
	return ''+msg+' ('+util.inspect(v1)+' '+op+' '+util.inspect(v2)+')';
}

export default {
	name:'YgEs_UnitTest',
	User:{},

	never:(msg=null)=>{assert(false,msg)},
	chk:(cond,msg=null)=>{assert(cond,msg)},
	chk_loose:(v1,v2,msg=null)=>{assert(v1==v2,_cpmsg(msg,v1,'==',v2))},
	chk_strict:(v1,v2,msg=null)=>{assert(v1===v2,_cpmsg(msg,v1,'===',v2))},
	chk_less:(v1,v2,msg=null)=>{assert(v1<v2,_cpmsg(msg,v1,'<',v2))},
	chk_less_eq:(v1,v2,msg=null)=>{assert(v1<=v2,_cpmsg(msg,v1,'<=',v2))},
	chk_great:(v1,v2,msg=null)=>{assert(v1>v2,_cpmsg(msg,v1,'>',v2))},
	chk_great_eq:(v1,v2,msg=null)=>{assert(v1>=v2,_cpmsg(msg,v1,'>=',v2))},

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
