// † Yggdrasil Essense for Node.js † //
// ==================================== //
// © 2024 Yggdrasil Leaves, LLC.        //
//        All rights reserved.          //

// Test of Unit Test //

import test from '../../api/unittest.js';

function delay(ms) {
	return new Promise((resolve)=>setTimeout(resolve,ms));
}

var scn=[
	{
		title:'always',
		proc:()=>{
			test.chk(true, 'always');
		},
	},
	{
		title:'loose',
		proc:()=>{
			test.chk_loose(1, '1', 'loose');
		},
	},
	{
		title:'strict',
		proc:()=>{
			test.chk_strict(1, 1, 'strict');
		},
	},
	{
		title:'waiting',
		proc: async ()=>{
			await delay(3000);
			test.chk(true, 'always');
		},
	},
]

test.run(scn);
