// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import HappeningManager from '../../api/happening.js';

// Happening Manager Test --------------- //

const scenaria=[
	{
		Title:'Global Happenning Manager',
		Proc:(tool)=>{
			Test.ChkStrict(true,HappeningManager.IsCleaned(),'initialised global manager');
		},
	},
	{
		Title:'Local Happening Manager',
		Proc:(tool)=>{
			let hap_local1=HappeningManager.CreateLocal();
			let hap_local2=hap_local1.CreateLocal();

			Test.ChkStrict(true,hap_local1.IsCleaned(),'initialised local1 manager');
			Test.ChkStrict(true,hap_local2.IsCleaned(),'initialised local2 manager');
		},
	},
]

Test.Run(scenaria);
