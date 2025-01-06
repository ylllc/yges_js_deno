// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Examples: StateMachine --------------- //

import Engine from '../api/engine.js';
import StateMachine from '../api/stmac.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';

let states={
	'StateA':{
		cb_start:(ctx,user)=>{
			Log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<10)?null:true;
		},
		cb_ready:(ctx,user)=>{
			Log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto StateB 
			return (++user.count<20)?null:'StateB';
		},
		cb_stop:(ctx,user)=>{
			Log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state 
			return (++user.count<30)?null:true;
		},
		cb_end:(ctx,user)=>{
			Log.info(ctx.getCurState()+' end');
		},
	},
	'StateB':{
		cb_start:(ctx,user)=>{
			Log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<40)?null:true;
		},
		cb_ready:(ctx,user)=>{
			Log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto end
			return (++user.count<50)?null:true;
		},
		cb_stop:(ctx,user)=>{
			Log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// next state is interrupted by StateC 
			return (++user.count<60)?null:'StateC';
		},
		cb_end:(ctx,user)=>{
			Log.info(ctx.getCurState()+' end');
		},
	},
	'StateC':{
		cb_start:(ctx,user)=>{
			Log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// next phase is interrupted by StateD 
			// and stop this state now 
			return (++user.count<70)?null:'StateD';
		},
		cb_ready:(ctx,user)=>{
			Log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// skipped by interruption 
			return (++user.count<80)?null:true;
		},
		cb_stop:(ctx,user)=>{
			Log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state 
			return (++user.count<90)?null:true;
		},
		cb_end:(ctx,user)=>{
			Log.info(ctx.getCurState()+' end');
		},
	},
	'StateD':{
		cb_start:(ctx,user)=>{
			Log.info(ctx.getCurState()+' start');
		},
		poll_up:(ctx,user)=>{
			// goto next phase 
			return (++user.count<100)?null:true;
		},
		cb_ready:(ctx,user)=>{
			Log.info(ctx.getCurState()+' ready');
		},
		poll_keep:(ctx,user)=>{
			// goto end 
			return (++user.count<110)?null:true;
		},
		cb_stop:(ctx,user)=>{
			Log.info(ctx.getCurState()+' stop');
		},
		poll_down:(ctx,user)=>{
			// goto next state (is end)
			return (++user.count<120)?null:true;
		},
		cb_end:(ctx,user)=>{
			Log.info(ctx.getCurState()+' end');
		},
	},
}

// start the Engine 
Engine.start();

let opt1={
	launcher:Engine.createLauncher(),
	user:{name:'Test1',count:1}, // share in states 
	cb_done:(user)=>{
		Log.info(user.name+' done');

		// run from StateB 
		// and abort after 200msec 
		let ctrl=StateMachine.run('StateB',states,opt2);
		Timing.delay(200,()=>{ctrl.abort();});
	},
	cb_abort:(user)=>{
		Log.info(user.name+' abort');
	},
}
let opt2={
	launcher:Engine.createLauncher(),
	user:{name:'Test2',count:1}, // share in states 
	cb_done:(user)=>{
		Log.info(user.name+' done');
	},
	cb_abort:(user)=>{
		Log.info(user.name+' abort');
	},
}

StateMachine.run('StateA',states,opt1);

opt1.launcher.sync((dmy)=>{
	Engine.shutdown();
});
