// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Basic Timing Features //

import eng from '../api/engine.js';
import log from '../api/logger.js';
import timing from '../api/timing.js';

// delaying 
timing.delay(500,()=>{
	log.info('Delayed');
});

// cancellable delay 
var cancel1=timing.delay(10000,()=>{
	log.info('Cannot Step It');
});
timing.delay(800,()=>{
	cancel1();
	log.info('Delaying Cancelled');
});

// polling 
var count2=0;
var cancel2=timing.poll(100,()=>{
	log.info('Polling: '+(++count2));
});
timing.delay(1000,()=>{
	cancel2();
	log.info('Polling Cancelled');
});

// synchronization
timing.sync(50,()=>{
	return count2>4;
},()=>{
	log.info('Sync1 Done');
},()=>{
	log.info('Sync1 Cancelled');
});

var cancel3=timing.sync(50,()=>{
	return count2>4;
},()=>{
	log.info('Sync2 Done');
},()=>{
	log.info('Sync2 Cancelled');
});
timing.delay(300,()=>{
	cancel3();
});

(async ()=>{
	// cancellable delay on Promise 
	var dk=timing.delayKit(500);
	await dk.promise();
	log.info('delayed on Promise');

	try{
		dk=timing.delayKit(500);
		timing.delay(350,()=>{dk.cancel();});
		await dk.promise();
		log.info('delayed on Promise');
	}
	catch(e){
		log.warn(e.message);
	}

	// cancellable sync on Promise 
	var go=false;
	var sk=timing.syncKit(50,()=>{return go;});
	timing.delay(100,()=>{go=true;});
	await sk.promise();
	log.info('synchronized on Promise');

	try{
		go=false;
		sk=timing.syncKit(50,()=>{return go;});
		timing.delay(100,()=>{sk.cancel();});
		await sk.promise();
	}
	catch(e){
		log.warn(e.message);
	}

	// create Promises 
	log.info(await timing.toPromise((ok,ng)=>{
		ok('OK via Promise');
	}));

	await timing.toPromise((ok,ng)=>{
		ok('OK via Callback');
	},(res)=>{
		log.info(res);
	});

	try{
		log.info(await timing.toPromise((ok,ng)=>{
			ng('NG via Promise');
		}));
	}
	catch(err){
		log.warn(err);
	}

	await timing.toPromise((ok,ng)=>{
		ng('NG via Promise');
	},(res)=>{
		log.info('OK via Callback');
	},(err)=>{
		log.warn('NG via Callback');
	});

	// eazy Promise running
	timing.fromPromise(
		timing.toPromise((ok,ng)=>{ok();}),
		(res)=>{
			log.info('OK to Callback');
		}
	);
	timing.fromPromise(
		timing.toPromise((ok,ng)=>{ng();}),
		(res)=>{
			log.info('OK to Callback');
		},
		(err)=>{
			log.warn('NG to Callback');
		}
	);


})();
