// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import StateMachine from '../../api/stmac.js';

// State Interruption from Up ----------- //

const states={
	'Test1':{
		OnPollInKeep:(ctx,proc)=>{
			Test.ChkLessEq(++proc.User.Count,10,'poll_keep called illegular');
			return (proc.User.Count<10)?null:'Test2A';
		},
		OnEnd:(ctx,proc)=>{
			Test.ChkStrict(++proc.User.Count,11,'cb_end called illegular');
		},
	},
	'Test2A':{
		OnStart:(ctx,proc)=>{
			Test.ChkStrict(++proc.User.Count,12,'cb_start called illegular');
		},
		OnPollInUp:(ctx,proc)=>{
			return 'Test2B';
		},
		OnPollInKeep:(ctx,proc)=>{
			Test.Never("don't step it");
			return false;
		},
		OnPollInDown:(ctx,proc)=>{
			Test.Never("don't step it");
			return false;
		},
		OnEnd:(ctx,proc)=>{
			Test.ChkStrict(++proc.User.Count,13,'cb_end called illegular');
		},
	},
	'Test2B':{
		OnStart:(ctx,proc)=>{
			Test.ChkStrict(++proc.User.Count,14,'cb_start called illegular');
		},
		OnPollInKeep:(ctx,proc)=>{
			Test.ChkLessEq(++proc.User.Count,20,'poll_keep called illegular');
			return (proc.User.Count<20)?null:true;
		},
		OnEnd:(ctx,proc)=>{
			Test.ChkStrict(++proc.User.Count,21,'cb_end called illegular');
		},
	},
}

let opt={
	User:{Count:1}, // share in states 
	OnDone:(proc)=>{
		Test.ChkStrict(++proc.User.Count,22,'cb_done called illegular');
	},
	OnAbort:(proc)=>{
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
