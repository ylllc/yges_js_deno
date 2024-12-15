// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Resyncronize Test //

import test from '../../api/unittest.js';
import timing from '../../api/timing.js';

const interval=50;
var count=0;

var scenaria=[
	{
		title:'Sync',
		proc:async ()=>{
			var t1=Date.now();
			await new Promise((ok,ng)=>{
				var cancel=timing.sync(interval,()=>{
					return ++count>=10;
				},
				()=>{ok();},
				()=>{ng();});
			});
			var dt=Date.now()-t1;
			test.chk_great(dt,interval*9);
			test.chk_strict(count,10);
		},
	},
	{
		title:'Abort Sync',
		proc:async ()=>{
			await new Promise((ok,ng)=>{
				var cancel=timing.sync(interval,()=>{
					return ++count>=20;
				},
				()=>{ng();},
				()=>{ok();});

				timing.delay(interval*5,()=>{cancel();});
				test.chk_less(count,16);
			});
		},
	},
]

test.run(scenaria);
