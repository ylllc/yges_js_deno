// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Log from '../api/logger.js';
import Timing from '../api/timing.js';

// Example: Basic Timing Features ------- //

// delaying 
Timing.Delay(500,()=>{
	Log.Info('Delayed');
});

// cancellable delay 
let cancel1=Timing.Delay(10000,()=>{
	Log.Info('Cannot Step It');
});
Timing.Delay(800,()=>{
	cancel1();
	Log.Info('Delaying Cancelled');
});

// polling 
let count2=0;
let cancel2=Timing.Poll(100,()=>{
	Log.Info('Polling: '+(++count2));
});
Timing.Delay(1000,()=>{
	cancel2();
	Log.Info('Polling Cancelled');
});

// synchronization
Timing.Sync(50,()=>{
	return count2>4;
},()=>{
	Log.Info('Sync1 Done');
},()=>{
	Log.Info('Sync1 Cancelled');
});

let cancel3=Timing.Sync(50,()=>{
	return count2>4;
},()=>{
	Log.Info('Sync2 Done');
},()=>{
	Log.Info('Sync2 Cancelled');
});
Timing.Delay(300,()=>{
	cancel3();
});

(async ()=>{
	// cancellable delay on Promise 
	let dk=Timing.DelayKit(500);
	await dk.ToPromise();
	Log.Info('delayed on Promise');

	try{
		dk=Timing.DelayKit(500);
		Timing.Delay(350,()=>{dk.Cancel();});
		await dk.ToPromise();
		Log.Info('delayed on Promise');
	}
	catch(e){
		Log.Warn(e.message);
	}

	// cancellable sync on Promise 
	let go=false;
	let sk=Timing.SyncKit(50,()=>{return go;});
	Timing.Delay(100,()=>{go=true;});
	await sk.ToPromise();
	Log.Info('synchronized on Promise');

	try{
		go=false;
		sk=Timing.SyncKit(50,()=>{return go;});
		Timing.Delay(100,()=>{sk.Cancel();});
		await sk.ToPromise();
	}
	catch(e){
		Log.Warn(e.message);
	}

	// create Promises 
	Log.Info(await Timing.ToPromise((ok,ng)=>{
		ok('OK via Promise');
	}));

	await Timing.ToPromise((ok,ng)=>{
		ok('OK via Callback');
	},(res)=>{
		Log.Info(res);
	});

	try{
		Log.Info(await Timing.ToPromise((ok,ng)=>{
			ng('NG via Promise');
		}));
	}
	catch(err){
		Log.Warn(err);
	}

	await Timing.ToPromise((ok,ng)=>{
		ng('NG via Promise');
	},(res)=>{
		Log.Info('OK via Callback');
	},(err)=>{
		Log.Warn('NG via Callback');
	});

	// eazy Promise running
	Timing.FromPromise(
		Timing.ToPromise((ok,ng)=>{ok();}),
		(res)=>{
			Log.Info('OK to Callback');
		}
	);
	Timing.FromPromise(
		Timing.ToPromise((ok,ng)=>{ng();}),
		(res)=>{
			Log.Info('OK to Callback');
		},
		(err)=>{
			Log.Warn('NG to Callback');
		}
	);

})();
