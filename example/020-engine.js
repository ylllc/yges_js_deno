// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import Log from '../api/logger.js';
import Util from '../api/util.js';

// Example: Async Proceure Engine ------- //

// start the Engine 
Engine.Start();

// local launcher 
var launcher=Engine.CreateLauncher({
	Name:'MyLauncher',
	Limit:3, // can limit parallel proc 
});

Util.SafeStepIter(0,10,1,(i)=>{
	launcher.Launch({
		User:{
			// initial settings 
			name:'async '+i,
		},
		OnStart:(user)=>{
			// called before running 
			user.lock=true;
			Engine.Delay(500,(ctx)=>{
				user.lock=false;
			});
		},
		OnPoll:(user)=>{
			// polling while returns true
			return user.lock;
		},
		OnDone:(user)=>{
			Log.Info(user.name+' done');
		},
		OnAbort:(user)=>{
			Log.Info(user.name+' abort');
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
