// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import YgEs from '../../api/common.js';

// Class Definition --------------------- //

const scenaria=[
	{
		Title:'Clone',
		Proc:async (tool)=>{

			let src={A:'Clone Test',B:'OK'}
			let dst=YgEs.Clone(src);

			src.B='NG';
			Test.ChkStrict('OK',dst.B);
		},
	},
]

Test.Run(scenaria);
