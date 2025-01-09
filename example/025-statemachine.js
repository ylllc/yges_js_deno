// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import StateMachine from '../api/stmac.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';

// Examples: StateMachine --------------- //

let states={
	'StateA':{
		OnStart:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,user)=>{
			// goto next phase 
			return (++user.Count<10)?null:true;
		},
		OnReady:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,user)=>{
			// goto StateB 
			return (++user.Count<20)?null:'StateB';
		},
		OnStop:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollOnDown:(ctx,user)=>{
			// goto next state 
			return (++user.Count<30)?null:true;
		},
		OnEnd:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateB':{
		OnStart:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,user)=>{
			// goto next phase 
			return (++user.Count<40)?null:true;
		},
		OnReady:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,user)=>{
			// goto end
			return (++user.Count<50)?null:true;
		},
		OnStop:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,user)=>{
			// next state is interrupted by StateC 
			return (++user.Count<60)?null:'StateC';
		},
		OnEnd:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateC':{
		OnStart:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,user)=>{
			// next phase is interrupted by StateD 
			// and stop this state now 
			return (++user.Count<70)?null:'StateD';
		},
		OnReady:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,user)=>{
			// skipped by interruption 
			return (++user.Count<80)?null:true;
		},
		OnStop:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,user)=>{
			// goto next state 
			return (++user.Count<90)?null:true;
		},
		OnEnd:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateD':{
		OnStart:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,user)=>{
			// goto next phase 
			return (++user.Count<100)?null:true;
		},
		OnReady:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,user)=>{
			// goto end 
			return (++user.Count<110)?null:true;
		},
		OnStop:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,user)=>{
			// goto next state (is end)
			return (++user.Count<120)?null:true;
		},
		OnEnd:(ctx,user)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
}

// start the Engine 
Engine.Start();

let opt1={
	Launcher:Engine.CreateLauncher(),
	User:{name:'Test1',Count:1}, // share in states 
	OnDone:(user)=>{
		Log.Info(user.name+' done');

		// run from StateB 
		// and abort after 200msec 
		let ctrl=StateMachine.Run('StateB',states,opt2);
		Timing.Delay(200,()=>{ctrl.Abort();});
	},
	OnAbort:(user)=>{
		Log.Info(user.name+' abort');
	},
}
let opt2={
	Launcher:Engine.CreateLauncher(),
	User:{name:'Test2',Count:1}, // share in states 
	OnDone:(user)=>{
		Log.Info(user.name+' done');
	},
	OnAbort:(user)=>{
		Log.Info(user.name+' abort');
	},
}

StateMachine.Run('StateA',states,opt1);

opt1.Launcher.Sync((dmy)=>{
	Engine.ShutDown();
});
