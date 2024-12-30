// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Agent Recovering Test ---------------- //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import workmng from '../../api/agent.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

eng.start();

var worker=null;
var handle=null;
var launcher=eng.createLauncher();
var hap_local=hap_global.createLocal({
	happen:(hap)=>{
		//log.fatal(hap.getProp());
	},
});

var workset={
	launcher:launcher,
	happen:hap_local,
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

		handle.close();
	},
	poll_trouble:(worker)=>{
		worker.User.count+=3;
		test.chk_strict(worker.User.count,7);

		// resolve all happenings in target HappeningManager 
		var hm=worker.getHappeningManager();
		hm.poll((hap)=>{
			hap.resolve();
		});
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

var scenaria=[
	{
		title:'Agent Repairing',
		proc:async ()=>{
			worker=workmng.standby(workset);
			test.chk_strict(worker.User.count,1);

			handle=worker.fetch();
			handle.open();

			await launcher.toPromise();
			eng.shutdown();
		},
	},
]

test.run(scenaria);
