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
	cb_done:(user)=>{
		// OK 
	},
	cb_abort:(user)=>{
		Test.never('states abend');
	},
}

const scenaria=[
	{
		title:'Empty Running',
		proc:async (tool)=>{
			opt.launcher=tool.Launcher;
			opt.happen=tool.Launcher.HappenTo;

			// run with undefined state 
			// abort soon 
			StateMachine.run(null,states,opt);

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
