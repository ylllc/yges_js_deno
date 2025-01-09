// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import PropTree from '../../api/proptree.js';

// Prop Tree Test ----------------------- //

const scenaria=[
	{
		Title:'Mono Mode',
		Proc:async (tool)=>{
			var p=PropTree.Create();
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.EMPTY);
			Test.ChkStrict(p.Get(),undefined);
			Test.ChkStrict(p.Export(),undefined);

			p.Set('test');
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.MONO);
			Test.ChkStrict(p.Get(),'test');
			Test.ChkStrict(p.Export(),'test');

			Test.ChkStrict(p.Cut(),'test');
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.EMPTY);
			Test.ChkStrict(p.Get(),undefined);
			Test.ChkStrict(p.Export(),undefined);
		},
	},
	{
		Title:'Array Mode',
		Proc:async (tool)=>{
			var p=PropTree.Create([],true);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			Test.ChkStrict(p.Count(),0);
			p.Push(1);
			p.Push('2');
			p.Unshift(-3);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			Test.ChkStrict(p.Count(),3);
			Test.ChkStrict(p.Get(1),1);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			Test.ChkStrict(p.Pop(),'2');
			Test.ChkStrict(p.Shift(),-3);
			Test.ChkStrict(p.Count(),1);
		},
	},
	{
		Title:'Prop Mode',
		Proc:async (tool)=>{
			var p=PropTree.Create({},true);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.DICT);

			p.Set('a','b',-12);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.DICT);
			Test.ChkStrict(p.Get('a','b'),-12);
			Test.ChkStrict(p.Get(['a','b']),-12);
			Test.ChkStrict(p.Ref('a').Get('b'),-12);
			Test.ChkStrict(p.Exists('a'),true);
			Test.ChkStrict(p.Exists('a','b'),true);
			Test.ChkStrict(p.Exists('a','b',-12),false);
			Test.ChkStrict(p.Exists('a','c'),false);
			Test.ChkStrict(p.Exists(['a','b']),true);

			p.Dig('a','c','e');
			Test.ChkStrict(p.Exists('a','c','e'),true);
			Test.ChkStrict(p.Count('a','c'),1);
			Test.ChkStrict(p.Count('a','c','e'),0);
		},
	},
	{
		Title:'Mono Import',
		Proc:async (tool)=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=PropTree.Create(a,false);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.MONO);
			Test.ChkStrict(p.Exists('c'),false);
			Test.ChkStrict(p.Get()['c'][0],3);
		},
	},
	{
		Title:'Deep Import',
		Proc:async (tool)=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=PropTree.Create(a,true);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.DICT);
			Test.ChkStrict(p.Exists('c',1),true);
			Test.ChkStrict(p.Get('c',0),3);
		},
	},
	{
		Title:'Shapeshifting',
		Proc:async (tool)=>{
			var p=PropTree.Create();
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.EMPTY);
			p.Set(true);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.MONO);
			p.Push(1);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			p.Set('a','A');
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.DICT);
			Test.ChkStrict(p.Shift(),1);
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			p.ToDict();
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.DICT);
			Test.ChkStrict(p.Get(0),'A');
			p.ToArray();
			Test.ChkStrict(p.GetType(),PropTree.PROPTYPE.ARRAY);
			Test.ChkStrict(p.Get(0),'A');
		},
	},
	{
		Title:'Exists',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:{c:2}},true);
			Test.ChkStrict(p.Exists(),true);
			Test.ChkStrict(p.Exists('a'),true);
			Test.ChkStrict(p.Exists('b'),true);
			Test.ChkStrict(p.Exists('c'),false);
			Test.ChkStrict(p.Exists('b','c'),true);
			Test.ChkStrict(p.Exists(['b','c']),true);
			Test.ChkStrict(p.Exists('b','d'),false);
			Test.ChkStrict(p.Exists(['b','d']),false);
		},
	},
	{
		Title:'Ref',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:{c:2}},true);
			Test.ChkStrict(p.Ref().Get('a'),1);
			Test.ChkStrict(p.Ref('b','c').Get(),2);
			Test.ChkStrict(p.Ref(['b','c']).Get(),2);
			Test.ChkStrict(p.Ref('b','d'),undefined);
		},
	},
	{
		Title:'Dig',
		Proc:async (tool)=>{
			var p=PropTree.Create();
			p.Dig('a').Set('b',-1);
			Test.ChkStrict(p.Get('a','b'),-1);
			p.Dig('a','c').Set(3);
			Test.ChkStrict(p.Get('a','c'),3);
			p.Dig('a').Dig(['c','d']).Set(2);
			Test.ChkStrict(p.Get('a','c','d'),2);
		},
	},
	{
		Title:'Count',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:{c:[1,2,3,4,5],d:{}}},true);
			Test.ChkStrict(p.Count(),2);
			Test.ChkStrict(p.Count('a'),1);
			Test.ChkStrict(p.Count('b'),2);
			Test.ChkStrict(p.Count('b','c'),5);
			Test.ChkStrict(p.Count(['b','c']),5);
			Test.ChkStrict(p.Count('b','d'),0);
			Test.ChkStrict(p.Count('x','x'),0);
		},
	},
	{
		Title:'Get',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:{c:2}},true);
			Test.ChkStrict(p.Get('a'),1);
			Test.ChkStrict(p.Get().b.c,2);
			Test.ChkStrict(p.Get('b','c'),2);
			Test.ChkStrict(p.Get(['b','c']),2);
			Test.ChkStrict(p.Get('x','x'),undefined);
		},
	},
	{
		Title:'Set',
		Proc:async (tool)=>{
			var p=PropTree.Create();
			Test.ChkStrict(p.Set(12).Get(),12);
			Test.ChkStrict(p.Set('a','b',-12).Get(),-12);
			Test.ChkStrict(p.Set(['a','b'],123).Get(),123);
			p.Ref('a').Set('b','c',3);
			Test.ChkStrict(p.Get('a','b','c'),3);
		},
	},
	{
		Title:'Cut',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:[1,2,3,4,5]},true);
			Test.ChkStrict(p.Cut('b',2).Get(),3);
			Test.ChkStrict(p.Ref('a').Cut(),1);
			Test.ChkStrict(p.Ref('a').Cut(),undefined);
		},
	},
	{
		Title:'Merge',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:1,b:[1,2,3,4,5],c:{d:10}},true);
			Test.ChkStrict(p.Merge('c',{e:[-1,-2,-3]}).Get('d'),10);
			p.Merge('b',5,false);
			p.Merge(['c','e',5],true);
			Test.ChkStrict(p.Get('b',3),4);
			Test.ChkStrict(p.Get('b',5),false);
			Test.ChkStrict(p.Get('c','e',1),-2);
			Test.ChkStrict(p.Get('c','e',4),undefined);
			Test.ChkStrict(p.Get('c','e',5),true);
		},
	},
	{
		Title:'Push',
		Proc:async (tool)=>{
			var p=PropTree.Create([1,2,3,4,5],true);
			Test.ChkStrict(p.Push(6,'a',-1).Get(0),-1);
			Test.ChkStrict(p.Push([6,'a'],-2).Get(1),-2);
		},
	},
	{
		Title:'Unshift',
		Proc:async (tool)=>{
			var p=PropTree.Create([1,2,3,4,5],true);
			Test.ChkStrict(p.Unshift(6,'a',-1).Get(0),-1);
			Test.ChkStrict(p.Unshift([6,'a'],-2).Get(0),-2);
		},
	},
	{
		Title:'Pop',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			Test.ChkStrict(p.Pop('a','b'),5);
			Test.ChkStrict(p.Pop(['a','b']),4);
			Test.ChkStrict(p.Pop('c'),'E');
			Test.ChkStrict(p.Pop('x','x'),undefined);
		},
	},
	{
		Title:'Shift',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			Test.ChkStrict(p.Shift('a','b'),1);
			Test.ChkStrict(p.Shift(['a','b']),2);
			Test.ChkStrict(p.Shift('c'),'D');
			Test.ChkStrict(p.Shift('x','x'),undefined);
		},
	},
	{
		Title:'Each',
		Proc:async (tool)=>{
			var p=PropTree.Create({a:{b:['0','1','2','3','4'],c:{d:'D',e:'E',X:'x'}}},true);
			p.Set('a','b',6,'6');
			p.Each('a','b',(k,t)=>{
				Test.ChkStrict(''+k,t.Export());
			});
			p.Each(['a','c'],(k,t)=>{
				Test.ChkStrict(k.toUpperCase(),t.Export());
				return k!='e';
			});
		},
	},
]

Test.Run(scenaria);
