// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Dependencies Test -------------- //

let agent=null;
let handle=null;

let workset1={
	user:{count:0},
	cb_open:(agent)=>{
		Test.chk_strict(agent.isBusy(),true);
		agent.waitFor(()=>{
			return ++agent.User.count>=10;
		});
	},
	cb_ready:(agent)=>{
		Test.chk_strict(agent.isReady(),true);
	},
	cb_close:(agent)=>{
		Test.chk_strict(agent.isReady(),false);
		agent.waitFor(()=>{
			return ++agent.User.count>=20;
		});
	},
	cb_finish:(agent)=>{
		Test.chk_strict(agent.isBusy(),false);
	},
}

let workset2={
	user:{count:0},
	dependencies:{w1:AgentManager.launch(workset1)},
	cb_open:(agent)=>{
		Test.chk_strict(agent.isBusy(),true);
	},
	cb_ready:(agent)=>{
		Test.chk_strict(agent.isReady(),true);
		Test.chk_strict(agent.getDependencies().w1.isOpenAgent(),true);

		handle.close();
		Test.chk_strict(agent.isOpen(),false);
	},
	cb_close:(agent)=>{
		Test.chk_strict(agent.isReady(),false);
		Test.chk_strict(agent.getDependencies().w1.isOpenAgent(),false);
	},
	cb_finish:(agent)=>{
		Test.chk_strict(agent.isBusy(),false);
	},
}

const scenaria=[
	{
		title:'Agent Dependencies',
		proc:async (tool)=>{
			workset1.launcher=tool.Launcher;
			workset2.launcher=tool.Launcher;
			workset1.happen=tool.Launcher.HappenTo;
			workset2.happen=tool.Launcher.HappenTo;

			agent=AgentManager.standby(workset2);
			handle=agent.open();
			Test.chk_strict(agent.isOpen(),true);

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
