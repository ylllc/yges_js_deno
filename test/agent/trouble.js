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
	User:{Count:1},
	OnOpen:(agent)=>{
		agent.User.Count+=1;
		Test.ChkStrict(agent.User.Count,2);
	},
	OnReady:(agent)=>{
		agent.User.Count+=2;
		Test.ChkStrict(agent.User.Count,4);

		// happening after ready 
		// required resolving it to recover 
		agent.GetHappeningManager().HappenMsg('Test Hap.');
	},
	OnPollInHealthy:(agent)=>{
		agent.User.Count+=4;
		Test.ChkStrict(agent.User.Count,11);

		handle.Close();
	},
	OnPollInTrouble:(agent)=>{
		agent.User.Count+=3;
		Test.ChkStrict(agent.User.Count,7);

		// resolve all happenings in target HappeningManager 
		let hm=agent.GetHappeningManager();
		hm.Poll((hap)=>{
			hap.Resolve();
		});
	},
	OnClose:(agent)=>{
		agent.User.Count+=5;
		Test.ChkStrict(agent.User.Count,16);
	},
	OnFinish:(agent)=>{
		agent.User.Count+=6;
		Test.ChkStrict(agent.User.Count,22);
	},
	OnAbort:(agent)=>{
		Test.Never("don't step");
	},
}

const scenaria=[
	{
		Title:'Agent Recovering',
		Proc:async (tool)=>{
			workset.Launcher=tool.Launcher;
			workset.HappenTo=tool.Launcher.HappenTo.CreateLocal({
				OnHappen:(hap)=>{
//					tool.Log.Fatal(hap.ToString(),hap.GetProp());
				},
			});

			agent=AgentManager.StandBy(workset);
			Test.ChkStrict(agent.User.Count,1);

			handle=agent.Fetch();
			handle.Open();

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
