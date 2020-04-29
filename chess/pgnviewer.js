/* Copyright 2007-2009 Richard Jones
This work is licensed under the Creative Commons Attribution-Noncommercial-No Derivative Works License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/2.5/au/
*/
Gettext=function(_1){
this.domain="messages";
this.locale_data=undefined;
var _2=["domain","locale_data"];
if(this.isValidObject(_1)){
for(var i in _1){
for(var j=0;j<_2.length;j++){
if(i==_2[j]){
if(this.isValidObject(_1[i])){
this[i]=_1[i];
}
}
}
}
}
this.try_load_lang();
return this;
};
Gettext.context_glue="\x04";
Gettext._locale_data={};
Gettext.prototype.try_load_lang=function(){
if(typeof (this.locale_data)!="undefined"){
var _5=this.locale_data;
this.locale_data=undefined;
this.parse_locale_data(_5);
if(typeof (Gettext._locale_data[this.domain])=="undefined"){
throw new Error("Error: Gettext 'locale_data' does not contain the domain '"+this.domain+"'");
}
}
var _6=this.get_lang_refs();
if(typeof (_6)=="object"&&_6.length>0){
for(var i=0;i<_6.length;i++){
var _8=_6[i];
if(_8.type=="application/json"){
if(!this.try_load_lang_json(_8.href)){
throw new Error("Error: Gettext 'try_load_lang_json' failed. Unable to exec xmlhttprequest for link ["+_8.href+"]");
}
}else{
if(_8.type=="application/x-po"){
if(!this.try_load_lang_po(_8.href)){
throw new Error("Error: Gettext 'try_load_lang_po' failed. Unable to exec xmlhttprequest for link ["+_8.href+"]");
}
}else{
throw new Error("TODO: link type ["+_8.type+"] found, and support is planned, but not implemented at this time.");
}
}
}
}
};
Gettext.prototype.parse_locale_data=function(_9){
if(typeof (Gettext._locale_data)=="undefined"){
Gettext._locale_data={};
}
for(var _a in _9){
if((!_9.hasOwnProperty(_a))||(!this.isValidObject(_9[_a]))){
continue;
}
var _b=false;
for(var _c in _9[_a]){
_b=true;
break;
}
if(!_b){
continue;
}
var _d=_9[_a];
if(_a==""){
_a="messages";
}
if(!this.isValidObject(Gettext._locale_data[_a])){
Gettext._locale_data[_a]={};
}
if(!this.isValidObject(Gettext._locale_data[_a].head)){
Gettext._locale_data[_a].head={};
}
if(!this.isValidObject(Gettext._locale_data[_a].msgs)){
Gettext._locale_data[_a].msgs={};
}
for(var _e in _d){
if(_e==""){
var _f=_d[_e];
for(var _10 in _f){
var h=_10.toLowerCase();
Gettext._locale_data[_a].head[h]=_f[_10];
}
}else{
Gettext._locale_data[_a].msgs[_e]=_d[_e];
}
}
}
for(var _a in Gettext._locale_data){
if(this.isValidObject(Gettext._locale_data[_a].head["plural-forms"])&&typeof (Gettext._locale_data[_a].head.plural_func)=="undefined"){
var _12=Gettext._locale_data[_a].head["plural-forms"];
var _13=new RegExp("^(\\s*nplurals\\s*=\\s*[0-9]+\\s*;\\s*plural\\s*=\\s*(?:\\s|[-\\?\\|&=!<>+*/%:;a-zA-Z0-9_()])+)","m");
if(_13.test(_12)){
var pf=Gettext._locale_data[_a].head["plural-forms"];
if(!/;\s*$/.test(pf)){
pf=pf.concat(";");
}
var _15="var plural; var nplurals; "+pf+" return { \"nplural\" : nplurals, \"plural\" : (plural === true ? 1 : plural ? plural : 0) };";
Gettext._locale_data[_a].head.plural_func=new Function("n",_15);
}else{
throw new Error("Syntax error in language file. Plural-Forms header is invalid ["+_12+"]");
}
}else{
if(typeof (Gettext._locale_data[_a].head.plural_func)=="undefined"){
Gettext._locale_data[_a].head.plural_func=function(n){
var p=(n!=1)?1:0;
return {"nplural":2,"plural":p};
};
}
}
}
return;
};
Gettext.prototype.try_load_lang_po=function(uri){
var _19=this.sjax(uri);
if(!_19){
return;
}
var _1a=this.uri_basename(uri);
var _1b=this.parse_po(_19);
var rv={};
if(_1b){
if(!_1b[""]){
_1b[""]={};
}
if(!_1b[""]["domain"]){
_1b[""]["domain"]=_1a;
}
_1a=_1b[""]["domain"];
rv[_1a]=_1b;
this.parse_locale_data(rv);
}
return 1;
};
Gettext.prototype.uri_basename=function(uri){
var rv;
if(rv=uri.match(/^(.*\/)?(.*)/)){
var _1f;
if(_1f=rv[2].match(/^(.*)\..+$/)){
return _1f[1];
}else{
return rv[2];
}
}else{
return "";
}
};
Gettext.prototype.parse_po=function(_20){
var rv={};
var _22={};
var _23="";
var _24=[];
var _25=_20.split("\n");
for(var i=0;i<_25.length;i++){
_25[i]=_25[i].replace(/(\n|\r)+$/,"");
var _27;
if(/^$/.test(_25[i])){
if(typeof (_22["msgid"])!="undefined"){
var _28=(typeof (_22["msgctxt"])!="undefined"&&_22["msgctxt"].length)?_22["msgctxt"]+Gettext.context_glue+_22["msgid"]:_22["msgid"];
var _29=(typeof (_22["msgid_plural"])!="undefined"&&_22["msgid_plural"].length)?_22["msgid_plural"]:null;
var _2a=[];
for(var str in _22){
var _27;
if(_27=str.match(/^msgstr_(\d+)/)){
_2a[parseInt(_27[1])]=_22[str];
}
}
_2a.unshift(_29);
if(_2a.length>1){
rv[_28]=_2a;
}
_22={};
_23="";
}
}else{
if(/^#/.test(_25[i])){
continue;
}else{
if(_27=_25[i].match(/^msgctxt\s+(.*)/)){
_23="msgctxt";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgid\s+(.*)/)){
_23="msgid";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgid_plural\s+(.*)/)){
_23="msgid_plural";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\s+(.*)/)){
_23="msgstr_0";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\[0\]\s+(.*)/)){
_23="msgstr_0";
_22[_23]=this.parse_po_dequote(_27[1]);
}else{
if(_27=_25[i].match(/^msgstr\[(\d+)\]\s+(.*)/)){
_23="msgstr_"+_27[1];
_22[_23]=this.parse_po_dequote(_27[2]);
}else{
if(/^"/.test(_25[i])){
_22[_23]+=this.parse_po_dequote(_25[i]);
}else{
_24.push("Strange line ["+i+"] : "+_25[i]);
}
}
}
}
}
}
}
}
}
}
if(typeof (_22["msgid"])!="undefined"){
var _28=(typeof (_22["msgctxt"])!="undefined"&&_22["msgctxt"].length)?_22["msgctxt"]+Gettext.context_glue+_22["msgid"]:_22["msgid"];
var _29=(typeof (_22["msgid_plural"])!="undefined"&&_22["msgid_plural"].length)?_22["msgid_plural"]:null;
var _2a=[];
for(var str in _22){
var _27;
if(_27=str.match(/^msgstr_(\d+)/)){
_2a[parseInt(_27[1])]=_22[str];
}
}
_2a.unshift(_29);
if(_2a.length>1){
rv[_28]=_2a;
}
_22={};
_23="";
}
if(rv[""]&&rv[""][1]){
var cur={};
var _2d=rv[""][1].split(/\\n/);
for(var i=0;i<_2d.length;i++){
if(!_2d.length){
continue;
}
var pos=_2d[i].indexOf(":",0);
if(pos!=-1){
var key=_2d[i].substring(0,pos);
var val=_2d[i].substring(pos+1);
var _31=key.toLowerCase();
if(cur[_31]&&cur[_31].length){
_24.push("SKIPPING DUPLICATE HEADER LINE: "+_2d[i]);
}else{
if(/#-#-#-#-#/.test(_31)){
_24.push("SKIPPING ERROR MARKER IN HEADER: "+_2d[i]);
}else{
val=val.replace(/^\s+/,"");
cur[_31]=val;
}
}
}else{
_24.push("PROBLEM LINE IN HEADER: "+_2d[i]);
cur[_2d[i]]="";
}
}
rv[""]=cur;
}else{
rv[""]={};
}
return rv;
};
Gettext.prototype.parse_po_dequote=function(str){
var _33;
if(_33=str.match(/^"(.*)"/)){
str=_33[1];
}
str=str.replace(/\\"/,"");
return str;
};
Gettext.prototype.try_load_lang_json=function(uri){
var _35=this.sjax(uri);
if(!_35){
return;
}
var rv=this.JSON(_35);
this.parse_locale_data(rv);
return 1;
};
Gettext.prototype.get_lang_refs=function(){
var _37=new Array();
var _38=document.getElementsByTagName("link");
for(var i=0;i<_38.length;i++){
if(_38[i].rel=="gettext"&&_38[i].href){
if(typeof (_38[i].type)=="undefined"||_38[i].type==""){
if(/\.json$/i.test(_38[i].href)){
_38[i].type="application/json";
}else{
if(/\.js$/i.test(_38[i].href)){
_38[i].type="application/json";
}else{
if(/\.po$/i.test(_38[i].href)){
_38[i].type="application/x-po";
}else{
if(/\.mo$/i.test(_38[i].href)){
_38[i].type="application/x-mo";
}else{
throw new Error("LINK tag with rel=gettext found, but the type and extension are unrecognized.");
}
}
}
}
}
_38[i].type=_38[i].type.toLowerCase();
if(_38[i].type=="application/json"){
_38[i].type="application/json";
}else{
if(_38[i].type=="text/javascript"){
_38[i].type="application/json";
}else{
if(_38[i].type=="application/x-po"){
_38[i].type="application/x-po";
}else{
if(_38[i].type=="application/x-mo"){
_38[i].type="application/x-mo";
}else{
throw new Error("LINK tag with rel=gettext found, but the type attribute ["+_38[i].type+"] is unrecognized.");
}
}
}
}
_37.push(_38[i]);
}
}
return _37;
};
Gettext.prototype.textdomain=function(_3a){
if(_3a&&_3a.length){
this.domain=_3a;
}
return this.domain;
};
Gettext.prototype.gettext=function(_3b){
var _3c;
var _3d;
var n;
var _3f;
return this.dcnpgettext(null,_3c,_3b,_3d,n,_3f);
};
Gettext.prototype.dgettext=function(_40,_41){
var _42;
var _43;
var n;
var _45;
return this.dcnpgettext(_40,_42,_41,_43,n,_45);
};
Gettext.prototype.dcgettext=function(_46,_47,_48){
var _49;
var _4a;
var n;
return this.dcnpgettext(_46,_49,_47,_4a,n,_48);
};
Gettext.prototype.ngettext=function(_4c,_4d,n){
var _4f;
var _50;
return this.dcnpgettext(null,_4f,_4c,_4d,n,_50);
};
Gettext.prototype.dngettext=function(_51,_52,_53,n){
var _55;
var _56;
return this.dcnpgettext(_51,_55,_52,_53,n,_56);
};
Gettext.prototype.dcngettext=function(_57,_58,_59,n,_5b){
var _5c;
return this.dcnpgettext(_57,_5c,_58,_59,n,_5b,_5b);
};
Gettext.prototype.pgettext=function(_5d,_5e){
var _5f;
var n;
var _61;
return this.dcnpgettext(null,_5d,_5e,_5f,n,_61);
};
Gettext.prototype.dpgettext=function(_62,_63,_64){
var _65;
var n;
var _67;
return this.dcnpgettext(_62,_63,_64,_65,n,_67);
};
Gettext.prototype.dcpgettext=function(_68,_69,_6a,_6b){
var _6c;
var n;
return this.dcnpgettext(_68,_69,_6a,_6c,n,_6b);
};
Gettext.prototype.npgettext=function(_6e,_6f,_70,n){
var _72;
return this.dcnpgettext(null,_6e,_6f,_70,n,_72);
};
Gettext.prototype.dnpgettext=function(_73,_74,_75,_76,n){
var _78;
return this.dcnpgettext(_73,_74,_75,_76,n,_78);
};
Gettext.prototype.dcnpgettext=function(_79,_7a,_7b,_7c,n,_7e){
if(!this.isValidObject(_7b)){
return "";
}
var _7f=this.isValidObject(_7c);
var _80=this.isValidObject(_7a)?_7a+Gettext.context_glue+_7b:_7b;
var _81=this.isValidObject(_79)?_79:this.isValidObject(this.domain)?this.domain:"messages";
var _82="LC_MESSAGES";
var _7e=5;
var _83=new Array();
if(typeof (Gettext._locale_data)!="undefined"&&this.isValidObject(Gettext._locale_data[_81])){
_83.push(Gettext._locale_data[_81]);
}else{
if(typeof (Gettext._locale_data)!="undefined"){
for(var dom in Gettext._locale_data){
_83.push(Gettext._locale_data[dom]);
}
}
}
var _85=[];
var _86=false;
var _87;
if(_83.length){
for(var i=0;i<_83.length;i++){
var _89=_83[i];
if(this.isValidObject(_89.msgs[_80])){
for(var j=0;j<_89.msgs[_80].length;j++){
_85[j]=_89.msgs[_80][j];
}
_85.shift();
_87=_89;
_86=true;
if(_85.length>0&&_85[0].length!=0){
break;
}
}
}
}
if(_85.length==0||_85[0].length==0){
_85=[_7b,_7c];
}
var _8b=_85[0];
if(_7f){
var p;
if(_86&&this.isValidObject(_87.head.plural_func)){
var rv=_87.head.plural_func(n);
if(!rv.plural){
rv.plural=0;
}
if(!rv.nplural){
rv.nplural=0;
}
if(rv.nplural<=rv.plural){
rv.plural=0;
}
p=rv.plural;
}else{
p=(n!=1)?1:0;
}
if(this.isValidObject(_85[p])){
_8b=_85[p];
}
}
return _8b;
};
Gettext.strargs=function(str,_8f){
if(null==_8f||"undefined"==typeof (_8f)){
_8f=[];
}else{
if(_8f.constructor!=Array){
_8f=[_8f];
}
}
var _90="";
while(true){
var i=str.indexOf("%");
var _92;
if(i==-1){
_90+=str;
break;
}
_90+=str.substr(0,i);
if(str.substr(i,2)=="%%"){
_90+="%";
str=str.substr((i+2));
}else{
if(_92=str.substr(i).match(/^%(\d+)/)){
var _93=parseInt(_92[1]);
var _94=_92[1].length;
if(_93>0&&_8f[_93-1]!=null&&typeof (_8f[_93-1])!="undefined"){
_90+=_8f[_93-1];
}
str=str.substr((i+1+_94));
}else{
_90+="%";
str=str.substr((i+1));
}
}
}
return _90;
};
Gettext.prototype.strargs=function(str,_96){
return Gettext.strargs(str,_96);
};
Gettext.prototype.isArray=function(_97){
return this.isValidObject(_97)&&_97.constructor==Array;
};
Gettext.prototype.isValidObject=function(_98){
if(null==_98){
return false;
}else{
if("undefined"==typeof (_98)){
return false;
}else{
return true;
}
}
};
Gettext.prototype.sjax=function(uri){
var _9a;
if(window.XMLHttpRequest){
_9a=new XMLHttpRequest();
}else{
if(navigator.userAgent.toLowerCase().indexOf("msie 5")!=-1){
_9a=new ActiveXObject("Microsoft.XMLHTTP");
}else{
_9a=new ActiveXObject("Msxml2.XMLHTTP");
}
}
if(!_9a){
throw new Error("Your browser doesn't do Ajax. Unable to support external language files.");
}
_9a.open("GET",uri,false);
try{
_9a.send(null);
}
catch(e){
return;
}
var _9b=_9a.status;
if(_9b==200||_9b==0){
return _9a.responseText;
}else{
var _9c=_9a.statusText+" (Error "+_9a.status+")";
if(_9a.responseText.length){
_9c+="\n"+_9a.responseText;
}
alert(_9c);
return;
}
};
Gettext.prototype.JSON=function(_9d){
return eval("("+_9d+")");
};

function getLocale(){
if(navigator){
if(navigator.language){
return navigator.language;
}else{
if(navigator.browserLanguage){
return navigator.browserLanguage;
}else{
if(navigator.systemLanguage){
return navigator.systemLanguage;
}else{
if(navigator.userLanguage){
return navigator.userLanguage;
}
}
}
}
}
}
var gt=null;
function init_gettext(){
if(typeof json_locale_data!=="undefined"){
var _1={"domain":"js-messages","locale_data":json_locale_data};
gt=new Gettext(_1);
}
}
init_gettext();
function _js(_2){
if(gt){
return gt.gettext(_2);
}else{
return _2;
}
}
function __js(_3,a){
var _3=_js(_3);
for(var i=0;i<a.length;i++){
var re=new RegExp("{"+a[i][0]+"}","g");
_3=_3.replace(re,a[i][1]);
}
return _3;
}
function _jn(_7,_8,_9){
var _a;
if(gt){
_a=gt.ngettext(_7,_8,_9);
}else{
if(_9==0||_9>1){
_a=_8;
}else{
_a=_7;
}
}
return _a;
}
function __jn(_b,_c,_d,a){
var _f=_jn(_b,_c,_d);
return __gt_expand(_f,a);
return _f;
}
function __gt_expand(msg,a){
for(var i=0;i<a.length;i++){
var re=new RegExp("{"+a[i][0]+"}","g");
msg=msg.replace(re,a[i][1]);
}
return msg;
}

PgnViewer=function(_1,_2){
var _3=new BoardConfig();
_3.applyConfig(_1);
if(!window._pvObject){
window._pvObject=new Array();
}
window._pvObject[_3.boardName]=this;
_1=_3;
_1.pgnMode=true;
this.chessapp=new ChessApp(_1);
this.finishedCallback=_2;
if(_1.loadImmediately){
this.chessapp.init();
}else{
YAHOO.util.Event.addListener(window,"load",this.chessapp.init,this.chessapp,true);
}
};
PgnViewer.prototype.setupFromPgn=function(_4){
this.chessapp.pgn.setupFromPGN(_4);
};
PgnViewer.prototype.setupFromFen=function(_5,_6,_7,_8){
this.chessapp.pgn.board.setupFromFen(_5,_6,_7,_8);
};
PGNGame=function(_9,_a,_b,_c,_d,_e,_f,_10,_11,_12){
this.movesseq=_9;
this.startFen=_a;
this.blackPlayer=_b;
this.whitePlayer=_c;
this.pgn_result=_d;
this.event=_e;
this.site=_f;
this.date=_10;
this.round=_11;
this.start_movenum=_12;
};
PGN=function(_13){
this.board=_13;
this.pgnGames=new Array();
};
PGN.prototype.getPGNFromURL=function(url){
YAHOO.util.Connect.asyncRequest("GET",url,{success:function(o){
this.setupFromPGN(o.responseText);
},failure:function(o){
YAHOO.log("pgn load failed:"+o.statusText+" for file:"+url);
alert("pgn load failed:"+o.statusText+" for file:"+url);
},scope:this},"emptyText");
};
PGN.prototype.getMoveFromPGNMove=function(_17,_18,_19){
var _1a=false;
var _1b=false;
var _1c=false;
var _1d;
var _1e=null;
var _1f=false;
var _20=null;
if(_17.charAt(_17.length-1)=="#"){
_1b=true;
_1a=true;
_17=_17.substr(0,_17.length-1);
}else{
if(_17.charAt(_17.length-1)=="+"){
_1b=true;
if(_17.length>1&&_17.charAt(_17.length-2)=="+"){
_1a=true;
_17=_17.substr(0,_17.length-2);
}else{
_17=_17.substr(0,_17.length-1);
}
}
}
if(_17=="O-O-O"){
if(_18=="w"){
return this.board.createMoveFromString("e1c1");
}else{
return this.board.createMoveFromString("e8c8");
}
}else{
if(_17=="O-O"){
if(_18=="w"){
return this.board.createMoveFromString("e1g1");
}else{
return this.board.createMoveFromString("e8g8");
}
}
}
var _21=_17.indexOf("=");
if(_21>=0){
var _22;
_1e=_17.substr(_21+1,1);
_22=_1e.charAt(0);
_1d=this.board.pieceCharToPieceNum(_22);
_1c=true;
_17=_17.substr(0,_21);
}
var _23=_17.substr(_17.length-2,2);
var _24=_23.charCodeAt(0)-"a".charCodeAt(0);
var _25=_23.charCodeAt(1)-"1".charCodeAt(0);
if(_24>7||_24<0||_25>7||_25<0){
alert("PgnViewer: Error processing to Square:"+_23+" on move:"+_17);
return null;
}
if(_17.length>2){
if(_17.charAt(_17.length-3)=="x"){
_1f=true;
_20=_17.substr(0,_17.length-3);
}else{
_20=_17.substr(0,_17.length-2);
}
}
var _26=new Array();
var _27=0;
var _28=null;
var _29=(_18=="w")?ChessPiece.WHITE:ChessPiece.BLACK;
switch(_17.charAt(0)){
case "K":
case "k":
_28=ChessPiece.KING;
break;
case "Q":
case "q":
_28=ChessPiece.QUEEN;
break;
case "R":
case "r":
_28=ChessPiece.ROOK;
break;
case "B":
_28=ChessPiece.BISHOP;
break;
case "N":
case "n":
_28=ChessPiece.KNIGHT;
break;
case "P":
case "p":
_28=ChessPiece.PAWN;
break;
default:
_28=ChessPiece.PAWN;
}
var _2a=null;
var _2b=null;
if(_20){
var _2c=_20.toLowerCase().charAt(0);
if(_2c==_20.charAt(0)&&_2c>="a"&&_2c<="h"){
_2b=_2c;
if(_20.length==2){
_2a=_20.charAt(1);
}
}else{
if(_20.length>1){
if(_20.length==2){
var c=_20.charAt(1);
if(c>="1"&&c<="8"){
_2a=c;
}else{
_2b=c;
}
}else{
if(_20.length==3){
_2b=_20.charAt(1);
_2a=_20.charAt(2);
if(_2b>="1"&&_2b<="9"){
var tmp=_2b;
_2b=_2a;
_2a=tmp;
}
}else{
alert("PgnViewer: Error: unhandled fromChars:"+_20);
return null;
}
}
}
}
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.board.boardPieces[i][j];
if(bp!=null&&bp.colour==_29&&bp.piece==_28){
if(this.board.canMove(bp,_24,_25,_19,true)){
var _32=String.fromCharCode("a".charCodeAt(0)+i).charAt(0);
var _33=String.fromCharCode("1".charCodeAt(0)+j).charAt(0);
if((_2b==null||_2b==_32)&&(_2a==null||_2a==_33)){
_26[_27++]=bp;
}else{
}
}
}
}
}
if(_27==0){
alert("PgnViewer: no candidate pieces for:"+_17);
return null;
}
if(_27>1){
alert("PgnViewer: Ambiguous:"+_17+" with fromChars:"+_20+" disRow:"+_2a+" disCol:"+_2b);
return null;
}
var _34=_26[0];
var _35="";
_35+=String.fromCharCode("a".charCodeAt(0)+_34.column);
_35+=String.fromCharCode("1".charCodeAt(0)+_34.row);
if(_1f){
_35+="x";
}
_35+=_23;
if(_1e){
_35+=_1e;
}
var _36=this.board.createMoveFromString(_35);
return _36;
};
PGN.prototype.parseTag=function(_37,pgn,_39){
if(pgn.substr(_39,_37.length+3)=="["+_37+" \""){
var _3a=pgn.indexOf("\"",_39+_37.length+3);
if(_3a>=0){
return pgn.substring(_39+_37.length+3,_3a);
}
}
return null;
};
PGN.prototype.setupFromPGN=function(pgn){
var _3c=new Array();
var _3d=new Array();
var _3e=0;
this.pgnGames=new Array();
pgn=pgn.replace(/^\s+|\s+$/g,"");
var _3f=0;
this.pgn=pgn;
this.setupFromPGN_cont(_3c,_3d,_3e,_3f);
};
PGN.prototype.setupFromPGN_cont=function(_40,_41,_42,_43){
var _44=new Date().getTime();
var pgn=this.pgn;
var _46=this.board.boardName+"-progress";
var _47=YAHOO.util.Dom.get(_46);
while(_43<pgn.length){
var _48="";
var _49="";
var _4a="";
var _4b="";
var _4c="";
var _4d="";
var _4e="";
var _4f="w";
var _50=0;
var _51=0;
var _52=new Array();
var _53=0;
var _54="";
var _55=null;
var _56=null;
var _57=new Array();
var _58=new Array();
var _59=new Array();
var _5a=new Array();
var _5b=new Array();
this.board.pieceMoveDisabled=true;
this.board.startFen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
var i=0;
for(i=_43;i<pgn.length;i++){
var tag=this.parseTag("FEN",pgn,i);
if(tag&&tag!="?"){
this.board.startFen=tag;
}else{
tag=this.parseTag("White",pgn,i);
if(tag&&tag!="?"){
_4e=tag;
}else{
tag=this.parseTag("Black",pgn,i);
if(tag&&tag!="?"){
_49=tag;
}else{
tag=this.parseTag("Result",pgn,i);
if(tag&&tag!="?"){
_48=tag;
}else{
tag=this.parseTag("Event",pgn,i);
if(tag&&tag!="?"){
_4a=tag;
}else{
tag=this.parseTag("Site",pgn,i);
if(tag&&tag!="?"){
_4b=tag;
}else{
tag=this.parseTag("Date",pgn,i);
if(tag&&tag!="?"){
_4c=tag;
}else{
tag=this.parseTag("Round",pgn,i);
if(tag&&tag!="?"){
_4d=tag;
}
}
}
}
}
}
}
}
if(pgn.charAt(i)=="["){
var j=pgn.indexOf;
for(j=i+1;j<pgn.length&&pgn.charAt(j)!="]";j++){
}
if(j==pgn.length){
alert("PgnViewer: Error parsing PGN. Found unclosed [");
return false;
}
i=j-1;
continue;
}
if(pgn.charAt(i)=="{"){
var _5f=pgn.indexOf("}",i+1);
if(_5f>=0){
var _60=pgn.substring(i+1,_5f);
i=_5f;
_54+="{ "+_60+" } ";
}else{
alert("PgnViewer: Error parsing PGN. Found unclosed {");
return false;
}
continue;
}
var _61=1;
if(pgn.substr(i,1)=="."){
var j=i-1;
while(j>0&&pgn.charAt(j)>="0"&&pgn.charAt(j)<="9"){
j--;
}
if(j>0){
_61=parseInt(pgn.substring(j+1,i));
}
break;
}
}
if(pgn.substr(i,1)!="."){
alert("PgnViewer: Error: Could not find movelist:"+pgn.substr(i));
return false;
}
this.board.setupFromFen(this.board.startFen,false,false,true);
var _62=i;
var _63=null;
for(i=i;i<pgn.length;i++){
var _64=-1;
if(pgn.substr(i,3)=="1-0"||pgn.substr(i,3)=="0-1"){
_64=3;
}else{
if(pgn.substr(i,7)=="1/2-1/2"){
_64=7;
}else{
if(pgn.substr(i,1)=="*"){
_64=1;
}
}
}
if(_64>0){
_63=pgn.substr(i,_64);
_43=i+_64;
break;
}
if(pgn.charAt(i)=="["){
_43=i;
break;
}
if(pgn.charAt(i)==" "||pgn.charAt(i)=="\t"||pgn.charAt(i)=="\n"||pgn.charAt(i)=="\r"){
_62=i+1;
continue;
}
if(pgn.charAt(i)>="0"&&pgn.charAt(i)<="9"){
continue;
}
if(pgn.charAt(i)=="."){
var _65=pgn.substring(_62,i).replace(/^\s+|\s+$/g,"");
_62=i;
while(i+1<pgn.length&&pgn.charAt(i+1)=="."){
i++;
}
if(_62!=i){
_4f="b";
}else{
_4f="w";
}
_62=i+1;
}else{
if(pgn.charAt(i)=="{"){
var _5f=pgn.indexOf("}",i+1);
if(_5f>=0){
var _60=pgn.substring(i+1,_5f);
i=_5f;
_54+="{ "+_60+" } ";
}
_62=i+1;
}else{
if(pgn.charAt(i)=="("){
_57[_50]=this.board.boardPieces;
_58[_50]=_4f;
_5a[_50]=_55;
_5b[_50]=_56;
this.board.boardPieces=_59[_50];
this.board.boardPieces=this.board.copyBoardPieces(false);
_55=_56;
_50++;
_62=i+1;
_54+="( ";
}else{
if(pgn.charAt(i)==")"){
boardPool.putObject(_57[_50]);
_50--;
this.board.boardPieces=_57[_50];
_4f=_58[_50];
_55=_5a[_50];
_56=_5b[_50];
_62=i+1;
_54+=") ";
}else{
if(pgn.charAt(i)=="$"){
var j;
for(j=i+1;j<pgn.length&&pgn.charAt(j)>="0"&&pgn.charAt(j)<="9";j++){
}
j--;
if(j>i){
var _66=parseInt(pgn.substr(i+1,j+1));
if(_66<=9){
switch(_66){
case 1:
_54=_54.substr(0,_54.length-1)+"! ";
break;
case 2:
_54=_54.substr(0,_54.length-1)+"? ";
break;
case 3:
_54=_54.substr(0,_54.length-1)+"!! ";
break;
case 4:
_54=_54.substr(0,_54.length-1)+"?? ";
break;
case 5:
_54=_54.substr(0,_54.length-1)+"!? ";
break;
case 6:
_54=_54.substr(0,_54.length-1)+"?! ";
break;
case 7:
case 8:
case 9:
case 0:
default:
}
}else{
_54+=pgn.substring(i,j+1)+" ";
}
i=j;
}
continue;
}else{
var _67=-1;
for(var j=i+1;j<pgn.length;j++){
if(pgn.charAt(j)==")"||pgn.charAt(j)=="("||pgn.charAt(j)=="{"||pgn.charAt(j)=="}"||pgn.charAt(j)==" "||pgn.charAt(j)=="\t"||pgn.charAt(j)=="\n"||pgn.charAt(j)=="\r"){
_67=j;
break;
}
}
if(_67==-1){
_67=pgn.length;
}
var _68=_62;
var _69=pgn.substring(_62,_67).replace(/^\s+|\s+$/g,"");
_62=_67;
i=_62-1;
if(_69.length==0){
alert("PgnViewer: Error: got empty move endMoveInd:"+_67+" upto:"+_68+" from:"+pgn.substr(_68)+"#");
return false;
}
var _6a=_69.length-1;
while(_6a>=0){
if(_69.charAt(_6a)=="?"){
_6a--;
}else{
if(_69.charAt(_6a)=="!"){
_6a--;
}else{
break;
}
}
}
var _6b=_69.substring(0,_6a+1);
var _6c=this.getMoveFromPGNMove(_6b,_4f,_55);
if(_6c==null){
_54+="unknown ";
alert("PgnViewer: Error parsing:"+_69);
return false;
}
_56=_55;
_55=_6c;
var _6d=this.board.boardPieces[_6c.fromColumn][_6c.fromRow];
boardPool.putObject(_59[_50]);
_59[_50]=this.board.copyBoardPieces(false);
if(_6d){
this.board.makeMove(_6c,_6d,false,0.5,false,false);
}
_51=_50;
_53++;
_4f=this.board.flipToMove(_4f);
_54+=_6c.moveString+"|"+_69+" ";
}
}
}
}
}
}
if(_43<i){
_43=i;
}
var _6e=pgn.indexOf("{",_43);
var _6f=pgn.indexOf("[",_43);
if(_6e>=0){
if(_6f==-1||_6e<_6f){
var _70=pgn.indexOf("}",_6e+1);
if(_70>=0){
var _60=pgn.substring(_6e+1,_70);
_43=_70+1;
_54+="{ "+_60+" } ";
}else{
alert("PgnViewer: Error: Unclosed {");
return false;
}
}
}
_54=_54.replace(/^\s+|\s+$/g,"");
this.board.pieceMoveDisabled=false;
if(_63!=null){
if(_48.length==0||_48=="?"){
_48=_63;
}
}
this.pgnGames[_42++]=new PGNGame(_54,this.board.startFen,_49,_4e,_48,_4a,_4b,_4c,_4d,_61);
if(_47){
_47.innerHTML="Loaded "+_42+" games";
}
if(new Date().getTime()-_44>500){
setTimeout("window._pvObject[\""+this.board.boardName+"\"].chessapp.pgn.setupFromPGN_cont(\""+_40+"\",\""+_41+"\",\""+_42+"\",\""+_43+"\");",0);
return;
}
}
var _71=YAHOO.util.Dom.get(this.board.boardName+"-problemSelectorForm");
if(_71){
_71.parentNode.removeChild(_71);
}
if(this.pgnGames.length==0){
alert("PgnViewer: Error: Unable to find any pgn games in:"+pgn);
return false;
}
if(this.pgnGames.length==1){
this.showGame(0);
}else{
var _72=this.board.boardName+"-container";
var _73=YAHOO.util.Dom.get(_72);
var _74=document.createElement("div");
var _75="<form id=\""+this.board.boardName+"-problemSelectorForm\" action=\"\" method=\"\"><select id=\""+this.board.boardName+"-problemSelector\" name=\""+this.board.boardName+"-problemSelector\" style=\"width: "+this.board.pieceSize*8+"px;\">";
for(i=0;i<this.pgnGames.length;i++){
var _76=this.pgnGames[i];
var _77=this.board.boardName+"-game-"+i;
var _78=(i+1)+". "+_76.whitePlayer+" vs "+_76.blackPlayer;
if(_76.pgn_result.length>0&&_76.pgn_result!="?"&&this.board.showResult==1){
_78+=" "+_76.pgn_result;
}
if(_76.event.length>0&&_76.event!="?"&&this.board.showEvent==1){
_78+=" "+_76.event;
}
if(_76.round.length>0&&_76.round!="?"&&this.board.showRound==1){
_78+=" Rnd:"+_76.round;
}
if(_76.site.length>0&&_76.site!="?"&&this.board.showSite==1){
_78+=" "+_76.site;
}
if(_76.date.length>0&&_76.date!="?"&&this.board.showDate==1){
_78+=" "+_76.date;
}
_75+="<option id=\""+_77+"\" value=\""+i+"\">"+_78+"</option>";
}
_75+="</select></form>";
_74.innerHTML=_75;
_73.insertBefore(_74,_73.firstChild);
YAHOO.util.Event.addListener(this.board.boardName+"-problemSelector","change",this.selectGame,this,true);
this.showGame(0);
}
if(_47){
YAHOO.util.Dom.setStyle(_47,"visibility","hidden");
_47.appendChild(_47);
}
if(window._pvObject[this.board.boardName].finishedCallback){
window._pvObject[this.board.boardName].finishedCallback();
}
return;
};
PGN.prototype.selectGame=function(e){
var _7a=YAHOO.util.Event.getTarget(e).selectedIndex;
this.showGame(_7a);
var _7b=this.board.boardName+"-piecestaken";
var _7c=YAHOO.util.Dom.get(_7b);
if(_7c){
_7c.innerHTML="";
}
this.board.resetMoveListScrollPosition();
};
PGN.prototype.showGame=function(_7d){
this.board.startFen=this.pgnGames[_7d].startFen;
this.board.setupFromFen(this.pgnGames[_7d].startFen,false,false,false);
this.board.setMoveSequence(this.pgnGames[_7d].movesseq,"NA",this.pgnGames[_7d].start_movenum,this.pgnGames[_7d].pgn_result);
this.board.displayPendingMoveList();
this.board.setCurrentMove(this.board.moveArray[0]);
if(this.board.autoplayFirst){
this.board.forwardMove();
}
this.board.displayMode=true;
};

