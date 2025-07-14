// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Engine from '../api/engine.js';
import StateMachine from '../api/stmac.js';
import Timing from '../api/timing.js';
import Log from '../api/logger.js';

// Example: StateMachine ---------------- //
//Log.Showable=Log.LEVEL.TRACE;
const TRACING=true;

let states={
	'StateA':{
		OnStart:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,proc)=>{
			// goto next phase 
			return (++proc.User.Count<10)?null:true;
		},
		OnReady:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,proc)=>{
			// goto StateB 
			return (++proc.User.Count<20)?null:'StateB';
		},
		OnStop:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollOnDown:(ctx,proc)=>{
			// goto next state 
			return (++proc.User.Count<30)?null:true;
		},
		OnEnd:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateB':{
		OnStart:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,proc)=>{
			// goto next phase 
			return (++proc.User.Count<40)?null:true;
		},
		OnReady:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,proc)=>{
			// goto end
			return (++proc.User.Count<50)?null:true;
		},
		OnStop:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,proc)=>{
			// next state is interrupted by StateC 
			return (++proc.User.Count<60)?null:'StateC';
		},
		OnEnd:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateC':{
		OnStart:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,proc)=>{
			// next phase is interrupted by StateD 
			// and stop this state now 
			return (++proc.User.Count<70)?null:'StateD';
		},
		OnReady:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,proc)=>{
			// skipped by interruption 
			return (++proc.User.Count<80)?null:true;
		},
		OnStop:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,proc)=>{
			// goto next state 
			return (++proc.User.Count<90)?null:true;
		},
		OnEnd:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
	'StateD':{
		OnStart:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' start');
		},
		OnPollInUp:(ctx,proc)=>{
			// goto next phase 
			return (++proc.User.Count<100)?null:true;
		},
		OnReady:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' ready');
		},
		OnPollInKeep:(ctx,proc)=>{
			// goto end 
			return (++proc.User.Count<110)?null:true;
		},
		OnStop:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' stop');
		},
		OnPollInDown:(ctx,proc)=>{
			// goto next state (is end)
			return (++proc.User.Count<120)?null:true;
		},
		OnEnd:(ctx,proc)=>{
			Log.Info(ctx.GetCurState()+' end');
		},
	},
}

// start the Engine 
Engine.Start();

let opt1={
	Launcher:Engine.CreateLauncher({
		Trace:TRACING,
	}),
	Trace:TRACING,
	Trace_Proc:TRACING,
	User:{name:'Test1',Count:1}, // share in states 
	OnDone:(proc)=>{
		Log.Info(proc.User.name+' done');

		// run from StateB 
		// and abort after 200msec 
		let ctrl=StateMachine.Run('StateB',states,opt2);
		Timing.Delay(200,()=>{ctrl.Abort();});
	},
	OnAbort:(proc)=>{
		Log.Info(proc.User.name+' abort');
	},
}
let opt2={
	Launcher:Engine.CreateLauncher({
		Trace:TRACING,
	}),
	Trace:TRACING,
	Trace_Proc:TRACING,
	User:{name:'Test2',Count:1}, // share in states 
	OnDone:(proc)=>{
		Log.Info(proc.User.name+' done');
	},
	OnAbort:(proc)=>{
		Log.Info(proc.User.name+' abort');
	},
}

StateMachine.Run('StateA',states,opt1);

opt1.Launcher.Sync((dmy)=>{
	Engine.ShutDown();
});
