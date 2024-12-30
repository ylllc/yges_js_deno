// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Rescue Locked Agent Test ------------- //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import workmng from '../../api/agent.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

eng.start();

var worker1=null;
var handle1=null;
var worker2=null;
var handle2=null;
var launcher=eng.createLauncher();
var hap_local1=hap_global.createLocal({
	happen:(hap)=>{
//		log.fatal(hap.getProp());
	},
});
var hap_local2=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.getProp());},
});

var workset1={
	name:'Test Rescuee',
	launcher:launcher,
	happen:hap_local1,
	user:{count:1},
	cb_open:(worker)=>{
		worker.User.count+=1;
		test.chk_strict(worker.User.count,2);
	},
	cb_ready:(worker)=>{
		worker.User.count+=2;
		test.chk_strict(worker.User.count,4);

		// happening after ready 
		// required resolving it to recover 
		worker.getHappeningManager().happenMsg('Test Hap.');
	},
	poll_healthy:(worker)=>{
		worker.User.count+=4;
		test.chk_strict(worker.User.count,11);

		handle1.close();
	},
	poll_trouble:(worker)=>{
		worker.User.count+=3;
		test.chk_strict(worker.User.count,7);

		// more happening in poll_trouble() 
		// this worker locked down and stop polling until cleaned up 
		worker.getHappeningManager().happenMsg('More Test Hap.');
	},
	cb_close:(worker)=>{
		worker.User.count+=5;
		test.chk_strict(worker.User.count,16);
	},
	cb_finish:(worker)=>{
		worker.User.count+=6;
		test.chk_strict(worker.User.count,22);
	},
	cb_abort:(worker)=>{
		test.chk_never("don't step");
	},
}

var workset2={
	name:'Test Rescuer',
	launcher:launcher,
	happen:hap_local2,

	cb_open:(worker)=>{
		worker.waitFor(()=>{
			return worker1.isHalt();
		});
	},
	cb_ready:(worker)=>{
		// rescue locked worker 
		var hm=worker1.getHappeningManager();
		hm.poll((hap)=>{
			hap.resolve();
		});
		handle2.close();
	},
}

var scenaria=[
	{
		title:'Rescue Locked Agent',
		proc:async ()=>{
			worker1=workmng.standby(workset1);
			test.chk_strict(worker1.User.count,1);

			handle1=worker1.fetch();
			handle1.open();

			worker2=workmng.standby(workset2);
			handle2=worker2.fetch();
			handle2.open();

			await launcher.toPromise();
			eng.shutdown();
		},
	},
]

test.run(scenaria);
