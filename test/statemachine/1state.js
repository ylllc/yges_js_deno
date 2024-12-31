// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import StateMachine from '../../api/stmac.js';

// 1 State Test ------------------------- //

const states={
	'Test':{
		cb_start:(ctx,user)=>{
			Test.chk_strict(++user.count,2,'cb_start called illegular');
		},
		poll_up:(ctx,user)=>{
			Test.chk_great(++user.count,2,'poll_up called illegular');
			Test.chk_less_eq(user.count,10,'poll_up called illegular');
			return (user.count<10)?null:true;
		},
		cb_ready:(ctx,user)=>{
			Test.chk_strict(++user.count,11,'cb_ready called illegular');
		},
		poll_keep:(ctx,user)=>{
			Test.chk_great(++user.count,11,'poll_keep called illegular');
			Test.chk_less_eq(user.count,20,'poll_keep called illegular');
			return (user.count<20)?null:true;
		},
		cb_stop:(ctx,user)=>{
			Test.chk_strict(++user.count,21,'cb_stop called illegular');
		},
		poll_down:(ctx,user)=>{
			Test.chk_great(++user.count,21,'poll_down called illegular');
			Test.chk_less_eq(user.count,30,'poll_down called illegular');
			return (user.count<30)?null:true;
		},
		cb_end:(ctx,user)=>{
			Test.chk_strict(++user.count,31,'cb_end called illegular');
		},
	},
}

let opt={
	user:{count:1}, // share in states 
	cb_done:(user)=>{
		Test.chk_strict(++user.count,32,'cb_done called illegular');
	},
	cb_abort:(user)=>{
		Test.never('states abend');
	},
}

const scenaria=[
	{
		title:'1 State Running',
		proc:async (tool)=>{
			opt.launcher=tool.Launcher;
			opt.happen=tool.Launcher.HappenTo;

			// run with undefined state 
			// abort soon 
			StateMachine.run('Test',states,opt);

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
