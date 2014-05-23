var fs = require('fs')
var url = require('url')

var request = require('request')
var co = require('co')

var config ={
  url: {
    randomuser: 'http://api.randomuser.me/',
    uifaces: 'http://uifaces.com/api/v1/random'
  }
}

var amount = 5;
// var amount = {
//   male: 3,
//   female: 2
// }

function errHandler( msg ){
  console.log( msg );
}

function getOneFace( url ){
  return function( fn ){
    request.get( url, fn )
  }
}

function callback( data ){
  // 判断是否执行成功
  if( data ){
    var res = data[0], body = data[1];
    // 请求发送成功 http状态码200
    if( res.statusCode === 200 ){
      // console.log( typeof body )
      return JSON.parse(body).results;
    }
    else{
      errHandler( 'getOneFace got wrong statusCode: ' + res.statusCode )
    }
  }
  else{
    errHandler( 'getOneFace function got error...' )
  }
  return false;
}

function writeJSON( results ){
  return function( fn ){
    if( results ){
      // console.log( results.length )
      fs.writeFile( './default.JSON', JSON.stringify(results), fn )
    }
    else{
      return false;
    }
  }
}

/* --------------- it works~ ------------
co( function*(){
  var data = yield getOneFace( 'http://api.randomuser.me/?results=20')
  // data is an array: [ response, body ],
  // just like original request.get callback param,
  // with no err
  var retults = callback( data )

  // console.log( retults )
  var wresult = yield writeJSON( retults )
  console.log( wresult? 'err occured when writeJSON': 'done' )
} )()
 ----------------------------------- */

/*
 * source: randomuser or uifaces
 * amountObj: { male: 1,female:1 }
 * 
 */ 
 

function getFaces( source, amount ){
  var url = config.url[ source ];
  switch( url ){
    case 'randomuser':
        if( typeof amount == 'number' ){

        }
        else if( typeof amount == 'object' ){

        }
  }
}

function getRandomFaces( amount ){
  var baseUrl = config.url.randomuser;
  if( typeof amount == 'number' ){
    baseUrl += '?results='+amount;
    return co(function*(){
      var data = yield getOneFace( baseUrl )
      var results = callback( data )
      var wresult = yield writeJSON( results )
      console.log( wresult? 'err occured when writeJSON': 'done' )
    })()
  }
  else if( typeof amount == 'object' ){
   
    var maleUrl = baseUrl + url.format( {query:{results:amount.male, gender: 'male'}} );
    var femaleUrl = baseUrl + url.format( {query:{results:amount.female, gender: 'female'}} );
    var urlArr = [ maleUrl, femaleUrl ];

    return co(function*(){
      // 并行执行 一个thunk的arr
      var reqs = urlArr.map( function(r){
        return getOneFace( r )
      } )
      // yield这个异步请求array
      // 多个并行执行的异步请求都完成后才会yield完成, dataArr赋值
      var dataArr = ( yield reqs ).map(function(r){
        return r;
      })
      
      var resultObj = {};
      // 但是为什么返回的数据不一样了~? 跟单个的request
      // 单个:  返回[ res, body ]  这样的arr
      // 多个并行: 返回 arr 里面的元素是对象, 
      // 什么样的对象呢? res对象 + body作为该对象的一个属性
      // 即:
      // {
      //   res-key1: foo,
      //   res-key2: bar,
      //   res-key3: baz,
      //   ...
      //   body: body
      // }
      dataArr.forEach( function(d){
        if( d && d.statusCode == 200 ){
          // for( var key in d.req ){
          //   console.log( key );
          // }

          if( d.req.path.indexOf('female') >=0 ){
            resultObj.female = JSON.parse(d.body).results
          }
          else{
            resultObj.male = JSON.parse(d.body).results
          }
        }
      } )

      var wresult = yield writeJSON( resultObj )
      console.log( wresult? 'err occured when writeJSON': 'done' )
    })()
  }
}


getRandomFaces( amount )


