// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import YgEs from '../../api/common.js';

// Enum Test ---------------------------- //

const scenaria=[
	{
		Title:'Enum',
		Proc:async (tool)=>{
			let src=['ZERO','ONE','TWO','THREE','FOUR',
				'FIVE','SIX','SEVEN','EIGHT','NINE','TEN']
			let lut=YgEs.CreateEnum(src);

			Test.ChkStrict(src.length,Object.keys(lut).length,'must same size');
			for(let i=0;i<src.length;++i){
				Test.ChkStrict(i,lut[src[i]],'reverse lookup compareing');
			}
		},
	},
]

Test.Run(scenaria);
