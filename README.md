# Living Room WebGL Scene

This coursework gives you an opportunity to implement a small 3D living room environment by applying your computer graphics knowledge and skills. There are different aspects for constructing a 3D environment, including object modeling, object transformation, scene graph construction, lighting, virtual camera setting, etc. Under each aspect, a variety of techniques could be used. You are expected to implement the above aspects with WebGL, demonstrating your competence in developing a computer graphics application. The deadline for submission is the 6th March 2019 (2pm) through DUO. This assessment contributes 12.5% of the overall COMP2231 module mark.

### Requirements and Marking Criteria:

• 3D Modeling (25 marks): Create 3D models to represent a living room and at least 10 pieces of furniture inside the room.

• Simple Model Animation (15 marks): Apply geometric transformations to support simple animation to 30 percentage of the furniture, such as movable chairs, a dangling light, etc.

• Scene Graph Construction (15 marks): Implement a scene graph to support effective construction and manipulation of 3D models.

• Rendering Effects (25 marks): Implement suitable lighting effects for the living room environment and allow the room to be rendered under adjustable virtual camera settings.

• Model and Scene Appearance (20 marks): Implement suitable coloring and texture mapping to support visually appealing rendering outputs.

For implementation, you should apply knowledge and methods you have learnt from the lectures and practical sessions. The marking criteria shows the breakdown of how the coursework requirements will be marked. As shown in Table 1, the percentage of marks awarded under each of the criteria will be determined by the level of achievement you have made. You are expected to use native WebGL for the implementation. No other high-level graphics API should be used, e.g., three.js. For the 3D model construction, you can build complicated 3D models by compositing a set of primitive objects through geometric transformations. If you alternatively resort to a modeling software, such as Blender, for 3D model construction, you are required to identify a suitable way on your own about how to incorporate the constructed 3D models into your WebGL program.

Your submission should include all source codes, resource files, and a readme file showing instructions of how to run your system and what external resources you have adopted. You should compress all files into a single zip file and upload it for submission.

See `cg.assignment.2020.pdf` for details. 

## To start the program from the command line:

0. Install http-server with `npm install http-server`.
1. Navigate to the relevant directory and run `http-server`.
2. Open a browser (tested on Firefox 75.0) and navigate to `localhost:8080`.


## To move the camera

UP & DOWN arrow keys  -  rotate the scene about the x axis.

LEFT & RIGHT arrow keys  -  rotate the scene about the y axis.

Z & X keys  -  rotate the scene about the z axis.


## To move the furniture

C & V keys  -  move the chairs away from and toward the table


## External resources

I have used the following libraries:
1. cuon-matrix.js
2. cuon-utils.js
3. initShaders.js
4. webgl-debug.js
5. webgl-utils.js

These are all included the `lib` subdirectory.
