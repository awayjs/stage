attribute vec4 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_projectionMatrix;

void main()
{            
    vec4 tmp = a_position;     
    gl_Position = u_projectionMatrix * tmp;
}