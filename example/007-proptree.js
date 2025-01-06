// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Example: Property Tree --------------- //

import PropTree from '../api/proptree.js';
import Log from '../api/logger.js';

console.log('--- Mono Mode ---');
let t1=PropTree.create();
console.log(t1.getType());
console.log(t1.get());
t1.set('Test');
console.log(t1.getType());
console.log(t1.get());
t1.cut();
console.log(t1.getType());
console.log(t1.get());

console.log('--- Array Mode ---');
let t2=PropTree.create([],true);
t2.push(1);
t2.push('2');
t2.unshift(-3);
t2.push(4);
console.log(t2.count());
console.log(t2.get(1));
console.log(t2.set(1,-1).export());
console.log(t2.cut(1).export());
console.log(t2.count());
console.log(t2.pop());
console.log(t2.shift());
console.log(t2.export());

console.log('--- Prop Mode ---');
let t3=PropTree.create({},true);
t3.set('a',1);
t3.set('b','2');
t3.set('c',-3);
console.log(t3.count());
console.log(t3.get('b'));
console.log(t3.cut('b').export());
console.log(t3.count());
console.log(t3.export());

console.log('--- Deep Access ---');
t3.set('d','a',-1);
t3.set(['d','b'],-2);
console.log(t3.count('d'));
console.log(t3.get('d','b'));
console.log(t3.get(['d','a']));

console.log('--- Subinstance ---');
let t3e=t3.dig('d','e');
t3e.set('f','G');
console.log(t3.get('d','e','f'));

let t3d=t3.ref('d');
console.log(t3d.get('a'));

console.log('--- Merging ---');
t3.merge('d',{e:{g:'HIJ',m:3.33}});
console.log(t3.get('d','e','m'));
console.log(t3.get('d','e','f'));

console.log('--- Set Object in Mono Mode ---');
t3.set('d2',{e:{g:'HIJ',m:3.33}});
console.log(t3.get('d2','e','g')); // undefined 
console.log(t3.get('d2').e.g); // HIJ 

console.log('--- Conversion ---');
console.log(t2.export());
console.log(t2.getType());
t2.set(2,5);
console.log(t2.getType());
t2.set('x',true);
console.log(t2.getType());
console.log(t2.get('x'));
t2.push(0);
console.log(t2.getType());
console.log(t2.get('x'));
console.log(t2.get(2));

console.log('--- Importing ---');
let src={a:10,b:['11',-12]}
let t4=PropTree.create(src,false);
console.log(t4.get('a')); // undefined 
console.log(t4.get()); // can get all only
let t5=PropTree.create(src,true);
console.log(t5.get('a')); // 10

console.log('--- Exporting ---');
console.log(t3.export());

console.log('--- Iteration ---');
t3.each((k,t)=>{Log.info('['+k+']='+JSON.stringify(t.export()));});
t3.each('d',(k,t)=>{Log.info('['+k+']='+JSON.stringify(t.export()));});
