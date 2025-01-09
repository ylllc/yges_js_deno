// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Restart Test ------------------- //

let agent=null;
let handle=null;

let workset={
	User:{Count:1},
	OnOpen:(agent)=>{
		++agent.User.Count;
	},
	OnReady:(agent)=>{
		if(agent.User.Count<10)agent.Restart();
		else handle.Close();
	},
	OnFinish:(agent)=>{
		Test.ChkStrict(agent.User.Count,10);
	},
}

const scenaria=[
	{
		Title:'Agent Restart',
		Proc:async (tool)=>{
			workset.Launcher=tool.Launcher;
			workset.HappenTo=tool.Launcher.HappenTo;
			agent=AgentManager.StandBy(workset);
			Test.ChkStrict(agent.User.Count,1);
			handle=agent.Fetch();
			handle.Open();

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
