// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// 1 State Test //

import test from '../../api/unittest.js';
import eng from '../../api/engine.js';
import stmac from '../../api/stmac.js';
import log from '../../api/logger.js';
import hap_global from '../../api/happening.js';

var hap_local=hap_global.createLocal({
	happen:(hap)=>{log.fatal(hap.GetProp());},
});

var states={
	'Test':{
		cb_start:(ctx,user)=>{
			test.chk_strict(++user.count,2,'cb_start called illegular');
		},
		poll_up:(ctx,user)=>{
			test.chk_great(++user.count,2,'poll_up called illegular');
			test.chk_less_eq(user.count,10,'poll_up called illegular');
			return (user.count<10)?null:true;
		},
		cb_ready:(ctx,user)=>{
			test.chk_strict(++user.count,11,'cb_ready called illegular');
		},
		poll_keep:(ctx,user)=>{
			test.chk_great(++user.count,11,'poll_keep called illegular');
			test.chk_less_eq(user.count,20,'poll_keep called illegular');
			return (user.count<20)?null:true;
		},
		cb_stop:(ctx,user)=>{
			test.chk_strict(++user.count,21,'cb_stop called illegular');
		},
		poll_down:(ctx,user)=>{
			test.chk_great(++user.count,21,'poll_down called illegular');
			test.chk_less_eq(user.count,30,'poll_down called illegular');
			return (user.count<30)?null:true;
		},
		cb_end:(ctx,user)=>{
			test.chk_strict(++user.count,31,'cb_end called illegular');
		},
	},
}

eng.start();

var opt={
	launcher:eng.createLauncher(),
	happen:hap_local,
	user:{count:1}, // share in states 
	cb_done:(user)=>{
		test.chk_strict(++user.count,32,'cb_done called illegular');
	},
	cb_abort:(user)=>{
		test.never('states abend');
	},
}

var scenaria=[
	{
		title:'1 State Running',
		proc:async ()=>{
			// run with undefined state 
			// abort soon 
			stmac.run('Test',states,opt);

			await opt.launcher.toPromise();
			eng.shutdown();
		},
	},
]

test.run(scenaria);
