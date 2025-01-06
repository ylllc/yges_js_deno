// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import {
	assert,
} from "https://deno.land/std@0.65.0/testing/asserts.ts";

import YgEs from './common.js';
import Timing from './timing.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import Log from './logger.js';

// Unit Test Utility for Deno ----------- //

function _cpmsg(msg,v1,op,v2){
	if(!msg)msg='Test Mismatch:';
	return ''+msg+' ('+YgEs.inspect(v1)+' '+op+' '+YgEs.inspect(v2)+')';
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
	chk_approx:(v1,v2,range,msg=null)=>{assert(((v1<v2)?(v2-v1):(v1-v2))<=range,_cpmsg(msg,v1,'>=',v2))},

	run:(scn)=>{

		// when there is even one pickup 
		// unselected tests are ignored. 
		// (use insted of Deno.test({only:true}) to suppress redundant log) 
		let puf=false;
		for(let t of scn){
			if(!t.pickup)continue;
			puf=true;
			break;
		}

		Timing.toPromise((ok,ng)=>{
			for(let t of scn){
				if(puf && !t.pickup)continue;
				if(t.filter!==undefined && !t.filter)continue;

				let err=null;
				Deno.test({
					name: t.title,
					fn: async ()=>{
						Engine.start();
						let launcher=Engine.createLauncher();
						try{
							await t.proc({
								Launcher:launcher,
								Log:Log.createLocal(t.title,Log.LEVEL.DEBUG),
							});
						}
						catch(e){
							err=e;
						}
						launcher.abort();
						if(!launcher.HappenTo.isCleaned())throw YgEs.inspect(launcher.HappenTo.getInfo());
						Engine.stop();

						if(err)throw err;
					},
				});
			}
		});
	},
};
