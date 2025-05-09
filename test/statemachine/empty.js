// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import StateMachine from '../../api/stmac.js';

// Empty State Test --------------------- //

// empty states
const states={
}

let opt={
	OnDone:(proc)=>{
		// OK 
	},
	OnAbort:(proc)=>{
		Test.Never('states abend');
	},
}

const scenaria=[
	{
		Title:'Empty Running',
		Proc:async (tool)=>{
			opt.Launcher=tool.Launcher;
			opt.HappenTo=tool.Launcher.HappenTo;

			// run with undefined state 
			// abort soon 
			StateMachine.Run(null,states,opt);

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
