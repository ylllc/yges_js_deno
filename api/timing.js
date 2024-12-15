// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Basic Timing Features //

var mif={
	name:'YgEs_Timing',
	User:{},

	fromPromise:(promise,cb_ok=null,cb_ng=null)=>{
		new Promise(async (ok,ng)=>{
			try{
				ok(await promise);
			}
			catch(e){
				ng(e);
			}
		}).then((r)=>{
			if(cb_ok)cb_ok(r);
			return r;
		}).catch((e)=>{
			if(cb_ng)cb_ng(e);
			else throw e;
		});
	},
	toPromise:(cb_proc,cb_done=null,cb_fail=null)=>{
		var p=new Promise((ok,ng)=>{
			cb_proc(ok,ng);
		}).then((r)=>{
			if(cb_done)cb_done(r);
			return r;
		}).catch((e)=>{
			if(cb_fail)cb_fail(e);
			else throw e;
		});
		return p;
	},

	delay:(ms,cb_done,cb_cancel=null)=>{

		var h=null;
		if(!cb_done)return ()=>{
			if(cb_cancel)cb_cancel();
		};

		h=setTimeout(()=>{
			h=null;
			cb_done();
		},ms);

		// canceller 
		return async ()=>{
			if(h==null)return;
			clearTimeout(h);
			h=null;
			if(cb_cancel)cb_cancel();
		}
	},

	poll:(ms,cb_poll,cb_abort=null)=>{

		if(!cb_poll)return ()=>{
			if(cb_abort)cb_abort();
		};

		var cancel=null;
		var next=()=>{
			cancel=mif.delay(ms,()=>{
				cb_poll();
				if(!cancel)return;
				cancel=null;
				next();
			});
		}
		next();
		return ()=>{
			if(!cancel)return;
			cancel();
			cancel=null;
			if(cb_abort)cb_abort();
		}
	},

	sync:(ms,cb_chk,cb_done,cb_abort=null)=>{

		if(!cb_chk)return ()=>{};
		if(!cb_done)return ()=>{};

		var cancel=null;
		if(cb_chk()){
			cb_done();
			return ()=>{};
		}

		cancel=mif.poll(ms,()=>{
			if(!cb_chk())return;
			if(cancel){
				cancel();
				cancel=null;
			}
			cb_done();
		});

		return ()=>{
			if(!cancel)return;
			cancel();
			cancel=null;
			cb_abort();
		}
	},

	delayKit:(ms,cb_done=null,cb_cancel=null)=>{
		var kit={}
		kit.promise=()=>mif.toPromise((ok,ng)=>{
			kit.cancel=mif.delay(ms,
			()=>{
				if(cb_done)cb_done();
				ok();
			},()=>{
				if(cb_cancel)cb_cancel();
				ng(new Error('Delay Cancelled'));
			});
		});
		return kit;
	},
	syncKit:(ms,cb_chk,cb_done=null,cb_abort=null)=>{
		var kit={}
		kit.promise=()=>mif.toPromise((ok,ng)=>{
			kit.cancel=mif.sync(ms,cb_chk,
			()=>{
				if(cb_done)ok(cb_done());
				else ok();
			},()=>{
				if(cb_abort)cb_abort();
				ng(new Error('Sync Aborted'));
			});
			if(!cb_chk)ng(new Error('No Conditions for Sync'));
		});
		return kit;
	},

}

export default mif;
