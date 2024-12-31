// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import PropTree from '../../api/proptree.js';

// Prop Tree Test ----------------------- //

const scenaria=[
	{
		title:'Mono Mode',
		proc:async (tool)=>{
			var p=PropTree.create();
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.EMPTY);
			Test.chk_strict(p.get(),undefined);
			Test.chk_strict(p.export(),undefined);

			p.set('test');
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.MONO);
			Test.chk_strict(p.get(),'test');
			Test.chk_strict(p.export(),'test');

			Test.chk_strict(p.cut(),'test');
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.EMPTY);
			Test.chk_strict(p.get(),undefined);
			Test.chk_strict(p.export(),undefined);
		},
	},
	{
		title:'Array Mode',
		proc:async (tool)=>{
			var p=PropTree.create([],true);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			Test.chk_strict(p.count(),0);
			p.push(1);
			p.push('2');
			p.unshift(-3);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			Test.chk_strict(p.count(),3);
			Test.chk_strict(p.get(1),1);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			Test.chk_strict(p.pop(),'2');
			Test.chk_strict(p.shift(),-3);
			Test.chk_strict(p.count(),1);
		},
	},
	{
		title:'Prop Mode',
		proc:async (tool)=>{
			var p=PropTree.create({},true);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.PROP);

			p.set('a','b',-12);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.PROP);
			Test.chk_strict(p.get('a','b'),-12);
			Test.chk_strict(p.get(['a','b']),-12);
			Test.chk_strict(p.ref('a').get('b'),-12);
			Test.chk_strict(p.exists('a'),true);
			Test.chk_strict(p.exists('a','b'),true);
			Test.chk_strict(p.exists('a','b',-12),false);
			Test.chk_strict(p.exists('a','c'),false);
			Test.chk_strict(p.exists(['a','b']),true);

			p.dig('a','c','e');
			Test.chk_strict(p.exists('a','c','e'),true);
			Test.chk_strict(p.count('a','c'),1);
			Test.chk_strict(p.count('a','c','e'),0);
		},
	},
	{
		title:'Mono Import',
		proc:async (tool)=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=PropTree.create(a,false);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.MONO);
			Test.chk_strict(p.exists('c'),false);
			Test.chk_strict(p.get()['c'][0],3);
		},
	},
	{
		title:'Deep Import',
		proc:async (tool)=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=PropTree.create(a,true);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.PROP);
			Test.chk_strict(p.exists('c',1),true);
			Test.chk_strict(p.get('c',0),3);
		},
	},
	{
		title:'Shapeshifting',
		proc:async (tool)=>{
			var p=PropTree.create();
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.EMPTY);
			p.set(true);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.MONO);
			p.push(1);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			p.set('a','A');
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.PROP);
			Test.chk_strict(p.shift(),1);
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			p.toProp();
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.PROP);
			Test.chk_strict(p.get(0),'A');
			p.toArray();
			Test.chk_strict(p.getType(),PropTree.PROPTYPE.ARRAY);
			Test.chk_strict(p.get(0),'A');
		},
	},
	{
		title:'Exists',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:{c:2}},true);
			Test.chk_strict(p.exists(),true);
			Test.chk_strict(p.exists('a'),true);
			Test.chk_strict(p.exists('b'),true);
			Test.chk_strict(p.exists('c'),false);
			Test.chk_strict(p.exists('b','c'),true);
			Test.chk_strict(p.exists(['b','c']),true);
			Test.chk_strict(p.exists('b','d'),false);
			Test.chk_strict(p.exists(['b','d']),false);
		},
	},
	{
		title:'Ref',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:{c:2}},true);
			Test.chk_strict(p.ref().get('a'),1);
			Test.chk_strict(p.ref('b','c').get(),2);
			Test.chk_strict(p.ref(['b','c']).get(),2);
			Test.chk_strict(p.ref('b','d'),undefined);
		},
	},
	{
		title:'Dig',
		proc:async (tool)=>{
			var p=PropTree.create();
			p.dig('a').set('b',-1);
			Test.chk_strict(p.get('a','b'),-1);
			p.dig('a','c').set(3);
			Test.chk_strict(p.get('a','c'),3);
			p.dig('a').dig(['c','d']).set(2);
			Test.chk_strict(p.get('a','c','d'),2);
		},
	},
	{
		title:'Count',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:{c:[1,2,3,4,5],d:{}}},true);
			Test.chk_strict(p.count(),2);
			Test.chk_strict(p.count('a'),1);
			Test.chk_strict(p.count('b'),2);
			Test.chk_strict(p.count('b','c'),5);
			Test.chk_strict(p.count(['b','c']),5);
			Test.chk_strict(p.count('b','d'),0);
			Test.chk_strict(p.count('x','x'),0);
		},
	},
	{
		title:'Get',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:{c:2}},true);
			Test.chk_strict(p.get('a'),1);
			Test.chk_strict(p.get().b.c,2);
			Test.chk_strict(p.get('b','c'),2);
			Test.chk_strict(p.get(['b','c']),2);
			Test.chk_strict(p.get('x','x'),undefined);
		},
	},
	{
		title:'Set',
		proc:async (tool)=>{
			var p=PropTree.create();
			Test.chk_strict(p.set(12).get(),12);
			Test.chk_strict(p.set('a','b',-12).get(),-12);
			Test.chk_strict(p.set(['a','b'],123).get(),123);
			p.ref('a').set('b','c',3);
			Test.chk_strict(p.get('a','b','c'),3);
		},
	},
	{
		title:'Cut',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:[1,2,3,4,5]},true);
			Test.chk_strict(p.cut('b',2).get(),3);
			Test.chk_strict(p.ref('a').cut(),1);
			Test.chk_strict(p.ref('a').cut(),undefined);
		},
	},
	{
		title:'Merge',
		proc:async (tool)=>{
			var p=PropTree.create({a:1,b:[1,2,3,4,5],c:{d:10}},true);
			Test.chk_strict(p.merge('c',{e:[-1,-2,-3]}).get('d'),10);
			p.merge('b',5,false);
			p.merge(['c','e',5],true);
			Test.chk_strict(p.get('b',3),4);
			Test.chk_strict(p.get('b',5),false);
			Test.chk_strict(p.get('c','e',1),-2);
			Test.chk_strict(p.get('c','e',4),undefined);
			Test.chk_strict(p.get('c','e',5),true);
		},
	},
	{
		title:'Push',
		proc:async (tool)=>{
			var p=PropTree.create([1,2,3,4,5],true);
			Test.chk_strict(p.push(6,'a',-1).get(0),-1);
			Test.chk_strict(p.push([6,'a'],-2).get(1),-2);
		},
	},
	{
		title:'Unshift',
		proc:async (tool)=>{
			var p=PropTree.create([1,2,3,4,5],true);
			Test.chk_strict(p.unshift(6,'a',-1).get(0),-1);
			Test.chk_strict(p.unshift([6,'a'],-2).get(0),-2);
		},
	},
	{
		title:'Pop',
		proc:async (tool)=>{
			var p=PropTree.create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			Test.chk_strict(p.pop('a','b'),5);
			Test.chk_strict(p.pop(['a','b']),4);
			Test.chk_strict(p.pop('c'),'E');
			Test.chk_strict(p.pop('x','x'),undefined);
		},
	},
	{
		title:'Shift',
		proc:async (tool)=>{
			var p=PropTree.create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			Test.chk_strict(p.shift('a','b'),1);
			Test.chk_strict(p.shift(['a','b']),2);
			Test.chk_strict(p.shift('c'),'D');
			Test.chk_strict(p.shift('x','x'),undefined);
		},
	},
	{
		title:'Each',
		proc:async (tool)=>{
			var p=PropTree.create({a:{b:['0','1','2','3','4'],c:{d:'D',e:'E',X:'x'}}},true);
			p.set('a','b',6,'6');
			p.each('a','b',(k,t)=>{
				Test.chk_strict(''+k,t.export());
			});
			p.each(['a','c'],(k,t)=>{
				Test.chk_strict(k.toUpperCase(),t.export());
				return k!='e';
			});
		},
	},
]

Test.run(scenaria);
