// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Delay Test //

import test from '../../api/unittest.js';
import timing from '../../api/timing.js';

const interval=100;

var scenaria=[
	{
		title:'Delay',
		proc:async ()=>{
			var t1=Date.now();
			await new Promise((ok,ng)=>{
				timing.delay(interval,()=>{
					var dt=Date.now()-t1;
					test.chk_great(dt,interval-(interval>>3));
					ok();
				});
			});
		},
	},
	{
		title:'Cancel Delay',
		proc:async ()=>{
			await new Promise((ok,ng)=>{
				var cancel=timing.delay(interval,()=>{
					test.never('not cancelled');
				});
				cancel();
				ok();
			});
		},
	},
]

test.run(scenaria);
