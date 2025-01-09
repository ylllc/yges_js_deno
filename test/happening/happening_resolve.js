// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import HappeningManager from '../../api/happening.js';
import Log from '../../api/logger.js';

// Happening Manager Test --------------- //

Log.Way=(src)=>{
//	console.log(src.Text);
}

const scenaria=[
	{
		Title:'Happening Resolving',
		Proc:(tool)=>{
			let hap_local1=HappeningManager.CreateLocal();
			let hap_local2=hap_local1.CreateLocal();
			let hap_local3=hap_local2.CreateLocal();

			let h1=hap_local1.HappenMsg('hap1');
			let h2=hap_local2.HappenMsg('hap2');
			let h3=hap_local3.HappenMsg('hap3');
			Test.ChkStrict(3,HappeningManager.CountIssues(),'global manager issue count');
			Test.ChkStrict(3,hap_local1.CountIssues(),'local1 manager issue count');
			Test.ChkStrict(2,hap_local2.CountIssues(),'local2 manager issue count');
			Test.ChkStrict(1,hap_local3.CountIssues(),'local3 manager issue count');

			h2.Resolve();
			Test.ChkStrict(2,hap_local2.CountIssues(),'resolved but dirty');

			hap_local1.CleanUp();
			Test.ChkStrict(2,HappeningManager.CountIssues(),'local1 cleaned up');
			Test.ChkStrict(2,hap_local1.CountIssues(),'local1 cleaned up');
			Test.ChkStrict(1,hap_local2.CountIssues(),'local1 cleaned up');
			Test.ChkStrict(1,hap_local3.CountIssues(),'local1 cleaned up');

			hap_local2.Abandon();
			Test.ChkStrict(1,HappeningManager.CountIssues(),'local2 abandoned');
			Test.ChkStrict(1,hap_local1.CountIssues(),'local2 abandoned');
			Test.ChkStrict(0,hap_local2.CountIssues(),'local2 abandoned');
			Test.ChkStrict(0,hap_local3.CountIssues(),'local2 abandoned');

			h3=hap_local3.HappenMsg('hap3-2');
			Test.ChkStrict(2,HappeningManager.CountIssues(),'local3 happened');
			Test.ChkStrict(2,hap_local1.CountIssues(),'local3 happened');
			Test.ChkStrict(1,hap_local2.CountIssues(),'local3 happened');
			Test.ChkStrict(1,hap_local3.CountIssues(),'local3 happened');

			HappeningManager.Abandon();
			Test.ChkStrict(0,HappeningManager.CountIssues(),'global abandoned');
			Test.ChkStrict(0,hap_local1.CountIssues(),'global abandoned');
			Test.ChkStrict(0,hap_local2.CountIssues(),'global abandoned');
			Test.ChkStrict(0,hap_local3.CountIssues(),'global abandoned');
			Test.ChkStrict(true,HappeningManager.IsCleaned(),'global cleaned');
			Test.ChkStrict(true,hap_local1.IsCleaned(),'global cleaned');
			Test.ChkStrict(true,hap_local2.IsCleaned(),'global cleaned');
			Test.ChkStrict(true,hap_local3.IsCleaned(),'global cleaned');
		},
	},
]

Test.Run(scenaria);
