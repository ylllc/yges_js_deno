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
	return ''+msg+' ('+YgEs.Inspect(v1)+' '+op+' '+YgEs.Inspect(v2)+')';
}

export default {
	name:'YgEs_UnitTest',
	User:{},

	Never:(msg=null)=>{assert(false,msg)},
	Chk:(cond,msg=null)=>{assert(cond,msg)},
	ChkLoose:(v1,v2,msg=null)=>{assert(v1==v2,_cpmsg(msg,v1,'==',v2))},
	ChkStrict:(v1,v2,msg=null)=>{assert(v1===v2,_cpmsg(msg,v1,'===',v2))},
	ChkLess:(v1,v2,msg=null)=>{assert(v1<v2,_cpmsg(msg,v1,'<',v2))},
	ChkLessEq:(v1,v2,msg=null)=>{assert(v1<=v2,_cpmsg(msg,v1,'<=',v2))},
	ChkGreat:(v1,v2,msg=null)=>{assert(v1>v2,_cpmsg(msg,v1,'>',v2))},
	ChkGreatEq:(v1,v2,msg=null)=>{assert(v1>=v2,_cpmsg(msg,v1,'>=',v2))},
	ChkApprox:(v1,v2,range,msg=null)=>{assert(((v1<v2)?(v2-v1):(v1-v2))<=range,_cpmsg(msg,v1,'>=',v2))},

	Run:(scn)=>{

		// when there is even one pickup 
		// unselected tests are ignored. 
		let puf=false;
		for(let t of scn){
			if(!t.PickUp)continue;
			puf=true;
			break;
		}

		Timing.ToPromise((ok,ng)=>{
			for(let t of scn){
				if(puf && !t.PickUp)continue;
				if(t.Filter!==undefined && !t.Filter)continue;

				let err=null;
				Deno.test({
					name: t.Title,
					fn: async ()=>{
						Engine.Start();
						let launcher=Engine.CreateLauncher();
						try{
							await t.Proc({
								Launcher:launcher,
								Log:Log.CreateLocal(t.Title,Log.LEVEL.DEBUG),
							});
						}
						catch(e){
							err=e;
						}
						launcher.Abort();
						if(!launcher.HappenTo.IsCleaned())throw new Error('Happen in Test: '+t.Title,{cause:launcher.HappenTo.GetInfo()});
							Engine.Stop();

						if(err)throw err;
					}
				});
			}
		});
	},
};
