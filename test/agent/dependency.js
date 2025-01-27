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
	User:{Count:0},
	OnOpen:(agent)=>{
		Test.ChkStrict(agent.IsBusy(),true);
		agent.WaitFor(()=>{
			return ++agent.User.Count>=10;
		});
	},
	OnReady:(agent)=>{
		Test.ChkStrict(agent.IsReady(),true);
	},
	OnClose:(agent)=>{
		Test.ChkStrict(agent.IsReady(),false);
		agent.WaitFor(()=>{
			return ++agent.User.Count>=20;
		});
	},
	OnFinish:(agent)=>{
		Test.ChkStrict(agent.IsBusy(),false);
	},
}

let workset2={
	User:{Count:0},
	Dependencies:{w1:AgentManager.Launch(workset1)},
	OnOpen:(agent)=>{
		Test.ChkStrict(agent.IsBusy(),true);
	},
	OnReady:(agent)=>{
		Test.ChkStrict(agent.IsReady(),true);
		Test.ChkStrict(agent.GetDependencies().w1.IsOpenAgent(),true);

		handle.Close();
		Test.ChkStrict(agent.IsOpen(),false);
	},
	OnClose:(agent)=>{
		Test.ChkStrict(agent.IsReady(),false);
		Test.ChkStrict(agent.GetDependencies().w1.IsOpenAgent(),false);
	},
	OnFinish:(agent)=>{
		Test.ChkStrict(agent.IsBusy(),false);
	},
}

const scenaria=[
	{
		Title:'Agent Dependencies',
		Proc:async (tool)=>{
			workset1.Launcher=tool.Launcher;
			workset2.Launcher=tool.Launcher;
			workset1.HappenTo=tool.HappenTo;
			workset2.HappenTo=tool.HappenTo;

			agent=AgentManager.StandBy(workset2);
			handle=agent.Open();
			Test.ChkStrict(agent.IsOpen(),true);

			await tool.Launcher.ToPromise();
		},
	},
]

Test.Run(scenaria);
