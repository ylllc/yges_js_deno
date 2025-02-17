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
const CLASS_PROC='YgEs.Procedure';
const CLASS_LAUNCHER='YgEs.Launcher';
const CLASS_LAUNCHERPROC='YgEs.LauncherProc';
const CLASS_DELAYPROC='YgEs.DelayProc';
const CLASS_ROOT='YgEs.RootLauncher';

function _create_proc(prm,launcher){

	let onStart=prm.OnStart??null;
	let onPoll=prm.OnPoll;
	let onDone=prm.OnDone??null;
	let onAbort=prm.OnAbort??null;

	let started=false;
	let finished=false;
	let aborted=false;

	const iid=YgEs.NextID();
	let proc={
		Name:prm.Name??CLASS_PROC,
		User:prm.User??{},
		_private_:{},

		HappenTo:prm.HappenTo??launcher.HappenTo??HappeningManager,

		GetInstanceID:()=>iid,
		IsStarted:()=>started,
		IsFinished:()=>finished,
		IsAborted:()=>aborted,
		IsEnd:()=>finished||aborted,

		GetStatus:()=>{
			if(finished)return 'Finished';
			if(aborted)return 'Aborted';
			if(started)return 'Running';
			return 'StandBy';
		},
		GetInfo:(site='')=>{return {
			InstanceID:iid,
			Name:proc.Name,
			CrashSite:site,
			Status:proc.GetStatus(),
			User:proc.User,
		}},

		_start:()=>{
			if(started)return;
			if(proc.IsEnd())return;
			started=true;
			if(onStart){
				try{
					onStart(proc.User);
				}
				catch(e){
					proc.HappenTo.Happen(e,{
						Class:CLASS_PROC,
						Cause:'ThrownFromCallback',
						Info:proc.GetInfo('OnStart'),
					});
					proc.Abort();
				}
			}
		},
		Abort:()=>{
			if(proc.IsEnd())return;
			aborted=true;
			if(onAbort){
				try{
					onAbort(proc.User);
				}
				catch(e){
					proc.HappenTo.Happen(e,{
						Class:CLASS_PROC,
						Cause:'ThrownFromCallback',
						Info:proc.GetInfo('OnAbort'),
					});
				}
			}
			else{
				proc.HappenTo.Happen(
					'Aborted',{
					Class:CLASS_PROC,
					Cause:'Aborted',
					Info:proc.GetInfo('Aborted'),
				});
			}
		},
		Poll:()=>{
			if(proc.IsEnd())return false;
			try{
				if(onPoll(proc.User))return true;
			}
			catch(e){
				proc.HappenTo.Happen(e,{
					Class:CLASS_PROC,
					Cause:'ThrownFromCallback',
					Info:proc.GetInfo('OnPoll'),
				});
				proc.Abort();
				return false;
			}
			if(onDone){
				try{
					onDone(proc.User);
					finished=true;
				}
				catch(e){
					proc.HappenTo.Happen(e,{
						Class:CLASS_PROC,
						Cause:'ThrownFromCallback',
						Info:proc.GetInfo('OnDone'),
					});
					proc.Abort();
					return false;
				}
			}
			else{
				finished=true;
			}
			return false;
		},

		Sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				proc.HappenTo.Happen(
					'Empty callback for sync',{
					Class:CLASS_PROC,
					Cause:'EmptySyncCallback',
					Info:proc.GetInfo('CannotSync'),
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.Sync(interval,
				()=>{return proc.IsEnd();},
				()=>{
					try{
						cb_sync(proc.User);
					}
					catch(e){
						proc.HappenTo.Happen(e,{
							Class:CLASS_PROC,
							Cause:'ThrownFromCallback',
							Info:proc.GetInfo('OnSync'),
						});
					}
				},
			);
		},
		ToPromise:(breakable,interval=null)=>{
			return Timing.ToPromise((ok,ng)=>{
				proc.Sync(()=>{
					if(breakable || finished)ok(proc.User);
					else ng(new Error('abort',{cause:proc.User}));
				},interval);
			});
		},
	}
	return proc;
}

function _yges_enginge_create_launcher(prm){

	let abandoned=false;
	let aborted=false;

	let sublauncher=[]
	let launched=[]
	let active=[]

	const iid=YgEs.NextID();
	let lnc={
		Name:prm.Name??CLASS_LAUNCHER,
		User:prm.User??{},
		_private_:{},

		HappenTo:prm.HappenTo??HappeningManager,
		Limit:prm.Limit??-1,
		Cycle:prm.Cycle??DEFAULT_LAUNCHER_CYCLE,

		GetInstanceID:()=>iid,
		GetActive:()=>active,
		GetHeld:()=>launched,
		GetSub:()=>sublauncher,

		GetStatus:()=>{
			if(abandoned)return 'Abandoned';
			if(aborted)return 'Aborted';
			return 'Ready';
		},
		GetInfo:(site='')=>{
			let r={
				InstanceID:iid,
				Name:lnc.Name,
				CrashSite:site,
				Status:lnc.GetStatus(),
				Limit:lnc.Limit,
				Cycle:lnc.Cycle,
				User:lnc.User,
				Active:[],
				Held:[],
				Sub:[],
			}
			for(let proc of active)r.Active.push(proc.GetInfo());
			for(let proc of launched)r.Held.push(proc.GetInfo());
			for(let sub of sublauncher)r.Sub.push(sub.GetInfo());
			return r;
		},

		IsEnd:()=>{
			if(launched.length>0)return false;
			if(active.length>0)return false;
			for(let sub of sublauncher){
				if(!sub.IsEnd())return false;
			}
			return true;
		},
		IsAbandoned:()=>abandoned,
		CountActive:()=>{
			let n=active.length
			for(let sub of sublauncher)n+=sub.CountActive();
			return n;
		},
		CountHeld:()=>{
			let n=launched.length
			for(let sub of sublauncher)n+=sub.CountHeld();
			return n;
		},

		Abandon:()=>{
			abandoned=true;
			lnc.Abort();
		},

		CreateLauncher:(prm={})=>{
			let sub=_yges_enginge_create_launcher(prm);
			sublauncher.push(sub);
			return sub;
		},

		Launch:(prm={})=>{
			if(Engine.IsAbandoned()){
				lnc.HappenTo.Happen('the Engine was abandoned, no longer launch new procedures.');
				return;
			}
			if(!_working){
				Log.Notice('the Engine not started. call Start() to run.');
			}
			if(abandoned){
				if(prm.OnAbort)prm.OnAbort();
				return;
			}
			if(!prm.OnPoll){
				lnc.HappenTo.Happen(
					'Empty callback for poll',{
					Class:CLASS_LAUNCHER,
					Cause:'CannotPoll',
				});
				return;
			}

			let proc=_create_proc(prm,lnc);
			if(lnc.Limit<0 || active.length<lnc.Limit){
				active.push(proc);
				proc._start();
			}
			else{
				launched.push(proc);
			}
			return proc;
		},
		Abort:()=>{
			if(lnc.IsEnd())return;
			aborted=true;
			for(let sub of sublauncher)sub.Abort();
			sublauncher=[]
			for(let proc of launched)proc.Abort();
			launched=[]
			for(let proc of active)proc.Abort();
			active=[]
		},
		Poll:()=>{
			for(let sub of sublauncher){
				sub.Poll();
			}

			let cont=[]
			for(let proc of active){
				if(proc.Poll())cont.push(proc);
			}
			active=cont;

			if(lnc.Limit<0 || active.length<lnc.Limit){
				let hold=[]
				for(let proc of launched){
					if(lnc.Limit>=0 && active.length>=lnc.Limit)hold.push(proc);
					else{
						proc._start();
						active.push(proc);
					}
				}
				launched=hold;
			}
		},

		Sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				lnc.HappenTo.Happen(
					'Empty callback for sync',{
					Class:CLASS_LAUNCHER,
					Cause:'CannotSync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.Sync(interval,
				()=>{
					lnc.Poll();
					return lnc.IsEnd();
				},
				()=>{
					try{
						cb_sync(lnc.User);
					}
					catch(e){
						lnc.HappenTo.Happen(e,{
							Class:CLASS_PROC,
							Cause:'ThrownFromCallback',
							Info:lnc.GetInfo('OnSync'),
						});
					}
				}
			);
		},

		ToPromise:(breakable,interval=null)=>{
			return Timing.ToPromise((ok,ng)=>{
				lnc.Sync(()=>{
					if(breakable || !aborted)ok(lnc.User);
					else ng(new Error('abort',{cause:lnc.GetInfo('abort')}));
				},interval);
			});
		},

		Delay:(time,cb_done,cb_abort=null)=>{
			let until=new Date(Date.now()+time);
			return lnc.Launch({
					Name:CLASS_DELAYPROC,
					OnPoll:(user)=>{
						return Date.now()<until;
					},
					OnDone:cb_done,
					OnAbort:cb_abort??cb_done,
				});
		},
	}
	return lnc;
}

let Engine=YgEs.Engine=_yges_enginge_create_launcher({
	Name:CLASS_ROOT,
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
