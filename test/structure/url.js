// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import URLBuilder from '../../api/urlbuild.js';

// URL Builder Test --------------------- //

const scenaria=[
	{
		title:'Basic HTTP URL',
		proc:async (tool)=>{
			var url='https://www.example.%63om/%7Ea/b%2Fc.html#xy%7A';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.scheme,'https');
			Test.chk_strict(pu.slashes,'//');
			Test.chk_strict(pu.host,'www.example.com');
			Test.chk_strict(pu.path,'/%7Ea/b%2Fc.html');
			Test.chk_strict(pu.fragment,'xy%7A');
			Test.chk_strict(pu.bake(),'https://www.example.com/%7Ea/b%2Fc.html#xy%7A');
		},
	},
	{
		title:'FTP URL',
		proc:async (tool)=>{
			var url='ftp://ftp%2Eexampl%65.com/a/b/%63.txt';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.scheme,'ftp');
			Test.chk_strict(pu.slashes,'//');
			Test.chk_strict(pu.host,'ftp.example.com');
			Test.chk_strict(pu.path,'/a/b/%63.txt');
			Test.chk_strict(pu.bake(),'ftp://ftp.example.com/a/b/%63.txt');
		},
	},
	{
		title:'file URL',
		proc:async (tool)=>{
			var url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.scheme,'file');
			Test.chk_strict(pu.slashes,'//');
			Test.chk_strict(pu.path,'/c:/Program%20Files/Internet%20Explorer/iexplore.exe');
			Test.chk_strict(pu.bake(),'file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe');
		},
	},
	{
		title:'mailto URL',
		proc:async (tool)=>{
			var url='mailto:us%65r@exampl%65.com';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.scheme,'mailto');
			Test.chk_strict(pu.slashes,'');
			Test.chk_strict(pu.user,'user');
			Test.chk_strict(pu.host,'example.com');
			Test.chk_strict(pu.bake(),'mailto:user@example.com');
		},
	},
	{
		title:'nonorigin path',
		proc:async (tool)=>{
			var url='a/b%2Fc.php?a=1&b=2#ab%43#xyz';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.path,'a/b%2Fc.php');
			Test.chk_strict(pu.query,'a=1&b=2');
			Test.chk_strict(pu.fragment,'ab%43#xyz');
			Test.chk_strict(pu.bake(),'a/b%2Fc.php?a=1&b=2#ab%43#xyz');
		},
	},
	{
		title:'Host Layering',
		proc:async (tool)=>{
			var url='https://www.example.com';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.host,'www.example.com');
			var xt=pu.extractHost();
			Test.chk_strict(xt.length,3);
			Test.chk_strict(xt[0],'www');
			Test.chk_strict(xt[1],'example');
			Test.chk_strict(xt[2],'com');
			xt[0]+=2;
			xt.unshift('test');
			pu.bakeHost(xt);
			Test.chk_strict(pu.host,'test.www2.example.com');
		},
	},
	{
		title:'Path Layering',
		proc:async (tool)=>{
			var url='https://www.example.com/a/b/c.html';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.path,'/a/b/c.html');
			var xt=pu.extractPath();
			Test.chk_strict(xt.length,4);
			Test.chk_strict(xt[0],'');
			Test.chk_strict(xt[1],'a');
			Test.chk_strict(xt[2],'b');
			Test.chk_strict(xt[3],'c.html');
			xt[3]='';
			pu.bakePath(xt);
			Test.chk_strict(pu.path,'/a/b/');
		},
	},
	{
		title:'Query as Args',
		proc:async (tool)=>{
			var url='https://www.example.com?abc+def+123';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.query,'abc+def+123');
			var xt=pu.extractArgs();
			Test.chk_strict(xt.length,3);
			Test.chk_strict(xt[0],'abc');
			Test.chk_strict(xt[1],'def');
			Test.chk_strict(xt[2],'123');
			xt.push('789');
			pu.bakeArgs(xt);
			Test.chk_strict(pu.query,'abc+def+123+789');
		},
	},
	{
		title:'Query as Prop',
		proc:async (tool)=>{
			var url='https://www.example.com?a=1&b=-2';
			var pu=URLBuilder.parse(url);
			Test.chk_strict(pu.query,'a=1&b=-2');
			var xt=pu.extractProp();
			Test.chk_strict(Object.keys(xt).length,2);
			Test.chk_strict(xt.a,'1');
			Test.chk_strict(xt.b,'-2');
			xt.c=['abc',-3.14,'xyz']
			pu.bakeProp(xt);
			Test.chk_strict(pu.query,'a=1&b=-2&c[]=abc&c[]=-3.14&c[]=xyz');
		},
	},
]

Test.run(scenaria);
