// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import QuickQueue from '../../api/quickqueue.js';

// Quick Queue Test --------------------- //

function create(/*...*/){
	var a=arguments;
	return QuickQueue.Create(arguments);
}

const scenaria=[
	{
		Title:'Empty Queue',
		Proc:async (tool)=>{
			var q=QuickQueue.Create([]);

			Test.ChkStrict(0,q.Count());
			Test.ChkStrict(0,q.Pos());
			Test.ChkStrict(true,q.IsEnd());
			Test.ChkStrict(undefined,q.Peek());
			Test.ChkStrict(undefined,q.Next());
			Test.ChkStrict(0,q.Pos());
		},
	},
	{
		Title:'Array Queue',
		Proc:async (tool)=>{
			var q=QuickQueue.Create([2,'ABC',-7]);

			Test.ChkStrict(3,q.Count());
			Test.ChkStrict(0,q.Pos());
			Test.ChkStrict(false,q.IsEnd());
			Test.ChkStrict(2,q.Peek());
			Test.ChkStrict(2,q.Next());
			Test.ChkStrict(1,q.Pos());
			Test.ChkStrict('ABC',q.Next());
			Test.ChkStrict(2,q.Pos());
			Test.ChkStrict(false,q.IsEnd());
			Test.ChkStrict(-7,q.Next());
			Test.ChkStrict(3,q.Pos());
			Test.ChkStrict(true,q.IsEnd());
		},
	},
	{
		Title:'Argument Queue',
		Proc:async (tool)=>{
			var q=create(5,'T',[false,true],null);
			Test.ChkStrict(4,q.Count());
			Test.ChkStrict(0,q.Pos());
			Test.ChkStrict(5,q.Next());
			Test.ChkStrict('T',q.Next());
			q.Reset();
			Test.ChkStrict(0,q.Pos());
			Test.ChkStrict(5,q.Peek());
		},
	},
	{
		Title:'After Push',
		Proc:async (tool)=>{
			var a=[]
			var q=QuickQueue.Create(a);
			Test.ChkStrict(0,q.Count());
			Test.ChkStrict(0,q.Pos());
			a.push(-12);
			Test.ChkStrict(1,q.Count());
			Test.ChkStrict(-12,q.Next());
		},
	},
]

Test.Run(scenaria);
