// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Async Proceure Engine ------ //

import Engine from '../api/engine.js';
import log from '../api/logger.js';
import util from '../api/util.js';

// start the Engine 
Engine.start();

// local launcher 
var launcher=Engine.createLauncher({
	name:'MyLauncher',
	limit:3, // can limit parallel proc 
});

util.safeStepIter(0,10,1,(i)=>{
	launcher.launch({
		user:{
			// initial settings 
			name:'async '+i,
		},
		cb_start:(user)=>{
			// called before running 
			user.lock=true;
			Engine.delay(500,(ctx)=>{
				user.lock=false;
			});
		},
		cb_poll:(user)=>{
			// polling while returns true
			return user.lock;
		},
		cb_done:(user)=>{
			log.info(user.name+' done');
		},
		cb_abort:(user)=>{
			log.info(user.name+' abort');
		},
	});
});

// sync in a launcher
launcher.sync((user)=>{
	log.info('all done');
});

// count up with 1 sec interval 
function countup(max,now=0){

	Engine.delay(1000,(user)=>{
		if(now>=max)return;
		++now;
		log.info('count: '+now);
		countup(max,now);
	},(user)=>{
		log.info('abort counting');
	});
}

// count up to 10, but... 
countup(10);

// after 5 sec, the Engine is ended. 
// and all pollings are aborted. 
// and can exit.
Engine.delay(5000,(ctx)=>{
	log.info('end of the engine');

	Engine.stop();
},(ctx)=>{
	log.info('abort root');
});
