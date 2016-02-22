date: 2015-02-09
title: Better User Experience with Promises in AngularJS
extract:
  >
    We live in the golden age of software development. Writing mobile and web applications is becoming easier
    thanks to amazing and brand new technologies and thanks to growing communities around them.
    Frameworks like Rails and AngularJS (just to name a few) provides us the power to build a working prototype
    in hours, if not minutes sometimes. But along with technologies, users needs grow too.
    I remember the days when I first started doing web development there was a simple rule:
    "If you make a user wait more than 30 seconds on a page, he/she will go away".
---
We live in the golden age of software development. Writing mobile and web applications is becoming easier
thanks to amazing and brand new technologies and thanks to growing communities around them.
Frameworks like Rails and AngularJS (just to name a few) provides us the power to build a working prototype
in hours, if not minutes sometimes. But along with technologies, users needs grow too.
I remember the days when I first started doing web development there was a simple rule:
"If you make a user wait more than 30 seconds on a page, he/she will go away".

30 seconds. I can't believe it. Now we talk about milliseconds. If you can't provide instant feedback to the
user he/she will complain. Your clients will have unhappy customers, and you will have unhappy clients.
Everyone will be unhappy!

Users will trigger lots of blocking operations on your application. These are operations that your
application depends on and that take long time to complete. Like, for example, an image upload with
thumbnails generation.

This is exactly what I'll be talking about on this post.

## My Experience

I had to implement, as part of a bigger application, a system that provided the user the ability to add
custom images to a racing suit. The user could then manipulate those images (resize and rotate) and submit
his/her design. Users could potentially load really big images and I couldn't make them wait for the server
to do the upload and the thumbnails generation.

## Promises to the rescue

I solved the problem using Promises. This is not a post about promises but I promise I'll go into details
about them in a future post...

Sorry.

This is a simple list of the tasks to be implemented for the feature:

1. Upload multiple images via drag & drop (one at a time)
2. Manage uploaded images through a "layers" list (kinda like the one on Photoshop)
  1. Select an image
  2. Remove the selected image
3. Resize/Rotate the images
4. Save the changes to the canvas

Actually each of these task can be seen as an individual feature, because some of them are really complex
(at least for me). For example, task n 1 involves all these subtasks:

1. Upload multiple images via drag & drop (one at a time)
  1. Take a dropped image
  2. Encode the image in base64 so it can be used as soon as possible into the canvas (see point 3 above)
  3. Upload the image to the backend
  4. Add a new layer to layers list with a thumbnail of the image

For tasks 1.1 and 1.3 I've used a really cool library called
[angular-file-upload](https://github.com/danialfarid/angular-file-upload) by
[Danial Farid](https://github.com/danialfarid) that takes care of the drag & drop and the file upload.

After the user drops the file, the app uploads the image to the server which stores the image and generates
a thumbnail. This thumbnail is later used in the app to show a preview on the layer.

The library exposes an `upload` method that returns a promise. So we can start the upload, save the
promise in a variable and pass it around to the pieces of code that will need the thumbnail. The library
exposes also an handy API you can use to append callbacks to the promises when, for example, it get resolved
or rejected (respectively success and error).

While the server is doing its stuff, the application encodes the image in base64, creates the layer, adds the
base64 encoded image to the canvas. This way we provide instant feedback to the user so he/she does not have
to wait for the server to save the image and generate the  thumbnail. As soon as the user drops the image,
he/she can begin to manipulate the image and can see the new layer in the layers list.

Later on the server will send the thumbnail to the js app which will update the relative preview image in
the layers list.

Here's an approximation of the code, with all the _irrelevant_ bits left out.

```html
<div ng-controller="ImageCtrl">
  <div class="ddarea" ng-file-drop="onFileDropped($files)" ng-file-drag-over-class="dropping">
    <p>Drag & Drop your design image here</p>
  </div>

  <div class="layers">
    <div class="layer" ng-class="{ active : layer.active }" ng-repeat="layer in layers">
      <div style="background-image: url({{layer.thumb}})"></div>
      <a ng-click="removeLayer(layer)">Remove</a>
    </div>
  </div>

  <div class="canvas">
    <canvas></canvas>
  </div>
</div>
```

```js
angular.module('app')
.service('FileUploaderService', ['$upload', function($upload) {
  var _upload: function(file) {
    return $upload.upload({
      url: '/upload',
      method: 'POST',
      file: file
    })
  };

  return {
    upload: _upload
  };
}])
.controller('imageCtrl', [function() {
  $scope.layers = [];
  $scope.onFileDropped = function($files) {
    var file = $files[0];
    if (file !== undefined) {
      var uploadPromise = FileUploaderService.upload(file);
      uploadPromise.error(function(response) {
        $scope.notify("Upload error: " + response.message);
      });

      var fileReader = new FileReader;

      fileReader.onload = function() {
        var layer = { 
          active: false,
          image = fileReader.result
        };
        $scope.createNewLayer(layer, uploadPromise);
        $scope.addImageToCanvas(layer, uploadPromise);
      };
      fileReader.readAsDataURL(file);
    }
  };

  $scope.createNewLayer = function(layer, uploadPromise) {
    $scope.layers.push(layer);
    uploadPromise.success(function(response){
      layer.thumb = response.thumb;
    });
    uploadPromise.error(function(response) {
      $scope.layers.splice(_.indexOf($scope.layers, layer), 1);
    });
  };

  $scope.addImageToCanvas = function(layer) {
    // code to add the image to the canvas
    uploadPromise.error(function(response) {
      // Remove the layer from the canvas
    });
  };
}]);
```

The `FileUploaderService` is a wrapper around the `$upload` module provided by the
[angular-file-upload](https://github.com/danialfarid/angular-file-upload) library. It exposes an `upload`
method that returns the promise.

On line 20 of the `image.js` file we start the file upload and store the promise into the `uploadPromise`
variable. We immediately append a function for when the promise is rejected (if there's a problem with the
file upload like network error, or validation errors) and we notify the user.

After encoding the image on line 27, we call the `createNewLayer` and the `addImageToCanvas` methods passing
them the promise.

The `createNewLayer` method _renders_ the new layer immediately -- it simply pushes the new layer to the
`layers` array -- and uses the promise to take the thumbnail generated by the server. Once the promise is
resolved, it adds the thumbnail to the layer object. Since the `layers` array is bounded to the view,
AngularJS will automatically redraw the layer with the generated thumbnail.

The `addImageToCanvas` method uses and external library to generate an image object from the base64 encoded
image and appends it to the canvas. The code is left out because it is not the focus of this post. For the
sake of discussion the library I've used is [FabricJS](http://fabricjs.com/).

Both methods implement behaviour for when the promise is rejected. The `createNewLayer` method removes the
layer from the layers lists, and the `addImageToCanvas` method removes the image from the canvas.

## Advantages of using promises

The thing I like the most about promises is that you can instantiate one, pass it around, and append it as
many `then` as you like. Your promise will only get resolved (or rejected) once and all your `then`s will get
called. Also, you can append a `then` even if the promise has already been resolved. Your `then` will be called.

There are other cool stuff promises provides. Like the ability to wait for more than one promise to resolve,
or the ability to chain promises, but these will be topics for future posts.

Until _then_, happy coding!
