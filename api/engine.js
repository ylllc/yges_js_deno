// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';
import HappeningManager from './happening.js';
import Log from './logger.js';
import Timing from './timing.js';

// Async Procedure Engine --------------- //
(()=>{ // local namespace 

const DEFAULT_ROOT_CYCLE=20;
const DEFAULT_LAUNCHER_CYCLE=20;
const DEFAULT_SYNC_CYCLE=10;

function _create_proc(prm,launcher){

	prm=YgEs.Validate(prm,{Others:true,Struct:{
		Name:{Literal:true},
		User:{Struct:true},
		Log:{Class:'YgEs.LocalLog',Default:launcher.Log??Log},
		HappenTo:{Class:'YgEs.HappeningManager',Default:launcher.HappenTo??HappeningManager},
		OnStart:{Callable:true,Default:(self)=>{}},
		OnPoll:{Callable:true,Default:(self)=>{}},
		OnDone:{Callable:true,Default:(self)=>{}},
		OnAbort:{Callable:true,Default:(self)=>{
			self.HappenTo.Happen(
				'Aborted',{
				Class:self.GetClassName(),
				Cause:'Aborted',
				Info:self.GetInfo('Aborted'),
			});
		}},
	}},'prm');

	const iid=YgEs.NextID();

	let self=YgEs.SoftClass(prm.Name,prm.User);

	let priv=self.Extend('YgEs.Procedure',{
		// private 
		started:false,
		finished:false,
		aborted:false,
	},{
		// public 
		Log:prm.Log,
		HappenTo:prm.HappenTo,

		GetInstanceID:()=>iid,
		IsStarted:()=>priv.started,
		IsFinished:()=>priv.finished,
		IsAborted:()=>priv.aborted,
		IsEnd:()=>priv.finished||priv.aborted,

		GetStatus:()=>{
			if(priv.finished)return 'Finished';
			if(priv.aborted)return 'Aborted';
			if(priv.started)return 'Running';
			return 'StandBy';
		},
		GetInfo:(site='')=>{return {
			InstanceID:iid,
			Name:self.Name,
			CrashSite:site,
			Status:self.GetStatus(),
			User:self.User,
		}},

		_start:()=>{
			if(priv.started)return;
			if(self.IsEnd())return;
			priv.started=true;
			try{
				prm.OnStart(self);
			}
			catch(e){
				self.HappenTo.Happen(e,{
					Class:self.GetClassName(),
					Cause:'ThrownFromCallback',
					Info:self.GetInfo('OnStart'),
				});
				self.Abort();
			}
		},
		Abort:()=>{
			if(self.IsEnd())return;
			priv.aborted=true;
			try{
				prm.OnAbort(self);
			}
			catch(e){
				self.HappenTo.Happen(e,{
					Class:self.GetClassName(),
					Cause:'ThrownFromCallback',
					Info:self.GetInfo('OnAbort'),
				});
			}
		},
		Poll:()=>{
			if(self.IsEnd())return false;
			try{
				if(prm.OnPoll(self))return true;
			}
			catch(e){
				self.HappenTo.Happen(e,{
					Class:self.GetClassName(),
					Cause:'ThrownFromCallback',
					Info:self.GetInfo('OnPoll'),
				});
				self.Abort();
				return false;
			}
			try{
				prm.OnDone(self);
				priv.finished=true;
			}
			catch(e){
				YgEs.Trinarize.HappenTo.Happen(e,{
					Class:self.GetClassName(),
					Cause:'ThrownFromCallback',
					Info:self.GetInfo('OnDone'),
				});
				self.Abort();
				return false;
			}
			return false;
		},

		Sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				self.HappenTo.Happen(
					'Empty callback for sync',{
					Class:self.GetClassName(),
					Cause:'EmptySyncCallback',
					Info:self.GetInfo('CannotSync'),
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.Sync(interval,
				()=>{return self.IsEnd();},
				()=>{
					try{
						cb_sync(self.User);
					}
					catch(e){
						self.HappenTo.Happen(e,{
							Class:self.GetClassName(),
							Cause:'ThrownFromCallback',
							Info:self.GetInfo('OnSync'),
						});
					}
				},
			);
		},
		ToPromise:(breakable,interval=null)=>{
			return Timing.ToPromise((ok,ng)=>{
				self.Sync(()=>{
					if(breakable || priv.finished)ok(self.User);
					else ng(new Error('abort',{cause:self.User}));
				},interval);
			});
		},
	});

	return self;
}

function _yges_enginge_create_launcher(prm){

	prm=YgEs.Validate(prm,{Others:true,Struct:{
		Name:{Literal:true},
		User:{Struct:true},
		Log:{Class:'YgEs.LocalLog'},
		HappenTo:{Class:'YgEs.HappeningManager',Default:HappeningManager},
		Limit:{Integer:true,Min:-1,Default:-1},
		Cycle:{Numeric:true,Default:DEFAULT_LAUNCHER_CYCLE},
		OnAbort:{Callable:true,Default:(lnc)=>{}},
	}},'prm');

	const iid=YgEs.NextID();

	let self=YgEs.SoftClass(prm.Name,prm.User);

	let priv=self.Extend('YgEs.Launcher',{
		// private 
		abandoned:false,
		aborted:false,
		sublauncher:[],
		launched:[],
		active:[],
	},{
		// public 
		Log:prm.Log,
		HappenTo:prm.HappenTo,
		Limit:prm.Limit,
		Cycle:prm.Cycle,

		GetInstanceID:()=>iid,
		GetActive:()=>priv.active,
		GetHeld:()=>priv.launched,
		GetSub:()=>priv.sublauncher,

		GetStatus:()=>{
			if(priv.abandoned)return 'Abandoned';
			if(priv.aborted)return 'Aborted';
			return 'Ready';
		},
		GetInfo:(site='')=>{
			let r={
				InstanceID:iid,
				Name:self.Name,
				CrashSite:site,
				Status:self.GetStatus(),
				Limit:self.Limit,
				Cycle:self.Cycle,
				User:self.User,
				Active:[],
				Held:[],
				Sub:[],
			}
			for(let proc of priv.active)r.Active.push(proc.GetInfo());
			for(let proc of priv.launched)r.Held.push(proc.GetInfo());
			for(let sub of priv.sublauncher)r.Sub.push(sub.GetInfo());
			return r;
		},

		IsEnd:()=>{
			if(priv.launched.length>0)return false;
			if(priv.active.length>0)return false;
			for(let sub of priv.sublauncher){
				if(!sub.IsEnd())return false;
			}
			return true;
		},
		IsAbandoned:()=>priv.abandoned,
		CountActive:()=>{
			let n=priv.active.length
			for(let sub of priv.sublauncher)n+=sub.CountActive();
			return n;
		},
		CountHeld:()=>{
			let n=priv.launched.length
			for(let sub of priv.sublauncher)n+=sub.CountHeld();
			return n;
		},

		Abandon:()=>{
			priv.abandoned=true;
			self.Abort();
		},

		CreateLauncher:(prm2={})=>{
			let sub=_yges_enginge_create_launcher(prm2);
			priv.sublauncher.push(sub);
			return sub;
		},

		Launch:(prm2={})=>{
			if(Engine.IsAbandoned()){
				self.HappenTo.Happen('the Engine was abandoned, no longer launch new procedures.');
				return;
			}
			if(!_working){
				Log.Notice('the Engine not started. call Start() to run.');
			}
			if(priv.abandoned){
				prm2.OnAbort(self);
				return;
			}
			if(!prm2.OnPoll){
				self.HappenTo.Happen(
					'Empty callback for poll',{
					Class:self.GetClassName(),
					Cause:'CannotPoll',
				});
				return;
			}

			let proc=_create_proc(prm2,self);
			if(self.Limit<0 || priv.active.length<self.Limit){
				priv.active.push(proc);
				proc._start();
			}
			else{
				priv.launched.push(proc);
			}
			return proc;
		},
		Abort:()=>{
			if(self.IsEnd())return;
			priv.aborted=true;
			for(let sub of priv.sublauncher)sub.Abort();
			priv.sublauncher=[]
			for(let proc of priv.launched)proc.Abort();
			priv.launched=[]
			for(let proc of priv.active)proc.Abort();
			priv.active=[]
		},
		Poll:()=>{
			for(let sub of priv.sublauncher){
				sub.Poll();
			}

			let cont=[]
			for(let proc of priv.active){
				if(proc.Poll())cont.push(proc);
			}
			priv.active=cont;

			if(self.Limit<0 || priv.active.length<self.Limit){
				let hold=[]
				for(let proc of priv.launched){
					if(self.Limit>=0 && priv.active.length>=self.Limit)hold.push(proc);
					else{
						proc._start();
						priv.active.push(proc);
					}
				}
				priv.launched=hold;
			}
		},

		Sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				self.HappenTo.Happen(
					'Empty callback for sync',{
					Class:self.GetClassName(),
					Cause:'CannotSync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.Sync(interval,
				()=>{
					self.Poll();
					return self.IsEnd();
				},
				()=>{
					try{
						cb_sync(self.User);
					}
					catch(e){
						self.HappenTo.Happen(e,{
							Class:self.GetClassName(),
							Cause:'ThrownFromCallback',
							Info:self.GetInfo('OnSync'),
						});
					}
				}
			);
		},

		ToPromise:(breakable,interval=null)=>{
			return Timing.ToPromise((ok,ng)=>{
				self.Sync(()=>{
					if(breakable || !priv.aborted)ok(self.User);
					else ng(new Error('abort',{cause:self.GetInfo('abort')}));
				},interval);
			});
		},

		Delay:(time,cb_done,cb_abort=null)=>{
			let until=new Date(Date.now()+time);
			return self.Launch({
					Name:'YgEs.DelayProc',
					OnPoll:(proc)=>{
						return Date.now()<until;
					},
					OnDone:cb_done,
					OnAbort:cb_abort??cb_done,
				});
		},
	});	

	return self;
}

let Engine=YgEs.Engine=_yges_enginge_create_launcher({
	Name:'YgEs.RootLauncher',
	Cycle:DEFAULT_ROOT_CYCLE,
});

let _working=false;
let _cancel=null;

function _poll_engine(){

	if(!_working)return;
	if(Engine.IsAbandoned())return;

	Engine.Poll();

	_cancel=Timing.Delay(Engine.Cycle,()=>{
		_cancel=null;
		_poll_engine();
	});
}

function _stop(){

	_working=false;
	if(_cancel!=null)_cancel();
}

YgEs.Engine.Start=()=>{

	if(Engine.IsAbandoned())return;
	if(_working)return;
	_working=true;
	_poll_engine();
}

YgEs.Engine.Stop=()=>{

	_stop();
	if(Engine.IsAbandoned())return;
	Engine.Abort();
}

YgEs.Engine.ShutDown=()=>{
	Engine.Abandon();
	_stop();
}

})();
export default YgEs.Engine;
