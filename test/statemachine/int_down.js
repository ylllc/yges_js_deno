// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// State Interruption from Down //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import stmac from '../../api/stmac.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

var hap_local=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.GetProp());},
});

var states={
	'Test1':{
		poll_keep:(ctx,user)=>{
			test.chk_less_eq(++user.count,10,'poll_keep called illegular');
			return (user.count<10)?null:'Test2A';
		},
		poll_down:(ctx,user)=>{
			return 'Test2B';
		},
		cb_end:(ctx,user)=>{
			test.chk_strict(++user.count,11,'cb_end called illegular');
		},
	},
	'Test2A':{
		cb_start:(ctx,user)=>{
			test.never("don't step it");
		},
	},
	'Test2B':{
		cb_start:(ctx,user)=>{
			test.chk_strict(++user.count,12,'cb_start called illegular');
		},
		poll_keep:(ctx,user)=>{
			test.chk_less_eq(++user.count,20,'poll_keep called illegular');
			return (user.count<20)?null:true;
		},
		cb_end:(ctx,user)=>{
			test.chk_strict(++user.count,21,'cb_end called illegular');
		},
	},
}

eng.start();

var opt={
	launcher:eng.createLauncher(),
	happen:hap_local,
	user:{count:1}, // share in states 
	cb_done:(user)=>{
		test.chk_strict(++user.count,22,'cb_done called illegular');
	},
	cb_abort:(user)=>{
		test.never('states abend');
	},
}

var scenaria=[
	{
		title:'Interruption from Down',
		proc:async ()=>{
			// run with undefined state 
			// abort soon 
			stmac.run('Test1',states,opt);

			await opt.launcher.toPromise();
			eng.shutdown();
		},
	},
]

test.run(scenaria);
