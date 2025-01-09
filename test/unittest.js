// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../api/unittest.js';
import Timing from '../api/timing.js';

// Test Example ------------------------- //

const scenaria=[
	// test 1 
	{
		Title:'Test Now',
		Proc:(tool)=>{
			// can test by any conditions 
			Test.Chk(true, 'always');
			// loose comparing 
			Test.ChkLoose(1, '1', 'loose comparing');
			// strict comparing 
			Test.ChkStrict(1, 1, 'strict comparing');
			// leftside less than rightside 
			Test.ChkLess(1,2);
			// leftside equal or less than rightside 
			Test.ChkLessEq(1,2);
			Test.ChkLessEq(1,1);
			// leftside greater than rightside 
			Test.ChkGreat(2,1);
			// leftside equal or greater than rightside 
			Test.ChkGreatEq(2,1);
			Test.ChkGreatEq(2,2);
		},
	},
	// test 2 
	{
		Title:'Test With Waiting',
		Proc: async (tool)=>{
			//  the process is kept until all test were ended 
			await Timing.DelayKit(2000).ToPromise();
			Test.Chk(true, 'delayed test');
		},
	},
	// test 3 
	{
		Title:'Test Ignored',
		Filter:false,
		Proc: async (tool)=>{
			//  will not step it by filtered out
			Test.Never('deny');
		},
	},
	// more ...
]

Test.Run(scenaria);
