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
const CLASS_PROC='YgEs_Procedure';
const CLASS_LAUNCHER='YgEs_Launcher';
const CLASS_LAUNCHERPROC='YgEs_LauncherProc';
const CLASS_DELAYPROC='YgEs_DelayProc';
const CLASS_ROOT='YgEs_RootLauncher';

function _create_proc(prm){

	let cb_start=prm.cb_start??null;
	let cb_poll=prm.cb_poll;
	let cb_done=prm.cb_done??null;
	let cb_abort=prm.cb_abort??null;

	let started=false;
	let finished=false;
	let aborted=false;

	let proc={
		name:prm.name??CLASS_PROC,
		HappenTo:(prm.happen??HappeningManager).createLocal(),
		User:prm.user??{},

		isStarted:()=>started,
		isFinished:()=>finished,
		isAborted:()=>aborted,
		isEnd:()=>finished||aborted,

		_start:()=>{
			if(started)return;
			if(proc.isEnd())return;
			started=true;
			if(cb_start){
				try{
					cb_start(proc.User);
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from start',
						src:proc,
						err:YgEs.fromError(e),
					});
					proc.abort();
				}
			}
		},
		abort:()=>{
			if(proc.isEnd())return;
			aborted=true;
			if(cb_abort){
				try{
					cb_abort(proc.User);
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from abort',
						src:proc,
						err:YgEs.fromError(e),
					});
				}
			}
			else{
				proc.HappenTo.happenProp({
					class:CLASS_PROC,
					cause:'abort',
					src:proc,
				});
			}
		},
		poll:()=>{
			if(proc.isEnd())return false;
			try{
				if(cb_poll(proc.User))return true;
			}
			catch(e){
				proc.HappenTo.happenProp({
					class:CLASS_PROC,
					cause:'throw from poll',
					src:proc,
					err:YgEs.fromError(e),
				});
				proc.abort();
				return false;
			}
			if(cb_done){
				try{
					cb_done(proc.User);
					finished=true;
				}
				catch(e){
					proc.HappenTo.happenProp({
						class:CLASS_PROC,
						cause:'throw from done',
						src:proc,
						err:YgEs.fromError(e),
					});
					proc.abort();
					return false;
				}
			}
			else{
				finished=true;
			}
			return false;
		},

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				proc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.sync(interval,
				()=>{return proc.isEnd();},
				()=>{
					try{
						cb_sync(proc.User);
					}
					catch(e){
						proc.HappenTo.happenProp({
							class:CLASS_PROC,
							cause:'throw from sync',
							src:proc,
							err:YgEs.fromError(e),
						});
					}
				},
			);
		},
		toPromise:(breakable,interval=null)=>{
			return Timing.toPromise((ok,ng)=>{
				proc.sync(()=>{
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

	let lnc={
		name:prm.name??CLASS_LAUNCHER,
		HappenTo:(prm.happen??HappeningManager).createLocal(),
		Limit:prm.limit??-1,
		Cycle:prm.cycle??DEFAULT_LAUNCHER_CYCLE,
		User:prm.user??{},

		isEnd:()=>{
			if(launched.length>0)return false;
			if(active.length>0)return false;
			for(let sub of sublauncher){
				if(!sub.isEnd())return false;
			}
			return true;
		},
		isAbandoned:()=>abandoned,
		countActive:()=>{
			let n=active.length
			for(let sub of sublauncher)n+=sub.countActive();
			return n;
		},
		countHeld:()=>{
			let n=launched.length
			for(let sub of sublauncher)n+=sub.countHeld();
			return n;
		},

		abandon:()=>{
			abandoned=true;
			lnc.abort();
		},

		createLauncher:(prm={})=>{
			let sub=_yges_enginge_create_launcher(prm);
			sublauncher.push(sub);
			return sub;
		},

		launch:(prm={})=>{
			if(Engine.isAbandoned()){
				lnc.HappenTo.happenMsg('the Engine was abandoned, no longer launch new procedures.');
				return;
			}
			if(!_working){
				Log.notice('the Engine not startted. call start() to run.');
			}
			if(abandoned){
				if(prm.cb_abort)prm.cb_abort();
				return;
			}
			if(!prm.cb_poll){
				lnc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty pollee',
				});
				return;
			}

			let proc=_create_proc(prm);
			if(lnc.Limit<0 || active.length<lnc.Limit){
				active.push(proc);
				proc._start();
			}
			else{
				launched.push(proc);
			}
			return proc;
		},
		abort:()=>{
			if(lnc.isEnd())return;
			aborted=true;
			for(let sub of sublauncher)sub.abort();
			sublauncher=[]
			for(let proc of launched)proc.abort();
			launched=[]
			for(let proc of active)proc.abort();
			active=[]
		},
		poll:()=>{
			for(let sub of sublauncher){
				sub.poll();
			}

			let cont=[]
			for(let proc of active){
				if(proc.poll())cont.push(proc);
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

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				lnc.HappenTo.happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			Timing.sync(interval,
				()=>{
					lnc.poll();
					return lnc.isEnd();
				},
				()=>{
					try{
						cb_sync(lnc.User);
					}
					catch(e){
						lnc.HappenTo.happenProp({
							class:CLASS_PROC,
							cause:'throw from sync',
							src:lnc,
							err:YgEs.fromError(e),
						});
					}
				}
			);
		},

		toPromise:(breakable,interval=null)=>{
			return Timing.toPromise((ok,ng)=>{
				lnc.sync(()=>{
					if(breakable || !aborted)ok(lnc.User);
					else ng(new Error('abort',{cause:lnc.User}));
				},interval);
			});
		},

		delay:(time,cb_done,cb_abort=null)=>{
			let until=new Date(Date.now()+time);
			return lnc.launch({
					name:CLASS_DELAYPROC,
					cb_poll:(user)=>{
						return Date.now()<until;
					},
					cb_done:cb_done,
					cb_abort:cb_abort??cb_done,
				});
		},
	}
	return lnc;
}

let Engine=YgEs.Engine=_yges_enginge_create_launcher({
	name:CLASS_ROOT,
	cycle:DEFAULT_ROOT_CYCLE,
});

let _working=false;
let _cancel=null;

function _poll_engine(){

	if(!_working)return;
	if(Engine.isAbandoned())return;

	Engine.poll();

	_cancel=Timing.delay(Engine.Cycle,()=>{
		_cancel=null;
		_poll_engine();
	});
}

function _stop(){

	_working=false;
	if(_cancel!=null)_cancel();
}

YgEs.Engine.start=()=>{

	if(Engine.isAbandoned())return;
	if(_working)return;
	_working=true;
	_poll_engine();
}

YgEs.Engine.stop=()=>{

	_stop();
	if(Engine.isAbandoned())return;
	Engine.abort();
}

YgEs.Engine.shutdown=()=>{
	Engine.abandon();
	_stop();
}

})();
export default YgEs.Engine;
