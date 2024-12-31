// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Callback Test ------------------ //

let agent=null;
let handle=null;

let workset={
	user:{count:1},
	cb_open:(agent)=>{
		agent.User.count+=1;
		Test.chk_strict(agent.User.count,2);
	},
	cb_repair:(agent)=>{
		Test.chk_never("don't step");
	},
	cb_ready:(agent)=>{
		agent.User.count+=2;
		Test.chk_strict(agent.User.count,4);
	},
	poll_healthy:(agent)=>{
		if(++agent.User.count>=10){
			handle.close();
		}
	},
	poll_trouble:(agent)=>{
		Test.chk_never("don't step");
	},
	cb_close:(agent)=>{
		agent.User.count+=3;
		Test.chk_strict(agent.User.count,13);
	},
	cb_finish:(agent)=>{
		agent.User.count+=4;
		Test.chk_strict(agent.User.count,17);
	},
	cb_abort:(agent)=>{
		Test.chk_never("don't step");
	},
}

const scenaria=[
	{
		title:'Agent Callback',
		proc:async (tool)=>{
			workset.launcher=tool.Launcher;
			workset.happen=tool.Launcher.HappenTo;

			agent=AgentManager.standby(workset);
			Test.chk_strict(agent.User.count,1);
			handle=agent.fetch();
			handle.open();

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
