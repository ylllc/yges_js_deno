// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import AgentManager from '../../api/agent.js';

// Plain Agent Test --------------------- //

const scenaria=[
	{
		Title:'Plain Agent',
		Proc:async (tool)=>{
			let w=AgentManager.StandBy({});
			Test.ChkStrict(w.IsOpen(),false);

			let info=w.GetInfo();
			Test.ChkStrict('NONE',info.State);
			Test.ChkStrict(false,info.Busy);
			Test.ChkStrict(false,info.Ready);
			Test.ChkStrict(false,info.Halt);
			Test.ChkStrict(false,info.Aborted);
			Test.ChkStrict(false,info.Restarting);
			Test.ChkStrict(0,info.Handles);
			Test.ChkStrict(0,info.Waiting);

			let h=w.Open();
			Test.ChkStrict(w.IsOpen(),true);

			info=w.GetInfo();
			Test.ChkStrict(true,info.Busy);
			Test.ChkStrict(true,info.Ready);
			Test.ChkStrict(1,info.Handles);

			h.Close();
			Test.ChkStrict(w.IsOpen(),false);

			info=w.GetInfo();
			Test.ChkStrict(0,info.Handles);
		},
	},
]

Test.Run(scenaria);
