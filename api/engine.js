// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Async Procedure Engine //

import hap from './happening.js';
import log from './logger.js';

const DEFAULT_ROOT_CYCLE=20;
const DEFAULT_LAUNCHER_CYCLE=20;
const DEFAULT_SYNC_CYCLE=10;
const CLASS_PROC='YgEs_Procedure';
const CLASS_LAUNCHER='YgEs_Launcher';
const CLASS_LAUNCHERPROC='YgEs_LauncherProc';
const CLASS_DELAYPROC='YgEs_DelayProc';
const CLASS_ROOT='YgEs_RootLauncher';

var notice=hap.createLocal('YgEs_Engnie_Happening_Notice');
notice.Happened=(h)=>{log.notice(h.ToJSON());}
var warn=notice.createLocal('YgEs_Engnie_Happening_Warn');
warn.Happened=(h)=>{log.warn(h.ToJSON());}
var fatal=warn.createLocal('YgEs_Engnie_Happening_Fatal');
fatal.Happened=(h)=>{log.fatal(h.ToJSON());	}

function _create_proc(prm){

	var cb_start=prm.cb_start??null;
	var cb_poll=prm.cb_poll;
	var cb_done=prm.cb_done??null;
	var cb_abort=prm.cb_abort??null;

	var started=false;
	var finished=false;
	var aborted=false;
	var promise=null;

	var proc={
		name:prm.name??CLASS_PROC,
		HappenTo:prm.happen??null,
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
					(proc.HappenTo??fatal).happenProp({
						class:CLASS_PROC,
						cause:'throw from start',
						src:proc,
						err:e,
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
					(proc.HappenTo??fatal).happenProp({
						class:CLASS_PROC,
						cause:'throw from abort',
						src:proc,
						err:e,
					});
				}
			}
			else{
				(proc.HappenTo??warn).happenProp({
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
				(proc.HappenTo??fatal).happenProp({
					class:CLASS_PROC,
					cause:'throw from poll',
					src:proc,
					err:e,
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
					(proc.HappenTo??fatal).happenProp({
						class:CLASS_PROC,
						cause:'throw from done',
						src:proc,
						err:e,
					});
					proc.abort();
					return false;
				}
			}
			return false;
		},

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				(proc.HappenTo??notice).happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			(async()=>{
				while(!proc.isEnd()){
					await new Promise(ok=>setTimeout(ok,interval));
				}
				try{
					cb_sync(proc.User);
				}
				catch(e){
					(proc.HappenTo??fatal).happenProp({
						class:CLASS_PROC,
						cause:'throw from sync',
						src:proc,
						err:e,
					});
				}
			})();
		},

		toPromise:(breakable,interval=null)=>{
			if(promise)return promise;
			promise=new Promise((ok,ng)=>{
				proc.sync(()=>{
					if(breakable || finished)ok(proc.User);
					else ng(new Error('abort',{cause:proc.User}));
				},interval);
			});
			return promise;
		},
	}
	return proc;
}

function _create_launcher(prm){

	var abandoned=false;
	var aborted=false;
	var promise=null;

	var lnc={
		name:prm.name??CLASS_LAUNCHER,
		HappenTo:prm.happen??null,
		Limit:prm.limit??-1,
		Cycle:prm.cycle??DEFAULT_LAUNCHER_CYCLE,
		User:prm.user??{},

		_launch:[],
		_active:[],

		isEnd:()=>{return lnc._launch.length+lnc._active.length<1;},
		isAbandoned:()=>abandoned,
		countActive:()=>lnc._active.length,
		countHeld:()=>lnc._launch.length,

		abandon:()=>{
			abandoned=true;
			lnc.abort();
		},

		createLauncher:(prm={})=>{
			var sub=_create_launcher(prm);
			lnc.launch({
				name:CLASS_LAUNCHERPROC,
				cb_poll:(user)=>{
					sub.poll();
					return !sub.isAbandoned();
				},
				cb_abort:()=>{
					sub.abort();
				},
			});
			return sub;
		},

		launch:(prm={})=>{
			if(abandoned){
				if(prm.cb_abort)prm.cb_abort();
				return;
			}
			if(!prm.cb_poll){
				(lnc.HappenTo??notice).happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty pollee',
				});
				return;
			}

			var proc=_create_proc(prm);
			if(lnc.Limit<0 || lnc._active.length<lnc.Limit){
				lnc._active.push(proc);
				proc._start();
			}
			else{
				lnc._launch.push(proc);
			}
			return proc;
		},
		abort:()=>{
			if(lnc.isEnd())return;
			aborted=true;
			for(var proc of lnc._launch)proc.abort();
			lnc._launch=[]
			for(var proc of lnc._active)proc.abort();
			lnc._active=[]
		},
		poll:()=>{
			var cont=[]
			for(var proc of lnc._active){
				if(proc.poll())cont.push(proc);
			}
			lnc._active=cont;

			if(lnc.Limit<0 || lnc._active.length<lnc.Limit){
				var hold=[]
				for(var proc of lnc._launch){
					if(lnc.Limit>=0 && lnc._active.length>=lnc.Limit)hold.push(proc);
					else{
						proc._start();
						lnc._active.push(proc);
					}
				}
				lnc._launch=hold;
			}
		},

		sync:(cb_sync,interval=null)=>{
			if(!cb_sync){
				(lnc.HappenTo??notice).happenProp({
					class:CLASS_LAUNCHER,
					cause:'empty callback from sync',
				});
				return;
			}
			if(interval===null)interval=DEFAULT_SYNC_CYCLE;
			(async()=>{
				while(!abandoned){
					lnc.poll();
					if(lnc.isEnd())break;
					await new Promise(ok=>setTimeout(ok,interval));
				}
				try{
					cb_sync(lnc.User);
				}
				catch(e){
					(proc.HappenTo??fatal).happenProp({
						class:CLASS_PROC,
						cause:'throw from sync',
						src:proc,
						err:e,
					});
				}
			})();
		},

		toPromise:(breakable,interval=null)=>{
			if(promise)return promise;
			promise=new Promise((ok,ng)=>{
				lnc.sync(()=>{
					if(breakable || !aborted)ok(lnc.User);
					else ng(new Error('abort',{cause:lnc.User}));
				},interval);
			});
			return promise;
		},

		delay:(time,cb_done,cb_abort=null)=>{
			var until=new Date(Date.now()+time);
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


const mif=_create_launcher({
	name:CLASS_ROOT,
	cycle:DEFAULT_ROOT_CYCLE,
});

var _working=false;

mif.start=()=>{

	if(mif.isAbandoned())return;
	if(_working)return;
	_working=true;
	(async()=>{
		while(_working && !mif.isAbandoned()){
			mif.poll();
			await new Promise(ok=>setTimeout(ok,mif.Cycle));
		}
	})();
}

mif.stop=()=>{

	if(mif.isAbandoned())return;
	mif.abort();
	_working=false;
}

mif.shutdown=()=>{
	mif.abandon();
}

export default mif;
