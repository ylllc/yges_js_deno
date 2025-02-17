// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import assert from 'node:assert';
import test from 'node:test';

import YgEs from './common.js';
import Timing from './timing.js';
import HappeningManager from './happening.js';
import Engine from './engine.js';
import Log from './logger.js';

// Unit Test Utility for Node.JS -------- //

function _cpmsg(msg,v1,op,v2){
	if(!msg)msg='Test Mismatch:';
	return ''+msg+' ('+YgEs.Inspect(v1)+' '+op+' '+YgEs.Inspect(v2)+')';
}

export default {
	name:'YgEs_UnitTest',
	User:{},
	_private_:{},

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

//		Timing.ToPromise((ok,ng)=>{
			for(let t of scn){
				if(puf && !t.PickUp)continue;
				if(t.Filter!==undefined && !t.Filter)continue;

				test(t.Title,async ()=>{
					Engine.Start();

					let abend=false;
					let hap2=YgEs.HappeningManager.CreateLocal({
						Name:'Happened in '+t.Title,
						OnHappen:(hap)=>{
							abend=true;
							console.error(hap.ToString());
							console.dir(hap.GetProp());
						},
					});
					let log2=YgEs.Log.CreateLocal(t.Title,YgEs.Log.LEVEL.DEBUG);
					let lnc2=Engine.CreateLauncher({
						HappenTo:hap2,
					});
					let end=YgEs.Timing.Poll(10,()=>{
						if(abend)Engine.Abort();
					});
					try{
						await t.Proc({
							HappenTo:hap2,
							Launcher:lnc2,
							Log:log2,
						});
						end();
						Engine.Stop();
						await Timing.SyncKit(10,()=>lnc2.IsEnd()).ToPromise();
					}
					catch(e){
						end();
						Engine.Stop();
						hap2.Happen(e);
					}
					hap2.CleanUp();
					let err=lnc2.HappenTo.IsCleaned()?null:new Error('Happen in Test: '+t.Title,{cause:lnc2.HappenTo.GetInfo()});
					lnc2.Abandon();
					hap2.Abandon();
					if(err)throw err;
				});
			}
//		});
	},
};
