// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Launcher Test //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';

const PROCS=100;
const LIMIT=30;
const WAIT=500;

var count_start=0;
var count_done=0;
var count_abort=0;

eng.start();

var scenaria=[
	{
		title:'launcher',
		proc:async ()=>{
			var lnc=eng.createLauncher('test launcher');
			lnc.Limit=0;
			test.chk_strict(0,lnc.countActive(),'empty launcher');
			test.chk_strict(0,lnc.countHeld(),'empty launcher');

			for(var i=0;i<PROCS;++i){
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
			test.chk_strict(0,count_start,'bgn - start');
			test.chk_strict(0,count_done,'bgn - done');
			test.chk_strict(0,count_abort,'bgn - abort');

			test.chk_strict(0,lnc.countActive(),'held launcher');
			test.chk_strict(PROCS,lnc.countHeld(),'held launcher');
			lnc.Limit=LIMIT;

			eng.delay(WAIT/2,(user)=>{
				test.chk_strict(LIMIT,lnc.countActive(),'start launcher: '+lnc.countActive());
				test.chk_strict(PROCS-LIMIT,lnc.countHeld(),'start launcher: '+lnc.countHeld());
			});

			await lnc.toPromise(false);

			test.chk_strict(0,lnc.countActive(),'done launcher');
			test.chk_strict(0,lnc.countHeld(),'done launcher');

			test.chk_strict(PROCS,count_start,'end - start');
			test.chk_strict(PROCS,count_done,'end - done');
			test.chk_strict(0,count_abort,'end - abort');
			lnc.abandon();

			await eng.toPromise(false);
			eng.shutdown();
		},
	},
]

test.run(scenaria);
