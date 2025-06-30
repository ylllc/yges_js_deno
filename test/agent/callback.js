// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Agent Callback Test ------------------ //

let agent=null;
let handle=null;

let workset={
	User:{count:1},
	OnOpen:(agent)=>{
		agent.User.count+=1;
		Test.ChkStrict(agent.User.count,2);
	},
	OnRepair:(agent)=>{
		Test.Never("don't step");
	},
	OnReady:(agent)=>{
		agent.User.count+=2;
		Test.ChkStrict(agent.User.count,4);
	},
	OnPollInHealthy:(agent)=>{
		if(++agent.User.count>=10){
			handle.Close();
		}
	},
	OnPollInTrouble:(agent)=>{
		Test.Never("don't step");
	},
	OnClose:(agent)=>{
		agent.User.count+=3;
		Test.ChkStrict(agent.User.count,13);
	},
	OnFinish:(agent)=>{
		agent.User.count+=4;
		Test.ChkStrict(agent.User.count,17);
	},
	OnAbort:(agent)=>{
		Test.Never("don't step");
	},
}

const scenaria=[
	{
		Title:'Agent Callback',
		Proc:async (tool)=>{
			workset.Log=tool.Log;
			workset.Launcher=tool.Launcher;
			workset.HappenTo=tool.Launcher.HappenTo;

			agent=AgentManager.StandBy(workset);
			Test.ChkStrict(agent.User.count,1);
			handle=agent.Fetch();
			handle.Open();

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
