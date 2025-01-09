// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Timing from '../../api/timing.js';

// Polling Test ------------------------- //

const interval=50;
let count=0;

const scenaria=[
	{
		Title:'Polling',
		Proc:async (tool)=>{
			let t1=Date.now();
			await new Promise((ok,ng)=>{
				let cancel=Timing.Poll(interval,()=>{
					if(++count>=10){
						cancel();
						ok();
					}
				});
			});
			let dt=Date.now()-t1;
			Test.ChkGreat(dt,interval*9);
			Test.ChkStrict(count,10);
		},
	},
]

Test.Run(scenaria);
