// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Recovering Test ---------------- //

let agent=null;
let handle=null;

let workset={
	user:{count:1},
	cb_open:(agent)=>{
		agent.User.count+=1;
		Test.chk_strict(agent.User.count,2);
	},
	cb_ready:(agent)=>{
		agent.User.count+=2;
		Test.chk_strict(agent.User.count,4);

		// happening after ready 
		// required resolving it to recover 
		agent.getHappeningManager().happenMsg('Test Hap.');
	},
	poll_healthy:(agent)=>{
		agent.User.count+=4;
		Test.chk_strict(agent.User.count,11);

		handle.close();
	},
	poll_trouble:(agent)=>{
		agent.User.count+=3;
		Test.chk_strict(agent.User.count,7);

		// resolve all happenings in target HappeningManager 
		let hm=agent.getHappeningManager();
		hm.poll((hap)=>{
			hap.resolve();
		});
	},
	cb_close:(agent)=>{
		agent.User.count+=5;
		Test.chk_strict(agent.User.count,16);
	},
	cb_finish:(agent)=>{
		agent.User.count+=6;
		Test.chk_strict(agent.User.count,22);
	},
	cb_abort:(agent)=>{
		Test.chk_never("don't step");
	},
}

const scenaria=[
	{
		title:'Agent Repairing',
		proc:async (tool)=>{
			workset.launcher=tool.Launcher;
			workset.happen=tool.Launcher.HappenTo.createLocal({
				happen:(hap)=>{
//					tool.Log.fatal(hap.toString(),hap.getProp());
				},
			});

			agent=AgentManager.standby(workset);
			Test.chk_strict(agent.User.count,1);

			handle=agent.fetch();
			handle.open();

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
