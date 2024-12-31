// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Timing from '../../api/timing.js';

// Resyncronize Test -------------------- //

const interval=50;
let count=0;

const scenaria=[
	{
		title:'Sync',
		proc:async (tool)=>{
			let t1=Date.now();
			await new Promise((ok,ng)=>{
				let cancel=Timing.sync(interval,()=>{
					return ++count>=10;
				},
				()=>{ok();},
				()=>{ng();});
			});
			let dt=Date.now()-t1;
			Test.chk_great(dt,interval*9);
			Test.chk_strict(count,10);
		},
	},
	{
		title:'Abort Sync',
		proc:async (tool)=>{
			await new Promise((ok,ng)=>{
				let cancel=Timing.sync(interval,()=>{
					return ++count>=20;
				},
				()=>{ng();},
				()=>{ok();});

				Timing.delay(interval*5,()=>{cancel();});
				Test.chk_less(count,16);
			});
		},
	},
]

Test.run(scenaria);
