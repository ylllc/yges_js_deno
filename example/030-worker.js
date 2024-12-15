// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Statemachine //

import eng from '../api/engine.js';
import workmng from '../api/worker.js';
import timing from '../api/timing.js';
import log from '../api/logger.js';
import hap_global from '../api/happening.js';

// start the Engine 
eng.start();

// for Worker environment 
var launcher=eng.createLauncher();
var hap_local=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.GetProp());},
});

// Worker1 
var workset1={
	launcher:launcher,
	happen:hap_local,
	user:{count:0},
	cb_open:(worker)=>{
		log.info('Worker1 open');
		worker.waitFor(()=>{
			return ++worker.User.count>=10;
		});
	},
	cb_back:(worker)=>{
		log.info('Worker1 back');
		worker.waitFor(()=>{
			return --worker.User.count<=0;
		});
	},
	cb_ready:(worker)=>{
		log.info('Worker1 ready');
	},
	cb_close:(worker)=>{
		log.info('Worker1 close');
		worker.waitFor(()=>{
			return --worker.User.count<=0;
		});
	},
	cb_finish:(worker)=>{
		log.info('Worker1 finish');
	},
}

// Worker2 
// has dependency, Worker1 required 
var workset2={
	launcher:launcher,
	happen:hap_local,
	user:{count:0},
	dependencies:{w1:workmng.launch(workset1)},
	cb_open:(worker)=>{
		log.info('Worker2 open');
		worker.User.count=0;
	},
	cb_ready:(worker)=>{
		log.info('Worker2 ready');
	},
	cb_close:(worker)=>{
		log.info('Worker2 close');
	},
	cb_finish:(worker)=>{
		log.info('Worker2 finish');
	},
};

(async ()=>{
	// Worker1 runs 
	var wh1=workmng.run(workset1);
	timing.delay(300,()=>{wh1.close();});
	await timing.syncKit(20,()=>{return !wh1.isBusy();}).promise();

	// Worker1 reopen&restart 
	await timing.delayKit(100,()=>{wh1.open();}).promise();
	await timing.delayKit(150,()=>{
		log.info('Worker1 restart');
		wh1.restart();
	}).promise();
	await timing.delayKit(500,()=>{wh1.close();}).promise();
	await timing.syncKit(20,()=>{return !wh1.isBusy();}).promise();

	// Worker2 open 
	// and depndencies too 
	var wh2=workmng.run(workset2);
	timing.delay(200,()=>{wh2.close();});

	launcher.sync((dmy)=>{
		eng.shutdown();
	});
})();
