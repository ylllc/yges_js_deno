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
		Title:'Delay',
		Proc:async ()=>{
			let t1=Date.now();
			await new Promise((ok,ng)=>{
				Timing.Delay(interval,()=>{
					let dt=Date.now()-t1;
					Test.ChkGreat(dt,interval-(interval>>3));
					ok();
				});
			});
		},
	},
	{
		Title:'Cancel Delay',
		Proc:async (tool)=>{
			await new Promise((ok,ng)=>{
				let cancel=Timing.Delay(interval,()=>{
					Test.Never('not cancelled');
				});
				cancel();
				ok();
			});
		},
	},
]

Test.Run(scenaria);
