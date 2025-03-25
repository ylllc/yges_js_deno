// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Plain Agent Test --------------------- //

let workset={
	User:{
		Add3:(a,b,c)=>a+b+c,
	},
	AgentBypasses:['IsOpen'],
	UserBypasses:['Add3'],
}

const scenaria=[
	{
		Title:'Agent Bypass',
		Proc:async (tool)=>{
			let w=AgentManager.StandBy(workset);

			let h=w.Fetch();

			h.Open();
			Test.ChkStrict(h.IsOpen(),true);
			Test.ChkStrict(h.Add3(1,2,3),6);

			h.Close();
		},
	},
]

Test.Run(scenaria);
