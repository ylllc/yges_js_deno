// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// URL Builder Test //

import test from '../../api/unittest.js';
import urlb from '../../api/urlbuild.js';

var scenaria=[
	{
		title:'Basic HTTP URL',
		proc:async ()=>{
			var url='https://www.example.%63om/%7Ea/b%2Fc.html#xy%7A';
			var pu=urlb.parse(url);
			test.chk_strict(pu.scheme,'https');
			test.chk_strict(pu.slashes,'//');
			test.chk_strict(pu.host,'www.example.com');
			test.chk_strict(pu.path,'/%7Ea/b%2Fc.html');
			test.chk_strict(pu.fragment,'xy%7A');
			test.chk_strict(pu.bake(),'https://www.example.com/%7Ea/b%2Fc.html#xy%7A');
		},
	},
	{
		title:'FTP URL',
		proc:async ()=>{
			var url='ftp://ftp%2Eexampl%65.com/a/b/%63.txt';
			var pu=urlb.parse(url);
			test.chk_strict(pu.scheme,'ftp');
			test.chk_strict(pu.slashes,'//');
			test.chk_strict(pu.host,'ftp.example.com');
			test.chk_strict(pu.path,'/a/b/%63.txt');
			test.chk_strict(pu.bake(),'ftp://ftp.example.com/a/b/%63.txt');
		},
	},
	{
		title:'file URL',
		proc:async ()=>{
			var url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
			var pu=urlb.parse(url);
			test.chk_strict(pu.scheme,'file');
			test.chk_strict(pu.slashes,'//');
			test.chk_strict(pu.path,'/c:/Program%20Files/Internet%20Explorer/iexplore.exe');
			test.chk_strict(pu.bake(),'file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe');
		},
	},
	{
		title:'mailto URL',
		proc:async ()=>{
			var url='mailto:us%65r@exampl%65.com';
			var pu=urlb.parse(url);
			test.chk_strict(pu.scheme,'mailto');
			test.chk_strict(pu.slashes,'');
			test.chk_strict(pu.user,'user');
			test.chk_strict(pu.host,'example.com');
			test.chk_strict(pu.bake(),'mailto:user@example.com');
		},
	},
	{
		title:'nonorigin path',
		proc:async ()=>{
			var url='a/b%2Fc.php?a=1&b=2#ab%43#xyz';
			var pu=urlb.parse(url);
			test.chk_strict(pu.path,'a/b%2Fc.php');
			test.chk_strict(pu.query,'a=1&b=2');
			test.chk_strict(pu.fragment,'ab%43#xyz');
			test.chk_strict(pu.bake(),'a/b%2Fc.php?a=1&b=2#ab%43#xyz');
		},
	},
	{
		title:'Host Layering',
		proc:async ()=>{
			var url='https://www.example.com';
			var pu=urlb.parse(url);
			test.chk_strict(pu.host,'www.example.com');
			var xt=pu.extractHost();
			test.chk_strict(xt.length,3);
			test.chk_strict(xt[0],'www');
			test.chk_strict(xt[1],'example');
			test.chk_strict(xt[2],'com');
			xt[0]+=2;
			xt.unshift('test');
			pu.bakeHost(xt);
			test.chk_strict(pu.host,'test.www2.example.com');
		},
	},
	{
		title:'Path Layering',
		proc:async ()=>{
			var url='https://www.example.com/a/b/c.html';
			var pu=urlb.parse(url);
			test.chk_strict(pu.path,'/a/b/c.html');
			var xt=pu.extractPath();
			test.chk_strict(xt.length,4);
			test.chk_strict(xt[0],'');
			test.chk_strict(xt[1],'a');
			test.chk_strict(xt[2],'b');
			test.chk_strict(xt[3],'c.html');
			xt[3]='';
			pu.bakePath(xt);
			test.chk_strict(pu.path,'/a/b/');
		},
	},
	{
		title:'Query as Args',
		proc:async ()=>{
			var url='https://www.example.com?abc+def+123';
			var pu=urlb.parse(url);
			test.chk_strict(pu.query,'abc+def+123');
			var xt=pu.extractArgs();
			test.chk_strict(xt.length,3);
			test.chk_strict(xt[0],'abc');
			test.chk_strict(xt[1],'def');
			test.chk_strict(xt[2],'123');
			xt.push('789');
			pu.bakeArgs(xt);
			test.chk_strict(pu.query,'abc+def+123+789');
		},
	},
	{
		title:'Query as Prop',
		proc:async ()=>{
			var url='https://www.example.com?a=1&b=-2';
			var pu=urlb.parse(url);
			test.chk_strict(pu.query,'a=1&b=-2');
			var xt=pu.extractProp();
			test.chk_strict(Object.keys(xt).length,2);
			test.chk_strict(xt.a,'1');
			test.chk_strict(xt.b,'-2');
			xt.c=['abc',-3.14,'xyz']
			pu.bakeProp(xt);
			test.chk_strict(pu.query,'a=1&b=-2&c[]=abc&c[]=-3.14&c[]=xyz');
		},
	},
]

test.run(scenaria);
