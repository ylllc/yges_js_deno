// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Timing from '../../api/timing.js';

// Delay Test --------------------------- //

const interval=100;

const scenaria=[
	{
		title:'Delay',
		proc:async ()=>{
			let t1=Date.now();
			await new Promise((ok,ng)=>{
				Timing.delay(interval,()=>{
					let dt=Date.now()-t1;
					Test.chk_great(dt,interval-(interval>>3));
					ok();
				});
			});
		},
	},
	{
		title:'Cancel Delay',
		proc:async (tool)=>{
			await new Promise((ok,ng)=>{
				let cancel=Timing.delay(interval,()=>{
					Test.never('not cancelled');
				});
				cancel();
				ok();
			});
		},
	},
]

Test.run(scenaria);
