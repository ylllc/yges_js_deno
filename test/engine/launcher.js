// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
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
		Title:'Launcher',
		Proc:async (tool)=>{
			let lnc=tool.Launcher.CreateLauncher({
				Name:'test launcher',
				HappenTo:tool.Launcher.HappenTo,
			});
			lnc.Limit=0;
			Test.ChkStrict(0,lnc.CountActive(),'empty launcher');
			Test.ChkStrict(0,lnc.CountHeld(),'empty launcher');

			for(let i=0;i<PROCS;++i){
				lnc.Launch({
					OnStart:(user)=>{
						user.until=new Date(Date.now()+WAIT);
						++count_start;
					},
					OnPoll:(user)=>{
						return new Date()<user.until;
					},
					OnDone:(user)=>{
						++count_done;
					},
					OnAbort:(user)=>{
						++count_abort;
					}
				});
			}
			Test.ChkStrict(0,count_start,'bgn - start');
			Test.ChkStrict(0,count_done,'bgn - done');
			Test.ChkStrict(0,count_abort,'bgn - abort');

			Test.ChkStrict(0,lnc.CountActive(),'held launcher');
			Test.ChkStrict(PROCS,lnc.CountHeld(),'held launcher');
			lnc.Limit=LIMIT;

			tool.Launcher.Delay(WAIT/2,(user)=>{
				Test.ChkStrict(LIMIT,lnc.CountActive(),'start launcher: '+lnc.CountActive());
				Test.ChkStrict(PROCS-LIMIT,lnc.CountHeld(),'start launcher: '+lnc.CountHeld());
			});

			await lnc.ToPromise(false);

			Test.ChkStrict(0,lnc.CountActive(),'done launcher');
			Test.ChkStrict(0,lnc.CountHeld(),'done launcher');

			Test.ChkStrict(PROCS,count_start,'end - start');
			Test.ChkStrict(PROCS,count_done,'end - done');
			Test.ChkStrict(0,count_abort,'end - abort');
			lnc.Abandon();

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
