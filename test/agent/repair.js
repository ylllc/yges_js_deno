// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Repairing Test ----------------- //

let agent=null;
let handle=null;

let workset={
	user:{count:1},
	cb_open:(agent)=>{
		agent.User.count+=2;
		Test.chk_strict(agent.User.count,4);
	},
	cb_repair:(agent)=>{
		agent.User.count+=1;
		Test.chk_strict(agent.User.count,2);

		agent.waitFor(()=>{
			// resolve all happenings in target HappeningManager 
			let hm=agent.getHappeningManager();
			hm.poll((hap)=>{
				hap.resolve();
			});

			hm.cleanup();
			return hm.isCleaned();
		});
	},
	cb_ready:(agent)=>{
		agent.User.count+=3;
		Test.chk_strict(agent.User.count,7);

		handle.close();
	},
	cb_close:(agent)=>{
		agent.User.count+=4;
		Test.chk_strict(agent.User.count,11);
	},
	cb_finish:(agent)=>{
		agent.User.count+=5;
		Test.chk_strict(agent.User.count,16);
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

			// the agent has a Happening at start 
			// and must repair it to open.  
			workset.happen.happenMsg('Test Hap.');

			handle=agent.fetch();
			handle.open();

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
