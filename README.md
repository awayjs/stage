# AwayJS Stage
[![Build Status](https://travis-ci.org/awayjs/stage.svg?branch=dev)](https://travis-ci.org/awayjs/stage)

Interface for graphics module providing various outputs options to render. Contains context implementations for WebGL and Software (js) outputs, as well as a bridge option for external (native) rendering.

## AwayJS Dependencies

* core
* graphics

## Internal Structure

* aglsl<br>
Shader classes for defining render instructions that can be consumed in a variety of ways

* attributes<br>
Abstractions for attributes classes

* base<br>
Interface API for rendering context, and enums for defining various render modes

* events<br>
Event objects for stage classes

* flash<br
>Context implementation for Flash (deprecated)

* gles<br>
Context implementation for External GLES rendering

* image<br>

* library<br>

* managers<br>

* software<br>
Context implementation for CPU software rendering

* webgl<br>
Context implementation for WebGL rendering