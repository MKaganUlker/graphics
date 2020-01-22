"use strict";

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];
var scoreL;
var scoreR;

var vertices = [
      vec4( -0.1, -0.1,  0.5, 1.0 ),
      vec4( -0.1,  0.1,  0.5, 1.0 ),
      vec4( 0.1,  0.1,  0.5, 1.0 ),
      vec4( 0.1, -0.1,  0.5, 1.0 ),
      vec4( -0.1, -0.1, -0.5, 1.0 ),
      vec4( -0.1,  0.1, -0.5, 1.0 ),
      vec4( 0.1,  0.1, -0.5, 1.0 ),
      vec4( 0.1, -0.1, -0.5, 1.0 )
  ];    


var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var ball, projection, size_mat, pad, padleft,padright;
var viewerPos;
var program;

var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var flag = true;
var flag2 = true;
var flag3 = true;
var key_up = false;
var key_down = false;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);


     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}



function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function kol(){
   var verticess = [
      vec4( -0.1, -0.4,  0.5, 1.0 ),
      vec4( -0.1,  0.4,  0.5, 1.0 ),
      vec4( 0.1,  0.4,  0.5, 1.0 ),
      vec4( 0.1, -0.4,  0.5, 1.0 ),
      vec4( -0.1, -0.4, -0.5, 1.0 ),
      vec4( -0.1,  0.4, -0.5, 1.0 ),
      vec4( 0.1,  0.4, -0.5, 1.0 ),
      vec4( 0.1, -0.4, -0.5, 1.0 )
  ];    
}

var x = 0.05;
window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){flag2 = !flag2;};
    document.getElementById("ButtonY").onclick = function(){flag3 = !flag3;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.addEventListener('keydown', function(event) {
      if(event.keyCode == 38) {
          key_up = true;
      }
      else if(event.keyCode == 40) {
         key_down = true;
      }
  });

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    render();
}
var i=0.0;
var j=0.0;
var dir = 1;
var createPad = function(x,y,z, size){
   size_mat = mat4();
   pad = mat4();
   pad = mult(pad, translate(x, 0, 0 ));
   pad = mult(pad, translate(0, y, 0));
   pad = mult(pad, translate(0, 0, z));
   
   size_mat[1][1]=size;
   pad = mult(pad, size_mat);
   gl.uniformMatrix4fv( gl.getUniformLocation(program,
     "modelViewMatrix"), false, flatten(pad) );
     gl.drawArrays( gl.TRIANGLES, 0, numVertices );
   return pad;
}

var get_pos = function(pad){
   var axis_x = pad[0][3];
   var axis_y = pad[1][3];
   var axis_z = pad[2][3];
   var pos = new Array(3);
   pos[0] = axis_x;
   pos[1] = axis_y;
   pos[2] = axis_z;
   return pos;
}

var ctrl_crash = function(pad_left, pad_right ,ball){
   var padl_pos = get_pos(pad_left);
   var ball_pos = get_pos(ball);
   padl_pos[0] += 0.1
   padl_pos[1] += 0.4
   ball_pos[0] -= 0.1
   ball_pos[1] -= 0.1
   if( padl_pos[0] > ball_pos[0] && padl_pos[1] < ball_pos[1] ){//sağ üst
      alert("sag oyuncu kazandi");
      location.reload();
   } 
   padl_pos[1] -= 0.8
   ball_pos[1] += 0.2
   if( padl_pos[0] > ball_pos[0] && padl_pos[1] > ball_pos[1] ){//sağ alt
      alert("sag oyuncu kazandi");
      location.reload();
   } 
   var padl_pos = get_pos(pad_left);
   var ball_pos = get_pos(ball);
   padl_pos[0] += 0.1
   padl_pos[1] += 0.4
   ball_pos[0] -= 0.1
   ball_pos[1] -= 0.1
   if( !(padl_pos[0] < ball_pos[0]) && !(padl_pos[1] < ball_pos[1]) ){//sağ üst
      padl_pos[1] -= 0.8
      ball_pos[1] += 0.2
      if( !(padl_pos[0] < ball_pos[0]) && !(padl_pos[1] > ball_pos[1]) ){//sağ alt
         dir *= -1
      } 
   } 






   var padr_pos = get_pos(pad_right);
   var ball_pos = get_pos(ball);

   padr_pos[0] -= 0.1
   padr_pos[1] += 0.4
   ball_pos[0] += 0.1
   ball_pos[1] += 0.1
   if( padr_pos[0] < ball_pos[0] && padr_pos[1] < ball_pos[1] ){//sol üst
      alert("sol oyuncu kazandi");
      location.reload();
   } 
   padr_pos[1] -= 0.8
   ball_pos[1] -= 0.2
   if( padr_pos[0] < ball_pos[0] && padr_pos[1] > ball_pos[1] ){//sağ alt
      alert("sol oyuncu kazandi");
      location.reload();
   } 




   var padr_pos = get_pos(pad_right);
   var ball_pos = get_pos(ball);

   padr_pos[0] -= 0.1
   padr_pos[1] += 0.4
   ball_pos[0] += 0.1
   ball_pos[1] += 0.1
   if( padr_pos[0] < ball_pos[0] && padr_pos[1] < ball_pos[1] ){//sol üst
      dir *= -1
   } 
   padr_pos[1] -= 0.8
   ball_pos[1] -= 0.2
   if( padr_pos[0] < ball_pos[0] && padr_pos[1] < ball_pos[1] ){//sağ alt
      dir *= -1
   } 
}

var pl_y = 0;
var pr_y = 0;
var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag) theta[axis] += 2.0;
   
 
   if(i>1 || i<-1) {dir *= -1; }  
    if(flag){
      if(dir > 0){
         i += 0.01;
      }else{
         i -= 0.01;
      }
   }
   if(!flag2){
      pl_y = pl_y - 0.1;
      flag2 = true;
   }
   if(!flag3){
      pl_y = pl_y + 0.1;
      flag3 = true;
   }
   if(key_up){
      pr_y = pr_y + 0.1;
      key_up = false;

   }
   if(key_down){
      pr_y = pr_y - 0.1;
      key_down = false;

   }

   padright = createPad(1,pr_y,1,4);
   padleft = createPad(-1,pl_y,1,4);

    ball = mat4();
    ball = mult(ball, translate(-i, 0, 0 ));
    ball = mult(ball, translate(0, 0, 0));
    ball = mult(ball, translate(0, 0, 1));  
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
         "modelViewMatrix"), false, flatten(ball) );
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
    

   ctrl_crash(padleft, padright, ball);
    
    requestAnimFrame(render);
}
