// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';

// Engine Procedure Test ---------------- //

let count_start=0;
let count_done=0;
let count_abort=0;

const scenaria=[
	{
		Title:'Root Async Proc',
		Proc:async (tool)=>{
			let proc=tool.Launcher.Launch({
				HappenTo:tool.Launcher.HappenTo,
				OnStart:(user)=>{
					user.lock=true;
					++count_start;
				},
				OnPoll:(user)=>{
					return user.lock;
				},
				OnDone:(user)=>{
					++count_done;
				},
				OnAbort:(user)=>{
					++count_abort;
				}
			});
			Test.ChkStrict(1,count_start,'bgn - start');
			Test.ChkStrict(0,count_done,'bgn - done');
			Test.ChkStrict(0,count_abort,'bgn - abort');
			Test.ChkStrict(true,proc.IsStarted(),'bgn - started');
			Test.ChkStrict(false,proc.IsFinished(),'bgn - finished');
			Test.ChkStrict(false,proc.IsAborted(),'bgn - aborted');
			Test.ChkStrict(false,proc.IsEnd(),'bgn - end');

			proc.User.lock=false;
			await proc.ToPromise(false);

			Test.ChkStrict(1,count_start,'end - start');
			Test.ChkStrict(1,count_done,'end - done');
			Test.ChkStrict(0,count_abort,'end - abort');
			Test.ChkStrict(true,proc.IsStarted(),'end - started');
			Test.ChkStrict(true,proc.IsFinished(),'end - finished');
			Test.ChkStrict(false,proc.IsAborted(),'end - aborted');
			Test.ChkStrict(true,proc.IsEnd(),'end - end');

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
