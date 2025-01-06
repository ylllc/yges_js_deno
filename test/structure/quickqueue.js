// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import QuickQueue from '../../api/quickqueue.js';

// Quick Queue Test --------------------- //

function create(/*...*/){
	var a=arguments;
	return QuickQueue.create(arguments);
}

const scenaria=[
	{
		title:'Empty Queue',
		proc:async (tool)=>{
			var q=QuickQueue.create([]);

			Test.chk_strict(0,q.count());
			Test.chk_strict(0,q.pos());
			Test.chk_strict(true,q.isEnd());
			Test.chk_strict(undefined,q.peek());
			Test.chk_strict(undefined,q.next());
			Test.chk_strict(0,q.pos());
		},
	},
	{
		title:'Array Queue',
		proc:async (tool)=>{
			var q=QuickQueue.create([2,'ABC',-7]);

			Test.chk_strict(3,q.count());
			Test.chk_strict(0,q.pos());
			Test.chk_strict(false,q.isEnd());
			Test.chk_strict(2,q.peek());
			Test.chk_strict(2,q.next());
			Test.chk_strict(1,q.pos());
			Test.chk_strict('ABC',q.next());
			Test.chk_strict(2,q.pos());
			Test.chk_strict(false,q.isEnd());
			Test.chk_strict(-7,q.next());
			Test.chk_strict(3,q.pos());
			Test.chk_strict(true,q.isEnd());
		},
	},
	{
		title:'Argument Queue',
		proc:async (tool)=>{
			var q=create(5,'T',[false,true],null);
			Test.chk_strict(4,q.count());
			Test.chk_strict(0,q.pos());
			Test.chk_strict(5,q.next());
			Test.chk_strict('T',q.next());
			q.reset();
			Test.chk_strict(0,q.pos());
			Test.chk_strict(5,q.peek());
		},
	},
	{
		title:'After Push',
		proc:async (tool)=>{
			var a=[]
			var q=QuickQueue.create(a);
			Test.chk_strict(0,q.count());
			Test.chk_strict(0,q.pos());
			a.push(-12);
			Test.chk_strict(1,q.count());
			Test.chk_strict(-12,q.next());
		},
	},
]

Test.run(scenaria);
