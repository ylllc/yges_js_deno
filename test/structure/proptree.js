// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Prop Tree Test //

import test from '../../api/unittest.js';
import proptree from '../../api/proptree.js';
import util from '../../api/util.js';

var scenaria=[
	{
		title:'Mono Mode',
		proc:async ()=>{
			var p=proptree.create();
			test.chk_strict(p.getType(),proptree.PROPTYPE.EMPTY);
			test.chk_strict(p.get(),undefined);
			test.chk_strict(p.export(),undefined);

			p.set('test');
			test.chk_strict(p.getType(),proptree.PROPTYPE.MONO);
			test.chk_strict(p.get(),'test');
			test.chk_strict(p.export(),'test');

			test.chk_strict(p.cut(),'test');
			test.chk_strict(p.getType(),proptree.PROPTYPE.EMPTY);
			test.chk_strict(p.get(),undefined);
			test.chk_strict(p.export(),undefined);
		},
	},
	{
		title:'Array Mode',
		proc:async ()=>{
			var p=proptree.create([],true);
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			test.chk_strict(p.count(),0);
			p.push(1);
			p.push('2');
			p.unshift(-3);
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			test.chk_strict(p.count(),3);
			test.chk_strict(p.get(1),1);
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			test.chk_strict(p.pop(),'2');
			test.chk_strict(p.shift(),-3);
			test.chk_strict(p.count(),1);
		},
	},
	{
		title:'Prop Mode',
		proc:async ()=>{
			var p=proptree.create({},true);
			test.chk_strict(p.getType(),proptree.PROPTYPE.PROP);

			p.set('a','b',-12);
			test.chk_strict(p.getType(),proptree.PROPTYPE.PROP);
			test.chk_strict(p.get('a','b'),-12);
			test.chk_strict(p.get(['a','b']),-12);
			test.chk_strict(p.ref('a').get('b'),-12);
			test.chk_strict(p.exists('a'),true);
			test.chk_strict(p.exists('a','b'),true);
			test.chk_strict(p.exists('a','b',-12),false);
			test.chk_strict(p.exists('a','c'),false);
			test.chk_strict(p.exists(['a','b']),true);

			p.dig('a','c','e');
			test.chk_strict(p.exists('a','c','e'),true);
			test.chk_strict(p.count('a','c'),1);
			test.chk_strict(p.count('a','c','e'),0);
		},
	},
	{
		title:'Mono Import',
		proc:async ()=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=proptree.create(a,false);
			test.chk_strict(p.getType(),proptree.PROPTYPE.MONO);
			test.chk_strict(p.exists('c'),false);
			test.chk_strict(p.get()['c'][0],3);
		},
	},
	{
		title:'Deep Import',
		proc:async ()=>{
			var a={a:1,b:-2,c:[3,'4',false]}
			var p=proptree.create(a,true);
			test.chk_strict(p.getType(),proptree.PROPTYPE.PROP);
			test.chk_strict(p.exists('c',1),true);
			test.chk_strict(p.get('c',0),3);
		},
	},
	{
		title:'Shapeshifting',
		proc:async ()=>{
			var p=proptree.create();
			test.chk_strict(p.getType(),proptree.PROPTYPE.EMPTY);
			p.set(true);
			test.chk_strict(p.getType(),proptree.PROPTYPE.MONO);
			p.push(1);
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			p.set('a','A');
			test.chk_strict(p.getType(),proptree.PROPTYPE.PROP);
			test.chk_strict(p.shift(),1);
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			p.toProp();
			test.chk_strict(p.getType(),proptree.PROPTYPE.PROP);
			test.chk_strict(p.get(0),'A');
			p.toArray();
			test.chk_strict(p.getType(),proptree.PROPTYPE.ARRAY);
			test.chk_strict(p.get(0),'A');
		},
	},
	{
		title:'Exists',
		proc:async ()=>{
			var p=proptree.create({a:1,b:{c:2}},true);
			test.chk_strict(p.exists(),true);
			test.chk_strict(p.exists('a'),true);
			test.chk_strict(p.exists('b'),true);
			test.chk_strict(p.exists('c'),false);
			test.chk_strict(p.exists('b','c'),true);
			test.chk_strict(p.exists(['b','c']),true);
			test.chk_strict(p.exists('b','d'),false);
			test.chk_strict(p.exists(['b','d']),false);
		},
	},
	{
		title:'Ref',
		proc:async ()=>{
			var p=proptree.create({a:1,b:{c:2}},true);
			test.chk_strict(p.ref().get('a'),1);
			test.chk_strict(p.ref('b','c').get(),2);
			test.chk_strict(p.ref(['b','c']).get(),2);
			test.chk_strict(p.ref('b','d'),undefined);
		},
	},
	{
		title:'Dig',
		proc:async ()=>{
			var p=proptree.create();
			p.dig('a').set('b',-1);
			test.chk_strict(p.get('a','b'),-1);
			p.dig('a','c').set(3);
			test.chk_strict(p.get('a','c'),3);
			p.dig('a').dig(['c','d']).set(2);
			test.chk_strict(p.get('a','c','d'),2);
		},
	},
	{
		title:'Count',
		proc:async ()=>{
			var p=proptree.create({a:1,b:{c:[1,2,3,4,5],d:{}}},true);
			test.chk_strict(p.count(),2);
			test.chk_strict(p.count('a'),1);
			test.chk_strict(p.count('b'),2);
			test.chk_strict(p.count('b','c'),5);
			test.chk_strict(p.count(['b','c']),5);
			test.chk_strict(p.count('b','d'),0);
			test.chk_strict(p.count('x','x'),0);
		},
	},
	{
		title:'Get',
		proc:async ()=>{
			var p=proptree.create({a:1,b:{c:2}},true);
			test.chk_strict(p.get('a'),1);
			test.chk_strict(p.get().b.c,2);
			test.chk_strict(p.get('b','c'),2);
			test.chk_strict(p.get(['b','c']),2);
			test.chk_strict(p.get('x','x'),undefined);
		},
	},
	{
		title:'Set',
		proc:async ()=>{
			var p=proptree.create();
			test.chk_strict(p.set(12).get(),12);
			test.chk_strict(p.set('a','b',-12).get(),-12);
			test.chk_strict(p.set(['a','b'],123).get(),123);
			p.ref('a').set('b','c',3);
			test.chk_strict(p.get('a','b','c'),3);
		},
	},
	{
		title:'Cut',
		proc:async ()=>{
			var p=proptree.create({a:1,b:[1,2,3,4,5]},true);
			test.chk_strict(p.cut('b',2).get(),3);
			test.chk_strict(p.ref('a').cut(),1);
			test.chk_strict(p.ref('a').cut(),undefined);
		},
	},
	{
		title:'Merge',
		proc:async ()=>{
			var p=proptree.create({a:1,b:[1,2,3,4,5],c:{d:10}},true);
			test.chk_strict(p.merge('c',{e:[-1,-2,-3]}).get('d'),10);
			p.merge('b',5,false);
			p.merge(['c','e',5],true);
			test.chk_strict(p.get('b',3),4);
			test.chk_strict(p.get('b',5),false);
			test.chk_strict(p.get('c','e',1),-2);
			test.chk_strict(p.get('c','e',4),undefined);
			test.chk_strict(p.get('c','e',5),true);
		},
	},
	{
		title:'Push',
		proc:async ()=>{
			var p=proptree.create([1,2,3,4,5],true);
			test.chk_strict(p.push(6,'a',-1).get(0),-1);
			test.chk_strict(p.push([6,'a'],-2).get(1),-2);
		},
	},
	{
		title:'Unshift',
		proc:async ()=>{
			var p=proptree.create([1,2,3,4,5],true);
			test.chk_strict(p.unshift(6,'a',-1).get(0),-1);
			test.chk_strict(p.unshift([6,'a'],-2).get(0),-2);
		},
	},
	{
		title:'Pop',
		proc:async ()=>{
			var p=proptree.create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			test.chk_strict(p.pop('a','b'),5);
			test.chk_strict(p.pop(['a','b']),4);
			test.chk_strict(p.pop('c'),'E');
			test.chk_strict(p.pop('x','x'),undefined);
		},
	},
	{
		title:'Shift',
		proc:async ()=>{
			var p=proptree.create({a:{b:[1,2,3,4,5]},c:{d:'D',e:'E'}},true);
			test.chk_strict(p.shift('a','b'),1);
			test.chk_strict(p.shift(['a','b']),2);
			test.chk_strict(p.shift('c'),'D');
			test.chk_strict(p.shift('x','x'),undefined);
		},
	},
	{
		title:'Each',
		proc:async ()=>{
			var p=proptree.create({a:{b:['0','1','2','3','4'],c:{d:'D',e:'E',X:'x'}}},true);
			p.set('a','b',6,'6');
			p.each('a','b',(k,t)=>{
				test.chk_strict(''+k,t.export());
			});
			p.each(['a','c'],(k,t)=>{
				test.chk_strict(k.toUpperCase(),t.export());
				return k!='e';
			});
		},
	},
]

test.run(scenaria);
