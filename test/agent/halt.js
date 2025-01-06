// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Rescue Locked Agent Test ------------- //

let agent1=null;
let handle1=null;
let agent2=null;
let handle2=null;

let workset1={
	name:'Test Rescuee',
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

		handle1.close();
	},
	poll_trouble:(agent)=>{
		agent.User.count+=3;
		Test.chk_strict(agent.User.count,7);

		// more happening in poll_trouble() 
		// this agent locked down and stop polling until cleaned up 
		agent.getHappeningManager().happenMsg('More Test Hap.');
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

let workset2={
	name:'Test Rescuer',

	cb_open:(agent)=>{
		agent.waitFor(()=>{
			return agent1.isHalt();
		});
	},
	cb_ready:(agent)=>{
		// rescue locked agent 
		let hm=agent1.getHappeningManager();
		hm.poll((hap)=>{
			hap.resolve();
		});
		handle2.close();
	},
}

const scenaria=[
	{
		title:'Rescue Locked Agent',
		proc:async (tool)=>{
			workset1.launcher=tool.Launcher;
			workset2.launcher=tool.Launcher;
			workset1.happen=tool.Launcher.HappenTo.createLocal({
				happen:(hap)=>{
//					tool.Log.fatal(hap.toString(),hap.getProp());
				},
			});
			workset2.happen=tool.Launcher.HappenTo.createLocal({
				happen:(hap)=>{
					tool.Log.fatal(hap.toString(),hap.getProp());
				},
			});

			agent1=AgentManager.standby(workset1);
			Test.chk_strict(agent1.User.count,1);

			handle1=agent1.fetch();
			handle1.open();

			agent2=AgentManager.standby(workset2);
			handle2=agent2.fetch();
			handle2.open();

			await tool.Launcher.toPromise();
		},
	},
]

Test.run(scenaria);
