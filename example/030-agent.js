// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Examples: Agent ---------------------- //

import Engine from '../api/engine.js';
import AgentManager from '../api/agent.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';
import HappeningManager from '../api/happening.js';

// start the Engine 
Engine.start();

// for Worker environment 
let launcher=Engine.createLauncher();
let hap_local=HappeningManager.createLocal({
	happen:(hap)=>{Log.fatal(hap.GetProp());},
});

// Worker1 
let workset1={
	launcher:launcher,
	happen:hap_local,
	user:{count:0},
	cb_open:(worker)=>{
		Log.info('Worker1 open');
		worker.waitFor(()=>{
			return ++worker.User.count>=10;
		});
	},
	cb_back:(worker)=>{
		Log.info('Worker1 back');
		worker.waitFor(()=>{
			return --worker.User.count<=0;
		});
	},
	cb_ready:(worker)=>{
		Log.info('Worker1 ready');
	},
	cb_close:(worker)=>{
		Log.info('Worker1 close');
		worker.waitFor(()=>{
			return --worker.User.count<=0;
		});
	},
	cb_finish:(worker)=>{
		Log.info('Worker1 finish');
	},
}

// Worker2 
// has dependency, Worker1 required 
let workset2={
	launcher:launcher,
	happen:hap_local,
	user:{count:0},
	dependencies:{w1:AgentManager.launch(workset1)},
	cb_open:(worker)=>{
		Log.info('Worker2 open');
		worker.User.count=0;
	},
	cb_ready:(worker)=>{
		Log.info('Worker2 ready');
	},
	cb_close:(worker)=>{
		Log.info('Worker2 close');
	},
	cb_finish:(worker)=>{
		Log.info('Worker2 finish');
	},
};

(async ()=>{
	// Worker1 runs 
	let wh1=AgentManager.run(workset1);
	Timing.delay(300,()=>{wh1.close();});
	await Timing.syncKit(20,()=>{return !wh1.isBusy();}).promise();

	// Worker1 reopen&restart 
	await Timing.delayKit(100,()=>{wh1.open();}).promise();
	await Timing.delayKit(150,()=>{
		Log.info('Worker1 restart');
		wh1.restart();
	}).promise();
	await Timing.delayKit(500,()=>{wh1.close();}).promise();
	await Timing.syncKit(20,()=>{return !wh1.isBusy();}).promise();

	// Worker2 open 
	// and depndencies too 
	let wh2=AgentManager.run(workset2);
	Timing.delay(200,()=>{wh2.close();});

	launcher.sync((dmy)=>{
		Engine.shutdown();
	});
})();
