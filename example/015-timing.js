// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Examples: Basic Timing Features ------ //

import Log from '../api/logger.js';
import Timing from '../api/timing.js';

// delaying 
Timing.delay(500,()=>{
	Log.info('Delayed');
});

// cancellable delay 
let cancel1=Timing.delay(10000,()=>{
	Log.info('Cannot Step It');
});
Timing.delay(800,()=>{
	cancel1();
	Log.info('Delaying Cancelled');
});

// polling 
let count2=0;
let cancel2=Timing.poll(100,()=>{
	Log.info('Polling: '+(++count2));
});
Timing.delay(1000,()=>{
	cancel2();
	Log.info('Polling Cancelled');
});

// synchronization
Timing.sync(50,()=>{
	return count2>4;
},()=>{
	Log.info('Sync1 Done');
},()=>{
	Log.info('Sync1 Cancelled');
});

let cancel3=Timing.sync(50,()=>{
	return count2>4;
},()=>{
	Log.info('Sync2 Done');
},()=>{
	Log.info('Sync2 Cancelled');
});
Timing.delay(300,()=>{
	cancel3();
});

(async ()=>{
	// cancellable delay on Promise 
	let dk=Timing.delayKit(500);
	await dk.promise();
	Log.info('delayed on Promise');

	try{
		dk=Timing.delayKit(500);
		Timing.delay(350,()=>{dk.cancel();});
		await dk.promise();
		Log.info('delayed on Promise');
	}
	catch(e){
		Log.warn(e.message);
	}

	// cancellable sync on Promise 
	let go=false;
	let sk=Timing.syncKit(50,()=>{return go;});
	Timing.delay(100,()=>{go=true;});
	await sk.promise();
	Log.info('synchronized on Promise');

	try{
		go=false;
		sk=Timing.syncKit(50,()=>{return go;});
		Timing.delay(100,()=>{sk.cancel();});
		await sk.promise();
	}
	catch(e){
		Log.warn(e.message);
	}

	// create Promises 
	Log.info(await Timing.toPromise((ok,ng)=>{
		ok('OK via Promise');
	}));

	await Timing.toPromise((ok,ng)=>{
		ok('OK via Callback');
	},(res)=>{
		Log.info(res);
	});

	try{
		Log.info(await Timing.toPromise((ok,ng)=>{
			ng('NG via Promise');
		}));
	}
	catch(err){
		Log.warn(err);
	}

	await Timing.toPromise((ok,ng)=>{
		ng('NG via Promise');
	},(res)=>{
		Log.info('OK via Callback');
	},(err)=>{
		Log.warn('NG via Callback');
	});

	// eazy Promise running
	Timing.fromPromise(
		Timing.toPromise((ok,ng)=>{ok();}),
		(res)=>{
			Log.info('OK to Callback');
		}
	);
	Timing.fromPromise(
		Timing.toPromise((ok,ng)=>{ng();}),
		(res)=>{
			Log.info('OK to Callback');
		},
		(err)=>{
			Log.warn('NG to Callback');
		}
	);

})();
