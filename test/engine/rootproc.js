// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Async Procedure Test //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

var count_start=0;
var count_done=0;
var count_abort=0;

var hap_local=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.GetProp());},
});

eng.start();

var scenaria=[
	{
		title:'Root Async Proc',
		proc:async ()=>{
			var proc=eng.launch({
				happen:hap_local,
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
			test.chk_strict(1,count_start,'bgn - start');
			test.chk_strict(0,count_done,'bgn - done');
			test.chk_strict(0,count_abort,'bgn - abort');
			test.chk_strict(true,proc.isStarted(),'bgn - started');
			test.chk_strict(false,proc.isFinished(),'bgn - finished');
			test.chk_strict(false,proc.isAborted(),'bgn - aborted');
			test.chk_strict(false,proc.isEnd(),'bgn - end');

			proc.User.lock=false;
			await proc.toPromise(false);

			test.chk_strict(1,count_start,'end - start');
			test.chk_strict(1,count_done,'end - done');
			test.chk_strict(0,count_abort,'end - abort');
			test.chk_strict(true,proc.isStarted(),'end - started');
			test.chk_strict(true,proc.isFinished(),'end - finished');
			test.chk_strict(false,proc.isAborted(),'end - aborted');
			test.chk_strict(true,proc.isEnd(),'end - end');

			await eng.toPromise(false);
			eng.shutdown();
		},
	},
]

test.run(scenaria);
