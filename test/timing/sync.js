// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Timing from '../../api/timing.js';

// Resyncronize Test -------------------- //

const interval=50;
let count=0;

const scenaria=[
	{
		Title:'Sync',
		Proc:async (tool)=>{
			let t1=Date.now();
			await new Promise((ok,ng)=>{
				let cancel=Timing.Sync(interval,()=>{
					return ++count>=10;
				},
				()=>{ok();},
				()=>{ng();});
			});
			let dt=Date.now()-t1;
			Test.ChkGreat(dt,interval*9);
			Test.ChkStrict(count,10);
		},
	},
	{
		Title:'Abort Sync',
		Proc:async (tool)=>{
			await new Promise((ok,ng)=>{
				let cancel=Timing.Sync(interval,()=>{
					return ++count>=20;
				},
				()=>{ng();},
				()=>{ok();});

				Timing.Delay(interval*5,()=>{cancel();});
				Test.ChkLess(count,16);
			});
		},
	},
]

Test.Run(scenaria);
