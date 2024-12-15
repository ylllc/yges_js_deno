// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Statemachine //

import eng from '../api/engine.js';
import stmac from '../api/stmac.js';
import timing from '../api/timing.js';
import log from '../api/logger.js';

var states={
	'StateA':{
		cb_start:(ctx,user)=>{
			log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<10)?null:true;
		},
		cb_ready:(ctx,user)=>{
			log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto StateB 
			return (++user.count<20)?null:'StateB';
		},
		cb_stop:(ctx,user)=>{
			log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state 
			return (++user.count<30)?null:true;
		},
		cb_end:(ctx,user)=>{
			log.info(ctx.getCurState()+' end');
		},
	},
	'StateB':{
		cb_start:(ctx,user)=>{
			log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<40)?null:true;
		},
		cb_ready:(ctx,user)=>{
			log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto end
			return (++user.count<50)?null:true;
		},
		cb_stop:(ctx,user)=>{
			log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// next state is interrupted by StateC 
			return (++user.count<60)?null:'StateC';
		},
		cb_end:(ctx,user)=>{
			log.info(ctx.getCurState()+' end');
		},
	},
	'StateC':{
		cb_start:(ctx,user)=>{
			log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// next phase is interrupted by StateD 
			// and stop this state now 
			return (++user.count<70)?null:'StateD';
		},
		cb_ready:(ctx,user)=>{
			log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// skipped by interruption 
			return (++user.count<80)?null:true;
		},
		cb_stop:(ctx,user)=>{
			log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state 
			return (++user.count<90)?null:true;
		},
		cb_end:(ctx,user)=>{
			log.info(ctx.getCurState()+' end');
		},
	},
	'StateD':{
		cb_start:(ctx,user)=>{
			log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<100)?null:true;
		},
		cb_ready:(ctx,user)=>{
			log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto end 
			return (++user.count<110)?null:true;
		},
		cb_stop:(ctx,user)=>{
			log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state (is end)
			return (++user.count<120)?null:true;
		},
		cb_end:(ctx,user)=>{
			log.info(ctx.getCurState()+' end');
		},
	},
}

// start the Engine 
eng.start();

var opt1={
	launcher:eng.createLauncher(),
	user:{name:'Test1',count:1}, // share in states 
	cb_done:(user)=>{
		log.info(user.name+' done');

		// run from StateB 
		// and abort after 200msec 
		var ctrl=stmac.run('StateB',states,opt2);
		timing.delay(200,()=>{ctrl.abort();});
	},
	cb_abort:(user)=>{
		log.info(user.name+' abort');
	},
}
var opt2={
	launcher:eng.createLauncher(),
	user:{name:'Test2',count:1}, // share in states 
	cb_done:(user)=>{
		log.info(user.name+' done');
	},
	cb_abort:(user)=>{
		log.info(user.name+' abort');
	},
}

stmac.run('StateA',states,opt1);

opt1.launcher.sync((dmy)=>{
	eng.shutdown();
});
