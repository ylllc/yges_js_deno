// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import StateMachine from '../../api/stmac.js';

// State Interruption from Up ----------- //

const states={
	'Test1':{
		OnPollInKeep:(ctx,user)=>{
			Test.ChkLessEq(++user.Count,10,'poll_keep called illegular');
			return (user.Count<10)?null:'Test2A';
		},
		OnEnd:(ctx,user)=>{
			Test.ChkStrict(++user.Count,11,'cb_end called illegular');
		},
	},
	'Test2A':{
		OnStart:(ctx,user)=>{
			Test.ChkStrict(++user.Count,12,'cb_start called illegular');
		},
		OnPollInUp:(ctx,user)=>{
			return 'Test2B';
		},
		OnPollInKeep:(ctx,user)=>{
			Test.Never("don't step it");
			return false;
		},
		OnPollInDown:(ctx,user)=>{
			Test.Never("don't step it");
			return false;
		},
		OnEnd:(ctx,user)=>{
			Test.ChkStrict(++user.Count,13,'cb_end called illegular');
		},
	},
	'Test2B':{
		OnStart:(ctx,user)=>{
			Test.ChkStrict(++user.Count,14,'cb_start called illegular');
		},
		OnPollInKeep:(ctx,user)=>{
			Test.ChkLessEq(++user.Count,20,'poll_keep called illegular');
			return (user.Count<20)?null:true;
		},
		OnEnd:(ctx,user)=>{
			Test.ChkStrict(++user.Count,21,'cb_end called illegular');
		},
	},
}

let opt={
	User:{Count:1}, // share in states 
	OnDone:(user)=>{
		Test.ChkStrict(++user.Count,22,'cb_done called illegular');
	},
	OnAbort:(user)=>{
		Test.Never('states abend');
	},
}

const scenaria=[
	{
		Title:'Interruption from Up',
		Proc:async (tool)=>{
			opt.Launcher=tool.Launcher;
			opt.HappenTo=tool.Launcher.HappenTo;

			// run with undefined state 
			// abort soon 
			StateMachine.Run('Test1',states,opt);

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
