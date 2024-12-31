// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Engine Procedure Test ---------------- //

let count_start=0;
let count_done=0;
let count_abort=0;

const scenaria=[
	{
		title:'Root Async Proc',
		proc:async (tool)=>{
			let proc=tool.Launcher.launch({
				happen:tool.Launcher.HappenTo,
				cb_start:(user)=>{
					user.lock=true;
					++count_start;
				},
				cb_poll:(user)=>{
					return user.lock;
				},
				cb_done:(user)=>{
					++count_done;
				},
				cb_abort:(user)=>{
					++count_abort;
				}
			});
			Test.chk_strict(1,count_start,'bgn - start');
			Test.chk_strict(0,count_done,'bgn - done');
			Test.chk_strict(0,count_abort,'bgn - abort');
			Test.chk_strict(true,proc.isStarted(),'bgn - started');
			Test.chk_strict(false,proc.isFinished(),'bgn - finished');
			Test.chk_strict(false,proc.isAborted(),'bgn - aborted');
			Test.chk_strict(false,proc.isEnd(),'bgn - end');

			proc.User.lock=false;
			await proc.toPromise(false);

			Test.chk_strict(1,count_start,'end - start');
			Test.chk_strict(1,count_done,'end - done');
			Test.chk_strict(0,count_abort,'end - abort');
			Test.chk_strict(true,proc.isStarted(),'end - started');
			Test.chk_strict(true,proc.isFinished(),'end - finished');
			Test.chk_strict(false,proc.isAborted(),'end - aborted');
			Test.chk_strict(true,proc.isEnd(),'end - end');

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
