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
	Name:'Test Rescuee',
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
		agent.GetHappeningManager().Happen('Test Hap.');
	},
	OnTrouble:(agent)=>{
		agent.User.Count+=3;
		Test.ChkStrict(agent.User.Count,7);
	},
	OnPollInTrouble:(agent)=>{
		// more happening in poll_trouble() 
		// this agent locked down and stop polling until cleaned up 
		agent.GetHappeningManager().Happen('More Test Hap.');
	},
	OnRecover:(agent)=>{
		agent.User.Count+=4;
		Test.ChkStrict(agent.User.Count,11);

		handle1.Close();
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

let workset2={
	name:'Test Rescuer',

	OnOpen:(agent)=>{
		agent.WaitFor('Is Agent1 halt',()=>{
			return agent1.IsHalt();
		});
	},
	OnReady:(agent)=>{
		// rescue locked agent 
		let hm=agent1.GetHappeningManager();
		hm.Poll((hap)=>{
			hap.Resolve();
		});
		handle2.Close();
	},
}

const scenaria=[
	{
		Title:'Rescue Locked Agent',
		Proc:async (tool)=>{
			workset1.Launcher=tool.Launcher;
			workset2.Launcher=tool.Launcher;
			workset1.HappenTo=tool.HappenTo.CreateLocal({
				OnHappen:(hap)=>{
//					tool.Log.Fatal(hap.ToString(),hap.GetProp());
				},
			});
			workset2.HappenTo=tool.HappenTo.CreateLocal({
				OnHappen:(hap)=>{
					tool.Log.Fatal(hap.ToString(),hap.GetProp());
				},
			});

			agent1=AgentManager.StandBy(workset1);
			Test.ChkStrict(agent1.User.Count,1);

			handle1=agent1.Fetch();
			handle1.Open();

			agent2=AgentManager.StandBy(workset2);
			handle2=agent2.Fetch();
			handle2.Open();

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
