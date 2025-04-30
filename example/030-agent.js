// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import AgentManager from '../api/agent.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';
import HappeningManager from '../api/happening.js';

// Example: Agent ----------------------- //

// start the Engine 
Engine.Start();

// for Worker environment 
let launcher=Engine.CreateLauncher();
let hap_local=HappeningManager.CreateLocal({
	OnHappen:(hap)=>{Log.Fatal(hap.GetProp());},
});

// Worker1 
let workset1={
	Launcher:launcher,
	HappenTo:hap_local,
	User:{Count:0},
	OnOpen:(worker)=>{
		Log.Info('Worker1 open');
		worker.WaitFor('Counting up to 10',()=>{
			return ++worker.User.Count>=10;
		});
	},
	OnBack:(worker)=>{
		Log.Info('Worker1 back');
		worker.WaitFor('Counting down to 0',()=>{
			return --worker.User.Count<=0;
		});
	},
	OnReady:(worker)=>{
		Log.Info('Worker1 ready');
	},
	OnClose:(worker)=>{
		Log.Info('Worker1 close');
		worker.WaitFor('Counting down to 0',()=>{
			return --worker.User.Count<=0;
		});
	},
	OnFinish:(worker)=>{
		Log.Info('Worker1 finish');
	},
}

// Worker2 
// has dependency, Worker1 required 
let workset2={
	Launcher:launcher,
	HappenTo:hap_local,
	User:{Count:0},
	Dependencies:{w1:AgentManager.Launch(workset1)},
	OnOpen:(worker)=>{
		Log.Info('Worker2 open');
		worker.User.Count=0;
	},
	OnReady:(worker)=>{
		Log.Info('Worker2 ready');
	},
	OnClose:(worker)=>{
		Log.Info('Worker2 close');
	},
	OnFinish:(worker)=>{
		Log.Info('Worker2 finish');
	},
};

(async ()=>{
	// Worker1 runs 
	let wh1=AgentManager.Run(workset1);
	Timing.Delay(300,()=>{wh1.Close();});
	await Timing.SyncKit(20,()=>{return !wh1.IsBusy();}).ToPromise();

	// Worker1 reopen&restart 
	await Timing.DelayKit(100,()=>{wh1.Open();}).ToPromise();
	await Timing.DelayKit(150,()=>{
		Log.Info('Worker1 restart');
		wh1.Restart();
	}).ToPromise();
	await Timing.DelayKit(500,()=>{wh1.Close();}).ToPromise();
	await Timing.SyncKit(20,()=>{return !wh1.IsBusy();}).ToPromise();

	// Worker2 open 
	// and depndencies too 
	let wh2=AgentManager.Run(workset2);
	Timing.Delay(200,()=>{wh2.Close();});

	launcher.Sync((dmy)=>{
		Engine.ShutDown();
	});
})();
