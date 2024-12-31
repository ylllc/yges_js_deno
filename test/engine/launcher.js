// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Launcher Test ------------------------ //

const PROCS=100;
const LIMIT=30;
const WAIT=500;

let count_start=0;
let count_done=0;
let count_abort=0;

const scenaria=[
	{
		title:'Launcher',
		proc:async (tool)=>{
			let lnc=tool.Launcher.createLauncher({
				name:'test launcher',
				happen:tool.Launcher.HappenTo,
			});
			lnc.Limit=0;
			Test.chk_strict(0,lnc.countActive(),'empty launcher');
			Test.chk_strict(0,lnc.countHeld(),'empty launcher');

			for(let i=0;i<PROCS;++i){
				lnc.launch({
					cb_start:(user)=>{
						user.until=new Date(Date.now()+WAIT);
						++count_start;
					},
					cb_poll:(user)=>{
						return new Date()<user.until;
					},
					cb_done:(user)=>{
						++count_done;
					},
					cb_abort:(user)=>{
						++count_abort;
					}
				});
			}
			Test.chk_strict(0,count_start,'bgn - start');
			Test.chk_strict(0,count_done,'bgn - done');
			Test.chk_strict(0,count_abort,'bgn - abort');

			Test.chk_strict(0,lnc.countActive(),'held launcher');
			Test.chk_strict(PROCS,lnc.countHeld(),'held launcher');
			lnc.Limit=LIMIT;

			tool.Launcher.delay(WAIT/2,(user)=>{
				Test.chk_strict(LIMIT,lnc.countActive(),'start launcher: '+lnc.countActive());
				Test.chk_strict(PROCS-LIMIT,lnc.countHeld(),'start launcher: '+lnc.countHeld());
			});

			await lnc.toPromise(false);

			Test.chk_strict(0,lnc.countActive(),'done launcher');
			Test.chk_strict(0,lnc.countHeld(),'done launcher');

			Test.chk_strict(PROCS,count_start,'end - start');
			Test.chk_strict(PROCS,count_done,'end - done');
			Test.chk_strict(0,count_abort,'end - abort');
			lnc.abandon();

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
