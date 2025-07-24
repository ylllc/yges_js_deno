// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import Log from '../api/logger.js';
import Util from '../api/util.js';

// Example: Async Proceure Engine ------- //
//Log.Showable=Log.LEVEL.TRACE;
const TRACING_LAUNCHER=false;
const TRACING_PROC=false;

// start the Engine 
Engine.Start();

// local launcher 
let launcher=Engine.CreateLauncher({
	Name:'MyLauncher',
	Trace:TRACING_LAUNCHER,
	Limit:3, // can limit parallel proc 
});

Util.SafeStepIter(0,10,1,(i)=>{
	launcher.Launch({
		Trace:TRACING_PROC,
		User:{
			// initial settings 
			name:'async '+i,
		},
		OnStart:(proc)=>{
			// called before running 
			proc.User.lock=true;
			Engine.Delay(500,(ctx)=>{
				proc.User.lock=false;
			});
		},
		OnPoll:(proc)=>{
			// polling while returns true
			return proc.User.lock;
		},
		OnDone:(proc)=>{
			Log.Info(proc.User.name+' done');
		},
		OnAbort:(proc)=>{
			Log.Info(proc.User.name+' abort');
		},
	});
});

// sync in a launcher
launcher.Sync((user)=>{
	Log.Info('all done');
});

// count up with 1 sec interval 
function countup(max,now=0){

	Engine.Delay(1000,(user)=>{
		if(now>=max)return;
		++now;
		Log.Info('count: '+now);
		countup(max,now);
	},(user)=>{
		Log.Info('abort counting');
	});
}

// count up to 10, but... 
countup(10);

// after 5 sec, the Engine is ended. 
// and all pollings are aborted. 
// and can exit.
Engine.Delay(5000,(ctx)=>{
	Log.Info('end of the engine');

	Engine.Stop();
},(ctx)=>{
	Log.Info('abort root');
});
