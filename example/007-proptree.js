// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import PropTree from '../api/proptree.js';
import Log from '../api/logger.js';

// Example: Property Tree --------------- //

console.log('--- Mono Mode ---');
let t1=PropTree.Create();
console.log(t1.GetType());
console.log(t1.Get());
t1.Set('Test');
console.log(t1.GetType());
console.log(t1.Get());
t1.Cut();
console.log(t1.GetType());
console.log(t1.Get());

console.log('--- Array Mode ---');
let t2=PropTree.Create([],true);
t2.Push(1);
t2.Push('2');
t2.Unshift(-3);
t2.Push(4);
console.log(t2.Count());
console.log(t2.Get(1));
console.log(t2.Set(1,-1).Export());
console.log(t2.Cut(1).Export());
console.log(t2.Count());
console.log(t2.Pop());
console.log(t2.Shift());
console.log(t2.Export());

console.log('--- Prop Mode ---');
let t3=PropTree.Create({},true);
t3.Set('a',1);
t3.Set('b','2');
t3.Set('c',-3);
console.log(t3.Count());
console.log(t3.Get('b'));
console.log(t3.Cut('b').Export());
console.log(t3.Count());
console.log(t3.Export());

console.log('--- Deep Access ---');
t3.Set('d','a',-1);
t3.Set(['d','b'],-2);
console.log(t3.Count('d'));
console.log(t3.Get('d','b'));
console.log(t3.Get(['d','a']));

console.log('--- Subinstance ---');
let t3e=t3.Dig('d','e');
t3e.Set('f','G');
console.log(t3.Get('d','e','f'));

let t3d=t3.Ref('d');
console.log(t3d.Get('a'));

console.log('--- Merging ---');
t3.Merge('d',{e:{g:'HIJ',m:3.33}});
console.log(t3.Get('d','e','m'));
console.log(t3.Get('d','e','f'));

console.log('--- Set Object in Mono Mode ---');
t3.Set('d2',{e:{g:'HIJ',m:3.33}});
console.log(t3.Get('d2','e','g')); // undefined 
console.log(t3.Get('d2').e.g); // HIJ 

console.log('--- Conversion ---');
console.log(t2.Export());
console.log(t2.GetType());
t2.Set(2,5);
console.log(t2.GetType());
t2.Set('x',true);
console.log(t2.GetType());
console.log(t2.Get('x'));
t2.Push(0);
console.log(t2.GetType());
console.log(t2.Get('x'));
console.log(t2.Get(2));

console.log('--- Importing ---');
let src={a:10,b:['11',-12]}
let t4=PropTree.Create(src,false);
console.log(t4.Get('a')); // undefined 
console.log(t4.Get()); // can get all only
let t5=PropTree.Create(src,true);
console.log(t5.Get('a')); // 10

console.log('--- Exporting ---');
console.log(t3.Export());

console.log('--- Iteration ---');
t3.Each((k,t)=>{Log.Info('['+k+']='+JSON.stringify(t.Export()));});
t3.Each('d',(k,t)=>{Log.Info('['+k+']='+JSON.stringify(t.Export()));});