var SITE_VERSION=1;
var clog=false;
var move_obj_id_counter=0;
BoardConfig=function(){
this.boardName="board";
this.pgnString=null;
this.pgnFile=null;
this.pieceSet="merida";
this.pieceSize=46;
this.isEndgame=false;
this.tr=false;
this.addVersion=true;
this.ml=9999;
this.autoScrollMoves=false;
this.moveAnimationLength=0.5;
this.showBracketsOnVariation=true;
this.newlineForEachMainMove=true;
this.showNPS=false;
this.squareColorClass="";
this.pieceTakenSize=this.pieceSize;
this.pauseBetweenMoves=800;
this.pgnMode=false;
this.previewMode=false;
this.movesFormat="default";
this.boardImagePath="http://chesstempo.com";
this.showCoordinates=false;
this.highlightFromTo=false;
this.highlightValidSquares=false;
this.showResult=1;
this.showEvent=1;
this.showRound=1;
this.showSite=1;
this.showDate=1;
this.ignoreFlipping=false;
this.reverseFlip=false;
this.autoplayFirst=false;
this.dontOutputNavButtons=false;
};
BoardConfig.prototype.applyConfig=function(_1){
for(var _2 in _1){
this[_2]=_1[_2];
}
};
ChessApp=function(_3){
this.displayMode=false;
this.config=_3;
this.board=null;
};
ChessApp.prototype.setDisplayMode=function(_4){
this.displayMode=_4;
};
ChessApp.prototype.setProblemNumber=function(_5,_6){
this.problemNumber=_5;
this.attId=_6;
};
ChessApp.prototype.init=function(us){
ChessPiece.init();
this.board=new Board(this.config.boardName);
this.board.moveArray=new Array();
if(!this.hideOnInit){
YAHOO.util.Dom.setStyle(this.config.boardName+"-container","display","block");
YAHOO.util.Dom.setStyle("toPlaySpan","display","inline");
}
this.tactics=(this.displayMode||this.config.pgnMode||this.config.previewMode)?null:new TacticsUI(this.board);
this.problem=(this.config.pgnMode||this.config.previewMode)?null:new ProblemUI(this.board,this.tactics);
this.board.tactics=this.tactics;
this.board.problem=this.problem;
if(this.problem){
this.problem.autoPlayOpponent=1;
}
this.pgn=(this.config.pgnMode)?new PGN(this.board):null;
var _8=MovesDisplay.DEFAULT_DISPLAY_TYPE;
if(this.config.movesFormat=="main_on_own_line"){
_8=MovesDisplay.MAIN_ON_OWN_LINE;
}
this.movesDisplay=new MovesDisplay(this.board,_8);
this.movesDisplay.variationOnOwnLine=this.config.variationOnOwnLine;
this.board.movesDisplay=this.movesDisplay;
this.board.boardImagePath=this.config.boardImagePath;
this.board.showNPS=this.config.showNPS;
this.board.squareColorClass=this.config.squareColorClass;
this.board.tr=this.config.tr;
this.board.ml=this.config.ml;
this.board.addVersion=this.config.addVersion;
this.board.autoScrollMoves=this.config.autoScrollMoves;
this.board.moveAnimationLength=this.config.moveAnimationLength;
this.board.showBracketsOnVariation=this.config.showBracketsOnVariation;
this.board.newlineForEachMainMove=this.config.newlineForEachMainMove;
this.board.pieceSize=this.config.pieceSize;
this.board.pieceTakenSize=this.config.pieceTakenSize;
this.board.pieceSet=this.config.pieceSet;
this.board.pauseBetweenMoves=this.config.pauseBetweenMoves;
this.board.showCoordinates=this.config.showCoordinates;
this.board.highlightFromTo=this.config.highlightFromTo;
this.board.highlightValidSquares=this.config.highlightValidSquares;
this.board.showDate=this.config.showDate;
this.board.showEvent=this.config.showEvent;
this.board.showGame=this.config.showGame;
this.board.showResult=this.config.showResult;
this.board.showRound=this.config.showRound;
this.board.showSite=this.config.showSite;
this.board.ignoreFlipping=this.config.ignoreFlipping;
this.board.reverseFlip=this.config.reverseFlip;
this.board.autoplayFirst=this.config.autoplayFirst;
this.board.dontOutputNavButtons=this.config.dontOutputNavButtons;
if(this.problem){
this.problem.isEndgame=this.config.isEndgame;
}
if(typeof loginManager!="undefined"){
if(this.tactics){
loginManager.setLoginCallback(this.tactics.loginCallback,this.tactics);
loginManager.setLogoutCallback(this.tactics.logoutCallback,this.tactics);
}
if(this.problem){
loginManager.setSessionCallback(this.problem.sessionCallback,this.problem);
}
}
YAHOO.util.DragDropMgr.clickTimeThresh=50;
YAHOO.util.DragDropMgr.clickPixelThresh=1;
this.board.createBoardUI();
if(this.problem){
this.problem.createProblemUI();
}
if(this.tactics){
this.tactics.initProblemCompleteOverlay();
}
if(this.problem){
this.problem.initLoadingOverlay();
}
if(this.config.pgnMode){
if(this.config.pgnFile){
this.pgn.getPGNFromURL(this.config.pgnFile);
}else{
if(this.config.pgnString){
this.pgn.setupFromPGN(this.config.pgnString);
}
}
}else{
if(this.tactics){
YAHOO.util.Event.addListener(window,"beforeunload",this.tactics.checkLeavingPage,this.tactics,true);
YAHOO.util.Event.addListener(window,"unload",this.tactics.leavingPage,this.tactics,true);
this.tactics.updateSessionDisplay(0,0);
if(typeof showingStart!="undefined"&&showingStart){
var _9=this;
var _a=new YAHOO.widget.SimpleDialog("starttacticdialog1",{width:"300px",fixedcenter:true,modal:false,visible:true,draggable:false,close:false,text:"<span style=\"color:black\">"+_js("Click start to begin solving problems")+"</span>",icon:YAHOO.widget.SimpleDialog.ICON_INFO,constraintoviewport:true,buttons:[{text:_js("Start"),handler:function(){
this.hide();
_9.problem.getProblem();
},isDefault:true}]});
var _b=YAHOO.util.Dom.get("ctb-"+this.board.boardName);
_a.render(document.body);
}else{
this.problem.getProblem();
}
}else{
if(this.problem){
if(this.problemNumber!=""){
YAHOO.util.Dom.setStyle("boardandmoves","display","block");
this.problem.getProblem(this.problemNumber,this.attId);
}
}
}
}
this.board.setupEventHandlers();
if(this.problem){
this.problem.setupEventHandlers();
}
if(this.tactics){
this.tactics.setupEventHandlers();
}
};
function clearClone(o){
if(o==null){
return;
}
for(prop in o){
if(typeof (o[prop])=="object"&&o[prop]!=null&&o[prop].alreadyCloned){
o[prop].alreadyCloned=false;
clearClone(o[prop]);
}
}
}
function cloneWork(o){
if(o==null){
return null;
}
var _e=new Object();
for(prop in o){
if(typeof (o[prop])=="object"){
_e[prop]=o[prop];
}else{
_e[prop]=o[prop];
}
}
return _e;
}
function clone(o){
return cloneWork(o);
}
get_image_str=function(_10,_11,_12,_13,_14){
var _15=".vers"+SITE_VERSION;
if(!_14){
_15="";
}
if(check_bad_msie()){
return _11+"/images/"+_12+"/"+_10+_13+_15+".png";
}else{
return _11+"/images/"+_12+"/"+_10+_13+_15+".png";
}
};
check_bad_msie=function(){
return (window.ActiveXObject&&(typeof document.body.style.maxHeight=="undefined"));
};
fix_ie_png=function(img){
if(!check_bad_msie()){
return;
}
var _17=(img.id)?"id='"+img.id+"' ":"";
var _18=(img.className)?"class='"+img.className+"' ":"";
var _19=(img.title)?"title='"+img.title+"' ":"title='"+img.alt+"' ";
var _1a="display:inline-block;"+img.style.cssText;
if(img.align=="left"){
_1a="float:left;"+_1a;
}
if(img.align=="right"){
_1a="float:right;"+_1a;
}
if(img.parentElement.href){
_1a="cursor:hand;"+_1a;
}
var _1b="<span "+_17+_18+_19+" style=\""+"width:"+img.width+"px; height:"+img.height+"px;"+_1a+";"+"filter:progid:DXImageTransform.Microsoft.AlphaImageLoader"+"(src='"+img.src+"', sizingMethod='image');\"></span>";
img.outerHTML=_1b;
};
Move=function(_1c,_1d,_1e,_1f,_20,_21,_22){
this.fromColumn=_1c;
this.fromRow=_1d;
this.toColumn=_1e;
this.toRow=_1f;
this.take=_20;
this.promotion=_21;
this.moveString=_22;
this.prev=null;
this.next=null;
this.numVars=0;
this.ravLevel=0;
this.atEnd=false;
this.obj_id=move_obj_id_counter++;
};
Move.columnToChar=function(col){
var a=String.fromCharCode("a".charCodeAt(0)+col);
return a;
};
Move.prototype.output=function(){
return Move.columnToChar(this.fromColumn)+""+(this.fromRow+1)+":"+Move.columnToChar(this.toColumn)+""+(this.toRow+1)+" prom:"+this.promotion+" objid:"+this.obj_id;
};
Move.prototype.equals=function(m){
return (m&&(this.fromColumn==m.fromColumn&&this.fromRow==m.fromRow&&this.promotion==m.promotion&&this.toColumn==m.toColumn&&this.toRow==m.toRow));
};
Move.prototype.toMoveString=function(){
var _26="";
if(this.promotion){
_26=this.promotion;
}
return Move.columnToChar(this.fromColumn)+""+(this.fromRow+1)+Move.columnToChar(this.toColumn)+""+(this.toRow+1)+_26;
};
function getTagValue(_27,_28){
var _29=_27.getElementsByTagName(_28);
if(_29==null){
YAHOO.log("got null node for tag:"+_28);
return null;
}
if(_29.length==0){
YAHOO.log("got empty array node for tag:"+_28);
return null;
}
if(_29[0].firstChild==null){
YAHOO.log("firstChild is null for tag:"+_28);
return null;
}
if(_29[0].firstChild.nodeValue==null){
YAHOO.log("firstChild.nodeValue is null for tag:"+_28);
return null;
}
if(typeof (_29[0].textContent)!="undefined"){
return _29[0].textContent;
}
return _29[0].firstChild.nodeValue;
}
ChessPiece=function(div,_2b,_2c,_2d){
var ua=navigator.userAgent.toLowerCase();
var _2f=(ua.indexOf("opera")>-1);
var id=div.id;
this.board=_2d;
this.icon=get_image_str(ChessPiece.pieceIconNames[_2b][_2c],this.board.boardImagePath,this.board.pieceSet,this.board.pieceSize,this.board.addVersion);
this.colour=_2b;
this.piece=_2c;
this.id=id;
this.div=div;
var _31=_2d.getPieceDragDiv();
var _32=false;
if(_31==null){
_31=document.createElement("div");
_31.id="pieceDragDiv";
_32=true;
YAHOO.util.Dom.setStyle(_31,"visibility","hidden");
YAHOO.util.Dom.setStyle(_31,"border","0px");
YAHOO.util.Dom.setStyle(_31,"position","absolute");
}
this.pieceDragEl=_31;
this.pieceDragElId="pieceDragDiv";
if(_32){
var _33=document.getElementsByTagName("body");
if(_33==null||_33.length==0){
alert("Could not find body tag");
}else{
_33[0].appendChild(_31);
}
}
if(YAHOO.util.Event.isIE){
var _34=this.div;
_34.innerHTML="<img src=\""+this.icon+"\"/>";
var img=_34.firstChild;
if(!_2f){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle([this.div],"backgroundImage","url("+this.icon+")");
YAHOO.util.Dom.setStyle([this.div],"background-repeat","no-repeat");
}
YAHOO.util.Dom.setStyle([this.div],"height",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle([this.div],"width",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle([this.div],"border","0px");
YAHOO.util.Dom.setStyle([this.div],"padding","0px");
var ua=navigator.userAgent.toLowerCase();
var _2f=(ua.indexOf("opera")>-1);
if(false&&_2f){
YAHOO.util.Dom.setStyle([this.div],"position","absolute");
}else{
YAHOO.util.Dom.setStyle([this.div],"position","relative");
}
this.init(id,"ct-"+this.board.boardName+"-boardandpieces",{dragElId:this.pieceDragElId,resizeFrame:false,centreFrame:true,isTarget:false});
this.initFrame();
};
ChessPiece.prototype=new YAHOO.util.DDProxy();
ChessPiece.init=function(){
ChessPiece.PAWN=0;
ChessPiece.BISHOP=1;
ChessPiece.KNIGHT=2;
ChessPiece.ROOK=3;
ChessPiece.KING=4;
ChessPiece.QUEEN=5;
ChessPiece.WHITE=0;
ChessPiece.BLACK=1;
ChessPiece.pieceIconNames=new Array(2);
ChessPiece.pieceIconNames[0]=new Array(6);
ChessPiece.pieceIconNames[1]=new Array(6);
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.PAWN]="whitepawn";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.BISHOP]="whitebishop";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.KNIGHT]="whiteknight";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.ROOK]="whiterook";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.KING]="whiteking";
ChessPiece.pieceIconNames[ChessPiece.WHITE][ChessPiece.QUEEN]="whitequeen";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.PAWN]="blackpawn";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.BISHOP]="blackbishop";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.KNIGHT]="blackknight";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.ROOK]="blackrook";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.KING]="blackking";
ChessPiece.pieceIconNames[ChessPiece.BLACK][ChessPiece.QUEEN]="blackqueen";
};
ChessPiece.prototype.oldIsValidHandleChild=ChessPiece.prototype.isValidHandleChild;
ChessPiece.prototype.oldStartDrag=ChessPiece.prototype.startDrag;
ChessPiece.prototype.isValidHandleChild=function(_36){
if(this.board.dragDisabled){
return false;
}
if(this.board.toMove!=this.colour){
return false;
}
return this.oldIsValidHandleChild(_36);
};
ChessPiece.prototype.onDragOut=function(e,id){
this.insideBoard=false;
};
ChessPiece.prototype.onDragEnter=function(e,id){
this.insideBoard=true;
};
ChessPiece.prototype.makeLightWeight=function(){
var cp=this.board.createPiece(this.colour,this.piece,true);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
ChessPiece.prototype.endDrag=function(e){
if(this.board.lastOverSquare){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
}
this.board.lastOverSquare=null;
if(!this.insideBoard){
this.board.board_xy=null;
this.setPosition(this.column,this.row,false,null,this.board.moveAnimationLength);
}
YAHOO.util.Dom.setStyle(this.getEl(),"visibility","visible");
};
ChessPiece.prototype.startDrag=function(x,y){
this.insideBoard=true;
var _3f=null;
if(this.board.currentMove){
if(this.board.currentMove.prev){
_3f=this.board.currentMove.prev;
}else{
_3f=this.board.prev_move;
}
}else{
_3f=this.board.prev_move;
}
if(this.board.highlightValidSquares){
this.candidates=null;
this.candidates=new Array(8);
for(var i=0;i<8;i++){
this.candidates[i]=new Array(8);
for(var j=0;j<8;j++){
this.candidates[i][j]=false;
}
}
}
this.pieceDragEl.innerHTML="<img src=\""+this.icon+"\"/>";
var img=this.pieceDragEl.firstChild;
fix_ie_png(img);
YAHOO.util.Dom.setStyle(this.pieceDragEl,"zIndex",1000);
YAHOO.util.Dom.setStyle(this.pieceDragEl,"height",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle(this.pieceDragEl,"width",this.board.pieceSize+"px");
YAHOO.util.Dom.setStyle(this.getEl(),"visibility","hidden");
if(this.board.highlightValidSquares){
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var _43=7-i;
var _44=j;
if(this.board.isFlipped){
_43=7-_43;
_44=7-_44;
}
if((_43==this.row&&_44==this.column)||this.board.canMove(this.makeLightWeight(),_44,_43,_3f,true)){
this.candidates[j][i]=true;
}
}
}
}
};
ChessPiece.prototype.onDragOver=function(e,id){
var x=YAHOO.util.Event.getPageX(e);
var y=YAHOO.util.Event.getPageY(e);
var _49=YAHOO.util.Dom.getX("ctb-"+this.board.boardName);
var _4a=YAHOO.util.Dom.getY("ctb-"+this.board.boardName);
var c=parseInt((x-_49)/this.board.pieceSize);
var r=parseInt((y-_4a)/this.board.pieceSize);
var _4d=this.board.boardName+"-s"+c+""+(7-r);
var _4e=YAHOO.util.Dom.get(_4d);
if(this.board.highlightValidSquares){
if(this.board.lastOverSquare){
if(this.board.lastOverSquare!=_4e){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
this.board.lastOverSquare=null;
if(this.candidates&&c<8&&c>=0&&r<8&&r>=0&&this.candidates[c][r]){
YAHOO.util.Dom.addClass(_4e,"ct-over-valid-square");
}else{
YAHOO.util.Dom.addClass(_4e,"ct-over-invalid-square");
}
}
}
this.board.lastOverSquare=_4e;
}
};
ChessPiece.prototype.onDragDrop=function(e,id){
if(this.board.blockFowardBack||this.board.deferredBlockForwardBack){
return false;
}
if(this.board.lastOverSquare){
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-valid-square");
YAHOO.util.Dom.removeClass(this.board.lastOverSquare,"ct-over-invalid-square");
}
var x=YAHOO.util.Event.getPageX(e);
var y=YAHOO.util.Event.getPageY(e);
var _53=YAHOO.util.Dom.getX("ctb-"+this.board.boardName);
var _54=YAHOO.util.Dom.getY("ctb-"+this.board.boardName);
var c=parseInt((x-_53)/this.board.pieceSize);
var r=parseInt((y-_54)/this.board.pieceSize);
if(this.board.isFlipped){
r=7-r;
c=7-c;
}
var _57=false;
if(!this.board.currentMove||this.board.currentMove.atEnd){
_57=true;
}
this.board.updatePiece(this,c,7-r,false,false,true);
if(!_57&&this.board.currentMove&&this.board.currentMove.atEnd){
this.board.toggleToMove();
this.board.updateToPlay();
}
};
ChessPiece.prototype.removeFromParent=function(){
var _58=this.div;
if(_58.parentNode){
_58.parentNode.removeChild(_58);
}
};
ChessPiece.prototype.setVisible=function(_59){
var _5a;
var _5b;
if(_59){
_5b="block";
_5a="visible";
}else{
_5b="none";
_5a="hidden";
}
YAHOO.util.Dom.setStyle(this.id,"visibility",_5a);
};
ChessPiece.prototype.moveResponse=function(o){
};
ChessPiece.prototype.getIcon=function(){
return this.icon;
};
ChessPiece.prototype.makeHeavyWeight=function(){
return this.copyPiece();
};
ChessPiece.prototype.copyPiece=function(){
var cp=new ChessPiece(this.div,this.colour,this.piece,this.board);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
ChessPiece.prototype.changePiece=function(_5e){
var ua=navigator.userAgent.toLowerCase();
var _60=(ua.indexOf("opera")>-1);
var _61=(_5e+"").toLowerCase().charAt(0);
switch(_61){
case "k":
this.piece=ChessPiece.KING;
break;
case "q":
this.piece=ChessPiece.QUEEN;
break;
case "r":
this.piece=ChessPiece.ROOK;
break;
case "b":
this.piece=ChessPiece.BISHOP;
break;
case "n":
this.piece=ChessPiece.KNIGHT;
break;
case "p":
this.piece=ChessPiece.PAWN;
break;
default:
}
this.icon=get_image_str(ChessPiece.pieceIconNames[this.colour][this.piece],this.board.boardImagePath,this.board.pieceSet,this.board.pieceSize,this.board.addVersion);
if(YAHOO.util.Event.isIE){
var _62=this.div;
_62.innerHTML="<img src=\""+this.icon+"\"/>";
var img=_62.firstChild;
if(!_60){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle(this.div,"backgroundImage","url("+this.icon+")");
YAHOO.util.Dom.setStyle(this.div,"background-repeat","no-repeat");
}
};
ChessPiece.prototype.getNewXYPosition=function(_64,row){
var _66=this.board.getBoardDiv();
var _67=this.board.getXY();
var _68=_67[0];
var _69=_67[1];
var _6a=[0,0];
if(this.board.isFlipped){
_6a[0]=_68+((7-_64)*this.board.pieceSize);
_6a[1]=_69+((row)*this.board.pieceSize);
}else{
_6a[0]=_68+((_64)*this.board.pieceSize);
_6a[1]=_69+((7-row)*this.board.pieceSize);
}
return _6a;
};
ChessPiece.prototype.setPosition=function(_6b,row,_6d,_6e,_6f){
this.column=_6b;
this.row=row;
if(this.board.pieceMoveDisabled){
return;
}
var _70=this.div;
if(!_6d){
if(!this.board.settingUpPosition){
var _71=this.getNewXYPosition(_6b,row);
YAHOO.util.Dom.setXY(_70,_71,false);
}else{
var _72=null;
if(this.board.isFlipped){
_72=this.board.boardName+"-s"+(7-this.column)+""+(7-this.row);
}else{
_72=this.board.boardName+"-s"+(this.column)+""+(this.row);
}
var _73=this.board[_72];
if(_70.parentNode){
_70.parentNode.removeChild(_70);
}
_73.appendChild(_70);
}
this.setVisible(true);
if(_6e){
_6e();
}
}else{
var _71=this.getNewXYPosition(_6b,row);
var _74=new YAHOO.util.Motion(_70,{points:{to:_71}});
_74.duration=_6f;
var _75=this;
_74.onComplete.subscribe(function(){
});
if(_6e){
_74.onComplete.subscribe(_6e);
}
_74.animate();
}
};
LightweightChessPiece=function(div,_77,_78,_79){
this.board=_79;
this.colour=_77;
this.piece=_78;
this.div=div;
};
LightweightChessPiece.prototype.makeLightWeight=function(){
return this.copyPiece();
};
LightweightChessPiece.prototype.makeHeavyWeight=function(){
var cp=this.board.createPiece(this.colour,this.piece,false);
cp.column=this.column;
cp.row=this.row;
cp.enPassant=this.enPassant;
cp.castled=this.castled;
return cp;
};
LightweightChessPiece.prototype.setVisible=function(_7b){
};
LightweightChessPiece.prototype.unreg=function(){
};
LightweightChessPiece.prototype.setPosition=function(_7c,row,_7e,_7f,_80){
this.column=_7c;
this.row=row;
};
LightweightChessPiece.prototype.copyPiece=function(){
var cp=new LightweightChessPiece(this.id,this.colour,this.piece,this.board);
cp.column=this.column;
cp.row=this.row;
return cp;
};
LightweightChessPiece.prototype.changePiece=function(_82){
var _83=(_82+"").toLowerCase().charAt(0);
switch(_83){
case "k":
this.piece=ChessPiece.KING;
break;
case "q":
this.piece=ChessPiece.QUEEN;
break;
case "r":
this.piece=ChessPiece.ROOK;
break;
case "b":
this.piece=ChessPiece.BISHOP;
break;
case "n":
this.piece=ChessPiece.KNIGHT;
break;
case "p":
this.piece=ChessPiece.PAWN;
break;
default:
}
};
MovesDisplay=function(_84,_85){
this.board=_84;
this.displayType=_85;
};
MovesDisplay.DEFAULT_DISPLAY_TYPE=0;
MovesDisplay.MAIN_ON_OWN_LINE=1;
Board=function(_86){
this.boardName=_86;
if(_86){
this.initTarget("ctb-"+_86,"ct-"+this.boardName+"-boardandpieces");
this.boardPieces=Board.createBoardArray();
}
this.settingUpPosition=false;
this.pendingLevelZeroCommentaryClose=false;
this.isUserFlipped=false;
this.registeredUpdateListeners=[];
this.registeredUpdateEndOfMovesListeners=[];
this.registeredUpdateHaveAltListeners=[];
this.registeredUpdateWrongMoveListeners=[];
this.registeredUpdateAllowMoveListeners=[];
};
Board.prototype=new YAHOO.util.DDTarget();
Board.createBoardArray=function(){
var _87=boardPool.getObject();
if(_87==null){
_87=new Array(8);
for(var i=0;i<8;i++){
_87[i]=new Array(8);
}
}
return _87;
};
Board.prototype.toggleToMove=function(){
if(this.toMove==ChessPiece.WHITE){
this.toMove=ChessPiece.BLACK;
}else{
this.toMove=ChessPiece.WHITE;
}
};
Board.prototype.setupPieceDivs=function(){
var _89=this.getBoardDiv();
if(this.availPieceDivs){
for(var i=0;i<32;i++){
if(this.availPieceDivs[i]){
if(this.availPieceDivs[i].parentNode){
this.availPieceDivs[i].parentNode.removeChild(this.availPieceDivs[i]);
}
}
}
}
if(this.pieces){
for(var i=0;i<32;i++){
if(this.pieces[i]){
this.pieces[i].setVisible(false);
this.pieces[i].unreg();
}
}
}
this.availIds=new Array(32);
this.availPieceDivs=new Array(32);
this.pieces=new Array(32);
this.uptoId=0;
this.uptoPiece=0;
};
Board.prototype.getXY=function(){
if(true||!this.board_xy){
this.board_xy=YAHOO.util.Dom.getXY("ctb-"+this.boardName);
}
return this.board_xy;
};
Board.prototype.updateFromTo=function(_8b,_8c,_8d,_8e,_8f,_90){
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
if(_8d==null){
return;
}
this.lastFromSquare=_8b;
this.lastToSquare=_8c;
this.lastFromRow=_8d;
this.lastFromColumn=_8e;
this.lastToRow=_8f;
this.lastToColumn=_90;
if(this.highlightFromTo){
YAHOO.util.Dom.addClass(_8b,"ct-from-square");
YAHOO.util.Dom.addClass(_8c,"ct-to-square");
}
};
Board.prototype.makeMove=function(_91,_92,_93,_94,_95,_96,_97,_98){
var _99;
var _9a;
if(!this.isFlipped){
_99=YAHOO.util.Dom.get(this.boardName+"-s"+_91.fromColumn+""+_91.fromRow);
_9a=YAHOO.util.Dom.get(this.boardName+"-s"+_91.toColumn+""+_91.toRow);
}else{
_99=YAHOO.util.Dom.get(this.boardName+"-s"+(7-_91.fromColumn)+""+(7-_91.fromRow));
_9a=YAHOO.util.Dom.get(this.boardName+"-s"+(7-_91.toColumn)+""+(7-_91.toRow));
}
if(_96){
this.updateFromTo(_99,_9a,_91.fromRow,_91.fromColumn,_91.toRow,_91.toColumn);
}
var _9b=this.boardPieces[_91.toColumn][_91.toRow];
if(_9b!=null){
_9b.enPassant=false;
_9b.castled=false;
}
if(_92.piece==ChessPiece.PAWN&&_91.toColumn!=_91.fromColumn&&this.boardPieces[_91.toColumn][_91.toRow]==null){
_9b=this.boardPieces[_91.toColumn][_91.fromRow];
this.boardPieces[_91.toColumn][_91.fromRow]=null;
if(_9b!=null){
_9b.enPassant=true;
}
}
var _9c=null;
if(_92.piece==ChessPiece.KING&&Math.abs(_91.toColumn-_91.fromColumn)>1){
var _9d;
var _9e;
if(_91.toColumn>_91.fromColumn){
_9c=this.boardPieces[7][_91.fromRow];
_9d=_91.fromRow;
_9e=5;
this.boardPieces[7][_91.toRow]=null;
}else{
_9c=this.boardPieces[0][_91.fromRow];
_9d=_91.fromRow;
_9e=3;
this.boardPieces[0][_91.toRow]=null;
}
if(!_9c){
alert("No castle piece");
}else{
_9c.setPosition(_9e,_9d,_93,null,_94);
this.boardPieces[_9c.column][_9c.row]=_9c;
_9c.castled=true;
}
}
_91.taken=_9b;
if(_9b&&_95){
this.processTaken(_9b,true);
}
this.board_xy=null;
_92.setPosition(_91.toColumn,_91.toRow,_93,function(){
var tp=_9b;
if(tp){
tp.setVisible(false);
}
if(_91.promotion!=null){
_92.changePiece(_91.promotion);
}
if(_97){
_97.call(_98);
}
},_94);
if(!_93){
if(_91.promotion!=null){
_92.changePiece(_91.promotion);
}
}
this.boardPieces[_91.fromColumn][_91.fromRow]=null;
this.boardPieces[_91.toColumn][_91.toRow]=_92;
if(_9c!=null){
_91.taken=_9c;
}
if(_92.piece==ChessPiece.ROOK){
if(_91.fromColumn==0){
this.canCastleQueenSide[_92.colour]=false;
}else{
if(_91.fromColumn==7){
this.canCastleKingSide[_92.colour]=false;
}
}
}else{
if(_92.piece==ChessPiece.KING){
this.canCastleQueenSide[_92.colour]=false;
this.canCastleKingSide[_92.colour]=false;
}
}
};
Board.prototype.promptPromotion=function(_a0,col,row,_a3,_a4){
_a0.prePromotionColumn=_a0.column;
_a0.prePromotionRow=_a0.row;
_a0.setPosition(col,row,false,null,this.moveAnimationLength);
var _a5=this;
var _a6=new YAHOO.widget.Dialog("promotionDialogId",{width:"300px",fixedcenter:true,visible:true,modal:true,close:false,constraintoviewport:true,buttons:[{text:_js("Queen"),handler:function(){
_a6.hide();
_a5.updatePiece(_a0,col,row,_a3,_a4,false,"q");
},isDefault:true},{text:_js("Rook"),handler:function(){
_a6.hide();
_a5.updatePiece(_a0,col,row,_a3,_a4,false,"r");
},isDefault:false},{text:_js("Bishop"),handler:function(){
_a6.hide();
_a5.updatePiece(_a0,col,row,_a3,_a4,false,"b");
},isDefault:false},{text:_js("Knight"),handler:function(){
_a6.hide();
_a5.updatePiece(_a0,col,row,_a3,_a4,false,"n");
},isDefault:false}]});
_a6.setHeader(_js("Select Promotion Piece"));
_a6.setBody("<div></div>");
_a6.render(document.body);
};
Board.prototype.moveToLocale=function(_a7){
if(!_a7||_a7==""){
return _a7;
}
var _a8="";
for(var i=0;i<_a7.length;i++){
var _aa=_a7.charAt(i);
switch(_aa){
case "K":
_aa=_js("K");
break;
case "Q":
_aa=_js("Q");
break;
case "R":
_aa=_js("R");
break;
case "N":
_aa=_js("N");
break;
case "B":
_aa=_js("B");
break;
case "a":
_aa=_js("a");
break;
case "b":
_aa=_js("b");
break;
case "c":
_aa=_js("c");
break;
case "d":
_aa=_js("d");
break;
case "e":
_aa=_js("e");
break;
case "f":
_aa=_js("f");
break;
case "g":
_aa=_js("g");
break;
case "h":
_aa=_js("h");
break;
case "x":
_aa=_js("x");
break;
case "#":
_aa=_js("#");
break;
}
_a8+=_aa;
}
return _a8;
};
Board.prototype.updatePiece=function(_ab,col,row,_ae,_af,_b0,_b1,_b2){
if(_b1){
this.board_xy=null;
if(_ab.prePromotionRow){
_ab.row=_ab.prePromotionRow;
_ab.column=_ab.prePromotionColumn;
}
}
if(_b1==null&&_ab.column==col&&_ab.row==row){
this.board_xy=null;
_ab.setPosition(_ab.column,_ab.row,false,null,this.moveAnimationLength);
if(clog){
console.log("moved piece back to its orig position");
}
return;
}
var _b3=null;
if(this.currentMove){
if(this.currentMove.prev){
_b3=this.currentMove.prev;
}else{
_b3=this.prev_move;
}
}
var _b4="";
if(_b0&&_ab.piece==ChessPiece.PAWN&&(row==7||row==0)){
this.promptPromotion(_ab,col,row,_ae,_af);
return;
}else{
if(_b1!=null){
_b4=_b1;
}
}
var _b5=true;
for(var i=0;i<this.registeredUpdateListeners.length;i++){
var res=this.registeredUpdateListeners[i].updatePieceCallback(_b4,_ab,col,row,_ae,_af,_b0,_b1,_b2,_b3);
if(!res){
_b5=false;
}
}
if(_b5){
if(!this.currentMove||this.currentMove.atEnd){
this.board_xy=null;
_ab.setPosition(_ab.column,_ab.row,false,null,this.moveAnimationLength);
YAHOO.log("already at end of move list");
alert("already at end");
return;
}
move=this.currentMove;
var _b8=null;
if(move.vars&&move.vars.length>0){
var i=0;
for(var i=0;i<move.vars.length;i++){
var _b9=move.vars[i];
if(_b9.fromColumn==_ab.column&&_b9.fromRow==_ab.row&&_b9.toRow==row&&_b9.toColumn==col&&(_b4==""||(_b4==_b9.promotion))){
_b8=_b9;
break;
}
}
}
var _ba=false;
if(move.fromColumn==_ab.column&&move.fromRow==_ab.row&&move.toRow==row&&move.toColumn==col&&(_b4==""||(_b4==move.promotion))){
_ba=true;
}else{
if(_b8&&_b8.mateInMoves==1){
move=_b9;
_ba=true;
}
}
if(_ba){
for(var i=0;i<this.registeredUpdateEndOfMovesListeners.length;i++){
var res=this.registeredUpdateAllowMoveListeners[i].updateAllowMoveCallback(_b4,_ab,col,row,_ae,_af,_b0,_b1,_b2,move);
}
YAHOO.log("Made correct move");
this.makeMove(move,_ab,_af,this.moveAnimationLength,true,true);
var _bb=!_ae&&(this.currentMove&&this.currentMove.next&&!this.currentMove.next.atEnd);
this.setCurrentMove(move.next,false,_bb);
if(this.currentMove.atEnd){
for(var i=0;i<this.registeredUpdateEndOfMovesListeners.length;i++){
var res=this.registeredUpdateEndOfMovesListeners[i].updateEndOfMovesCallback(_b4,_ab,col,row,_ae,_af,_b0,_b1,_b2);
}
}
if(_bb){
opponentMove=this.currentMove;
if(this.currentMove&&this.currentMove.next.atEnd){
this.toggleToMove();
}
this.updatePiece(this.boardPieces[opponentMove.fromColumn][opponentMove.fromRow],opponentMove.toColumn,opponentMove.toRow,true,true,false);
}
}else{
var _bc=_ab.column;
var _bd=_ab.row;
var _be=false;
var _b9=null;
if(_b8&&_b8.isAlt){
_b9=_b8;
_be=true;
}
if(_be){
for(var i=0;i<this.registeredUpdateHaveAltListeners.length;i++){
var res=this.registeredUpdateHaveAltListeners[i].updateHaveAltCallback(_b4,_ab,col,row,_ae,_af,_b0,_b1,_b2,_b9);
}
}
this.board_xy=null;
_ab.setPosition(_ab.column,_ab.row,false,null,this.moveAnimationLength);
if(!_be&&this.canMove(_ab.makeLightWeight(),col,row,_b3,true)){
for(var i=0;i<this.registeredUpdateWrongMoveListeners.length;i++){
var res=this.registeredUpdateWrongMoveListeners[i].updateWrongMoveCallback(_b4,_ab,col,row,_ae,_af,_b0,_b1,_b2,move);
}
}
}
}else{
}
};
Board.prototype.addUpdatePieceListener=function(_bf){
this.registeredUpdateListeners.push(_bf);
};
Board.prototype.addUpdatePieceEndOfMovesListener=function(_c0){
this.registeredUpdateEndOfMovesListeners.push(_c0);
};
Board.prototype.addUpdatePieceHaveAltListener=function(_c1){
this.registeredUpdateHaveAltListeners.push(_c1);
};
Board.prototype.addUpdatePieceAllowMoveListener=function(_c2){
this.registeredUpdateAllowMoveListeners.push(_c2);
};
Board.prototype.addUpdatePieceWrongMoveListener=function(_c3){
this.registeredUpdateWrongMoveListeners.push(_c3);
};
Board.prototype.scoreToShortString=function(_c4){
if(_c4=="draw"){
return "D";
}
if(_c4>=0){
return "M"+_c4;
}else{
return "L"+(-1*_c4);
}
};
Board.prototype.scoreToLongString=function(_c5){
if(_c5=="draw"){
return _js("Draw");
}
if(_c5==0){
return _js("Mate");
}else{
if(_c5>0){
return __js("Mate in {NUMBER_MOVES}",[["NUMBER_MOVES",_c5]]);
}else{
return __js("Lose in {NUMBER_MOVES}",[["NUMBER_MOVES",(-1*_c5)]]);
}
}
};
Board.prototype.egMoveToScoreString=function(_c6){
var _c7=_c6.score;
var _c8=_c6.optimal_score;
var s=this.scoreToShortString(_c7);
var opt=this.scoreToShortString(_c8);
var _cb=this.scoreToLongString(_c7);
var _cc=this.scoreToLongString(_c8);
if(_c7==_c8){
return ["",_cb];
}else{
var _cd="ct-subopt-move-score";
if(_c7=="draw"||_c7<0){
_cd="ct-bad-move-score";
}
return ["<span class=\""+_cd+"\">"+s+"("+opt+")</span>",_cb+"("+_cc+")"];
}
};
Board.prototype.makeShortAlgabraic=function(_ce,_cf,_d0,_d1,_d2){
if(clog){
console.log("fromCol:"+_ce+" fromRow:"+_cf+" toCol:"+_d0+" toRow:"+_d1);
}
var _d3=this.boardPieces[_ce][_cf];
var _d4=_d3.piece;
var _d5=this.pieceTypeToChar(_d4);
var _d6="";
if(_d4==ChessPiece.PAWN){
if(_ce==_d0){
_d6=Move.columnToChar(_ce)+""+(_d1+1);
}else{
_d6=Move.columnToChar(_ce)+"x"+Move.columnToChar(_d0)+""+(_d1+1);
if(!this.boardPieces[_d0][_d1]){
_d6+=" e.p.";
}
}
}else{
if(_d4==ChessPiece.KING){
var _d7=Math.abs(_ce-_d0);
if(_d7==1||_d7==0){
_d6=_d5;
if(this.boardPieces[_d0][_d1]){
_d6+="x";
}
_d6+=Move.columnToChar(_d0)+""+(_d1+1);
}else{
if(_d0==6){
_d6="O-O";
}else{
_d6="O-O-O";
}
}
}else{
var _d8=[];
for(var row=0;row<8;row++){
for(var col=0;col<8;col++){
var cp=this.boardPieces[col][row];
if(cp&&cp.colour==_d3.colour&&cp.piece==_d4&&!(_d3.column==cp.column&&_d3.row==cp.row)){
var _dc=null;
if(this.currentMove){
_dc=this.currentMove.prev;
}
if(this.canMove(cp.makeLightWeight(),_d0,_d1,_dc,true)){
_d8.push(cp);
}
}
}
}
_d6=_d5;
if(_d8.length>0){
var _dd=false;
var _de=false;
for(var i=0;i<_d8.length;i++){
if(_d8[i].row==_cf){
_de=true;
}
if(_d8[i].column==_ce){
_dd=true;
}
}
if(_de||!(_de||_dd)){
_d6+=Move.columnToChar(_ce);
}
if(_dd){
_d6+=""+(_cf+1);
}
}
if(this.boardPieces[_d0][_d1]){
_d6+="x";
}
_d6+=Move.columnToChar(_d0)+""+(_d1+1);
}
}
var _e0="";
var _e1="";
if(_d2){
var _e2=this.cloneBoard();
var _e3=ChessPiece.WHITE;
if(_e2.boardPieces[_d2.fromColumn][_d2.fromRow].colour==ChessPiece.WHITE){
_e3=ChessPiece.BLACK;
}
_e2.makeMove(_d2,_e2.boardPieces[_d2.fromColumn][_d2.fromRow],false,_e2.moveAnimationLength,false,false);
if(!_e2.isKingSafe(_e3,_d2)){
_e0="+";
if(_e2.isKingMated(_e3,_d2)){
_e0="#";
}
}
if(_d2.promotion){
_e1="="+((_d2.promotion+"").toUpperCase());
}
}
_d6+=_e1+_e0;
return _d6;
};
Board.prototype.createMoveFromString=function(_e4){
var _e5=0;
var _e6=false;
var _e7=null;
var _e8=_e4.charCodeAt(_e5++);
var _e9=_e4.charCodeAt(_e5++);
var _ea=_e4.split("|");
var pgn=null;
if(_ea.length>1){
pgn=_ea[1];
_e4=_ea[0];
}else{
_e4=_ea[0];
}
if(_e4.charAt(_e5)=="x"){
_e5++;
_e6=true;
}
var _ec=_e4.charCodeAt(_e5++);
var _ed=_e4.charCodeAt(_e5++);
if(_e5<_e4.length){
_e7=_e4.charAt(_e5);
}
var _ee=new Move(_e8-("a".charCodeAt(0)),_e9-("1".charCodeAt(0)),_ec-("a".charCodeAt(0)),_ed-("1".charCodeAt(0)),_e6,_e7,_e4);
_ee.pgn=pgn;
return _ee;
};
Board.prototype.setForwardBack=function(){
var _ef=YAHOO.util.Dom.get(this.boardName+"-back");
var _f0=YAHOO.util.Dom.get(this.boardName+"-forward");
var end=YAHOO.util.Dom.get(this.boardName+"-end");
var _f2=YAHOO.util.Dom.get(this.boardName+"-start");
if(!this.currentMove){
if(_ef){
_ef.src=this.boardImagePath+"/images/resultset_previous_disabled"+this.getVersString()+".gif";
}
if(_f2){
_f2.src=this.boardImagePath+"/images/disabled_resultset_first"+this.getVersString()+".gif";
}
if(_f0){
_f0.src=this.boardImagePath+"/images/resultset_next_disabled"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/disabled_resultset_last"+this.getVersString()+".gif";
}
return;
}
if(this.currentMove.prev==null){
if(_ef){
_ef.src=this.boardImagePath+"/images/resultset_previous_disabled"+this.getVersString()+".gif";
}
if(_f2){
_f2.src=this.boardImagePath+"/images/disabled_resultset_first"+this.getVersString()+".gif";
}
}else{
if(_ef){
_ef.src=this.boardImagePath+"/images/resultset_previous"+this.getVersString()+".gif";
}
if(_f2){
_f2.src=this.boardImagePath+"/images/resultset_first"+this.getVersString()+".gif";
}
}
if(this.currentMove.atEnd){
if(_f0){
_f0.src=this.boardImagePath+"/images/resultset_next_disabled"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/disabled_resultset_last"+this.getVersString()+".gif";
}
}else{
if(_f0){
_f0.src=this.boardImagePath+"/images/resultset_next"+this.getVersString()+".gif";
}
if(end){
end.src=this.boardImagePath+"/images/resultset_last"+this.getVersString()+".gif";
}
}
};
Board.prototype.convertPiecesFromLightWeight=function(_f3){
var _f4=this.settingUpPosition;
this.settingUpPosition=true;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
if(this.boardPieces[i][j]!=null){
var _f7=this.boardPieces[i][j];
var p=_f7.makeHeavyWeight();
this.boardPieces[i][j]=p;
p.setPosition(p.column,p.row,false,null,this.moveAnimationLength);
p.setVisible(true);
}
}
}
var _f9=this.moveArray[_f3];
while(_f9!=null){
if(_f9.taken){
_f9.taken=_f9.taken.makeHeavyWeight();
}
_f9=_f9.prev;
}
this.settingUpPosition=_f4;
};
MovesDisplay.prototype.setToMove=function(_fa){
this.toMove=_fa;
};
MovesDisplay.prototype.gotoMove=function(e){
if(this.board.tactics&&this.board.tactics.problemActive){
return;
}
var t=e.currentTarget?e.currentTarget:e.targetElement?e.targetElement:false;
if(!t){
t=YAHOO.util.Event.getTarget(e);
}
if(!t.id){
t=t.parentNode;
}
var _fd=t.id.substr((this.board.boardName+"-m").length);
if(clog){
console.log("got goto move index:"+_fd);
}
this.board.gotoMoveIndex(_fd);
if(this.board.problem){
if(this.board.currentMove.bestMoves){
this.board.problem.showBestMoves(this.board.currentMove,this.board.currentMove.bestMoves,this.board.currentMove.correctMove,this.board.currentMove.wrongMove);
}else{
this.board.problem.clearBestMoves();
}
}
};
MovesDisplay.prototype.getMovesDisplay=function(){
if(!this.cachedMovesDisplay&&!this.allreadyCachedMovesDisplay){
this.cachedMovesDisplay=YAHOO.util.Dom.get(this.board.boardName+"-moves");
this.allreadyCachedMovesDisplay=true;
}
return this.cachedMovesDisplay;
};
MovesDisplay.prototype.outputVariationStart=function(_fe,_ff,_100,_101){
var _102="";
if(_ff>this.board.ml){
return _102;
}
if(this.board.ml==1&&_101>1){
return _102;
}
var _103=this.getMovesDisplay();
if(_103){
if(_fe==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
if(this.firstNonMove){
_102+="<div class=\"ct-mainline-commentary\"/>";
this.pendingLevelZeroCommentaryClose=true;
}
}
if(this.variationOnOwnLine){
_102+="<br/>";
}
if(this.board.showBracketsOnVariation){
_102+="<span>( </span>";
}
}
this.firstNonMove=false;
return _102;
};
MovesDisplay.prototype.outputVariationEnd=function(_104,_105,_106,_107){
var _108=this.getMovesDisplay();
var _109="";
if(_105>this.board.ml){
return _109;
}
if(this.board.ml==1&&_107>3){
return _109;
}
if(_108){
if(this.board.showBracketsOnVariation){
_109+="<span>) </span>";
}
}
if(_104==1&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
}
this.firstNonMove=false;
return _109;
};
MovesDisplay.prototype.outputComment=function(_10a,_10b,_10c){
var _10d="";
if(this.board.ml==1){
return _10d;
}
var _10e=this.getMovesDisplay();
if(_10e){
if(_10b==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
if(this.firstNonMove){
_10d+="<br/>";
}
_10d+="<div class=\"ct-mainline-commentary\">";
this.pendingLevelZeroCommentaryClose=true;
}
var _10f="ct-board-move-comment";
if(_10c){
_10f="ct-board-move-alt-comment";
}
_10d+="<span class=\""+_10f+"\"> "+_10a+" </span>";
if(_10b==0&&this.displayType==MovesDisplay.MAIN_ON_OWN_LINE){
}
}
this.firstNonMove=false;
return _10d;
};
MovesDisplay.prototype.outputNag=function(_110){
var _111="";
var _112=this.getMovesDisplay();
if(_112){
var _113=null;
switch(_110){
case 11:
_113="=";
break;
case 14:
_113="+=";
break;
case 15:
_113="=+";
break;
case 16:
_113="+/-";
break;
case 17:
_113="-/+";
break;
case 18:
_113="+-";
break;
case 19:
_113="-+";
break;
case 20:
_113="+--";
break;
case 21:
_113="--+";
break;
default:
}
if(_113){
_111+="<span> "+_113+" </span>";
}
}
return _111;
};
MovesDisplay.prototype.outputResult=function(_114){
return "<span class=\"ct-result\">"+_114+"</span>";
};
MovesDisplay.prototype.outputMove=function(_115,_116,_117,_118,_119,_11a,_11b,move,_11d,_11e){
if(clog){
console.log("outputMove:"+_118+" hideScore:"+_11d);
}
var _11f="";
var _120=this.getMovesDisplay();
if(this.board.tr&&_116>0&&(_11a>1||_11b>3)&&!_119){
return _11f;
}
if(_116>0&&_11a>this.board.ml){
return _11f;
}
if(_116>0&&_11b>3&&this.board.ml==1){
return _11f;
}
if(_120){
var _121=""+Math.round(_117/2)+". ";
if(_117%2!=1){
if(clog){
console.log("firstRav:"+_119+" firstNonMove:"+this.firstNonMove);
}
if(_119||!this.firstNonMove){
_121=Math.round(_117/2)+"... ";
}else{
_121="";
}
}
if(this.displayType==MovesDisplay.MAIN_ON_OWN_LINE&&_116==0&&(!this.firstNonMove||_117%2==1)){
if(this.pendingLevelZeroCommentaryClose){
this.pendingLevelZeroCommentaryClose=false;
_11f+="</div>";
}
if(this.board.newlineForEachMainMove){
_11f+="<br/>";
}
}
var _122="";
var _123="";
if(move&&move.eg_move){
var res=this.board.egMoveToScoreString(move.eg_move);
_122=res[0];
_123=res[1];
}
var _125="";
if(_11d){
_125="initially_hidden";
}
if(_122!=""){
_122=" "+_122;
}
var _126="title";
if(_11d){
_126="alt";
}
var _127="";
if(_11e){
_127=" rel=\""+_118+"\" ";
_118="___";
}
_11f+="<span "+_127+_126+"=\""+_123+"\" id=\""+this.board.boardName+"-m"+_115+"\" class=\""+((_116==0)?"ct-board-move-mainline":"ct-board-move-variation")+"\">"+_121+_118+"<span id=\""+this.board.boardName+"-msc"+_115+"\" class=\""+_125+"\">"+_122+"</span></span>";
}
this.firstNonMove=true;
return _11f;
};
Board.prototype.setMoveSeqLalg=function(_128,_129,_12a,_12b){
if(this.movesDisplay&&this.lastCount){
for(var i=0;i<this.lastCount;i++){
var mv=YAHOO.util.Dom.get(this.boardName+"-m"+i);
if(mv){
YAHOO.util.Event.purgeElement(mv);
}
}
}
var _12e=this.cloneBoard();
this.movesDisplay.firstNonMove=false;
var _12f=new Array();
var _130=new Array();
if(this.prev_move){
_12e.makeMove(this.prev_move,_12e.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],false,_12e.moveAnimationLength,false,false);
}
var _131=_12e.cloneBoard();
var _132=_128.replace(/\s+$/g,"").split(" ");
var _133=null;
var _134=0;
var _135="";
var _136=false;
var _137=false;
var _138=0;
var _139=false;
var _13a=new Array();
var _13b=new Array();
_13b[0]=0;
var _13c=new Array();
var _13d=new Array();
var _13e=_12a*2-1;
var _13f=new Array();
var _140=ChessPiece.WHITE;
var _141=0;
var eval="";
var _143="";
var _144="";
var time="";
var _146=-1;
var _147=0;
for(var i=0;i<_132.length;i++){
var _148=0;
if(_132[i]=="ALT"){
_137=true;
continue;
}
if(_132[i].indexOf("EVAL")==0){
eval=_132[i].split(":")[1];
if(parseInt(eval)>=175&&_138>0&&_13b[_138]>1){
_137=true;
}
continue;
}
if(_132[i].indexOf("DEPTH")==0){
_143=_132[i].split(":")[1];
continue;
}
if(_132[i].indexOf("NODES")==0){
_144=_132[i].split(":")[1];
continue;
}
if(_132[i].indexOf("TIME")==0){
time=_132[i].split(":")[1];
var e=eval;
if(eval.indexOf("mate")!=0){
e=(parseFloat(eval)/100).toFixed(2);
if(e>0){
e="+"+e;
}
}else{
e=e.replace(/_/," ");
var _14a=e.split(" ");
_148=parseInt(_14a[1]);
e=_js("mate")+" "+_14a[1];
if(_13b[_138]==1){
_146=_148;
}
}
_147=_148;
if(_148<0){
_137=false;
}else{
if(_148>0&&_148<8&&_138>0&&_13b[_138]>1){
_137=true;
}
}
var _14b="";
if(_137){
_14b=_js("ALT")+" ";
}
var t=parseInt(time);
var nps=" "+__js("nps:{NODES_PER_SECOND}",[["NODES_PER_SECOND",Math.round(parseInt(_144)/(parseInt(time)/1000))]]);
if(!this.showNPS){
nps="";
}
if(!(_138>0&&_13b[_138]>this.ml)){
_132[i]=_14b+e+" ("+__js("depth:{DEPTH}",[["DEPTH",_143]])+nps+")";
}else{
_132[i]="";
}
}
if(_132[i]=="}"){
_136=false;
if(this.movesDisplay){
_135=_135.replace(/\s+$/g,"");
_13f.push(this.movesDisplay.outputComment(_135,_138,_137));
}
continue;
}else{
if(_136){
_135+=_132[i]+" ";
continue;
}else{
if(_132[i]=="{"){
_135="";
_136=true;
continue;
}else{
if(_132[i]=="("){
if(!_13b[_138+1]){
_13b[_138+1]=0;
}
_13b[_138+1]++;
if(this.movesDisplay){
_13f.push(this.movesDisplay.outputVariationStart(_138,_13b[_138+1],_13e,_13a[0]));
}
_13a[_138]=_13e;
_13c[_138]=_133;
_13d[_138]=_140;
_12f[_138]=_12e;
_130[_138]=_131;
_12e=_131.cloneBoard();
_138++;
_13e--;
_139=true;
continue;
}else{
if(_132[i]==")"){
if(this.movesDisplay){
_13f.push(this.movesDisplay.outputVariationEnd(_138,_13b[_138],_13e,_13a[0]));
}
var _14e=new Move();
_14e.atEnd=true;
_133.next=_14e;
_14e.prev=_133;
_138--;
_13e=_13a[_138];
_133=_13c[_138];
_140=_13d[_138];
_12e=_12f[_138];
_131=_130[_138];
_137=false;
continue;
}else{
if(_132[i].charAt(0)=="$"){
if(this.movesDisplay){
_13f.push(this.movesDisplay.outputNag(parseInt(_132[i].substring(1))));
}
continue;
}
}
}
}
}
}
var move=this.createMoveFromString(_132[i]);
var _150=false;
if(_13e==1&&this.boardPieces[move.fromColumn][move.fromRow].colour==ChessPiece.BLACK){
_13e++;
_150=true;
_140=ChessPiece.BLACK;
}
move.index=_134;
var _151=(move.pgn)?move.pgn:move.moveString;
if(move.pgn){
_151=move.pgn;
}else{
_151=_12e.makeShortAlgabraic(move.fromColumn,move.fromRow,move.toColumn,move.toRow,move);
move.SAN=_151;
}
_151=this.moveToLocale(_151);
if(this.movesDisplay){
this.movesDisplay.setToMove(_140);
_13f.push(this.movesDisplay.outputMove(_134,_138,_13e,_151+" ",_139,_13b[_138],_13a[0]));
}
_140=(_140==ChessPiece.BLACK)?ChessPiece.WHITE:ChessPiece.BLACK;
move.moveNum=_13e;
_13e++;
if(_138>0){
if(_139){
var _152=_133;
if(_152==null){
alert("Got no previous move for variation:"+movesArra[i]);
}
if(_152.numVars==0){
_152.vars=new Array();
}
move.isAlt=_137;
move.mateInMoves=_147;
_152.vars[_152.numVars++]=move;
move.prev=_152.prev;
_139=false;
}else{
move.prev=_133;
if(_133!=null){
_133.next=move;
}
}
}else{
move.prev=_133;
if(_133!=null){
_133.next=move;
}
}
_13b[_138+1]=0;
if(_138==0){
_141=_134;
}
_129[_134++]=move;
_12e.moveArray[_134-1]=move;
_133=move;
_131=_12e.cloneBoard();
_12e.makeMove(move,_12e.boardPieces[move.fromColumn][move.fromRow],false,_12e.moveAnimationLength,false,false);
}
if(this.movesDisplay&&!this.disableMoveOutput){
var _153=this.movesDisplay.getMovesDisplay();
_13f.push(this.movesDisplay.outputResult(_12b));
this.pendingMovesOutput=_13f.join("");
this.pendingMovesOutputCount=_134;
}
this.lastMoveIndex=_141;
if(_133!=null){
var _14e=new Move();
_14e.atEnd=true;
_133.next=_14e;
_14e.prev=_133;
}
this.lastCount=_134;
};
Board.prototype.displayPendingMoveList=function(){
if(this.pendingMovesOutput&&this.movesDisplay){
var _154=this.movesDisplay.getMovesDisplay();
if(_154){
_154.innerHTML=this.pendingMovesOutput;
var _155=new YAHOO.util.Scroll(_154,{scroll:{to:[0,0]}},0);
_155.animate();
}
if(this.movesDisplay){
for(var i=0;i<this.pendingMovesOutputCount;i++){
var mv1=YAHOO.util.Dom.get(this.boardName+"-m"+i);
if(mv1){
YAHOO.util.Event.addListener(mv1,"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
}
}
}
}
};
Board.prototype.setMoveSequence=function(_158,_159,_15a,_15b){
this.tacticMoveArray=new Array();
this.moveArray=this.tacticMoveArray;
this.setMoveSeqLalg(_158,this.tacticMoveArray,_15a,_15b);
this.tacticsmoveArrayLastMoveIndex=this.lastMoveIndex;
if(false&&_159!="NA"){
this.fullmoveArray=new Array();
this.disableMoveOutput=true;
this.setMoveSeqLalg(_159,this.fullmoveArray,_15a,_15b);
this.disableMoveOutput=false;
this.fullmoveArrayLastMoveIndex=this.lastMoveIndex;
}else{
this.fullmoveArray=null;
}
this.lastMoveIndex=this.tacticsmoveArrayLastMoveIndex;
};
Board.prototype.resetVariationsPreviousNodes=function(_15c,_15d){
if(_15c.numVars>0){
for(var i=0;i<_15c.numVars;i++){
_15c.vars[i].prev=_15d;
this.resetVariationsPreviousNodes(_15c.vars[i],_15d);
}
}
};
Board.prototype.reconnectNextNodeVariations=function(_15f,_160){
if(!_160){
return;
}
if(_160.numVars>0){
for(var i=0;i<_160.numVars;i++){
_160.vars[i].prev=_15f;
this.reconnectNextNodeVariations(_15f,_160.vars[i]);
}
}
};
Board.prototype.insertMoveAfter=function(_162,_163,_164,_165,_166,_167){
addToMovelist=!_164;
if(clog){
console.log("addToMovelist:"+addToMovelist);
}
var _168="null";
if(_162){
_168=_162.output();
}
if(clog){
console.log("insert newMove:"+_163.output()+" after:"+_168);
}
if(_162==null){
this.currentMove=_163;
_163.atEnd=1;
_163.prev=null;
_163.next=null;
this.firstMove=_163;
if(this.toMove==ChessPiece.WHITE){
this.currentMove.moveNum=1;
}else{
this.currentMove.moveNum=2;
}
}else{
_163.atEnd=_162.atEnd;
_163.prev=_162;
_162.atEnd=0;
if(clog){
if(_162.next){
console.log("prevMove.next:"+_162.next.output());
}
}
if(_163.equals(_162.next)||_163.equals(_162)){
if(clog){
console.log("inserting move that already exists in variation:"+_162.next.output());
}
var _169=_162.next;
if(this.firstMove==_169){
this.firstMove=_163;
}
if(_163.equals(_162)){
_169=_162;
}
if(_169.prev&&(_169.prev.next==_169)){
_169.prev.next=_163;
}
if(_169.next){
_169.next.prev=_163;
}
addToMovelist=false;
_163.moveNum=_169.moveNum;
_163.ravLevel=_169.ravLevel;
_163.index=_169.index;
_163.fen=_169.fen;
_163.nextFen=_169.nextFen;
_163.bestMoves=_169.bestMoves;
_163.correctMove=_169.correctMove;
_163.wrongMove=_169.wrongMove;
_163.next=_169.next;
_163.vars=_169.vars;
_163.numVars=_169.numVars;
this.reconnectNextNodeVariations(_163,_169.next);
this.moveArray[_163.index]=_163;
if(this.currentMove==_169){
this.setCurrentMove(_163);
}
}else{
_163.moveNum=_162.moveNum+1;
_163.ravLevel=_162.ravLevel;
_163.next=_162.next;
if(_163.next){
_163.next.prev=_163;
}
}
_162.next=_163;
}
if(addToMovelist){
this.insertIntoMoveDisplay(_162,_163,_165,_166,_167);
}
if(_163.next==null){
var _16a=this.createMoveFromString("i1i2");
_163.next=_16a;
_16a.prev=_163;
_16a.moveNum=_163.moveNum+1;
_16a.ravLevel=_163.ravLevel;
_16a.next=null;
_16a.atEnd=1;
_16a.endNode=true;
if(clog){
console.log("created endmove node in insertAfterMove:"+_16a.output());
}
}else{
if(clog){
console.log("allready had a node at end:"+_163.next.output());
}
_163.next.moveNum=_163.moveNum+1;
}
};
function insertAfter(node,_16c){
var _16d=_16c.parentNode;
_16d.insertBefore(node,_16c.nextSibling);
}
Board.prototype.replaceIntoMoveDisplay=function(_16e,_16f,_170,_171,_172){
var _173="null";
if(_16e){
_173=_16e.output();
}
if(clog){
console.log("replace display newMove:"+_16f.output()+" after:"+_173+" hideScore:"+_171);
}
if(!_16e){
if(clog){
console.log("null oldMove");
}
this.insertIntoMoveDisplay(null,_16f,false,_171);
}else{
if(clog){
console.log("about to get movesdsiplay in replace into move display:"+this.movesDisplay);
}
var _174=this.movesDisplay.getMovesDisplay();
if(clog){
console.log("got moves display");
}
if(!_174){
if(clog){
console.log("no movesd disiplay in replace into move display");
}
return;
}
var san=_16f.SAN;
if(!san){
if(clog){
console.log("about to make san");
}
san=this.makeShortAlgabraic(_16f.fromColumn,_16f.fromRow,_16f.toColumn,_16f.toRow,_16f);
if(clog){
console.log("about to made san:"+san);
}
_16f.SAN=san;
}
if(clog){
console.log("oldMove.index:"+_16e.index);
}
var _176=YAHOO.util.Dom.get((this.boardName+"-ms"+_16e.index));
if(_170){
this.moveIndex++;
_16f.index=this.moveIndex;
this.moveArray[this.moveIndex]=_16f;
if(clog){
console.log("replace as variation old:"+_16e.output()+" new:"+_16f.output());
}
var _177=document.createElement("span");
var _178=this.movesDisplay.outputVariationStart(0,0,_16f.moveNum,0);
_16f.ravLevel=_16e.ravlevel+1;
var _173=this.moveToLocale(san);
if(_16f.prev==null){
this.movesDisplay.firstNonMove=false;
}
var _179=this.movesDisplay.outputMove(this.moveIndex,_16f.ravLevel,_16f.moveNum,_173,_170,0,_16f.moveNum,_16f,_171,_172);
var _17a=document.createElement("span");
_17a.id=(this.boardName+"-ms"+_16f.index);
_17a.innerHTML=_179+"&nbsp;";
var _17b=this.movesDisplay.outputVariationEnd(0,0,_16f.moveNum,0);
this.movesDisplay.firstNonMove=true;
var _17c=document.createElement("span");
_17c.innerHTML=_178;
var _17d=document.createElement("span");
_17d.innerHTML=_17b;
_177.appendChild(_17c);
_177.appendChild(_17a);
_177.appendChild(_17d);
_176.appendChild(_177);
}else{
_16f.index=_16e.index;
this.moveArray[_16f.index]=_16f;
var _173=this.moveToLocale(san);
if(_16f.prev==null){
this.movesDisplay.firstNonMove=false;
}
var _179=this.movesDisplay.outputMove(_16f.index,_16f.ravLevel,_16f.moveNum,_173,_170,0,_16f.moveNum,_16f,_171,_172);
var _17a=document.createElement("span");
_17a.innerHTML=_179+"&nbsp;";
_17a.id=(this.boardName+"-ms"+_16f.index);
var _17e=[];
if(_176&&_176.childNodes){
for(var i=1;i<_176.childNodes.length;i++){
_17e[i-1]=_176.childNodes[i];
}
}
if(clog){
console.log("replace as main line not variation old:"+_16e.output()+" new:"+_16f.output());
}
_176.parentNode.replaceChild(_17a,_176);
if(_17e){
for(var i=0;i<_17e.length;i++){
_17a.appendChild(_17e[i]);
}
}
}
YAHOO.util.Event.removeListener(this.boardName+"-m"+_16f.index);
YAHOO.util.Event.addListener((this.boardName+"-m"+_16f.index),"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
}
};
Board.prototype.insertIntoMoveDisplay=function(_180,_181,_182,_183,_184){
var _185=this.movesDisplay.getMovesDisplay();
if(!_185){
return;
}
var _186="null";
if(_180){
_186=_180.output();
}
if(clog){
console.log("insert display newMove:"+_181.output()+" after:"+_186);
}
var san=_181.SAN;
if(!san){
san=this.makeShortAlgabraic(_181.fromColumn,_181.fromRow,_181.toColumn,_181.toRow,_181);
_181.SAN=san;
}
this.moveIndex++;
_181.index=this.moveIndex;
this.moveArray[this.moveIndex]=_181;
var _186=this.moveToLocale(san);
var _188=this.movesDisplay.outputMove(this.moveIndex,_181.ravLevel,_181.moveNum,_186,false,0,_181.moveNum,_181,_183,_184);
var _189=document.createElement("span");
_189.innerHTML=_188+"&nbsp;";
_189.id=(this.boardName+"-ms"+this.moveIndex);
if(_182){
YAHOO.util.Dom.setStyle(_189,"visibility","hidden");
}
if(_180){
if(clog){
console.log("prevMove.index:"+_180.index+"prevMove:"+_180.output());
}
var _18a=YAHOO.util.Dom.get((this.boardName+"-ms"+_180.index));
if(_18a){
insertAfter(_189,_18a);
}else{
_185.appendChild(_189);
}
}else{
if(_181.next){
var _18b=YAHOO.util.Dom.get((this.boardName+"-ms"+_181.next.index));
insertBefore(_189,_18b);
}else{
_185.appendChild(_189);
}
}
YAHOO.util.Event.removeListener(this.boardName+"-m"+this.moveIndex);
YAHOO.util.Event.addListener((this.boardName+"-m"+this.moveIndex),"click",this.movesDisplay.gotoMove,this.movesDisplay,true);
};
Board.prototype.replaceMove=function(_18c,_18d,_18e,_18f,_190,_191){
var _192="null";
if(_18c){
_192=_18c.output();
}
if(clog){
console.log("replace newMove:"+_18d.output()+" after:"+_192+" replace as var"+_18e+" rep move display:"+_18f+" hideScore:"+_190);
if(_18c&&_18c.prev){
console.log("replace oldMove.prev:"+_18c.prev.output());
}
if(_18c&&_18c.next){
console.log("replace oldMove.next:"+_18c.next.output());
}
}
var _193=false;
var _194=null;
var _195=0;
if(_18c.endNode){
if(clog){
console.log("asked to replace endNode,inserting before instead");
}
this.insertMoveAfter(_18c.prev,_18d,false,false,_190,_191);
_18d.fen=_18c.fen;
_18d.nextFen=_18c.nextFen;
return;
}
if(_18d.equals(_18c)){
if(clog){
console.log("new move is same as old move so not replacing as variation");
}
_18e=false;
}else{
if(_18c&&_18c.numVars>0){
for(var i=0;i<_18c.numVars;i++){
var _197=_18c.vars[i];
if(_18d.equals(_197)){
if(clog){
console.log("new move is same as an existing variation varNum:"+i);
console.log("variation:"+_197.output());
if(_197.next){
console.log("variation next:"+_197.next.output());
}
}
_193=true;
_194=_18c;
_18c=_197;
_195=i;
break;
}
}
}
}
if(_18c==null){
if(clog){
console.log("replaced new move with null oldmove");
}
this.currentMove=_18d;
_18d.atEnd=1;
_18d.next=null;
_18d.prev=null;
if(this.startPositionAfterOpponentMove){
_18d.fen=this.startPositionAfterOpponentMove;
_18d.nextFen=null;
}
if(this.toMove==ChessPiece.WHITE){
this.currentMove.moveNum=1;
}else{
this.currentMove.moveNum=2;
}
this.firstMove=_18d;
}else{
var _198=false;
if(_18c&&_18c.prev&&_18c.prev.next!=_18c){
_198=true;
}
if(this.currentMove==_18c&&!_18e){
this.currentMove=_18d;
}
_18d.atEnd=_18c.atEnd;
_18d.prev=_18c.prev;
_18d.next=_18c.next;
_18d.fen=_18c.fen;
_18d.nextFen=_18c.nextFen;
_18d.bestMoves=_18c.bestMoves;
_18d.correctMove=_18c.correctMove;
_18d.wrongMove=_18c.wrongMove;
_18d.moveNum=_18c.moveNum;
_18d.ravLevel=_18c.ravLevel;
_18d.index=_18c.index;
if(_193){
_194.vars[_195]=_18d;
_18d.vars=_18c.vars;
_18d.numVars=_18c.numVars;
this.reconnectNextNodeVariations(_18d,_18c.next);
if(_18c.next){
_18c.next.prev=_18d;
}
this.moveArray[_18d.index]=_18d;
if(clog){
console.log("replacing existing sub variation of main line");
if(_18d.next){
console.log("next of replacement variation:"+_18d.next.output());
}
}
return;
}
if(!_18e){
if(clog){
console.log("not replacing as variation");
}
if(!_198&&_18c.prev){
_18c.prev.next=_18d;
}
if(_18c.next){
_18c.next.prev=_18d;
}
_18d.vars=_18c.vars;
_18d.numVars=_18c.numVars;
this.reconnectNextNodeVariations(_18d,_18c.next);
if(this.firstMove==_18c){
this.firstMove=_18d;
}
this.moveArray[_18d.index]=_18d;
}else{
if(clog){
console.log("replacing as variation");
}
if(_18c.numVars==0){
_18c.vars=new Array();
}
_18c.vars[_18c.numVars++]=_18d;
_18c.atEnd=0;
_18d.next=null;
var _199=this.createMoveFromString("i1i2");
_18d.next=_199;
_199.prev=_18d;
_199.next=null;
_199.atEnd=1;
_199.moveNum=_18d.moveNum+1;
_199.ravLevel=_18d.ravLevel;
_199.endNode=true;
}
}
if(_18f){
this.replaceIntoMoveDisplay(_18c,_18d,_18e,_190,_191);
}
};
Board.prototype.setCurrentMove=function(move,_19b,_19c){
if(this.currentMove!=null&&this.currentMove.prev!=null){
YAHOO.util.Dom.removeClass(this.boardName+"-m"+this.currentMove.prev.index,"ct-board-move-current");
}
this.currentMove=move;
if(this.currentMove!=null&&this.currentMove.prev!=null){
var _19d=this.boardName+"-m"+this.currentMove.prev.index;
if(clog){
console.log("setCurrentMove attempted highlight of id:"+_19d+" for move:"+move.output());
}
var span=YAHOO.util.Dom.get(_19d);
if(span){
var cls=span.className;
YAHOO.util.Dom.addClass(span,"ct-board-move-current");
if(this.autoScrollMoves){
if(!_19c&&cls.indexOf("ct-board-move-variation")==-1){
var _1a0=this.movesDisplay.getMovesDisplay();
if(_1a0){
var y=YAHOO.util.Dom.getY(span)-YAHOO.util.Dom.getY(_1a0);
var _1a2=new YAHOO.util.Scroll(_1a0,{scroll:{by:[0,y]}},this.moveAnimationLength,YAHOO.util.Easing.easeOut);
_1a2.animate();
}
}
}
}
}else{
if(move==null){
if(clog){
console.log("attempted to set current move on null node");
}
}
}
if(!_19b){
this.setForwardBack();
}
};
Board.prototype.getCastlingString=function(_1a3){
var _1a4=_js("None");
if(this.canCastleKingSide[_1a3]){
_1a4="O-O";
}
if(this.canCastleQueenSide[_1a3]){
if(_1a4==_js("None")){
_1a4="O-O-O";
}else{
_1a4+=",O-O-O";
}
}
return _1a4;
};
Board.prototype.updateToPlay=function(){
var _1a5=YAHOO.util.Dom.get("toPlay");
if(_1a5==null){
return;
}
if(this.toMove==ChessPiece.WHITE){
_1a5.src="/images/whiteknight"+this.getVersString()+".gif";
_1a5.alt=_js("White to play");
}else{
_1a5.src="/images/blackknight"+this.getVersString()+".gif";
_1a5.alt=_js("Black to play");
}
var _1a6=YAHOO.util.Dom.get("fenStatus");
if(_1a6){
var _1a7=this.getCastlingString(ChessPiece.BLACK);
var _1a8=this.getCastlingString(ChessPiece.WHITE);
var s="<div><span>"+_js("White Castling: ")+"</span><span>"+_1a8+"</span></div>"+"<div><span>"+_js("Black Castling: ")+"</span><span>"+_1a7+"</span></div>";
_1a6.innerHTML=s;
}
};
Board.prototype.getBoardDiv=function(){
if(!this.boardDiv){
this.boardDiv=YAHOO.util.Dom.get("ctb-"+this.boardName);
}
return this.boardDiv;
};
Board.prototype.getPieceDragDiv=function(){
if(!this.pieceDragDiv){
this.pieceDragDiv=YAHOO.util.Dom.get("pieceDragDiv");
}
return this.pieceDragDiv;
};
Board.prototype.createBoardCoords=function(){
this.coordinatesShown=false;
var _1aa=YAHOO.util.Dom.get(this.boardName+"-fileLabels");
var _1ab=YAHOO.util.Dom.get(this.boardName+"-rankLabels");
if(!_1aa||!_1ab){
return;
}
_1ab.innerHTML="";
_1aa.innerHTML="";
var _1ac=YAHOO.util.Dom.get(this.boardName+"-boardBorder");
if(!this.showCoordinates){
YAHOO.util.Dom.setStyle(_1aa,"display","none");
YAHOO.util.Dom.setStyle(_1ab,"display","none");
var _1ad=0;
YAHOO.util.Dom.setStyle(_1ac,"width",(this.pieceSize*8+_1ad)+"px");
YAHOO.util.Dom.setStyle(_1ac,"height",(this.pieceSize*8+_1ad)+"px");
return;
}
YAHOO.util.Dom.setStyle(_1aa,"display","block");
YAHOO.util.Dom.setStyle(_1ab,"display","block");
var _1ad=15;
var _1ae=0;
if(check_bad_msie()){
_1ae=4;
}
YAHOO.util.Dom.setStyle(_1ac,"width",(this.pieceSize*8+_1ad+_1ae)+"px");
YAHOO.util.Dom.setStyle(_1ac,"height",(this.pieceSize*8+_1ad)+"px");
this.coordinatesShown=true;
for(var i=0;i<8;i++){
var _1b0=document.createElement("div");
YAHOO.util.Dom.setStyle(_1b0,"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_1b0,"width","15px");
YAHOO.util.Dom.setStyle(_1b0,"text-align","center");
YAHOO.util.Dom.setStyle(_1b0,"line-height",this.pieceSize+"px");
if(this.isFlipped){
_1b0.innerHTML=""+(i+1);
}else{
_1b0.innerHTML=""+9-(i+1);
}
_1ab.appendChild(_1b0);
}
for(var i=0;i<9;i++){
var _1b1=document.createElement("span");
YAHOO.util.Dom.setStyle(_1b1,"float","left");
YAHOO.util.Dom.setStyle(_1b1,"height","15px");
if(i==0){
YAHOO.util.Dom.setStyle(_1b1,"width","15px");
YAHOO.util.Dom.setStyle(_1b1,"clear","both");
YAHOO.util.Dom.setStyle(_1b1,"margin-top","-5px");
if(_1ae){
YAHOO.util.Dom.setStyle(_1b1,"margin-left","-3px");
}else{
YAHOO.util.Dom.setStyle(_1b1,"margin-left","-2px");
}
var _1b2="";
if(this.isFlipped){
_1b2="whiteblack-flipper.png";
}else{
_1b2="blackwhite-flipper.png";
}
_1b1.innerHTML="<span><img id=\""+this.boardName+"-flipper\" title=\""+_js("Flip Board")+"\" src=\""+this.boardImagePath+"/images/"+_1b2+"\"/></span>";
YAHOO.util.Event.addListener(this.boardName+"-flipper","click",this.flipBoard,this,true);
}else{
YAHOO.util.Dom.setStyle(_1b1,"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_1b1,"text-align","center");
if(this.isFlipped){
_1b1.innerHTML=_js(Move.columnToChar(8-(i)));
}else{
_1b1.innerHTML=_js(Move.columnToChar((i-1)));
}
}
_1aa.appendChild(_1b1);
}
var _1b3=YAHOO.util.Dom.get(this.boardName+"-flipper");
if(_1b3){
fix_ie_png(_1b3);
}
};
Board.prototype.createBoardUI=function(){
var _1b4=this.boardName+"-container";
var _1b5=YAHOO.util.Dom.get(_1b4);
if(_1b5==null){
alert("Could not find board container:"+_1b4);
return;
}
YAHOO.util.Dom.addClass(_1b5,"ct-board-container");
this.boardDiv=null;
var _1b6=document.createElement("div");
_1b6.id=this.boardName+"-boardBorder";
YAHOO.util.Dom.addClass(_1b6,"ct-board-border"+this.squareColorClass);
var _1b7=0;
if(this.showCoordinates){
_1b7=15;
}
YAHOO.util.Dom.setStyle(_1b6,"width",(this.pieceSize*8+_1b7)+"px");
YAHOO.util.Dom.setStyle(_1b6,"height",(this.pieceSize*8+_1b7)+"px");
var _1b8=document.createElement("div");
YAHOO.util.Dom.setStyle(_1b8,"float","left");
_1b8.id=this.boardName+"-rankLabels";
_1b6.appendChild(_1b8);
var _1b9=document.createElement("div");
YAHOO.util.Dom.addClass(_1b9,"ct-board");
YAHOO.util.Dom.setStyle(_1b9,"width",(this.pieceSize*8)+"px");
YAHOO.util.Dom.setStyle(_1b9,"height",(this.pieceSize*8)+"px");
_1b9.id="ctb-"+this.boardName;
var _1ba="ct-white-square"+this.squareColorClass;
for(var i=7;i>=0;i--){
var _1b8=document.createElement("div");
for(var j=0;j<8;j++){
var _1bd=document.createElement("div");
_1bd.id=this.boardName+"-s"+j+""+i;
this[_1bd.id]=_1bd;
YAHOO.util.Dom.addClass(_1bd,_1ba);
YAHOO.util.Dom.setStyle(_1bd,"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_1bd,"height",this.pieceSize+"px");
var _1be=(((j+1)*(i+1))%19/19*100);
var _1bf=((65-((j+1)*(i+1)))%19/19*100);
YAHOO.util.Dom.setStyle(_1bd,"background-position",_1be+"% "+_1bf+"%");
_1b8.appendChild(_1bd);
_1ba=(_1ba=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
_1ba=(_1ba=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
_1b9.appendChild(_1b8);
}
var _1c0=document.createElement("div");
_1c0.id=this.boardName+"-fileLabels";
_1b6.appendChild(_1b9);
_1b6.appendChild(_1c0);
_1b5.appendChild(_1b6);
this.createBoardCoords();
var _1c1=YAHOO.util.Dom.get(this.boardName+"-ct-nav-container");
if(!_1c1){
_1c1=document.createElement("div");
}else{
_1c1.innerHTML="";
}
_1c1.id=this.boardName+"-ct-nav-container";
if(!this.dontOutputNavButtons){
var _1c2="";
if(!this.problem||!this.problem.isEndgame){
_1c2="<span id=\"playStopSpan\"><img class=\"ct-end\" id=\""+this.boardName+"-end\" src=\""+this.boardImagePath+"/images/resultset_last"+this.getVersString()+".gif\" alt=\""+_js("End position")+"\" title=\""+_js("Go to final position")+"\"/>"+"<img class=\"ct-play\" id=\""+this.boardName+"-play\" src=\""+this.boardImagePath+"/images/control_play_blue"+this.getVersString()+".gif\" alt=\""+_js("Play moves")+"\" title=\""+_js("Play sequence of moves")+"\"/>"+"<img class=\"ct-stop\" id=\""+this.boardName+"-stop\" src=\""+this.boardImagePath+"/images/control_stop_blue"+this.getVersString()+".gif\" alt=\""+_js("Stop playing")+"\" title=\""+_js("Stop playing move sequence")+"\"/></span>";
}
var _1c3="<div class=\"ct-nav-buttons\" id=\""+this.boardName+"-navButtons\"><span id=\"nav-buttons-only\">";
_1c3+="<img class=\"ct-start\" id=\""+this.boardName+"-start\" src=\""+this.boardImagePath+"/images/resultset_first"+this.getVersString()+".gif\" alt=\""+_js("Start position")+"\" title=\""+_js("Go to starting position")+"\"/>"+"<img class=\"ct-back\" id=\""+this.boardName+"-back\" src=\""+this.boardImagePath+"/images/resultset_previous"+this.getVersString()+".gif\" alt=\""+_js("Previous Move")+"\" title=\""+_js("Go back a move")+"\"/>"+"<img class=\"ct-forward\" id=\""+this.boardName+"-forward\" src=\""+this.boardImagePath+"/images/resultset_next"+this.getVersString()+".gif\" alt=\""+_js("Next Move")+"\" title=\""+_js("Go forward a move")+"\"/>"+_1c2;
_1c3+="</span></div>";
_1c1.innerHTML=_1c3;
}
_1b5.appendChild(_1c1);
var body=YAHOO.util.Dom.get("body");
if(body){
YAHOO.util.Dom.setStyle(body,"min-width",((this.pieceSize*8+_1b7)+300+250)+"px");
}
};
Board.prototype.getPieceDiv=function(){
var _1c5=this.getBoardDiv();
var _1c6=document.createElement("div");
this.availPieceDivs[this.uptoId]=_1c6;
this.availIds[this.uptoId]=YAHOO.util.Dom.generateId(_1c6);
YAHOO.util.Dom.setStyle(_1c6,"visibility","hidden");
_1c5.appendChild(_1c6);
this.uptoId++;
return _1c6;
};
Board.prototype.flipToMove=function(_1c7){
return (_1c7=="w")?"b":"w";
};
Board.prototype.pieceCharToPieceNum=function(_1c8){
var _1c9;
switch(_1c8){
case "K":
_1c9=ChessPiece.KING;
break;
case "Q":
_1c9=ChessPiece.QUEEN;
break;
case "R":
_1c9=ChessPiece.ROOK;
break;
case "B":
_1c9=ChessPiece.BISHOP;
break;
case "N":
_1c9=ChessPiece.KNIGHT;
break;
case "P":
_1c9=ChessPiece.PAWN;
break;
}
return _1c9;
};
Board.prototype.pieceTypeToChar=function(_1ca){
switch(_1ca){
case ChessPiece.KING:
return "K";
case ChessPiece.QUEEN:
return "Q";
case ChessPiece.ROOK:
return "R";
case ChessPiece.BISHOP:
return "B";
case ChessPiece.KNIGHT:
return "N";
case ChessPiece.PAWN:
return "P";
}
return "?";
};
Board.prototype.canMoveKnight=function(_1cb,_1cc,_1cd,_1ce){
if(_1cb+2==_1cd&&_1cc+1==_1ce){
return true;
}
if(_1cb+2==_1cd&&_1cc-1==_1ce){
return true;
}
if(_1cb-2==_1cd&&_1cc+1==_1ce){
return true;
}
if(_1cb-2==_1cd&&_1cc-1==_1ce){
return true;
}
if(_1cb+1==_1cd&&_1cc+2==_1ce){
return true;
}
if(_1cb-1==_1cd&&_1cc+2==_1ce){
return true;
}
if(_1cb+1==_1cd&&_1cc-2==_1ce){
return true;
}
if(_1cb-1==_1cd&&_1cc-2==_1ce){
return true;
}
return false;
};
Board.prototype.canMovePawn=function(_1cf,_1d0,_1d1,_1d2,_1d3){
var _1d4=this.boardPieces[_1d1][_1d2];
var _1d5=this.boardPieces[_1cf][_1d0];
if(_1d3){
var _1d6=this.boardPieces[_1d3.toColumn][_1d3.toRow];
if(_1d6.piece==ChessPiece.PAWN){
if(_1d6.colour==ChessPiece.WHITE){
if(_1d3.fromRow==1&&_1d3.toRow==3){
if(_1d1==_1d3.fromColumn&&_1d0==3&&_1d2==2&&(_1cf==_1d1+1||_1cf==_1d1-1)){
return true;
}
}
}else{
if(_1d3.fromRow==6&&_1d3.toRow==4){
if(_1d1==_1d3.fromColumn&&_1d0==4&&_1d2==5&&(_1cf==_1d1+1||_1cf==_1d1-1)){
return true;
}
}
}
}
}
if(_1d4){
if(_1d5.colour==ChessPiece.WHITE){
if((_1cf==_1d1+1||_1cf==_1d1-1)&&(_1d0==_1d2-1)){
return true;
}
}else{
if((_1cf==_1d1+1||_1cf==_1d1-1)&&(_1d0==_1d2+1)){
return true;
}
}
}else{
if(_1cf==_1d1){
if(_1d5.colour==ChessPiece.WHITE){
if(_1d0==1){
if(_1d2==2){
return true;
}else{
if(_1d2==3&&this.boardPieces[_1d1][2]==null){
return true;
}
}
}else{
if(_1d0+1==_1d2){
return true;
}
}
}else{
if(_1d0==6){
if(_1d2==5){
return true;
}else{
if(_1d2==4&&this.boardPieces[_1d1][5]==null){
return true;
}
}
}else{
if(_1d0-1==_1d2){
return true;
}
}
}
}
}
return false;
};
Board.prototype.canMoveStraight=function(_1d7,_1d8,_1d9,_1da,_1db,_1dc){
var _1dd=_1d7;
var _1de=_1d8;
var _1df=0;
var _1e0=0;
if(_1d9>_1d7){
_1df=1;
}else{
if(_1d9<_1d7){
_1df=-1;
}
}
if(_1da>_1d8){
_1e0=1;
}else{
if(_1da<_1d8){
_1e0=-1;
}
}
if(clog){
console.log("deltaRow:"+_1e0+" deltaCol:"+_1df+" fromCol:"+_1d7+" fromRow:"+_1d8+" toCol:"+_1d9+" toRow:"+_1da);
}
if(_1db==ChessPiece.ROOK&&(_1df!=0&&_1e0!=0)){
return false;
}
if(_1db==ChessPiece.BISHOP&&(_1df==0||_1e0==0)){
return false;
}
var _1e1=0;
while(true){
_1e1++;
_1d7+=_1df;
_1d8+=_1e0;
if(_1db==ChessPiece.KING&&_1e1>1){
if(clog){
console.log("king count:"+_1e1+" toCol:"+_1d9+" toRow:"+_1da);
}
if(_1e1!=2){
return false;
}
if(_1e0!=0){
return false;
}
if(!(_1d9==6||_1d9==2)){
return false;
}
if(_1d9==2){
if(this.boardPieces[1][_1d8]||this.boardPieces[2][_1d8]||this.boardPieces[3][_1d8]){
return false;
}
if(!this.canCastleQueenSide[_1dc.colour]){
return false;
}
}else{
if(_1d9==6){
if(this.boardPieces[5][_1d8]||this.boardPieces[6][_1d8]){
if(clog){
console.log("king can't castle intervening piece");
}
return false;
}
if(!this.canCastleKingSide[_1dc.colour]){
if(clog){
console.log("king can't castle king side (made previously invalid) colour:"+_1dc.colour);
}
return false;
}
}else{
if(clog){
console.log("king not in col 2 or 6");
}
return false;
}
}
var _1e2="";
_1e2+=Move.columnToChar(_1dd);
_1e2+=String.fromCharCode("1".charCodeAt(0)+_1de);
_1e2+=Move.columnToChar((_1dd+_1df));
_1e2+=String.fromCharCode("1".charCodeAt(0)+(_1de+_1e0));
var move=this.createMoveFromString(_1e2);
var _1e4=this.boardPieces;
var _1e5=this.toMove;
var _1e6=this.saveCastling();
this.boardPieces=this.copyBoardPieces(true);
this.makeMove(move,this.boardPieces[_1dd][_1de],false,this.moveAnimationLength,false,false);
this.restoreCastling(_1e6);
kingSafe=this.isKingSafe(_1dc.colour,move);
boardPool.putObject(this.boardPieces);
this.boardPieces=_1e4;
_1e4.count--;
this.toMove=_1e5;
if(clog){
console.log("kingSafe1:"+kingSafe);
}
if(!kingSafe){
return false;
}
var _1e2="";
_1e2+=Move.columnToChar(_1dd);
_1e2+=String.fromCharCode("1".charCodeAt(0)+_1de);
_1e2+=Move.columnToChar(_1dd);
_1e2+=String.fromCharCode("1".charCodeAt(0)+_1de);
var move=this.createMoveFromString(_1e2);
var _1e4=this.boardPieces;
var _1e5=this.toMove;
var _1e6=this.saveCastling();
this.boardPieces=this.copyBoardPieces(true);
this.makeMove(move,this.boardPieces[_1dd][_1de],false,this.moveAnimationLength,false,false);
this.restoreCastling(_1e6);
kingSafe=this.isKingSafe(_1dc.colour,move);
boardPool.putObject(this.boardPieces);
this.boardPieces=_1e4;
_1e4.count--;
this.toMove=_1e5;
if(clog){
console.log("kingSafe2:"+kingSafe);
}
if(!kingSafe){
return false;
}
}
if(_1d7==_1d9&&_1d8==_1da){
return true;
}
if(_1d7<0||_1d7>7||_1d8<0||_1d8>7){
return false;
}
if(this.boardPieces[_1d7][_1d8]!=null){
return false;
}
}
};
Board.prototype.canMove=function(_1e7,_1e8,_1e9,_1ea,_1eb){
var _1ec=_1e7.column;
var _1ed=_1e7.row;
if(_1e8>7||_1e8<0||_1e9>7||_1e9<0){
if(clog){
console.log("can't move coz out of bounds");
}
return false;
}
var _1ee=this.boardPieces[_1e8][_1e9];
var _1ef=this.boardPieces[_1ec][_1ed];
if(_1ef==null){
return false;
}
if(_1ee&&_1ee.colour==_1ef.colour){
return false;
}
var _1f0=false;
if(_1e7.piece==ChessPiece.PAWN){
_1f0=this.canMovePawn(_1ec,_1ed,_1e8,_1e9,_1ea);
}else{
if(_1e7.piece==ChessPiece.KNIGHT){
_1f0=this.canMoveKnight(_1ec,_1ed,_1e8,_1e9);
}else{
_1f0=this.canMoveStraight(_1ec,_1ed,_1e8,_1e9,_1e7.piece,_1e7);
}
}
if(clog){
console.log("moveOk:"+_1f0);
}
var _1f1=true;
if(_1f0&&_1eb){
var _1f2="";
_1f2+=Move.columnToChar(_1ec);
_1f2+=String.fromCharCode("1".charCodeAt(0)+_1ed);
_1f2+=Move.columnToChar(_1e8);
_1f2+=String.fromCharCode("1".charCodeAt(0)+_1e9);
var move=this.createMoveFromString(_1f2);
var _1f4=this.boardPieces;
var _1f5=this.toMove;
var _1f6=this.saveCastling();
this.boardPieces=this.copyBoardPieces(true);
if(clog){
console.log("in canMove about to make move:"+move.output()+" fromCol:"+_1ec+" fromRow:"+_1ed);
}
this.makeMove(move,this.boardPieces[_1ec][_1ed],false,this.moveAnimationLength,false,false);
this.restoreCastling(_1f6);
_1f1=this.isKingSafe(_1e7.colour,move);
boardPool.putObject(this.boardPieces);
this.boardPieces=_1f4;
_1f4.count--;
this.toMove=_1f5;
}
return _1f0&&_1f1;
};
Board.prototype.isKingMated=function(_1f7,_1f8){
var _1f9=null;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.piece==ChessPiece.KING&&bp.colour==_1f7){
_1f9=bp;
break;
}
}
}
var _1fd=[[1,0],[1,1],[1,-1],[-1,0],[-1,1],[-1,-1],[0,1],[0,-1],[2,0],[-2,0]];
var bp=_1f9;
for(var k=0;k<_1fd.length;k++){
if(this.canMove(bp,bp.column+_1fd[k][0],bp.row+_1fd[k][1],_1f8,true)){
return false;
}
}
var _1ff=this.getCandidateMoves(_1f7,_1f8,true,true);
if(_1ff.length>0){
return false;
}
return true;
};
Board.prototype.getCandidateMoves=function(_200,_201,_202,_203){
var _204=new Array();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
var _208=[];
if(!bp||bp.colour!=_200){
continue;
}
switch(bp.piece){
case ChessPiece.KING:
if(_203){
continue;
}
_208=[[1,0],[1,1],[1,-1],[-1,0],[-1,1],[-1,-1],[0,1],[0,-1],[2,0],[-2,0]];
break;
case ChessPiece.KNIGHT:
_208=[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
break;
case ChessPiece.BISHOP:
for(var k=0;k<8;k++){
_208.push([1+k,1+k]);
_208.push([1+k,-1-k]);
_208.push([-1-k,1+k]);
_208.push([-1-k,-1-k]);
}
break;
case ChessPiece.QUEEN:
for(var k=0;k<8;k++){
_208.push([1+k,0]);
_208.push([1+k,1+k]);
_208.push([1+k,-1-k]);
_208.push([-1-k,0]);
_208.push([-1-k,1+k]);
_208.push([-1-k,-1-k]);
_208.push([0,-1-k]);
_208.push([0,1+k]);
}
break;
case ChessPiece.ROOK:
for(var k=0;k<8;k++){
_208.push([1+k,0]);
_208.push([-1-k,0]);
_208.push([0,-1-k]);
_208.push([0,1+k]);
}
break;
case ChessPiece.PAWN:
_208=[[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
break;
}
for(var k=0;k<_208.length;k++){
if(this.canMove(bp,bp.column+_208[k][0],bp.row+_208[k][1],_201,true)){
_204.push(new Move(bp.column,bp.row,bp.column+_208[k][0],bp.row+_208[k][1]));
if(_202){
return _204;
}
}
}
}
}
return _204;
};
Board.prototype.isKingSafe=function(_20a,_20b){
var _20c=null;
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.piece==ChessPiece.KING&&bp.colour==_20a){
_20c=bp;
break;
}
}
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var bp=this.boardPieces[i][j];
if(bp!=null&&bp.colour!=_20a){
if(this.canMove(bp,_20c.column,_20c.row,_20b,false)){
return false;
}
}
}
}
return true;
};
Board.prototype.cloneBoard=function(){
var _210=new Board();
_210.boardPieces=this.copyBoardPieces(true);
_210.moveArray=this.copyMoveArray();
_210.canCastleQueenSide=this.copyCastleQueenSide();
_210.canCastleKingSide=this.copyCastleKingSide();
_210.toMove=this.toMove;
_210.opponentColour=this.opponentColour;
_210.isFlipped=this.isFlipped;
_210.isUserFlipped=this.isUserFlipped;
_210.ignoreFlipping=this.ignoreFlipping;
_210.reverseFlip=this.reverseFlip;
_210.moveAnimationLength=this.moveAnimationLength;
return _210;
};
Board.prototype.copyCastleQueenSide=function(){
return [this.canCastleQueenSide[0],this.canCastleQueenSide[1]];
};
Board.prototype.copyCastleKingSide=function(){
return [this.canCastleKingSide[0],this.canCastleKingSide[1]];
};
Board.prototype.copyMoveArray=function(){
var _211=new Array();
if(this.moveArray.length>0){
_211=this.moveArray.slice(0);
}
return _211;
};
Board.prototype.copyBoardPieces=function(_212){
var _213=Board.createBoardArray();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
if(this.boardPieces[i][j]!=null){
if(_212){
_213[i][j]=this.boardPieces[i][j].makeLightWeight();
}else{
_213[i][j]=this.boardPieces[i][j].copyPiece();
}
}else{
_213[i][j]=null;
}
}
}
return _213;
};
Board.prototype.createPiece=function(_216,_217,_218){
if(_218){
return new LightweightChessPiece(null,_216,_217,this);
}else{
return new ChessPiece(this.getPieceDiv(),_216,_217,this);
}
};
Board.prototype.restoreCastling=function(_219){
this.canCastleKingSide=_219.kingSide;
this.canCastleQueenSide=_219.queenSide;
};
Board.prototype.saveCastling=function(){
var _21a=[this.canCastleQueenSide[0],this.canCastleQueenSide[1]];
var _21b=[this.canCastleKingSide[0],this.canCastleKingSide[1]];
return {queenSide:_21a,kingSide:_21b};
};
Board.prototype.setupFromFen=function(fen,_21d,flip,_21f){
this.settingUpPosition=true;
var ua=navigator.userAgent.toLowerCase(),_221=(ua.indexOf("opera")>-1),_222=(ua.indexOf("safari")>-1),_223=(!_221&&!_222&&ua.indexOf("gecko")>-1),isIE=(!_221&&ua.indexOf("msie")>-1);
var _225=fen.split(" ");
var _226=_225[0].split("/");
var _227=0;
var row=8;
this.uptoId=0;
this.board_xy=null;
var _229=_225[2];
this.canCastleQueenSide=[false,false];
this.canCastleKingSide=[false,false];
if(_229!="-"){
if(_229.indexOf("K")>=0){
this.canCastleKingSide[ChessPiece.WHITE]=true;
}
if(_229.indexOf("Q")>=0){
this.canCastleQueenSide[ChessPiece.WHITE]=true;
}
if(_229.indexOf("k")>=0){
this.canCastleKingSide[ChessPiece.BLACK]=true;
}
if(_229.indexOf("q")>=0){
this.canCastleQueenSide[ChessPiece.BLACK]=true;
}
}
if(_225[1]=="w"){
this.toMove=ChessPiece.WHITE;
this.opponentColour=ChessPiece.WHITE;
this.isFlipped=false;
}else{
this.toMove=ChessPiece.BLACK;
this.opponentColour=ChessPiece.BLACK;
this.isFlipped=true;
}
if(_21d){
this.toMove=(ChessPiece.BLACK==this.toMove)?ChessPiece.WHITE:ChessPiece.BLACK;
this.isFlipped=!this.isFlipped;
}
if(flip){
this.isFlipped=true;
}
if(this.reverseFlip){
this.isFlipped=!this.isFlipped;
}
if(this.ignoreFlipping){
this.isFlipped=false;
}
if(this.isUserFlipped){
this.isFlipped=!this.isFlipped;
}
this.updateToPlay();
this.setupPieceDivs();
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
this.boardPieces[i][j]=null;
}
}
for(var i=0;i<8;i++){
var line=_226[i];
row--;
_227=0;
for(var j=0;j<line.length;j++){
var c=line.charAt(j);
var code=line.charCodeAt(j);
var num=code-"0".charCodeAt(0);
if(num>0&&num<9){
while(num--){
var _230=this.boardPieces[_227][row];
this.boardPieces[_227][row]=null;
_227++;
}
}else{
var _231=(c+"").toLowerCase().charAt(0);
var _232=ChessPiece.WHITE;
if(_231==c){
_232=ChessPiece.BLACK;
}
var cp;
switch(_231){
case "k":
cp=this.createPiece(_232,ChessPiece.KING,_21f);
break;
case "q":
cp=this.createPiece(_232,ChessPiece.QUEEN,_21f);
break;
case "r":
cp=this.createPiece(_232,ChessPiece.ROOK,_21f);
break;
case "b":
cp=this.createPiece(_232,ChessPiece.BISHOP,_21f);
break;
case "n":
cp=this.createPiece(_232,ChessPiece.KNIGHT,_21f);
break;
case "p":
cp=this.createPiece(_232,ChessPiece.PAWN,_21f);
break;
default:
}
if(_223||_221){
cp.setPosition(_227,row,false,null,this.moveAnimationLength);
cp.setVisible(true);
}
this.boardPieces[_227][row]=cp;
this.pieces[this.uptoPiece]=cp;
this.pieces[this.uptoPiece].column=_227;
this.pieces[this.uptoPiece].row=row;
this.uptoPiece++;
_227++;
}
}
}
if(!_223){
for(var i=0;i<this.uptoPiece;i++){
this.pieces[i].setPosition(this.pieces[i].column,this.pieces[i].row,false,null,0);
}
}
if(!_21f){
for(var i=0;i<this.uptoPiece;i++){
this.pieces[i].setVisible(true);
}
}
this.createBoardCoords();
this.settingUpPosition=false;
};
Board.prototype.resetMoveListScrollPosition=function(){
var _234=this.movesDisplay.getMovesDisplay();
if(_234){
var _235=new YAHOO.util.Scroll(_234,{scroll:{to:[0,0]}},0);
_235.animate();
}
};
Board.prototype.changePieceSet=function(_236,_237){
var ua=navigator.userAgent.toLowerCase();
var _239=(ua.indexOf("opera")>-1);
if(!this.showedIE6Warning){
alert(_js("Depending on your browser you may need to reload the\n page for piece size changes to properly take effect."));
}
this.showedIE6Warning=true;
if(check_bad_msie()){
if(!this.showedIE6Warning){
alert(_js("Internet Explorer version 6 does not support dynamic piece size changes.\n Please reload page to view new settings."));
}
this.showedIE6Warning=true;
return;
}
var _23a=this.pieceSize;
this.pieceSet=_236;
this.pieceSize=_237;
var _23b=YAHOO.util.Dom.get(this.boardName+"-boardBorder");
var _23c=0;
if(this.showCoordinates){
_23c=15;
}
_23b.className="";
YAHOO.util.Dom.addClass(_23b,"ct-board-border"+this.squareColorClass);
YAHOO.util.Dom.setStyle(_23b,"width",(this.pieceSize*8+_23c)+"px");
YAHOO.util.Dom.setStyle(_23b,"height",(this.pieceSize*8+_23c)+"px");
var _23d=YAHOO.util.Dom.get("ctb-"+this.boardName);
YAHOO.util.Dom.setStyle(_23d,"width",(this.pieceSize*8)+"px");
YAHOO.util.Dom.setStyle(_23d,"height",(this.pieceSize*8)+"px");
var _23e="ct-white-square"+this.squareColorClass;
for(var i=7;i>=0;i--){
for(var j=0;j<8;j++){
var _241=this[this.boardName+"-s"+j+""+i];
_241.className="";
YAHOO.util.Dom.addClass(_241,_23e);
YAHOO.util.Dom.setStyle(_241,"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle(_241,"height",this.pieceSize+"px");
var _242=(((j+1)*(i+1))%19/19*100);
var _243=((65-((j+1)*(i+1)))%19/19*100);
YAHOO.util.Dom.setStyle(_241,"background-position",_242+"% "+_243+"%");
_23e=(_23e=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
_23e=(_23e=="ct-black-square"+this.squareColorClass)?"ct-white-square"+this.squareColorClass:"ct-black-square"+this.squareColorClass;
}
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var cp=this.boardPieces[i][j];
if(cp){
cp.icon=get_image_str(ChessPiece.pieceIconNames[cp.colour][cp.piece],cp.board.boardImagePath,cp.board.pieceSet,cp.board.pieceSize,cp.board.addVersion);
if(YAHOO.util.Event.isIE){
var _245=cp.div;
_245.innerHTML="<img src=\""+cp.icon+"\"/>";
var img=_245.firstChild;
if(!_239){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle([cp.div],"backgroundImage","url("+cp.icon+")");
YAHOO.util.Dom.setStyle([cp.div],"background-repeat","no-repeat");
}
YAHOO.util.Dom.setStyle([cp.div],"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"left","");
YAHOO.util.Dom.setStyle([cp.div],"top","");
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
}
if(this.moveArray){
var move=this.moveArray[0];
while(move!=null){
if(move.taken){
var cp=move.taken;
if(cp.getNewXYPosition){
cp.icon=get_image_str(ChessPiece.pieceIconNames[cp.colour][cp.piece],cp.board.boardImagePath,cp.board.pieceSet,cp.board.pieceSize,cp.board.addVersion);
if(YAHOO.util.Event.isIE){
var _245=cp.div;
_245.innerHTML="<img src=\""+cp.icon+"\"/>";
YAHOO.util.Dom.setStyle([cp.div],"position","relative");
var img=_245.firstChild;
if(!_239){
fix_ie_png(img);
}
}else{
YAHOO.util.Dom.setStyle([cp.div],"backgroundImage","url("+cp.icon+")");
YAHOO.util.Dom.setStyle([cp.div],"background-repeat","no-repeat");
}
YAHOO.util.Dom.setStyle([cp.div],"height",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"width",this.pieceSize+"px");
YAHOO.util.Dom.setStyle([cp.div],"left","");
YAHOO.util.Dom.setStyle([cp.div],"top","");
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
move=move.next;
}
}
var body=YAHOO.util.Dom.get("body");
if(body){
YAHOO.util.Dom.setStyle(body,"min-width",((this.pieceSize*8+_23c)+300+250)+"px");
}
this.createBoardCoords();
};
Board.prototype.forwardMove=function(e){
if(this.blockFowardBack||this.deferredBlockForwardBack){
if(clog){
console.log("returning early from forward due to block forward on");
}
return;
}
var _24b=false;
if(this.tactics&&this.tactics.problemActive){
return;
}
this.blockForwardBack=true;
if(this.currentMove&&!this.currentMove.atEnd){
move=this.currentMove;
if(move){
if(clog){
console.log("forward move:"+move.output());
}
}else{
if(clog){
console.log("forward move with currentmove null");
}
}
if(move.endNode){
if(clog){
console.log("calling processendgame from forward move");
}
if(!_24b){
this.problem.processEndgame("",true);
}
this.toggleToMove();
this.updateToPlay();
}else{
if(clog){
console.log("forwarding move:"+move.output());
}
var _24c=null;
piece=this.boardPieces[move.fromColumn][move.fromRow];
if(move.promotion){
_24c=move.promotion;
piece.prePromotionColumn=null;
piece.prePromotionRow=null;
}
this.updatePiece(piece,move.toColumn,move.toRow,true,true,false,_24c,true);
this.toggleToMove();
this.updateToPlay();
var _24d=this.currentMove;
if(this.problem&&_24d){
var _24e=false;
if(_24d.bestMoves){
if(_24d.bestMoves.length>0){
var bm=_24d.bestMoves[0];
if(bm.score!="draw"&&bm.score==0){
if(clog){
console.log("move is mate");
}
_24e=true;
}
}else{
_24e=true;
}
}
if(_24e&&_24d.endNode){
this.problem.clearBestMoves();
}else{
this.problem.showBestMoves(_24d,_24d.bestMoves,_24d.correctMove,_24d.wrongMove);
}
}
}
}else{
if(clog){
console.log("already at end");
}
}
this.blockForwardBack=false;
};
Board.prototype.setupEventHandlers=function(){
this.timesLostFocus=0;
YAHOO.util.Event.addListener(document,"blur",this.lostFocus,this,true);
YAHOO.util.Event.addListener(document,"keydown",function(e){
var _251=(e.target)?e.target:e.srcElement;
if(_251.form){
return true;
}
switch(YAHOO.util.Event.getCharCode(e)){
case 37:
this.backMove();
break;
case 39:
this.forwardMove();
break;
default:
}
return true;
},this,true);
YAHOO.util.Event.addListener(this.boardName+"-forward","click",this.forwardMove,this,true);
YAHOO.util.Event.addListener(this.boardName+"-back","click",this.backMove,this,true);
YAHOO.util.Event.addListener(this.boardName+"-start","click",this.gotoStart,this,true);
YAHOO.util.Event.addListener(this.boardName+"-end","click",this.gotoEnd,this,true);
YAHOO.util.Event.addListener(this.boardName+"-play","click",this.playMoves,this,true);
YAHOO.util.Event.addListener(this.boardName+"-stop","click",this.stopPlayingMoves,this,true);
};
Board.prototype.flipBoard=function(){
this.isUserFlipped=!this.isUserFlipped;
this.isFlipped=!this.isFlipped;
this.redrawBoard();
};
Board.prototype.lostFocus=function(){
this.timesLostFocus++;
};
Board.prototype.redrawBoard=function(){
for(var i=0;i<8;i++){
for(var j=0;j<8;j++){
var cp=this.boardPieces[i][j];
if(cp){
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
}
if(this.moveArray){
var move=this.moveArray[0];
while(move!=null){
if(move.taken){
var cp=move.taken;
if(cp.getNewXYPosition){
var xy=cp.getNewXYPosition(cp.column,cp.row);
YAHOO.util.Dom.setXY(cp.div,xy,false);
}
}
move=move.next;
}
}
this.createBoardCoords();
if(this.highlightFromTo){
if(!this.isFlipped){
var _257=YAHOO.util.Dom.get(this.boardName+"-s"+this.lastFromColumn+""+this.lastFromRow);
var _258=YAHOO.util.Dom.get(this.boardName+"-s"+this.lastToColumn+""+this.lastToRow);
}else{
var _257=YAHOO.util.Dom.get(this.boardName+"-s"+(7-this.lastFromColumn)+""+(7-this.lastFromRow));
var _258=YAHOO.util.Dom.get(this.boardName+"-s"+(7-this.lastToColumn)+""+(7-this.lastToRow));
}
this.updateFromTo(_257,_258,this.lastFromRow,this.lastFromColumn,this.lastToRow,this.lastToColumn);
}
};
Board.prototype.gotoMoveIndex=function(_259,_25a){
var _25b=this.boardName+"-piecestaken";
var _25c=YAHOO.util.Dom.get(_25b);
if(_25c){
_25c.innerHTML="";
}
if(_259==-1){
var flip=false;
if(this.prev_move){
flip=true;
}
this.setupFromFen(this.startFen,flip,false,false);
if(this.prev_move){
this.makeMove(this.prev_move,this.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],true,this.moveAnimationLength,true,true);
this.updateToPlay();
}
if(this.moveArray&&this.moveArray.length>0){
this.setCurrentMove(this.moveArray[0],_25a);
}else{
this.setCurrentMove(this.firstMove,_25a);
}
if(!_25a){
this.setForwardBack();
}
return;
}
var _25e=new Array();
var move=this.moveArray[_259];
if(clog&&move){
console.log("gotomoveindex move:"+move.output());
if(move.next){
console.log("gotomoveindex move.next:"+move.next.output());
}
if(move.prev){
console.log("gotomoveindex move.next:"+move.prev.output());
}
}
var _260=0;
if(move.next!=null){
this.setCurrentMove(move.next,_25a);
}else{
if(clog){
console.log("move next null with move:"+move.output());
}
}
while(move!=null){
_25e[_260++]=move;
move=move.prev;
}
var flip=false;
if(this.prev_move){
flip=true;
}
this.setupFromFen(this.startFen,flip,false,true);
if(this.prev_move){
if(clog){
console.log("gotomoveindex prev_move:"+this.prev_move.output());
}
this.makeMove(this.prev_move,this.boardPieces[this.prev_move.fromColumn][this.prev_move.fromRow],false,this.moveAnimationLength,true,true);
this.updateToPlay();
}
for(var i=_260-1;i>=1;i--){
var move=_25e[i];
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],false,this.moveAnimationLength,true,true);
this.toggleToMove();
}
if(!_25a){
this.convertPiecesFromLightWeight(_259);
}
var move=_25e[0];
this.makeMove(move,this.boardPieces[move.fromColumn][move.fromRow],true,this.moveAnimationLength,true,true);
this.toggleToMove();
this.updateToPlay();
if(!_25a){
this.setForwardBack();
}
};
Board.prototype.gotoStart=function(e){
this.gotoMoveIndex(-1);
if(this.problem){
if(this.currentMove.bestMoves){
this.problem.showBestMoves(this.currentMove,this.currentMove.bestMoves,this.currentMove.correctMove,this.currentMove.wrongMove);
}else{
this.problem.clearBestMoves();
}
}
};
Board.prototype.gotoEnd=function(e){
if(this.tactics&&this.tactics.problemActive){
this.tactics.autoForward=false;
this.tactics.markProblem(false,false,"NULL","NULL");
}
this.gotoMoveIndex(this.lastMoveIndex);
};
Board.prototype.playMove=function(self){
if(!self.keepPlayingMoves||!self.currentMove.next){
var play=YAHOO.util.Dom.get(this.boardName+"-play");
play.src=this.boardImagePath+"/images/control_play_blue"+this.getVersString()+".gif";
self.keepPlayingMoves=false;
return;
}
self.forwardMove();
setTimeout(function(){
self.playMove(self);
},self.pauseBetweenMoves);
};
Board.prototype.getVersString=function(){
var _266=".vers"+SITE_VERSION;
if(!this.addVersion){
_266="";
}
return _266;
};
Board.prototype.playMoves=function(e){
this.keepPlayingMoves=true;
var play=YAHOO.util.Dom.get(this.boardName+"-play");
play.src=this.boardImagePath+"/images/disabled_control_play_blue"+this.getVersString()+".gif";
this.playMove(this);
};
Board.prototype.stopPlayingMoves=function(e){
this.keepPlayingMoves=false;
};
Board.prototype.backMove=function(e){
if(this.blockFowardBack||this.deferredBlockForwardBack){
return;
}
if(this.tactics){
if(this.tactics.problemActive){
return;
}
}
this.blockForwardBack=true;
YAHOO.util.Dom.removeClass(this.lastFromSquare,"ct-from-square");
YAHOO.util.Dom.removeClass(this.lastToSquare,"ct-to-square");
this.lastFromRow=null;
if(this.currentMove&&this.currentMove.prev!=null){
this.toggleToMove();
this.updateToPlay();
move=this.currentMove.prev;
if(move){
if(clog){
console.log("backwards moving to prev move:"+move.output()+" from current move:"+this.currentMove.output());
}
}
this.setCurrentMove(move);
piece=this.boardPieces[move.toColumn][move.toRow];
if(!piece){
if(clog){
console.log("got empty piece in backMove");
}
}
takenPiece=move.taken;
this.board_xy=null;
piece.setPosition(move.fromColumn,move.fromRow,true,null,this.moveAnimationLength);
this.boardPieces[move.fromColumn][move.fromRow]=piece;
if(move.promotion){
piece.changePiece("p");
}
piece.setVisible(true);
var _26b=false;
if(piece.piece==ChessPiece.KING&&Math.abs(move.fromColumn-move.toColumn)>1){
_26b=true;
}
if(takenPiece&&!_26b){
this.board_xy=null;
var _26c=move.toColumn;
var _26d=move.toRow;
if(piece.piece==ChessPiece.PAWN&&move.fromColumn!=move.toColumn&&takenPiece.enPassant){
_26d=move.fromRow;
this.boardPieces[move.toColumn][move.toRow]=null;
}
takenPiece.setPosition(_26c,_26d,false,null,this.moveAnimationLength);
this.boardPieces[_26c][_26d]=takenPiece;
move.taken=null;
this.processTaken(takenPiece,false);
}else{
this.boardPieces[move.toColumn][move.toRow]=null;
}
if(_26b){
var _26e=move.toRow;
var _26f;
var _270;
if(move.fromColumn>move.toColumn){
_26f=0;
_270=3;
}else{
_26f=7;
_270=5;
}
var _271=this.boardPieces[_270][_26e];
_271.setPosition(_26f,_26e,true,null,this.moveAnimationLength);
this.boardPieces[_26f][_26e]=_271;
}
if(move!=null&&move.prev!=null&&move.prev.next!=move){
move=move.prev.next;
if(clog){
if(move){
console.log("moving backwards out of variation moving to:"+move.output());
}else{
console.log("jumping out of variation to null move");
}
}
}
if(this.problem&&this.problem.isEndgame){
if(this.currentMove){
if(this.currentMove.bestMoves){
var cm=this.currentMove;
this.problem.showBestMoves(cm,cm.bestMoves,cm.correctMove,cm.wrongMove);
}
}else{
if(this.problem.initialBestMoves){
this.problem.showBestMoves(this.currentMove,this.problem.initialBestMoves,null,null);
}
}
}
this.setCurrentMove(move);
this.setForwardBack();
}
this.blockForwardBack=false;
};
Board.prototype.processTaken=function(_273,_274){
var _275=this.boardName+"-piecestaken";
var _276=YAHOO.util.Dom.get(_275);
if(_276){
if(_274){
var _277=get_image_str(ChessPiece.pieceIconNames[_273.colour][_273.piece],this.boardImagePath,this.pieceSet,this.pieceTakenSize,this.addVersion);
_276.innerHTML=_276.innerHTML+"<img src=\""+_277+"\"/>";
}else{
var _278=_276.innerHTML.split("<");
_276.innerHTML="";
for(var i=1;i<_278.length-1;i++){
_276.innerHTML=_276.innerHTML+"<"+_278[i];
}
}
}
};
Pool=function(){
this.pool=new Array();
this.count=-1;
this.numGot=0;
this.numPut=0;
};
Pool.prototype.getObject=function(){
var o=null;
if(this.count>=0){
this.numGot++;
o=this.pool[this.count--];
}
return o;
};
Pool.prototype.putObject=function(o){
if(o!=null){
this.numPut++;
this.pool[++this.count]=o;
}
};
var boardPool=new Pool();

