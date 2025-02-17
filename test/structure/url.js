// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import URLBuilder from '../../api/urlbuilder.js';

// URL Builder Test --------------------- //

const scenaria=[
	{
		Title:'Basic HTTP URL',
		Proc:async (tool)=>{
			var url='https://www.example.%63om/%7Ea/b%2Fc.html#xy%7A';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Scheme,'https');
			Test.ChkStrict(pu.Slashes,'//');
			Test.ChkStrict(pu.Host,'www.example.com');
			Test.ChkStrict(pu.Path,'/%7Ea/b%2Fc.html');
			Test.ChkStrict(pu.Fragment,'xy%7A');
			Test.ChkStrict(pu.Bake(),'https://www.example.com/%7Ea/b%2Fc.html#xy%7A');
		},
	},
	{
		Title:'FTP URL',
		Proc:async (tool)=>{
			var url='ftp://ftp%2Eexampl%65.com/a/b/%63.txt';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Scheme,'ftp');
			Test.ChkStrict(pu.Slashes,'//');
			Test.ChkStrict(pu.Host,'ftp.example.com');
			Test.ChkStrict(pu.Path,'/a/b/%63.txt');
			Test.ChkStrict(pu.Bake(),'ftp://ftp.example.com/a/b/%63.txt');
		},
	},
	{
		Title:'file URL',
		Proc:async (tool)=>{
			var url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Scheme,'file');
			Test.ChkStrict(pu.Slashes,'//');
			Test.ChkStrict(pu.Path,'/c:/Program%20Files/Internet%20Explorer/iexplore.exe');
			Test.ChkStrict(pu.Bake(),'file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe');
		},
	},
	{
		Title:'mailto URL',
		Proc:async (tool)=>{
			var url='mailto:us%65r@exampl%65.com';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Scheme,'mailto');
			Test.ChkStrict(pu.Slashes,'');
			Test.ChkStrict(pu.UID,'user');
			Test.ChkStrict(pu.Host,'example.com');
			Test.ChkStrict(pu.Bake(),'mailto:user@example.com');
		},
	},
	{
		Title:'nonorigin Path',
		Proc:async (tool)=>{
			var url='a/b%2Fc.php?a=1&b=2#ab%43#xyz';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Path,'a/b%2Fc.php');
			Test.ChkStrict(pu.Query,'a=1&b=2');
			Test.ChkStrict(pu.Fragment,'ab%43#xyz');
			Test.ChkStrict(pu.Bake(),'a/b%2Fc.php?a=1&b=2#ab%43#xyz');
		},
	},
	{
		Title:'Host Layering',
		Proc:async (tool)=>{
			var url='https://www.example.com';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Host,'www.example.com');
			var xt=pu.ExtractHost();
			Test.ChkStrict(xt.length,3);
			Test.ChkStrict(xt[0],'www');
			Test.ChkStrict(xt[1],'example');
			Test.ChkStrict(xt[2],'com');
			xt[0]+=2;
			xt.unshift('test');
			pu.BakeHost(xt);
			Test.ChkStrict(pu.Host,'test.www2.example.com');
		},
	},
	{
		Title:'Path Layering',
		Proc:async (tool)=>{
			var url='https://www.example.com/a/b/c.html';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Path,'/a/b/c.html');
			var xt=pu.ExtractPath();
			Test.ChkStrict(xt.length,4);
			Test.ChkStrict(xt[0],'');
			Test.ChkStrict(xt[1],'a');
			Test.ChkStrict(xt[2],'b');
			Test.ChkStrict(xt[3],'c.html');
			xt[3]='';
			pu.BakePath(xt);
			Test.ChkStrict(pu.Path,'/a/b/');
		},
	},
	{
		Title:'Query as Args',
		Proc:async (tool)=>{
			var url='https://www.example.com?abc+def+123';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Query,'abc+def+123');
			var xt=pu.ExtractArgs();
			Test.ChkStrict(xt.length,3);
			Test.ChkStrict(xt[0],'abc');
			Test.ChkStrict(xt[1],'def');
			Test.ChkStrict(xt[2],'123');
			xt.push('789');
			pu.BakeArgs(xt);
			Test.ChkStrict(pu.Query,'abc+def+123+789');
		},
	},
	{
		Title:'Query as Prop',
		Proc:async (tool)=>{
			var url='https://www.example.com?a=1&b=-2';
			var pu=URLBuilder.Parse(url);
			Test.ChkStrict(pu.Query,'a=1&b=-2');
			var xt=pu.ExtractProp();
			Test.ChkStrict(Object.keys(xt).length,2);
			Test.ChkStrict(xt.a,'1');
			Test.ChkStrict(xt.b,'-2');
			xt.c=['abc',-3.14,'xyz']
			pu.BakeProp(xt);
			Test.ChkStrict(pu.Query,'a=1&b=-2&c[]=abc&c[]=-3.14&c[]=xyz');
		},
	},
]

Test.Run(scenaria);
